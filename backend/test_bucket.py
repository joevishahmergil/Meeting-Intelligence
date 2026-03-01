import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")
bucket_name: str = "meeting-audio"

supabase: Client = create_client(url, key)

try:
    print("Creating bucket...")
    supabase.storage.create_bucket(bucket_name, options={'public': True})
    print(f"Bucket {bucket_name} created successfully!")
except Exception as e:
    print(f"Error: {e}")
