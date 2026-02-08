#!/usr/bin/env python3
"""
Debug script to test authentication endpoints
"""

import asyncio
import httpx
import json

async def debug_auth():
    """Debug authentication endpoints"""
    base_url = "http://localhost:8000"
    
    async with httpx.AsyncClient() as client:
        print("🔍 Testing Registration Endpoint...")
        
        # Test registration
        registration_data = {
            "email": "testuser@example.com",
            "password": "testpass123",
            "full_name": "Test User"
        }
        
        try:
            response = await client.post(f"{base_url}/api/auth/register", json=registration_data)
            print(f"Status Code: {response.status_code}")
            print(f"Headers: {dict(response.headers)}")
            print(f"Response: {response.text}")
            
            if response.status_code == 201:
                data = response.json()
                print(f"✅ Registration successful!")
                print(f"Token: {data.get('access_token', 'N/A')[:50]}...")
                return data.get('access_token')
            else:
                print(f"❌ Registration failed")
                return None
                
        except Exception as e:
            print(f"❌ Exception during registration: {str(e)}")
            return None

async def debug_login():
    """Debug login endpoint"""
    base_url = "http://localhost:8000"
    
    async with httpx.AsyncClient() as client:
        print("\n🔍 Testing Login Endpoint...")
        
        # Test login
        login_data = {
            "email": "testuser@example.com",
            "password": "testpass123"
        }
        
        try:
            response = await client.post(f"{base_url}/api/auth/login", json=login_data)
            print(f"Status Code: {response.status_code}")
            print(f"Headers: {dict(response.headers)}")
            print(f"Response: {response.text}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Login successful!")
                print(f"Token: {data.get('access_token', 'N/A')[:50]}...")
                return data.get('access_token')
            else:
                print(f"❌ Login failed")
                return None
                
        except Exception as e:
            print(f"❌ Exception during login: {str(e)}")
            return None

async def debug_unauthorized():
    """Debug unauthorized access"""
    base_url = "http://localhost:8000"
    
    async with httpx.AsyncClient() as client:
        print("\n🔍 Testing Unauthorized Access...")
        
        try:
            response = await client.get(f"{base_url}/api/projects")
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.text}")
            
            if response.status_code == 401:
                print(f"✅ Correctly returned 401")
            elif response.status_code == 403:
                print(f"⚠️  Returned 403 instead of 401 (FastAPI default)")
            else:
                print(f"❌ Unexpected status code: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Exception during unauthorized test: {str(e)}")

async def main():
    print("🐛 Authentication Debug Script")
    print("="*50)
    
    # Test registration
    token = await debug_auth()
    
    # Test login
    if not token:
        token = await debug_login()
    
    # Test unauthorized access
    await debug_unauthorized()
    
    print("\n" + "="*50)
    print("Debug complete!")

if __name__ == "__main__":
    asyncio.run(main())
