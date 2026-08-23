# ShopSense AI — Complete Backend Implementation

You are working on an existing project called **ShopSense AI**, a voice-first, context-aware shopping assistant.

Your task is to take the existing backend project and turn it into a **complete, runnable, clean, production-quality backend**.

Do not create unnecessary complexity. Do not build the frontend. Focus entirely on the backend.

---

## 1. First inspect the existing project

Before changing anything:

1. Inspect the complete `backend/` directory.
2. Inspect all existing Python files.
3. Inspect `.env` structure without exposing or printing secret values.
4. Inspect `requirements.txt`.
5. Inspect the current Flask setup.
6. Inspect the Supabase integration.
7. Check why the current `/api/health` endpoint returns:

```text
PGRST125
Invalid path specified in request URL
```

8. Verify whether the Supabase URL is being constructed correctly.
9. Do not recreate the Supabase database if the existing schema is already present.
10. Do not delete existing working code unless it is genuinely incorrect.

If a configuration problem exists, fix it in the backend implementation and clearly report what was changed.

---

## 2. Project objective

The backend must support a voice shopping assistant with:

* Voice command processing
* Natural language understanding
* Multilingual/Hinglish commands
* Shopping list management
* Product search
* Quantity management
* Price filtering
* Brand filtering
* Smart recommendations
* Product substitutes
* Shopping history
* User preferences
* Shopping context
* Budget-aware basket optimization
* Recommendation explanations

The backend must be deterministic where possible.

The LLM must understand user intent, but it must NOT directly manipulate the database.

Architecture:

```text
Client
  ↓
Flask API
  ↓
Intent / AI Layer
  ↓
Validation
  ↓
Business Logic
  ↓
Supabase PostgreSQL
```

The LLM must never receive database credentials.

---

## 3. Existing database

The existing Supabase database contains these tables:

```text
profiles
products
shopping_lists
shopping_items
shopping_history
shopping_context
```

Do not unnecessarily modify the database schema.

Use the existing schema.

The `products` table contains fields such as:

```text
id
name
brand
category
price
unit
stock
season
tags
image_url
created_at
updated_at
```

The shopping list tables are relational and should be accessed through the backend.

---

## 4. Backend architecture

Use:

* Python
* Flask
* Flask-CORS
* Supabase Python client
* PostgreSQL through Supabase
* Pydantic
* python-dotenv
* Google Gemini using the current `google-genai` SDK

Do NOT introduce:

* Django
* FastAPI
* LangChain
* LangGraph
* unnecessary microservices
* unnecessary vector databases
* unnecessary Redis
* unnecessary Celery
* unnecessary ML models

The deadline is short, so prioritize a clean working backend.

---

## 5. Required project structure

Create or improve the structure to approximately:

```text
backend/
│
├── app/
│   ├── __init__.py
│   ├── config.py
│   │
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── health.py
│   │   ├── products.py
│   │   ├── shopping.py
│   │   ├── voice.py
│   │   ├── recommendations.py
│   │   └── context.py
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── supabase_service.py
│   │   ├── gemini_service.py
│   │   ├── intent_service.py
│   │   ├── shopping_service.py
│   │   ├── recommendation_service.py
│   │   ├── basket_service.py
│   │   └── context_service.py
│   │
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── intent.py
│   │   ├── shopping.py
│   │   └── common.py
│   │
│   └── utils/
│       ├── __init__.py
│       └── errors.py
│
├── tests/
│   ├── test_health.py
│   ├── test_products.py
│   ├── test_intent.py
│   └── test_shopping.py
│
├── .env
├── .env.example
├── .gitignore
├── requirements.txt
├── run.py
└── README.md
```

Adapt this structure if the existing project already has a reasonable structure.

---

## 6. Environment configuration

Use environment variables.

Required:

```env
SUPABASE_URL=
SUPABASE_KEY=
GEMINI_API_KEY=
```

Never hardcode secrets.

Never print secret values.

