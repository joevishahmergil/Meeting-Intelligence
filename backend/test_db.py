#!/usr/bin/env python3
"""
Test database connection
"""

import asyncio
from app.core.database import get_supabase

async def test_db_connection():
    """Test database connection"""
    try:
        supabase = get_supabase()
        
        # Test basic connection by checking if users table exists
        response = supabase.table("users").select("count").execute()
        print(f"✅ Database connection successful")
        print(f"Response: {response}")
        
        # Test creating a user
        test_user = {
            "email": "test@example.com",
            "hashed_password": "test_hash",
            "full_name": "Test User"
        }
        
        try:
            response = supabase.table("users").insert(test_user).execute()
            print(f"✅ User creation successful: {response}")
            
            # Clean up
            if response.data:
                user_id = response.data[0]["id"]
                supabase.table("users").delete().eq("id", user_id).execute()
                print(f"✅ Test user cleaned up")
                
        except Exception as e:
            print(f"❌ User creation failed: {str(e)}")
            
    except Exception as e:
        print(f"❌ Database connection failed: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_db_connection())
