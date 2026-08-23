"""
Full end-to-end voice intent test using the production gemini_service.
"""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from dotenv import load_dotenv
load_dotenv()

from app.services.gemini_service import parse_command

test_cases = [
    ("bhai 2 litre doodh add kar de", "ADD_ITEM"),
    ("find organic apples under 200", "SEARCH_PRODUCT"),
    ("mera budget 1000 hai", "SET_BUDGET"),
    ("kal 5 friends aa rahe hain", "CREATE_CONTEXT"),
]

all_passed = True
for text, expected_intent in test_cases:
    print(f"Input:    {text!r}")
    try:
        result = parse_command(text)
        intent = result.get("intent")
        print(f"Output:   {json.dumps(result, ensure_ascii=False, indent=2)}")
        status = "✓ PASS" if intent == expected_intent else f"✗ FAIL (expected {expected_intent}, got {intent})"
        print(f"Status:   {status}")
        if intent != expected_intent:
            all_passed = False
    except Exception as exc:
        print(f"ERROR:    {exc}")
        all_passed = False
    print()

print("All tests passed." if all_passed else "Some tests failed.")
sys.exit(0 if all_passed else 1)
