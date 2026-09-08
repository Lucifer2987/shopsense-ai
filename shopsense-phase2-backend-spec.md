# ShopSense AI — Phase 2 Backend Spec

You are working on the existing ShopSense AI backend repository.

We are now moving from PHASE 1 to PHASE 2.

**IMPORTANT:** This is an existing production backend currently deployed on Railway and already serving the Phase 1 customer application successfully.

Your job is NOT to rewrite the backend from scratch.

Your job is to carefully inspect the existing codebase, understand the current architecture, preserve all working Phase 1 functionality, and extend the backend professionally for Phase 2.

---

## Project Context

ShopSense AI is an AI-powered grocery shopping platform.

PHASE 1 is already implemented and working in production.

Existing Phase 1 capabilities include:

- Product retrieval
- Product search/filtering
- Shopping list creation
- Shopping list retrieval
- Voice/text grocery commands
- Gemini-based intent processing
- Supabase database integration
- Flask API
- Gunicorn production server
- CORS configuration
- Railway deployment

Existing production API structure includes:

```
GET  /api/health
GET  /api/products
POST /api/shopping-lists
GET  /api/shopping-lists/<id>
POST /api/voice/command
```

DO NOT break, rename, remove, or unnecessarily modify these existing APIs. The existing customer frontend depends on them.

---

## Phase 2 Objective

Phase 2 transforms ShopSense from a customer-only grocery application into a two-sided retail platform.

There will be two primary sides:

1. **CUSTOMER**
2. **SELLER / ADMIN**

The customer experience should continue working as it currently does. The new backend functionality will primarily support the Seller/Admin side.

The seller should eventually be able to:

- Authenticate/login
- Access a protected admin dashboard
- Manage products
- Manage inventory
- Upload inventory through Excel/CSV
- Validate uploaded inventory
- Import inventory into Supabase
- Perform stock-in operations
- Perform stock-out operations
- Adjust stock
- Update prices
- Activate/deactivate products
- View inventory statistics
- Track inventory movement
- Identify low-stock and out-of-stock products

The backend should be designed so that future phases can add analytics, notifications, AI seller assistance, orders, sales, and multiple stores without requiring a major rewrite.

---

## First Rule: Inspect Before Modifying

Before writing code:

1. Inspect the complete existing backend structure.
2. Inspect:
   - Flask application factory
   - Blueprints/routes
   - Services
   - Config
   - Supabase integration
   - Existing database access patterns
   - Error handling
   - Response format
   - Authentication if already present
   - CORS implementation
   - requirements/dependencies
   - Railway deployment configuration
3. Identify the existing database schema and relationships.
4. Identify how products are currently represented.
5. Identify how users/shopping lists are currently represented.
6. Identify existing conventions used by the project.

Do NOT assume the repository follows a generic Flask structure. Follow the existing project's conventions wherever they are sound.

Before implementing Phase 2, determine the minimum changes required to extend the current architecture safely.

---

## Architectural Direction

Use a **PROFESSIONAL MODULAR MONOLITH** architecture for now.

DO NOT introduce microservices.

The backend should remain one deployable Flask application, but responsibilities should be clearly separated into modules.

Conceptually, the backend should evolve toward:

```
backend/
    app/
        routes/
        services/
        models/
        utils/
        config/
    ...
```

The exact structure must be based on the existing repository.

Potential Phase 2 domains:

- auth
- products
- inventory
- imports
- shopping
- analytics

Do not create unnecessary abstractions simply for the sake of architecture. Prefer clean, maintainable, production-oriented code.

---

## Database Design

The current database uses Supabase/PostgreSQL.

Inspect the existing schema before making changes. Design Phase 2 database changes carefully.

The system should support inventory management without breaking existing product functionality.

The inventory architecture should support concepts such as:

```
PRODUCT
    ↓
INVENTORY
    ↓
INVENTORY TRANSACTIONS
```

Inventory transactions should support at minimum:

- STOCK_IN
- STOCK_OUT
- ADJUSTMENT

Design the schema so that inventory changes can be audited. Do NOT rely only on a single mutable stock quantity if an inventory transaction/history model can be implemented safely. However, avoid unnecessary database complexity.

The database should eventually be capable of supporting multiple sellers/stores. Therefore, consider the correct relationship between:

- seller
- store
- product
- store inventory

Do not force a multi-store architecture if it conflicts with the current schema. Instead, design it so that adding multiple stores later does not require a complete rewrite.

---

## Seller / Admin Authentication

Phase 2 needs protected seller/admin APIs.

Inspect whether Supabase Auth is already available or whether an authentication mechanism already exists. Prefer integrating with the existing authentication infrastructure rather than creating a completely separate authentication system.

Implement role-based authorization where appropriate. At minimum, distinguish:

