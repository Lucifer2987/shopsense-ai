-- ============================================================
-- ShopSense AI — Phase 2.1 Migration
-- ============================================================
-- Safe, non-destructive, idempotent.
-- Run against the Supabase SQL editor (or psql) ONCE.
-- Existing Phase 1 tables are not dropped or altered except
-- for adding the optional is_active column to products.
-- ============================================================

-- ============================================================
-- 1. sellers
-- ============================================================
CREATE TABLE IF NOT EXISTS sellers (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email         text UNIQUE NOT NULL,
    password_hash text NOT NULL,
    role          text NOT NULL DEFAULT 'seller'
                      CHECK (role IN ('seller', 'admin')),
    is_active     boolean NOT NULL DEFAULT true,
    created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sellers_email ON sellers(email);

-- ============================================================
-- 2. stores
-- ============================================================
-- No UNIQUE(seller_id) — a seller may own multiple stores.
-- The application currently creates one default store per seller,
-- but the schema is intentionally multi-store capable.
CREATE TABLE IF NOT EXISTS stores (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id  uuid NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
    name       text NOT NULL,
    is_active  boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stores_seller ON stores(seller_id);

-- ============================================================
-- 3. is_active on products  (soft deactivation — non-breaking)
-- ============================================================
-- The existing stock column (boolean) is left untouched.
-- is_active represents seller-controlled visibility.
-- Customer-facing APIs filter is_active = true.
ALTER TABLE products
    ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- ============================================================
-- 4. inventory  (store-aware — UNIQUE per store+product pair)
-- ============================================================
CREATE TABLE IF NOT EXISTS inventory (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id      uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    product_id    uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity      integer NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    minimum_stock integer NOT NULL DEFAULT 5 CHECK (minimum_stock >= 0),
    created_at    timestamptz NOT NULL DEFAULT now(),
    updated_at    timestamptz NOT NULL DEFAULT now(),
    UNIQUE (store_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_inventory_store    ON inventory(store_id);
CREATE INDEX IF NOT EXISTS idx_inventory_product  ON inventory(product_id);

-- ============================================================
-- 5. inventory_transactions  (immutable audit log)
-- ============================================================
-- Application-level immutability: no API endpoint exposes
-- UPDATE or DELETE on this table. Rows are written only by
-- atomic_inventory_update() inside a DB transaction.
-- For stronger DB-level protection add a BEFORE UPDATE/DELETE
-- trigger once Supabase supports custom trigger creation in the
-- dashboard, or apply it via psql with a superuser session.
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id         uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    product_id       uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    seller_id        uuid REFERENCES sellers(id) ON DELETE SET NULL,
    transaction_type text NOT NULL
                         CHECK (transaction_type IN ('STOCK_IN','STOCK_OUT','ADJUSTMENT')),
    quantity_change  integer NOT NULL,
    quantity_before  integer NOT NULL,
    quantity_after   integer NOT NULL,
    note             text,
    created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inv_tx_store   ON inventory_transactions(store_id);
CREATE INDEX IF NOT EXISTS idx_inv_tx_product ON inventory_transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_inv_tx_seller  ON inventory_transactions(seller_id);

-- ============================================================
-- 6. Supabase RPC — atomic_inventory_update
-- ============================================================
-- Performs the inventory update and inserts the transaction
-- record inside a single database transaction, eliminating the
-- read-modify-write race condition that would occur in Python.
--
-- Parameters:
--   p_store_id   : uuid
--   p_product_id : uuid
--   p_seller_id  : uuid  (may be NULL for system operations)
--   p_type       : text  ('STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT')
--   p_delta      : integer
--                    STOCK_IN   → must be positive (units to add)
--                    STOCK_OUT  → must be negative (units to remove)
--                    ADJUSTMENT → must be non-negative (absolute target qty)
--   p_note       : text
--
-- Returns the updated inventory row as JSON.
-- Raises named exceptions for all invalid inputs so the caller
-- can surface a clean error without inspecting raw DB messages.
-- ============================================================
CREATE OR REPLACE FUNCTION atomic_inventory_update(
    p_store_id   uuid,
    p_product_id uuid,
    p_seller_id  uuid,
    p_type       text,
    p_delta      integer,
    p_note       text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
    v_inv        inventory%ROWTYPE;
    v_qty_before integer;
    v_qty_after  integer;
BEGIN
    -- ── Input validation (before touching any row) ──────────────────────────

    IF p_type NOT IN ('STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT') THEN
        RAISE EXCEPTION 'INVALID_TYPE: p_type must be STOCK_IN, STOCK_OUT, or ADJUSTMENT. Got: %', p_type;
    END IF;

    IF p_type = 'STOCK_IN' AND p_delta <= 0 THEN
        RAISE EXCEPTION 'INVALID_QUANTITY: STOCK_IN requires a positive delta. Got: %', p_delta;
    END IF;

    IF p_type = 'STOCK_OUT' AND p_delta >= 0 THEN
        RAISE EXCEPTION 'INVALID_QUANTITY: STOCK_OUT requires a negative delta. Got: %', p_delta;
    END IF;

    IF p_type = 'ADJUSTMENT' AND p_delta < 0 THEN
        RAISE EXCEPTION 'INVALID_QUANTITY: ADJUSTMENT target quantity cannot be negative. Got: %', p_delta;
    END IF;

    -- ── Lock inventory row for update (prevents concurrent races) ───────────

    SELECT * INTO v_inv
      FROM inventory
     WHERE store_id   = p_store_id
       AND product_id = p_product_id
       FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'INVENTORY_NOT_FOUND: No inventory record for store % product %',
            p_store_id, p_product_id;
    END IF;

    v_qty_before := v_inv.quantity;

    IF p_type = 'ADJUSTMENT' THEN
        v_qty_after := p_delta;
    ELSE
        v_qty_after := v_qty_before + p_delta;
    END IF;

    IF v_qty_after < 0 THEN
        RAISE EXCEPTION 'INSUFFICIENT_STOCK: Cannot reduce quantity below zero (current: %, requested change: %).',
            v_qty_before, p_delta;
    END IF;

    -- ── Atomic update + audit log (single transaction) ──────────────────────

    UPDATE inventory
       SET quantity   = v_qty_after,
           updated_at = now()
     WHERE id = v_inv.id;

    INSERT INTO inventory_transactions
        (store_id, product_id, seller_id, transaction_type,
         quantity_change, quantity_before, quantity_after, note)
    VALUES
        (p_store_id, p_product_id, p_seller_id, p_type,
         v_qty_after - v_qty_before, v_qty_before, v_qty_after, p_note);

    SELECT i.*
      INTO v_inv
      FROM inventory AS i
     WHERE i.id = v_inv.id;

    RETURN row_to_json(v_inv);
END;
$$;

-- ============================================================
-- 7. RPC permissions
-- ============================================================
-- Revoke execute access from all default Supabase roles.
-- Only the service_role key (used by the backend) may call this
-- function. The anon and authenticated roles (used by the
-- Supabase JS client / PostgREST) cannot invoke it directly.
REVOKE EXECUTE ON FUNCTION atomic_inventory_update(uuid, uuid, uuid, text, integer, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION atomic_inventory_update(uuid, uuid, uuid, text, integer, text) FROM anon;
REVOKE EXECUTE ON FUNCTION atomic_inventory_update(uuid, uuid, uuid, text, integer, text) FROM authenticated;
GRANT  EXECUTE ON FUNCTION atomic_inventory_update(uuid, uuid, uuid, text, integer, text) TO service_role;
