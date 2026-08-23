import logging
from typing import Any

from pydantic import ValidationError

from app.schemas.intent import parse_intent, AnyIntent
from app.services import gemini_service

logger = logging.getLogger(__name__)


def extract_intent(text: str) -> AnyIntent:
    raw = gemini_service.parse_command(text)
    logger.info("Raw intent from Gemini: %s", raw.get("intent"))
    try:
        return parse_intent(raw)
    except ValidationError as exc:
        logger.warning("Intent validation failed: %s", exc)
        raise ValueError(f"Invalid intent structure: {exc}") from exc