- CUSTOMER
- SELLER / ADMIN

Seller/admin-only operations must NOT be accessible anonymously. Do not implement insecure authentication shortcuts. Never hardcode credentials, tokens, API keys, or secrets.

---

## Product Management

Implement backend support for seller product management.

Required capabilities:

- Create product
- Update product
- Deactivate product
- Activate product
- Search products
- Filter products
- Retrieve product details

If deletion is dangerous because customer shopping lists or historical inventory transactions may reference products, prefer soft deletion/deactivation instead of destructive deletion.

Preserve the existing customer `GET /api/products` behavior. Customer product APIs must continue returning the response structure expected by the existing frontend.

---

## Inventory Management

Implement seller/admin inventory APIs.

Required operations:

1. Get inventory
2. Get inventory for a specific product
3. Stock in
4. Stock out
5. Adjust stock
6. Update inventory-related product information where appropriate
7. Identify low-stock items
8. Identify out-of-stock items

Every inventory mutation should:

- Validate the request
- Validate the quantity
- Prevent invalid negative quantities
- Update the inventory safely
- Create an inventory transaction/history record
- Return a consistent API response
- Handle database failures safely

Pay attention to concurrent inventory updates. Do not implement naive read-modify-write logic if a safer database-level operation is possible.

---

## Excel / CSV Inventory Import

A major Phase 2 feature is bulk inventory upload.

The seller should eventually upload an Excel or CSV file from the admin dashboard.

The backend should support:

```
POST /api/inventory/import
```

or an equivalent endpoint consistent with the project's routing conventions.

Expected flow:

```
FILE UPLOAD
    ↓
FILE VALIDATION
    ↓
SCHEMA VALIDATION
    ↓
DATA NORMALIZATION
    ↓
DUPLICATE DETECTION
    ↓
ROW VALIDATION
    ↓
PREVIEW / VALIDATION RESULT
    ↓
CONFIRMED IMPORT
    ↓
SUPABASE
    ↓
IMPORT SUMMARY
```

The implementation should support common inventory fields such as:

- product name
- SKU
- category
- brand
- price
- quantity/stock
- unit
- minimum stock threshold

BUT: do not blindly enforce these exact columns if the existing product schema uses different names. First inspect the current database model and adapt the import schema accordingly.

The importer must provide useful validation errors such as:

- Missing required field
- Invalid price
- Invalid quantity
- Duplicate SKU
- Invalid category
- Empty product name
- Unsupported file format

Do not partially corrupt the database if an import fails. Use appropriate transaction/bulk-operation behavior.

Large files should not cause unreasonable memory or request-processing problems. Add reasonable file size and file type validation.

---

## Inventory Import History

Track inventory imports.

An import record should allow the system to understand:

- who uploaded it
- when it was uploaded
- filename
- status
- number of rows
- successful rows
- failed rows
- error information where appropriate

This will be useful for the future admin dashboard.

---

## Low Stock

Inventory should support a configurable minimum stock threshold.

For example:

```
quantity = 3
minimum_stock = 5
→ LOW STOCK

quantity = 0
→ OUT OF STOCK
```

Do not hardcode these values globally if the database can support product-level thresholds.

---

## API Design

Follow the existing API response style.

If the existing API follows a structure similar to:

```json
{
    "success": true,
    "data": {...}
}
```

continue using that convention.

For errors, provide consistent structured responses. Use appropriate HTTP status codes:

| Code | Meaning |
|---|---|
| 200 | successful retrieval/update |
| 201 | successful creation |
| 400 | validation error |
| 401 | unauthenticated |
| 403 | unauthorized |
| 404 | resource not found |
| 409 | conflict |
| 422 | invalid input where appropriate |
| 500 | unexpected server error |

Do not expose stack traces, secrets, API keys, or internal implementation details in production responses.

---

## Validation

Validate all seller/admin inputs server-side. Never trust frontend validation.

Validate:

- IDs
- quantities
- prices
- SKU
- product names
- uploaded files
- enum values
- pagination parameters
- filters

Handle malformed requests gracefully.

---

## Security

Treat this as a production backend. Follow secure practices:

- Authentication for protected routes
- Authorization for seller/admin operations
- Server-side validation
- Safe file uploads
- File size limits
- Allowed file extensions/types
- No secrets in source code
- No sensitive information in logs
- No stack traces in API responses
- Prevent unauthorized inventory access
- Prevent one seller from modifying another seller's inventory

Review CORS carefully. Do not weaken security simply to make development easier.

---

## Error Handling

Use the project's existing error-handling architecture if one exists. Avoid wrapping every line in try/except. Catch errors at appropriate boundaries.

Database errors should produce clean API responses. Unexpected exceptions should be logged appropriately without exposing sensitive information to clients.

---

