import logging

from flask import Blueprint

from app.services.supabase_service import supabase

logger = logging.getLogger(__name__)
health_bp = Blueprint("health", __name__)


@health_bp.get("/health")
def health():
    try:
        supabase.table("products").select("id").limit(1).execute()
        return {"status": "healthy", "database": "connected"}, 200
    except Exception as exc:
        logger.error("Health check failed: %s", exc)
        return {"status": "unhealthy", "database": "error"}, 503