Create `.env.example`:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_server_side_supabase_key
GEMINI_API_KEY=your_gemini_api_key
```

Ensure `.env` is ignored by Git.

---

## 7. Supabase integration

Create a clean Supabase service/client layer.

The client must be initialized from:

```text
SUPABASE_URL
SUPABASE_KEY
```

Validate that the URL is a valid Supabase project URL.

Do not accidentally append:

```text
/rest/v1
```

to `SUPABASE_URL` when initializing the Supabase Python client.

The client itself should handle the REST API path.

Investigate and fix the current:

```text
PGRST125
Invalid path specified in request URL
```

problem.

Do not hide the error.

If Supabase is unavailable, return a clean API error instead of crashing the Flask application.

---

## 8. Health endpoint

Implement:

```http
GET /api/health
```

Response when healthy:

```json
{
  "status": "healthy",
  "database": "connected"
}
```

If database is unavailable:

```json
{
  "status": "unhealthy",
  "database": "error"
}
```

Do not expose secrets or internal credentials.

---

## 9. Product APIs

Implement:

```http
GET /api/products
GET /api/products/<product_id>
GET /api/products/search
```

Support filters:

```text
search
category
brand
max_price
min_price
in_stock
```

Example:

```http
GET /api/products?search=milk
```

```http
GET /api/products?category=Dairy&max_price=100
```

```http
GET /api/products?brand=Amul
```

Search should be case-insensitive.

Return clean JSON.

Do not return raw Supabase errors directly to the user.

---

## 10. Shopping list APIs

Implement:

```http
POST /api/shopping-lists
GET /api/shopping-lists/<list_id>
DELETE /api/shopping-lists/<list_id>
```

Shopping item operations:

```http
POST /api/shopping-lists/<list_id>/items
PATCH /api/shopping-items/<item_id>
DELETE /api/shopping-items/<item_id>
```

Support:

* Add item
* Remove item
* Update quantity
* Mark completed
* Unmark completed

Validate quantities.

Reject invalid quantities such as:

```text
0
negative numbers
invalid strings
```

---

## 11. Voice intent engine

This is one of the most important parts.

The backend must expose:

```http
POST /api/voice/command
```

Request:

```json
{
  "text": "bhai 2 litre doodh add kar de"
}
```

The AI should convert natural language into a structured intent.

Supported intents:

```text
ADD_ITEM
REMOVE_ITEM
UPDATE_QUANTITY
SEARCH_PRODUCT
SET_BUDGET
SET_PREFERENCE
CREATE_CONTEXT
GET_RECOMMENDATIONS
OPTIMIZE_BASKET
SHOW_LIST
CLEAR_LIST
```

Example:

Input:

```text
"bhai 2 litre doodh add kar de"
```

Expected structured intent:

```json
{
  "intent": "ADD_ITEM",
  "items": [
    {
      "name": "milk",
      "quantity": 2,
      "unit": "litre"
    }
  ]
}
```

Another:

```text
"find organic apples under 200"
```

Expected:

```json
{
  "intent": "SEARCH_PRODUCT",
  "query": "apples",
  "constraints": {
    "organic": true,
    "max_price": 200
  }
}
```

Another:

```text
"mera budget 1000 hai"
```

Expected:

```json
{
  "intent": "SET_BUDGET",
  "budget": 1000
}
```

Another:

```text
"kal 5 log aa rahe hain"
```

Expected:

```json
{
  "intent": "CREATE_CONTEXT",
  "context": {
    "type": "party",
    "people": 5,
    "date": "tomorrow"
  }
}
```

---

## 12. Pydantic validation

Never trust raw LLM output.

Create Pydantic schemas for intents.

Pipeline:

```text
User text
 ↓
Gemini
 ↓
Structured JSON
 ↓
Pydantic validation
 ↓
Business logic
 ↓
Database
```

If Gemini produces malformed output:

Return a controlled error.

Do not allow malformed LLM output to reach the database.

---

## 13. Gemini integration

Use the current Google Gemini Python SDK.

Keep Gemini logic isolated inside:

```text
services/gemini_service.py
```

Do not mix Gemini calls directly inside Flask routes.

The service should provide something similar to:

```python
parse_command(text)
```

Use structured output/schema-based generation wherever supported.

The model should return intent data rather than conversational prose.

The prompt should explicitly tell the model:

* Understand English
* Understand Hindi
* Understand Hinglish
* Extract quantities
* Extract units
* Extract product names
* Extract brands
* Extract price constraints
* Extract preferences
* Extract contextual information
* Never invent product IDs
* Never invent prices
* Never claim a product exists

The database remains the source of truth for products and prices.

---

## 14. Shopping command execution

After intent extraction, route the intent to the correct business logic.

Example:

```text
ADD_ITEM
 ↓
Find matching product
 ↓
Validate availability
 ↓
Add to shopping list
 ↓