## Performance

Design APIs with future production usage in mind.

For inventory/product listing APIs:

- Support pagination where appropriate
- Avoid unnecessary database queries
- Avoid N+1 query patterns
- Use database filtering instead of fetching everything into Python
- Use bulk database operations for imports
- Add indexes where genuinely useful

Do not prematurely optimize.

---

## Testing

Before considering Phase 2 backend complete, add/update tests for critical functionality. At minimum test:

1. Existing health endpoint
2. Existing products endpoint
3. Seller authentication
4. Unauthorized access
5. Product creation
6. Product update
7. Product deactivation
8. Inventory retrieval
9. Stock in
10. Stock out
11. Invalid stock operation
12. Low-stock detection
13. Out-of-stock detection
14. Excel/CSV validation
15. Valid inventory import
16. Invalid inventory import
17. Duplicate SKU handling
18. Import failure handling

**Most importantly:** existing Phase 1 functionality must continue to pass.

---

## Production Compatibility

The application currently runs on Railway.

- Do NOT change the production start command unless absolutely necessary.
- Do NOT introduce Vercel/Render-specific configuration.
- Do NOT add unnecessary deployment files.

Ensure the backend continues to work with:

- Python 3.13
- Gunicorn
- Railway
- Supabase
- Existing environment variables

Do not hardcode Railway URLs. Environment-specific configuration must remain environment-variable based.

---

## Environment Variables

Inspect the current configuration first. Do not rename existing environment variables unless absolutely necessary.

Existing variables may include:

```
SUPABASE_URL
SUPABASE_KEY
GEMINI_API_KEY
CORS_ORIGINS
PYTHON_VERSION
```

If new variables are genuinely required, document them clearly. Never expose their values.

---

## Comments and Code Style

**IMPORTANT:** DO NOT fill the code with unnecessary comments. Write clean, self-explanatory production code.

Only add comments when they provide genuinely useful context, such as:

- non-obvious business logic
- security decisions
- database consistency decisions
- unusual workarounds
- important architectural reasoning

Avoid comments like:

```
# Get products
# Create user
# Check quantity
```

The code itself should already make these things obvious.

---

## Documentation

Update documentation only where useful. Document:

- New API endpoints
- Required environment variables
- Database changes
- Excel/CSV import format
- Authentication/authorization behavior
- Important setup instructions

Do not generate excessive documentation or duplicate information.

---

## Important Development Rules

1. DO NOT rewrite working Phase 1 code unnecessarily.
2. DO NOT remove existing APIs.
3. DO NOT change existing response contracts unless absolutely necessary.
4. DO NOT introduce microservices.
5. DO NOT hardcode secrets.
6. DO NOT hardcode production URLs.
7. DO NOT create unnecessary files.
8. DO NOT add unnecessary comments.
9. DO NOT add unnecessary dependencies.
10. DO NOT blindly assume the database schema.
11. Inspect the repository before implementation.
12. Reuse existing utilities/services where appropriate.
13. Follow existing project conventions.
14. Keep customer functionality backward compatible.
15. Make database changes safely.
16. Prefer modular, maintainable code over clever code.

---

## Implementation Strategy

Work incrementally.

### Phase 2.1

First implement the backend foundation:

- Seller authentication/authorization
- Seller/product ownership model if required
- Product management
- Inventory model
- Inventory transactions
- Inventory CRUD/mutation APIs
- Low-stock/out-of-stock logic

### Phase 2.2

Then implement:

- Excel/CSV import
- Validation
- Bulk insertion/update
- Import history
- Import error reporting

### Phase 2.3

Prepare backend APIs for:

- Inventory analytics
- Seller dashboard metrics
- Future AI seller assistant

Do not implement unnecessary Phase 2.3 functionality yet unless it is required by the architecture.

---

## Final Verification

After implementation:

1. Run the existing test suite.
2. Run the new Phase 2 tests.
3. Run lint/type/static checks if the project already uses them.
4. Verify the Flask application starts successfully.
5. Verify Gunicorn starts successfully.
6. Verify `/api/health`.
7. Verify existing Phase 1 APIs.
8. Verify new seller APIs.
9. Verify database connectivity.
10. Verify no secrets were committed.
11. Review git diff carefully.
12. Remove unnecessary generated files.
13. Check that no Phase 1 behavior was accidentally changed.

At the end, provide a concise implementation report containing:

- What you inspected
- What architecture was added
- Files created
- Files modified
- Database/schema changes
- New API endpoints
- Authentication/authorization approach
- Excel/CSV import behavior
- Tests added
- Any remaining limitations
- Any environment variables that need to be added

**IMPORTANT:** Do not merely give a plan. Actually inspect the existing repository and implement Phase 2 backend changes in the codebase while preserving Phase 1.
