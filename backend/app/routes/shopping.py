import logging

from flask import Blueprint, request
from pydantic import ValidationError

from app.schemas.common import error, success
from app.schemas.shopping import AddItemRequest, CreateListRequest, UpdateItemRequest
from app.services import shopping_service

logger = logging.getLogger(__name__)
shopping_bp = Blueprint("shopping", __name__)


@shopping_bp.post("/shopping-lists")
def create_list():
    try:
        body = CreateListRequest.model_validate(request.get_json(force=True) or {})
    except ValidationError as exc:
        return error(str(exc), "VALIDATION_ERROR", 422)
    try:
        lst = shopping_service.create_list(body.user_id, body.name)
        return success(data=lst, message="Shopping list created.", code=201)
    except Exception as exc:
        logger.error("Create list error: %s", exc)
        return error("Failed to create shopping list.", "DB_ERROR", 503)


@shopping_bp.get("/shopping-lists/<list_id>")
def get_list(list_id: str):
    try:
        lst = shopping_service.get_list(list_id)
        if not lst:
            return error("Shopping list not found.", "LIST_NOT_FOUND", 404)
        return success(data=lst)
    except Exception as exc:
        logger.error("Get list error: %s", exc)
        return error("Failed to fetch shopping list.", "DB_ERROR", 503)


@shopping_bp.delete("/shopping-lists/<list_id>")
def delete_list(list_id: str):
    try:
        deleted = shopping_service.delete_list(list_id)
        if not deleted:
            return error("Shopping list not found.", "LIST_NOT_FOUND", 404)
        return success(message="Shopping list deleted.")
    except Exception as exc:
        logger.error("Delete list error: %s", exc)
        return error("Failed to delete shopping list.", "DB_ERROR", 503)


@shopping_bp.post("/shopping-lists/<list_id>/items")
def add_item(list_id: str):
    try:
        body = AddItemRequest.model_validate(request.get_json(force=True) or {})
    except ValidationError as exc:
        return error(str(exc), "VALIDATION_ERROR", 422)
    try:
        item = shopping_service.add_item(list_id, body.product_id, body.quantity, body.unit)
        return success(data=item, message="Item added to shopping list.", code=201)
    except Exception as exc:
        logger.error("Add item error: %s", exc)
        return error("Failed to add item.", "DB_ERROR", 503)


@shopping_bp.patch("/shopping-items/<item_id>")
def update_item(item_id: str):
    try:
        body = UpdateItemRequest.model_validate(request.get_json(force=True) or {})
    except ValidationError as exc:
        return error(str(exc), "VALIDATION_ERROR", 422)
    try:
        item = shopping_service.update_item(item_id, body.quantity, body.is_completed)
        if not item:
            return error("Item not found or no changes.", "NOT_FOUND", 404)
        return success(data=item, message="Item updated.")
    except Exception as exc:
        logger.error("Update item error: %s", exc)
        return error("Failed to update item.", "DB_ERROR", 503)


@shopping_bp.delete("/shopping-items/<item_id>")
def delete_item(item_id: str):
    try:
        deleted = shopping_service.delete_item(item_id)
        if not deleted:
            return error("Item not found.", "NOT_FOUND", 404)
        return success(message="Item removed.")
    except Exception as exc:
        logger.error("Delete item error: %s", exc)
        return error("Failed to delete item.", "DB_ERROR", 503)
