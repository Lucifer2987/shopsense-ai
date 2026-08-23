import logging

from flask import Blueprint, request

from app.schemas.common import error, success
from app.schemas.intent import (
    AddItemIntent, RemoveItemIntent, UpdateQuantityIntent,
    SearchProductIntent, SetBudgetIntent, SetPreferenceIntent,
    CreateContextIntent, SimpleIntent,
)
from app.services import intent_service, shopping_service, product_service, context_service

logger = logging.getLogger(__name__)
voice_bp = Blueprint("voice", __name__)

# Default list/user IDs can be passed in body; without auth these are required.
_DEFAULT_USER = "anonymous"


@voice_bp.post("/voice/command")
def voice_command():
    body = request.get_json(force=True) or {}
    text = (body.get("text") or "").strip()
    if not text:
        return error("Field 'text' is required.", "MISSING_PARAM")

    list_id = body.get("list_id")
    user_id = body.get("user_id", _DEFAULT_USER)

    try:
        intent = intent_service.extract_intent(text)
    except ValueError as exc:
        return error(str(exc), "INTENT_PARSE_ERROR", 422)
    except RuntimeError as exc:
        return error(str(exc), "AI_UNAVAILABLE", 503)

    logger.info("Intent: %s", intent.intent)

    return _dispatch(intent, list_id=list_id, user_id=user_id)


def _dispatch(intent, list_id, user_id):
    if isinstance(intent, AddItemIntent):
        return _handle_add(intent, list_id)

    if isinstance(intent, RemoveItemIntent):
        return _handle_remove(intent, list_id)

    if isinstance(intent, UpdateQuantityIntent):
        return _handle_update_qty(intent, list_id)

    if isinstance(intent, SearchProductIntent):
        return _handle_search(intent)

    if isinstance(intent, SetBudgetIntent):
        return success(
            data={"budget": intent.budget},
            message=f"Budget set to ₹{intent.budget:.0f}.",
        )

    if isinstance(intent, SetPreferenceIntent):
        return success(
            data={"preference": intent.preference},
            message=f"Preference noted: {intent.preference}.",
        )

    if isinstance(intent, CreateContextIntent):
        try:
            ctx = context_service.create_context(
                user_id=user_id,
                context_type=intent.context.type,
                context_data=intent.context.model_dump(exclude_none=True),
            )
            return success(data=ctx, message="Shopping context saved.", code=201)
        except Exception as exc:
            logger.error("Context save error: %s", exc)
            return error("Failed to save context.", "DB_ERROR", 503)

    if isinstance(intent, SimpleIntent):
        if intent.intent == "SHOW_LIST":
            if not list_id:
                return error("list_id is required to show the list.", "MISSING_PARAM")
            try:
                lst = shopping_service.get_list(list_id)
                return success(data=lst) if lst else error("List not found.", "NOT_FOUND", 404)
            except Exception as exc:
                return error("Failed to fetch list.", "DB_ERROR", 503)

        if intent.intent == "GET_RECOMMENDATIONS":
            from app.services import recommendation_service
            ctx = context_service.get_active_context(user_id)
            ctx_data = ctx["context_data"] if ctx else None
            recs = recommendation_service.get_recommendations(user_id, context=ctx_data)
            return success(data={"recommendations": recs})

    return success(
        data={"intent": intent.intent},
        message="Understood, but no automatic action was taken.",
    )


def _handle_add(intent: AddItemIntent, list_id):
    if not list_id:
        return error("list_id is required to add items.", "MISSING_PARAM")

    added = []
    not_found = []
    insert_errors: list[str] = []

    for item in intent.items:
        brand_hint = getattr(item, "brand", None)
        product = product_service.find_best_product(item.name, brand=brand_hint)
        if not product:
            not_found.append(item.name)
            continue
        try:
            shopping_service.add_item(list_id, product["id"], item.quantity, item.unit)
            alternatives = product_service.find_products_by_name(item.name)
            alt_names = [
                a["name"] + (f" ({a['brand']})" if a.get("brand") else "")
                for a in alternatives
                if a["id"] != product["id"]
            ]
            added.append({
                "product": product["name"],
                "brand": product.get("brand"),
                "price": product.get("price"),
                "quantity": item.quantity,
                "unit": item.unit,
                "alternatives": alt_names,
            })
        except Exception as exc:
            logger.error("Add item DB error for '%s': %s", product['name'], exc)
            insert_errors.append(product["name"])

    if not_found:
        logger.warning("Products not found: %s", not_found)
    if insert_errors:
        logger.error("Insert failed for products: %s", insert_errors)

    if not added:
        if insert_errors and not not_found:
            return error(
                f"Found products but failed to add to list: {', '.join(insert_errors)}. "
                "Check that list_id is a valid UUID.",
                "LIST_ERROR",
                400,
            )
        return error(
            f"Couldn't find products: {', '.join(not_found)}.",
            "PRODUCT_NOT_FOUND",
            404,
        )

    msg_parts = [
        f"{a['quantity']} {a['unit']} of {a['product']}"
        + (f" ({a['brand']})" if a.get("brand") else "")
        for a in added
    ]
    message = f"Added {', '.join(msg_parts)} to your list."
    if not_found:
        message += f" Couldn't find: {', '.join(not_found)}."

    return success(data={"added": added, "not_found": not_found}, message=message)



def _handle_remove(intent: RemoveItemIntent, list_id):
    if not list_id:
        return error("list_id is required.", "MISSING_PARAM")
    items = shopping_service.get_list_items(list_id)
    target_name = intent.name.lower()
    for item in items:
        product = item.get("products") or {}
        if target_name in (product.get("name") or "").lower():
            shopping_service.delete_item(item["id"])
            return success(message=f"Removed {product['name']} from your list.")
    return error(f"'{intent.name}' not found in your list.", "ITEM_NOT_FOUND", 404)


def _handle_update_qty(intent: UpdateQuantityIntent, list_id):
    if not list_id:
        return error("list_id is required.", "MISSING_PARAM")
    items = shopping_service.get_list_items(list_id)
    target_name = intent.name.lower()
    for item in items:
        product = item.get("products") or {}
        if target_name in (product.get("name") or "").lower():
            updated = shopping_service.update_item(item["id"], intent.quantity, None)
            return success(data=updated, message=f"Updated {product['name']} to {intent.quantity} {intent.unit}.")
    return error(f"'{intent.name}' not found in your list.", "ITEM_NOT_FOUND", 404)


def _handle_search(intent: SearchProductIntent):
    c = intent.constraints
    products = product_service.get_products(
        search=intent.query,
        category=c.category,
        brand=c.brand,
        max_price=c.max_price,
        min_price=c.min_price,
        in_stock=True if c.organic else None,
    )

    if not products:
        return success(
            data={"products": [], "query": intent.query},
            message=f"No products found matching '{intent.query}'.",
        )

    if c.organic:
        products = [
            p for p in products
            if "organic" in " ".join(p.get("tags") or []).lower()
            or "organic" in (p.get("name") or "").lower()
        ]

    return success(data={"products": products, "count": len(products), "query": intent.query})
