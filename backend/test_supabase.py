from supabase import create_client, Client
from app.core.config import settings
import os
import traceback

def test_connection():
    print("--- Supabase Connection Test ---")
    
    # 1. Verify .env availability
    env_path = os.path.abspath(".env")
    if os.path.exists(env_path):
        print(f"Found .env file at: {env_path}")
        # Check actual file content for debug confidence
        with open(env_path, "r") as f:
            content = f.read()
            if "SUPABASE_KEY" in content:
                print("Confirmed: 'SUPABASE_KEY' is present in .env file.")
            else:
                print("WARNING: 'SUPABASE_KEY' not found in text of .env file!")
    else:
        print("WARNING: .env file NOT found in current directory!")
        print(f"Expected at: {env_path}")

    try:
        url = settings.SUPABASE_URL
        key = settings.SUPABASE_KEY
        
        print(f"\nLoaded Settings:")
        print(f"URL: '{url}'")
        # Show start/end of key for verification
        masked_key = f"{key[:10]}...{key[-10:]}" if key and len(key) > 20 else key
        print(f"Key: '{masked_key}' (Length: {len(key)})")
        
        if not key:
            print("ERROR: Supabase Key is empty!")
            return

        # Basic JWT format check (Supabase keys are JWTs)
        if not key.startswith("ey") or key.count(".") < 2:
            print("\n❌ CRITICAL WARNING: Invalid Key Format")
            print("The loaded SUPABASE_KEY does not look like a valid Supabase Project API Key.")
            print(f"Current format starts with: '{key[:10]}...'")
            print("Supabase `anon` and `service_role` keys are JWTs and typically start with 'eyJ'.")
            print("👉 Please check your Supabase Dashboard > Project Settings > API.")
            print("   Use the 'anon' public key or 'service_role' secret.")
            print("   Do NOT use the Database Password or Personal Access Tokens here.\n")

        print("\nInitializing Supabase Client...")
        client = create_client(url, key)
        print("SUCCESS: Client created successfully!")
        
    except Exception as e:
        print("\nERROR creating client:")
        # Check for the specific "Invalid API key" message
        if "Invalid API key" in str(e):
             print("\n❌ SUPABASE ERROR: Invalid API Key")
             print("The Supabase client rejected the key. This confirms it is not a valid Project API JWT.")
             print("Please update your .env file with the 'anon' or 'service_role' key from your project dashboard.")
        else:
             traceback.print_exc()

if __name__ == "__main__":
    test_connection()
