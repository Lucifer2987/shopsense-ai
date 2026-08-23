import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from dotenv import load_dotenv
load_dotenv()
from app.services.supabase_service import supabase

# Test 1: ilike search for milk
print("=== ilike search: name ilike '%milk%' ===")
r1 = supabase.table("products").select("id,name,brand,stock").ilike("name", "%milk%").execute()
print(f"Rows: {len(r1.data)}")
for p in r1.data:
    print(f"  {p}")

# Test 2: with .gt('stock', 0) — may break on boolean stock
print("\n=== ilike + .gt('stock', 0) ===")
try:
    r2 = supabase.table("products").select("id,name,brand,stock").ilike("name", "%milk%").gt("stock", 0).execute()
    print(f"Rows: {len(r2.data)}")
    for p in r2.data:
        print(f"  {p}")
except Exception as exc:
    print(f"ERROR: {exc}")

# Test 3: with .eq('stock', True)
print("\n=== ilike + .eq('stock', True) ===")
try:
    r3 = supabase.table("products").select("id,name,brand,stock").ilike("name", "%milk%").eq("stock", True).execute()
    print(f"Rows: {len(r3.data)}")
    for p in r3.data:
        print(f"  {p}")
except Exception as exc:
    print(f"ERROR: {exc}")
