import logging

from flask import Blueprint, g, request
from pydantic import ValidationError

from app.schemas.common import error, success
from app.schemas.seller import LoginRequest, RegisterRequest
from app.services import auth_service
from app.utils.auth import require_seller
from app.utils.errors import APIError

logger = logging.getLogger(__name__)
seller_auth_bp = Blueprint("seller_auth", __name__)


@seller_auth_bp.post("/seller/auth/register")
def register():
    try:
        body = RegisterRequest.model_validate(request.get_json(force=True) or {})
    except ValidationError as exc:
        return error(str(exc), "VALIDATION_ERROR", 422)
    try:
        seller = auth_service.register_seller(body.email, body.password)
        return success(data={"seller": seller}, message="Seller account created.", code=201)
    except APIError:
        raise
    except Exception as exc:
        logger.error("Registration error: %s", exc)
        return error("Registration failed.", "DB_ERROR", 503)


@seller_auth_bp.post("/seller/auth/login")
def login():
    try:
        body = LoginRequest.model_validate(request.get_json(force=True) or {})
    except ValidationError as exc:
        return error(str(exc), "VALIDATION_ERROR", 422)
    try:
        result = auth_service.login_seller(body.email, body.password)
        return success(data=result, message="Login successful.")
    except APIError:
        raise
    except Exception as exc:
        logger.error("Login error: %s", exc)
        return error("Login failed.", "DB_ERROR", 503)


@seller_auth_bp.get("/seller/auth/me")
@require_seller
def me():
    try:
        seller = auth_service.get_seller_by_id(g.seller_id)
        if not seller:
            return error("Seller not found.", "NOT_FOUND", 404)
        return success(data={"seller": seller})
    except APIError:
        raise
    except Exception as exc:
        logger.error("Me error: %s", exc)
        return error("Failed to fetch profile.", "DB_ERROR", 503)
