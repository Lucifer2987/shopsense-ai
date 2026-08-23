"""
Real end-to-end live test: creates a shopping list via API, runs the voice command,
verifies success, then cleans up.
"""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dotenv import load_dotenv
load_dotenv(override=True)

import httpx

BASE = "http://localhost:5000/api"

# Step 1: Check health
r = httpx.get(f"{BASE}/health")
assert r.status_code == 200 and r.json()["status"] == "healthy", f"Health failed: {r.text}"
print("PASS: /api/health -> healthy")

# Step 2: Verify products endpoint returns milk
r = httpx.get(f"{BASE}/products?search=milk")
products = r.json()["data"]["products"]
assert len(products) >= 1, "Expected at least 1 milk product"
print(f"PASS: /api/products?search=milk -> {len(products)} products")
for p in products:
    print(f"       {p['name']} ({p['brand']}) price={p['price']}")

# Step 3: Use Supabase directly to create a list (bypassing FK via service key)
from app.services.supabase_service import supabase

# Find or create a test profile
profile_id = "00000000-0000-0000-0000-000000000099"
try:
    supabase.table("profiles").insert({"id": profile_id}).execute()
    print(f"  Created test profile: {profile_id}")
except Exception:
    print(f"  Profile already exists: {profile_id}")

# Create a shopping list
list_result = supabase.table("shopping_lists").insert({
    "user_id": profile_id,
    "name": "E2E-Test-List"
}).execute()
list_id = list_result.data[0]["id"]
print(f"  Created shopping list: {list_id}")

try:
    # Step 4: Run voice command with real list_id
    payload = {"text": "bhai 2 litre doodh add kar de", "list_id": list_id}
    r = httpx.post(f"{BASE}/voice/command", json=payload, timeout=30)
    resp = r.json()
    print(f"\nPASS: /api/voice/command")
    print(f"  HTTP: {r.status_code}")
    print(f"  Response: {json.dumps(resp, indent=2, ensure_ascii=False)}")

    assert resp["success"] is True, f"Expected success but got: {resp}"
    assert len(resp["data"]["added"]) >= 1
    added = resp["data"]["added"][0]
    assert "milk" in added["product"].lower()
    assert added["quantity"] == 2
    print(f"\nPASS: Added '{added['product']}' ({added['brand']}) x{added['quantity']} {added['unit']}")
    if added.get("alternatives"):
        print(f"  Alternatives: {', '.join(added['alternatives'])}")

finally:
    # Cleanup
    supabase.table("shopping_items").delete().eq("list_id", list_id).execute()
    supabase.table("shopping_lists").delete().eq("id", list_id).execute()
    supabase.table("profiles").delete().eq("id", profile_id).execute()
    print(f"\n  Cleaned up list {list_id} and test profile")

print("\nAll end-to-end tests passed.")
