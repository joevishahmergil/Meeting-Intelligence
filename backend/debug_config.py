from app.core.config import settings
import os

print(f"DEBUG: Checking Configuration Loading...")
print(f"Current Directory: {os.getcwd()}")
print(f"Files in Config dir: {os.listdir('app/core')}")
print(f"Does .env exist? {os.path.exists('.env')}")

# Print length/existence without revealing full secret
key = settings.SUPABASE_KEY
print(f"SUPABASE_KEY type: {type(key)}")
print(f"SUPABASE_KEY length: {len(key) if key else 0}")
print(f"SUPABASE_KEY starts with: {key[:5] if key else 'None'}")
print(f"SUPABASE_KEY is empty string? {key == ''}")

url = settings.SUPABASE_URL
print(f"SUPABASE_URL: {url}")
