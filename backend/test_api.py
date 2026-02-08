#!/usr/bin/env python3
"""
Comprehensive API Testing Script for Meeting Intelligence Backend
Tests all API endpoints with realistic data and error handling
"""

import asyncio
import httpx
import json
import os
from datetime import datetime, date, time
from typing import Dict, Any, Optional

# API Configuration
BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api"

# Test Data
TEST_USER = {
    "email": "testuser@example.com",
    "password": "testpass123",
    "full_name": "Test User"
}

TEST_PROJECT = {
    "name": "Test Project",
    "description": "A test project for API testing",
    "color": "#3B82F6"
}

TEST_MEETING = {
    "title": "Team Standup Meeting",
    "meeting_date": str(date.today()),
    "meeting_time": "10:00:00",
    "meeting_type": "Standup",
    "attendees": ["john@example.com", "jane@example.com"],
    "source": "manual",
    "calendar_event_id": None
}

class APITester:
    def __init__(self):
        self.client = httpx.AsyncClient(base_url=BASE_URL)
        self.auth_token: Optional[str] = None
        self.user_id: Optional[str] = None
        self.project_id: Optional[str] = None
        self.meeting_id: Optional[str] = None
        self.test_results = []
        
    def log_result(self, test_name: str, status: str, details: str = "", response_data: Any = None):
        """Log test result"""
        result = {
            "test": test_name,
            "status": status,
            "details": details,
            "timestamp": datetime.now().isoformat(),
            "response_data": response_data
        }
        self.test_results.append(result)
        
        status_icon = "✅" if status == "PASS" else "❌" if status == "FAIL" else "⚠️"
        print(f"{status_icon} {test_name}: {status}")
        if details:
            print(f"   Details: {details}")
        if response_data and status == "FAIL":
            print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
        print()
    
    async def test_health_check(self):
        """Test health check endpoint"""
        try:
            response = await self.client.get("/health")
            if response.status_code == 200:
                self.log_result("Health Check", "PASS", "Service is healthy", response.json())
                return True
            else:
                self.log_result("Health Check", "FAIL", f"Status code: {response.status_code}")
                return False
        except Exception as e:
            self.log_result("Health Check", "FAIL", f"Exception: {str(e)}")
            return False
    
    async def test_root_endpoint(self):
        """Test root endpoint"""
        try:
            response = await self.client.get("/")
            if response.status_code == 200:
                data = response.json()
                self.log_result("Root Endpoint", "PASS", f"Welcome message: {data.get('message')}")
                return True
            else:
                self.log_result("Root Endpoint", "FAIL", f"Status code: {response.status_code}")
                return False
        except Exception as e:
            self.log_result("Root Endpoint", "FAIL", f"Exception: {str(e)}")
            return False
    
    async def test_user_registration(self):
        """Test user registration"""
        try:
            response = await self.client.post(f"{API_BASE}/auth/register", json=TEST_USER)
            if response.status_code == 201:
                data = response.json()
                self.auth_token = data.get("access_token")
                self.user_id = data.get("user", {}).get("id")
                self.log_result("User Registration", "PASS", f"User created: {TEST_USER['email']}")
                return True
            elif response.status_code == 400 and "Email already registered" in response.text:
                self.log_result("User Registration", "PASS", f"User already exists: {TEST_USER['email']}")
                # Try to login with existing user
                return await self.test_user_login()
            else:
                self.log_result("User Registration", "FAIL", f"Status code: {response.status_code}", response.json())
                return False
        except Exception as e:
            self.log_result("User Registration", "FAIL", f"Exception: {str(e)}")
            return False
    
    async def test_user_login(self):
        """Test user login"""
        try:
            response = await self.client.post(f"{API_BASE}/auth/login", json={
                "email": TEST_USER["email"],
                "password": TEST_USER["password"]
            })
            if response.status_code == 200:
                data = response.json()
                self.auth_token = data.get("access_token")
                self.user_id = data.get("user", {}).get("id")
                self.log_result("User Login", "PASS", f"Login successful for {TEST_USER['email']}")
                return True
            else:
                self.log_result("User Login", "FAIL", f"Status code: {response.status_code}", response.json() if response.content else "No content")
                return False
        except Exception as e:
            self.log_result("User Login", "FAIL", f"Exception: {str(e)}")
            return False
    
    async def test_get_current_user(self):
        """Test getting current user info"""
        if not self.auth_token:
            self.log_result("Get Current User", "SKIP", "No auth token available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = await self.client.get(f"{API_BASE}/auth/me", headers=headers)
            if response.status_code == 200:
                data = response.json()
                self.log_result("Get Current User", "PASS", f"User: {data.get('email')}")
                return True
            else:
                self.log_result("Get Current User", "FAIL", f"Status code: {response.status_code}", response.json())
                return False
        except Exception as e:
            self.log_result("Get Current User", "FAIL", f"Exception: {str(e)}")
            return False
    
    async def test_create_project(self):
        """Test creating a project"""
        if not self.auth_token:
            self.log_result("Create Project", "SKIP", "No auth token available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = await self.client.post(f"{API_BASE}/projects", json=TEST_PROJECT, headers=headers)
            if response.status_code == 201:
                data = response.json()
                self.project_id = data.get("id")
                self.log_result("Create Project", "PASS", f"Project created: {TEST_PROJECT['name']}")
                return True
            else:
                self.log_result("Create Project", "FAIL", f"Status code: {response.status_code}", response.json())
                return False
        except Exception as e:
            self.log_result("Create Project", "FAIL", f"Exception: {str(e)}")
            return False
    
    async def test_get_projects(self):
        """Test getting all projects"""
        if not self.auth_token:
            self.log_result("Get Projects", "SKIP", "No auth token available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = await self.client.get(f"{API_BASE}/projects", headers=headers)
            if response.status_code == 200:
                data = response.json()
                self.log_result("Get Projects", "PASS", f"Found {len(data)} projects")
                return True
            else:
                self.log_result("Get Projects", "FAIL", f"Status code: {response.status_code}", response.json())
                return False
        except Exception as e:
            self.log_result("Get Projects", "FAIL", f"Exception: {str(e)}")
            return False
    
    async def test_get_project(self):
        """Test getting a specific project"""
        if not self.auth_token or not self.project_id:
            self.log_result("Get Project", "SKIP", "No auth token or project ID available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = await self.client.get(f"{API_BASE}/projects/{self.project_id}", headers=headers)
            if response.status_code == 200:
                data = response.json()
                self.log_result("Get Project", "PASS", f"Project: {data.get('name')}")
                return True
            else:
                self.log_result("Get Project", "FAIL", f"Status code: {response.status_code}", response.json())
                return False
        except Exception as e:
            self.log_result("Get Project", "FAIL", f"Exception: {str(e)}")
            return False
    
    async def test_update_project(self):
        """Test updating a project"""
        if not self.auth_token or not self.project_id:
            self.log_result("Update Project", "SKIP", "No auth token or project ID available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            update_data = {"name": "Updated Test Project", "description": "Updated description"}
            response = await self.client.put(f"{API_BASE}/projects/{self.project_id}", json=update_data, headers=headers)
            if response.status_code == 200:
                data = response.json()
                self.log_result("Update Project", "PASS", f"Project updated to: {data.get('name')}")
                return True
            else:
                self.log_result("Update Project", "FAIL", f"Status code: {response.status_code}", response.json())
                return False
        except Exception as e:
            self.log_result("Update Project", "FAIL", f"Exception: {str(e)}")
            return False
    
    async def test_create_meeting(self):
        """Test creating a meeting"""
        if not self.auth_token or not self.project_id:
            self.log_result("Create Meeting", "SKIP", "No auth token or project ID available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            meeting_data = TEST_MEETING.copy()
            meeting_data["project_id"] = self.project_id
            response = await self.client.post(f"{API_BASE}/meetings", json=meeting_data, headers=headers)
            if response.status_code == 201:
                data = response.json()
                self.meeting_id = data.get("id")
                self.log_result("Create Meeting", "PASS", f"Meeting created: {TEST_MEETING['title']}")
                return True
            else:
                self.log_result("Create Meeting", "FAIL", f"Status code: {response.status_code}", response.json())
                return False
        except Exception as e:
            self.log_result("Create Meeting", "FAIL", f"Exception: {str(e)}")
            return False
    
    async def test_get_meetings(self):
        """Test getting all meetings"""
        if not self.auth_token:
            self.log_result("Get Meetings", "SKIP", "No auth token available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = await self.client.get(f"{API_BASE}/meetings", headers=headers)
            if response.status_code == 200:
                data = response.json()
                self.log_result("Get Meetings", "PASS", f"Found {len(data)} meetings")
                return True
            else:
                self.log_result("Get Meetings", "FAIL", f"Status code: {response.status_code}", response.json())
                return False
        except Exception as e:
            self.log_result("Get Meetings", "FAIL", f"Exception: {str(e)}")
            return False
    
    async def test_get_meeting(self):
        """Test getting a specific meeting"""
        if not self.auth_token or not self.meeting_id:
            self.log_result("Get Meeting", "SKIP", "No auth token or meeting ID available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = await self.client.get(f"{API_BASE}/meetings/{self.meeting_id}", headers=headers)
            if response.status_code == 200:
                data = response.json()
                self.log_result("Get Meeting", "PASS", f"Meeting: {data.get('title')}")
                return True
            else:
                self.log_result("Get Meeting", "FAIL", f"Status code: {response.status_code}", response.json())
                return False
        except Exception as e:
            self.log_result("Get Meeting", "FAIL", f"Exception: {str(e)}")
            return False
    
    async def test_get_actions(self):
        """Test getting action items"""
        if not self.auth_token:
            self.log_result("Get Actions", "SKIP", "No auth token available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = await self.client.get(f"{API_BASE}/actions", headers=headers)
            if response.status_code == 200:
                data = response.json()
                self.log_result("Get Actions", "PASS", f"Found {len(data)} action items")
                return True
            else:
                self.log_result("Get Actions", "FAIL", f"Status code: {response.status_code}", response.json())
                return False
        except Exception as e:
            self.log_result("Get Actions", "FAIL", f"Exception: {str(e)}")
            return False
    
    async def test_get_pending_actions(self):
        """Test getting pending action items"""
        if not self.auth_token:
            self.log_result("Get Pending Actions", "SKIP", "No auth token available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = await self.client.get(f"{API_BASE}/actions/pending", headers=headers)
            if response.status_code == 200:
                data = response.json()
                self.log_result("Get Pending Actions", "PASS", f"Found {len(data)} pending action items")
                return True
            else:
                self.log_result("Get Pending Actions", "FAIL", f"Status code: {response.status_code}", response.json())
                return False
        except Exception as e:
            self.log_result("Get Pending Actions", "FAIL", f"Exception: {str(e)}")
            return False
    
    async def test_email_drafts(self):
        """Test email draft endpoints"""
        if not self.auth_token or not self.meeting_id:
            self.log_result("Email Drafts", "SKIP", "No auth token or meeting ID available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            
            # Test creating email draft
            draft_data = {
                "meeting_id": self.meeting_id,
                "subject": "Meeting Follow-up",
                "body": "This is a test email draft for the meeting.",
                "recipients": ["team@example.com"],
                "cc": []
            }
            
            response = await self.client.post(f"{API_BASE}/emails/drafts", json=draft_data, headers=headers)
            if response.status_code == 201:
                data = response.json()
                self.log_result("Create Email Draft", "PASS", f"Email draft created: {data.get('subject')}")
                return True
            else:
                self.log_result("Create Email Draft", "FAIL", f"Status code: {response.status_code}", response.json())
                return False
        except Exception as e:
            self.log_result("Email Drafts", "FAIL", f"Exception: {str(e)}")
            return False
    
    async def test_unauthorized_access(self):
        """Test unauthorized access to protected endpoints"""
        try:
            # Test accessing protected endpoint without token
            response = await self.client.get(f"{API_BASE}/projects")
            if response.status_code in [401, 403]:
                self.log_result("Unauthorized Access", "PASS", f"Correctly rejected unauthorized access ({response.status_code})")
                return True
            else:
                self.log_result("Unauthorized Access", "FAIL", f"Expected 401/403, got {response.status_code}")
                return False
        except Exception as e:
            self.log_result("Unauthorized Access", "FAIL", f"Exception: {str(e)}")
            return False
    
    async def cleanup(self):
        """Clean up test data"""
        if not self.auth_token:
            return
            
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        try:
            # Delete test meeting
            if self.meeting_id:
                await self.client.delete(f"{API_BASE}/meetings/{self.meeting_id}", headers=headers)
                
            # Delete test project
            if self.project_id:
                await self.client.delete(f"{API_BASE}/projects/{self.project_id}", headers=headers)
                
            self.log_result("Cleanup", "PASS", "Test data cleaned up")
        except Exception as e:
            self.log_result("Cleanup", "FAIL", f"Exception during cleanup: {str(e)}")
    
    def generate_report(self):
        """Generate test report"""
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r["status"] == "PASS"])
        failed_tests = len([r for r in self.test_results if r["status"] == "FAIL"])
        skipped_tests = len([r for r in self.test_results if r["status"] == "SKIP"])
        
        print("\n" + "="*60)
        print("API TEST REPORT")
        print("="*60)
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        print(f"Skipped: {skipped_tests} ⚠️")
        print(f"Success Rate: {(passed_tests/total_tests*100):.1f}%" if total_tests > 0 else "N/A")
        print("="*60)
        
        # Save detailed report to file
        report_data = {
            "summary": {
                "total": total_tests,
                "passed": passed_tests,
                "failed": failed_tests,
                "skipped": skipped_tests,
                "success_rate": (passed_tests/total_tests*100) if total_tests > 0 else 0
            },
            "tests": self.test_results,
            "timestamp": datetime.now().isoformat()
        }
        
        with open("api_test_report.json", "w") as f:
            json.dump(report_data, f, indent=2)
        
        print(f"Detailed report saved to: api_test_report.json")
    
    async def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting API Testing...")
        print(f"Testing against: {BASE_URL}")
        print("="*60)
        
        # Basic endpoint tests
        await self.test_health_check()
        await self.test_root_endpoint()
        
        # Authentication tests
        await self.test_user_registration()
        if not self.auth_token:
            await self.test_user_login()
        await self.test_get_current_user()
        
        # Authorization tests
        await self.test_unauthorized_access()
        
        # Project tests
        await self.test_create_project()
        await self.test_get_projects()
        await self.test_get_project()
        await self.test_update_project()
        
        # Meeting tests
        await self.test_create_meeting()
        await self.test_get_meetings()
        await self.test_get_meeting()
        
        # Action tests
        await self.test_get_actions()
        await self.test_get_pending_actions()
        
        # Email tests
        await self.test_email_drafts()
        
        # Cleanup
        await self.cleanup()
        
        # Generate report
        self.generate_report()

async def main():
    """Main function to run the API tests"""
    print("Meeting Intelligence API Tester")
    print("Make sure the backend server is running on http://localhost:8000")
    print("Press Ctrl+C to exit\n")
    
    tester = APITester()
    try:
        await tester.run_all_tests()
    except KeyboardInterrupt:
        print("\n\n⚠️ Testing interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {str(e)}")
    finally:
        await tester.client.aclose()

if __name__ == "__main__":
    asyncio.run(main())
