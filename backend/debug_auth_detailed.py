#!/usr/bin/env python3
"""
Debug authentication endpoint in detail
"""

import asyncio
import httpx
import json
from app.core.security import get_password_hash, create_access_token
from app.core.database import get_supabase
from app.models.user import UserCreate

async def debug_registration_detailed():
    """Debug registration step by step"""
    print("🔍 Debugging Registration Step by Step...")
    
    try:
        # Step 1: Test user creation model
        user_data = UserCreate(
            email="testuser@example.com",
            password="testpass123",
            full_name="Test User"
        )
        print(f"✅ Step 1: User model created: {user_data.email}")
        
        # Step 2: Test password hashing
        hashed_password = get_password_hash(user_data.password)
        print(f"✅ Step 2: Password hashed successfully")
        
        # Step 3: Test database connection
        supabase = get_supabase()
        print(f"✅ Step 3: Database connection established")
        
        # Step 4: Check if user already exists
        existing_user = supabase.table("users").select("*").eq("email", user_data.email).execute()
        print(f"✅ Step 4: Existing user check: {len(existing_user.data) if existing_user.data else 0} users found")
        
        # Step 5: Create user
        new_user = {
            "email": user_data.email,
            "hashed_password": hashed_password,
            "full_name": user_data.full_name
        }
        
        response = supabase.table("users").insert(new_user).execute()
        print(f"✅ Step 5: User created in database: {response.data[0]['id'] if response.data else 'Failed'}")
        
        # Step 6: Create JWT token
        if response.data:
            created_user = response.data[0]
            access_token = create_access_token(data={"sub": created_user["id"]})
            print(f"✅ Step 6: JWT token created: {access_token[:50]}...")
            
            # Clean up
            supabase.table("users").delete().eq("id", created_user["id"]).execute()
            print(f"✅ Cleanup: Test user deleted")
        
        return True
        
    except Exception as e:
        print(f"❌ Error in registration debug: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

async def test_api_endpoint():
    """Test the actual API endpoint"""
    print("\n🔍 Testing Actual API Endpoint...")
    
    base_url = "http://localhost:8000"
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        registration_data = {
            "email": "testuser@example.com",
            "password": "testpass123",
            "full_name": "Test User"
        }
        
        try:
            response = await client.post(f"{base_url}/api/auth/register", json=registration_data)
            print(f"Status Code: {response.status_code}")
            print(f"Response Headers: {dict(response.headers)}")
            print(f"Response Body: {response.text}")
            
            # Try to get more detailed error info
            if response.status_code == 500:
                print(f"❌ Internal Server Error - Check server logs")
            
        except Exception as e:
            print(f"❌ API request failed: {str(e)}")

async def main():
    print("🐛 Detailed Authentication Debug")
    print("="*50)
    
    # Test step by step
    success = await debug_registration_detailed()
    
    if success:
        # Test actual API
        await test_api_endpoint()
    
    print("\n" + "="*50)
    print("Debug complete!")

if __name__ == "__main__":
    asyncio.run(main())
