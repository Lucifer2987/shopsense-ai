import os
import re

from dotenv import load_dotenv

load_dotenv(override=True)


class Config:
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    CORS_ORIGINS: list[str] = [
        o.strip()
        for o in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
    ]

    @classmethod
    def clean_supabase_url(cls) -> str:
        url = cls.SUPABASE_URL.strip().rstrip("/")
        # Strip accidentally appended /rest/v1 path — the SDK adds this itself
        url = re.sub(r"/rest/v1.*$", "", url)
        return url


def validate_config() -> None:
    missing = [
        k
        for k, v in {
            "SUPABASE_URL": Config.SUPABASE_URL,
            "SUPABASE_KEY": Config.SUPABASE_KEY,
            "GEMINI_API_KEY": Config.GEMINI_API_KEY,
        }.items()
        if not v
    ]
    if missing:
        raise RuntimeError(f"Missing environment variables: {', '.join(missing)}")