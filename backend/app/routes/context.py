import logging

from flask import Blueprint, request
from pydantic import ValidationError

from app.schemas.common import error, success
from app.services import context_service

logger = logging.getLogger(__name__)
context_bp = Blueprint("context", __name__)


@context_bp.post("/context")
def create_context():
    body = request.get_json(force=True) or {}
    user_id = body.get("user_id", "").strip()
    context_type = body.get("context_type", "").strip()
    context_data = body.get("context_data") or {}

    if not user_id or not context_type:
        return error("user_id and context_type are required.", "MISSING_PARAM")

    try:
        ctx = context_service.create_context(
            user_id=user_id,
            context_type=context_type,
            context_data=context_data,
            expires_at=body.get("expires_at"),
        )
        return success(data=ctx, message="Context created.", code=201)
    except Exception as exc:
        logger.error("Context create error: %s", exc)
        return error("Failed to create context.", "DB_ERROR", 503)


@context_bp.get("/context/<user_id>")
def get_context(user_id: str):
    try:
        contexts = context_service.get_context(user_id)
        return success(data={"contexts": contexts, "count": len(contexts)})
    except Exception as exc:
        logger.error("Context fetch error: %s", exc)
        return error("Failed to fetch context.", "DB_ERROR", 503)


@context_bp.delete("/context/<context_id>")
def delete_context(context_id: str):
    try:
        deleted = context_service.delete_context(context_id)
        if not deleted:
            return error("Context not found.", "NOT_FOUND", 404)
        return success(message="Context deleted.")
    except Exception as exc:
        logger.error("Context delete error: %s", exc)
        return error("Failed to delete context.", "DB_ERROR", 503)