Return confirmation
```

Example response:

```json
{
  "success": true,
  "message": "Added 2 litres of Milk to your list.",
  "action": "ADD_ITEM",
  "item": {}
}
```

For a product that does not exist:

```json
{
  "success": false,
  "message": "I couldn't find that product."
}
```

Never hallucinate a product.

---

## 15. Multilingual/Hinglish support

The intent engine must support examples such as:

```text
"Add milk"
"Add 2 litres of milk"
"mujhe doodh chahiye"
"doodh add kar de"
"bhai 2 packet doodh daal"
"mujhe sasta doodh chahiye"
"find something cheaper"
"organic seb 200 ke andar dhoondh"
"mera budget 1000 hai"
```

Do not translate everything manually before sending to Gemini.

Let the intent parser understand the natural language.

---

## 16. Shopping history

Implement:

```http
POST /api/history
GET /api/history/<user_id>
```

History should store:

```text
user_id
product_id
quantity
price
purchased_at
```

Provide a service that can determine purchasing frequency.

Example:

If user bought milk on:

```text
1 Aug
7 Aug
13 Aug
19 Aug
```

the system should infer a roughly 6-day purchase pattern.

Do not use an ML model for this.

A simple statistical frequency calculation is enough.

---

## 17. Recommendation engine

Create:

```text
recommendation_service.py
```

Recommendations must be based on actual database data.

Use signals such as:

```text
purchase frequency
purchase history
user preferences
current basket
price
availability
season
current shopping context
```

Do not let Gemini invent recommendations.

Example scoring concept:

```text
recommendation_score =
    history_score
    + preference_score
    + price_score
    + context_score
    + season_score
    + availability_score
