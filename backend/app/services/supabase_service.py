import logging

# pyrefly: ignore [missing-import]
from supabase import Client, create_client

from app.config import Config

logger = logging.getLogger(__name__)


def _create_client() -> Client:
    url = Config.clean_supabase_url()
    key = Config.SUPABASE_KEY.strip()
    logger.info("Initialising Supabase client for project: %s", url)
    return create_client(url, key)


supabase: Client = _create_client()