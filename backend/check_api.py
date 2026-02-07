import sys
import os
import uuid
import json
from fastapi.testclient import TestClient

# Add current directory to path so we can import app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from app.main import app
    from app.core.config import settings
except ImportError as e:
    print(f"Error importing app: {e}")
    print("Make sure you are running this script from the 'backend' directory.")
    sys.exit(1)

# Initialize TestClient
client = TestClient(app)

def print_result(name, passed, details=None):
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{status} - {name}")
    if not passed and details:
        print(f"   Error: {details}")

def run_checks():
    print(f"🚀 Starting API Health Checks for {settings.APP_NAME}...")
    print(f"Target: Local In-Memory Application (TestClient)\n")

    # 1. Health Check
    try:
        response = client.get("/health")
        passed = response.status_code == 200 and response.json()["status"] == "healthy"
        print_result("Health Check", passed, response.text if not passed else None)
    except Exception as e:
        print_result("Health Check", False, str(e))

    # 2. Authentication Flow
    # Register
    random_id = str(uuid.uuid4())[:8]
    email = f"test_{random_id}@example.com"
    password = "testpassword123"
    
    auth_token = None
    user_id = None

    try:
        register_data = {
            "email": email,
            "password": password,
            "full_name": "Test User"
        }
        response = client.post("/api/auth/register", json=register_data)
        passed = response.status_code == 201
        if passed:
            print_result("Register User", True)
        else:
            print_result("Register User", False, response.text)
            return  # Stop if auth fails
    except Exception as e:
        print_result("Register User", False, str(e))
        return

    # Login
    try:
        login_data = {
            "email": email,
            "password": password
        }
        response = client.post("/api/auth/login", json=login_data)
        passed = response.status_code == 200
        if passed:
            data = response.json()
            auth_token = data["access_token"]
            print_result("Login User", True)
        else:
            print_result("Login User", False, response.text)
            return
    except Exception as e:
        print_result("Login User", False, str(e))
        return

    headers = {"Authorization": f"Bearer {auth_token}"}

    # 3. Projects Flow
    project_id = None
    try:
        project_data = {
            "name": f"Test Project {random_id}",
            "description": "Integration verification",
            "color": "#10B981"
        }
        response = client.post("/api/projects", json=project_data, headers=headers)
        passed = response.status_code == 201
        if passed:
            project_id = response.json()["id"]
            print_result("Create Project", True)
        else:
            print_result("Create Project", False, response.text)
    except Exception as e:
        print_result("Create Project", False, str(e))

    # List Projects
    try:
        response = client.get("/api/projects", headers=headers)
        passed = response.status_code == 200 and len(response.json()) > 0
        print_result("List Projects", passed, response.text if not passed else None)
    except Exception as e:
        print_result("List Projects", False, str(e))

    # 4. Meetings Flow
    meeting_id = None
    try:
        meeting_data = {
            "project_id": project_id,
            "title": "Weekly Sync",
            "meeting_date": "2026-10-25",
            "meeting_time": "10:00:00",
            "meeting_type": "Internal",
            "attendees": ["alice@example.com", "bob@example.com"],
            "source": "Manual"
        }
        response = client.post("/api/meetings", json=meeting_data, headers=headers)
        passed = response.status_code == 201
        if passed:
            meeting_id = response.json()["id"]
            print_result("Create Meeting", True)
        else:
            print_result("Create Meeting", False, response.text)
    except Exception as e:
        print_result("Create Meeting", False, str(e))

    # Get Meeting Detail
    if meeting_id:
        try:
            response = client.get(f"/api/meetings/{meeting_id}", headers=headers)
            passed = response.status_code == 200
            print_result("Get Meeting Detail", passed, response.text if not passed else None)
        except Exception as e:
            print_result("Get Meeting Detail", False, str(e))

    # 5. Clean up (Best effort)
    if meeting_id:
        client.delete(f"/api/meetings/{meeting_id}", headers=headers)
    
    if project_id:
        client.delete(f"/api/projects/{project_id}", headers=headers)
        
    print("\n🏁 Checks completed.")

if __name__ == "__main__":
    run_checks()