```

Normalize scores appropriately.

Return the reason for each recommendation.

Example:

```json
{
  "product": "Milk",
  "score": 0.87,
  "reason": [
    "You usually buy this every 6 days.",
    "Your last purchase was 7 days ago."
  ]
}
```

---

## 18. Recommendation explanations

Implement a backend response that explains why something was recommended.

Do not simply say:

```text
AI recommended this.
```

Return explainable reasons such as:

```text
Purchased frequently
Matches current preference
Fits current budget
Currently in stock
Matches current context
```

The explanation must be generated from actual signals.

---

## 19. Substitutions

Implement substitute discovery.

Example:

User searches:

```text
milk
```

If the preferred product is unavailable or too expensive, find alternatives based on:

```text
same/similar category
similar tags
similar use case
lower price
availability
```

Example:

```text
Amul Milk ₹62
Mother Dairy Milk ₹59
Almond Milk ₹145
```

Return alternatives with reasons.

Never invent substitute products.

---

## 20. Shopping context engine

Implement:

```http
POST /api/context
GET /api/context/<user_id>
DELETE /api/context/<context_id>
```

Context examples:

```text
party
breakfast
weekly_grocery
healthy_shopping
budget_shopping
guests
```

Example:

```json
{
  "context_type": "party",
  "context_data": {
    "people": 5,
    "budget": 1500,
    "preferences": [
      "healthy"
    ]
  }
}
```

Context should optionally expire using `expires_at`.

---

## 21. Context-aware recommendations

If the user says:

```text
"kal 5 friends aa rahe hain"
```

store a party context.

Then if they ask:

```text
"what else do I need?"
```

recommend products based on:

```text
party
5 people
existing basket
budget
preferences
```

Do not create an unnecessarily complex AI planning system.

A deterministic rule/scoring system is enough.

---

## 22. Basket optimizer

Create:

```http
POST /api/basket/optimize
```

Input should include the shopping list or list ID and optional budget.

Example:

```json
{
  "list_id": "...",
  "budget": 1500
}
```

The optimizer should:

1. Calculate current total.
2. Detect whether the basket exceeds budget.
3. Search for cheaper valid substitutes.
4. Calculate potential savings.
5. Return suggested changes.
6. Never automatically replace items.

Example:

```json
{
  "current_total": 1724,
  "optimized_total": 1493,
  "savings": 231,
  "suggestions": [
    {
      "current_product": "Coca-Cola",
      "replacement": "Alternative Cola",
      "saving": 50,
      "reason": "Lower price"
    }
  ]
}
```

The user must explicitly accept changes.

---

## 23. API response format

Use consistent responses.

Success:

```json
{
  "success": true,
  "data": {},
  "message": "..."
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Product not found."
  }
}
```

Use appropriate HTTP status codes:

```text
200
201
400
404
422
500
503
```

---

## 24. Error handling

Implement centralized error handling.

Handle:

* invalid JSON
* validation errors
* missing parameters
* invalid UUID
* product not found
* shopping list not found
* Supabase errors
* Gemini errors
* timeout
* unexpected exceptions

Do not expose stack traces in API responses.

Development logs can contain useful diagnostic information, but never secrets.

---

## 25. Logging

Use Python's standard `logging` module.

Log important events:

```text
API request
intent detected
database operation failure
Gemini failure
recommendation generation
```

Do NOT log:

```text
API keys
Supabase keys
full sensitive user data
```

Keep logging clean and useful.

---

## 26. CORS

Configure CORS for local frontend development.

Allow:

```text
http://localhost:3000
```

Keep it configurable through environment variables if practical.

Do not use an unnecessarily permissive production configuration.

---

## 27. Testing

Create basic tests for:

```text
health endpoint
product search
product filtering
intent parsing
invalid intent
shopping item validation
```

Tests should not require a real Gemini API call.

Mock external services where appropriate.

Tests should be simple and readable.

---

## 28. README

Create/update `README.md`.

Include:

```text
Project overview
Architecture
Tech stack
Folder structure
Environment variables
Local setup
How to run
API endpoints
Example requests
Example voice commands
Testing
Deployment notes
```

Also include an architecture diagram in Mermaid if appropriate.

---

## 29. Code quality

This is extremely important.

Write code as if it is going into a real engineering assessment.

Rules:

* Keep functions reasonably small.
* Separate routes from services.
* Separate validation from business logic.
* Use meaningful names.
* Avoid duplicated code.
* Avoid unnecessary abstractions.
* Avoid giant files.
* Avoid giant functions.
* Use type hints where useful.
* Use clear error handling.
* Keep dependencies minimal.

### Comments

Use **very few comments**.

Do not write comments like:

```python
# This function adds a product to the shopping list
```

or:

```python
# Check if the product exists
```

The code should explain itself through good naming and structure.

Only add comments when they explain a non-obvious design decision or tricky logic.

The code should feel like it was written by a human engineer, not generated by an AI template.

Do not fill every function with comments/docstrings.

---

## 30. No fake functionality

Do NOT create fake implementations such as:

```python
return {"recommendations": ["milk", "bread"]}
```

without actually using the database.

Do NOT hardcode prices.

Do NOT invent product IDs.

Do NOT pretend Gemini is working if the API is unavailable.

Do NOT create fake Supabase responses.

If something cannot be implemented because a required external credential is unavailable, implement the integration correctly and make the failure explicit.

---

## 31. Important existing issue

The current backend previously produced:

```text
PGRST125
Invalid path specified in request URL
```

You must specifically investigate this.

Check:

```text
SUPABASE_URL
Supabase client initialization
supabase.table(...)
request URL construction
environment loading
```

Do not simply catch the error and return `"database connected"`.

The `/api/health` endpoint must genuinely verify database connectivity.

---

## 32. Run verification

After implementation, actually run:

```bash
python run.py
```

Then verify:

```text
GET /api/health
GET /api/products
GET /api/products?search=milk
GET /api/products?max_price=100
```

Also run the tests.

Fix all import errors, syntax errors and runtime errors before finishing.

---

## 33. Final expected backend capabilities

At the end, the backend should support this complete flow:

```text
"bhai 2 litre doodh add kar de"
        ↓
Gemini Intent Parser
        ↓
ADD_ITEM
        ↓
Pydantic validation
        ↓
Product lookup
        ↓
Supabase
        ↓
Shopping list updated
        ↓
Structured response
```

And:

```text
"organic apples 200 ke andar dhoondh"
        ↓
SEARCH_PRODUCT
        ↓
constraints extracted
        ↓
Supabase product search
        ↓
filtered results
```

And:

```text
"kal 5 friends aa rahe hain"
        ↓
CREATE_CONTEXT
        ↓
party context stored
        ↓
recommendation engine
        ↓
context-aware suggestions
```

And:

```text
"budget 1500 se zyada nahi hona chahiye"
        ↓
basket optimizer
        ↓
current total
        ↓
substitute discovery
        ↓
potential savings
```

---

## 34. Final instruction

Do not stop after creating files.

**Actually implement the backend.**

Inspect the existing code first, modify it intelligently, install/update only necessary dependencies, run the application, run the tests, diagnose errors and fix them.

At the end provide a concise summary containing:

1. Files created/modified
2. Backend features implemented
3. Supabase issue and its fix
4. Commands to run the backend
5. Tests performed
6. Any remaining issue that genuinely requires manual configuration

Do not rewrite the entire project unnecessarily.

Do not modify the frontend.

Do not create excessive comments.

Keep the implementation clean, practical, human-readable and assessment-ready.
