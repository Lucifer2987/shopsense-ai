import json
from unittest.mock import MagicMock, patch

from app.schemas.intent import AddItemIntent, SearchProductIntent, SetBudgetIntent


def test_parse_add_item_intent():
    raw = {"intent": "ADD_ITEM", "items": [{"name": "milk", "quantity": 2, "unit": "litre"}]}
    from app.schemas.intent import parse_intent
    intent = parse_intent(raw)
    assert isinstance(intent, AddItemIntent)
    assert intent.items[0].name == "milk"
    assert intent.items[0].quantity == 2


def test_parse_search_intent():
    raw = {"intent": "SEARCH_PRODUCT", "query": "apples", "constraints": {"max_price": 200, "organic": True}}
    from app.schemas.intent import parse_intent
    intent = parse_intent(raw)
    assert isinstance(intent, SearchProductIntent)
    assert intent.query == "apples"
    assert intent.constraints.max_price == 200


def test_parse_set_budget_intent():
    raw = {"intent": "SET_BUDGET", "budget": 1000}
    from app.schemas.intent import parse_intent
    intent = parse_intent(raw)
    assert isinstance(intent, SetBudgetIntent)
    assert intent.budget == 1000


def test_invalid_add_item_zero_quantity():
    from pydantic import ValidationError
    with pytest.raises(ValidationError):
        AddItemIntent.model_validate({
            "intent": "ADD_ITEM",
            "items": [{"name": "milk", "quantity": 0, "unit": "litre"}]
        })


def test_voice_command_missing_text(client):
    response = client.post("/api/voice/command", json={})
    assert response.status_code == 400
    data = response.get_json()
    assert data["success"] is False
    assert data["error"]["code"] == "MISSING_PARAM"


def test_voice_command_gemini_failure(client):
    with patch("app.services.gemini_service.parse_command") as mock_parse:
        mock_parse.side_effect = RuntimeError("Gemini unavailable")
        response = client.post("/api/voice/command", json={"text": "add milk"})
    assert response.status_code == 503
    data = response.get_json()
    assert data["error"]["code"] == "AI_UNAVAILABLE"


import pytest
