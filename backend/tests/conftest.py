import pytest
from unittest.mock import MagicMock, patch

from app import create_app


@pytest.fixture()
def app():
    with patch("app.services.supabase_service._create_client", return_value=MagicMock()):
        with patch("app.services.gemini_service._client", MagicMock()):
            return create_app()


@pytest.fixture()
def client(app):
    return app.test_client()
