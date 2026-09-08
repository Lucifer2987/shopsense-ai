import logging

from flask import Blueprint, g, request
from pydantic import ValidationError

from app.schemas.common import error, success
from app.schemas.seller import CreateProductRequest, UpdateProductRequest
from app.services.supabase_service import supabase
from app.utils.auth import require_seller
from app.utils.errors import APIError

logger = logging.getLogger(__name__)
seller_products_bp = Blueprint("seller_products", __name__)

_ALLOWED_SORT = {"name", "price", "category", "created_at"}


@seller_products_bp.get("/seller/products")
@require_seller
def list_products():
    params = request.args
    try:
        page = max(1, int(params.get("page", 1)))
        per_page = min(100, max(1, int(params.get("per_page", 20))))
    except ValueError:
        return error("Invalid pagination parameters.", "INVALID_PARAM", 400)

    offset = (page - 1) * per_page
    query = supabase.table("products").select("*")

    if search := params.get("search"):
        query = query.ilike("name", f"%{search}%")
    if category := params.get("category"):
        query = query.eq("category", category)
    if brand := params.get("brand"):
        query = query.ilike("brand", f"%{brand}%")

    is_active_raw = params.get("is_active", "").lower()
    if is_active_raw == "true":
        query = query.eq("is_active", True)
    elif is_active_raw == "false":
        query = query.eq("is_active", False)

    sort_by = params.get("sort_by", "created_at")
    if sort_by not in _ALLOWED_SORT:
        sort_by = "created_at"
    query = query.order(sort_by, desc=(params.get("sort_dir", "desc") == "desc"))
    query = query.range(offset, offset + per_page - 1)

    try:
        data = query.execute().data
        return success(data={"products": data, "count": len(data), "page": page, "per_page": per_page})
    except Exception as exc:
        logger.error("Seller product list error: %s", exc)
        return error("Failed to fetch products.", "DB_ERROR", 503)


@seller_products_bp.post("/seller/products")
@require_seller
def create_product():
    try:
        body = CreateProductRequest.model_validate(request.get_json(force=True) or {})
    except ValidationError as exc:
        return error(str(exc), "VALIDATION_ERROR", 422)
    try:
        payload = body.model_dump(exclude_none=True)
        payload.setdefault("stock", True)
        payload.setdefault("is_active", True)
        result = supabase.table("products").insert(payload).execute()
        return success(data=result.data[0], message="Product created.", code=201)
    except Exception as exc:
        logger.error("Product create error: %s", exc)
        return error("Failed to create product.", "DB_ERROR", 503)


@seller_products_bp.get("/seller/products/<product_id>")
@require_seller
def get_product(product_id: str):
    try:
        result = supabase.table("products").select("*").eq("id", product_id).execute()
        if not result.data:
            return error("Product not found.", "PRODUCT_NOT_FOUND", 404)
        return success(data=result.data[0])
    except Exception as exc:
        logger.error("Seller product get error: %s", exc)
        return error("Failed to fetch product.", "DB_ERROR", 503)


@seller_products_bp.patch("/seller/products/<product_id>")
@require_seller
def update_product(product_id: str):
    try:
        body = UpdateProductRequest.model_validate(request.get_json(force=True) or {})
    except ValidationError as exc:
        return error(str(exc), "VALIDATION_ERROR", 422)

    updates = body.model_dump(exclude_none=True)
    if not updates:
        return error("No fields to update.", "NO_CHANGES", 400)

    try:
        existing = supabase.table("products").select("id").eq("id", product_id).execute()
        if not existing.data:
            return error("Product not found.", "PRODUCT_NOT_FOUND", 404)
        result = supabase.table("products").update(updates).eq("id", product_id).execute()
        return success(data=result.data[0], message="Product updated.")
    except Exception as exc:
        logger.error("Product update error: %s", exc)
        return error("Failed to update product.", "DB_ERROR", 503)


@seller_products_bp.post("/seller/products/<product_id>/activate")
@require_seller
def activate_product(product_id: str):
    return _set_active(product_id, True)


@seller_products_bp.post("/seller/products/<product_id>/deactivate")
@require_seller
def deactivate_product(product_id: str):
    return _set_active(product_id, False)


def _set_active(product_id: str, active: bool):
    try:
        existing = supabase.table("products").select("id").eq("id", product_id).execute()
        if not existing.data:
            return error("Product not found.", "PRODUCT_NOT_FOUND", 404)
        result = (
            supabase.table("products")
            .update({"is_active": active})
            .eq("id", product_id)
            .execute()
        )
        state = "activated" if active else "deactivated"
        return success(data=result.data[0], message=f"Product {state}.")
    except Exception as exc:
        logger.error("Product activation error: %s", exc)
        return error("Failed to update product.", "DB_ERROR", 503)
