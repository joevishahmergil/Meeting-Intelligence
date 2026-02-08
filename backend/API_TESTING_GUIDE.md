# API Testing Guide

## Overview
The `test_api.py` file provides comprehensive testing for all Meeting Intelligence API endpoints. This script tests authentication, projects, meetings, actions, and email functionality.

## Prerequisites
1. Backend server running on `http://localhost:8000`
2. Python 3.7+ with required packages installed
3. Environment configured (see `.env.example`)

## Installation
```bash
# Install required packages if not already installed
pip install httpx asyncio
```

## Running Tests

### Option 1: Direct Execution
```bash
cd backend
python test_api.py
```

### Option 2: Using Python Module
```bash
cd backend
python -m test_api
```

## Test Coverage

### Basic Endpoints
- ✅ Health Check (`/health`)
- ✅ Root Endpoint (`/`)

### Authentication (`/api/auth`)
- ✅ User Registration (`POST /register`)
- ✅ User Login (`POST /login`)
- ✅ Get Current User (`GET /me`)
- ✅ Unauthorized Access Protection

### Projects (`/api/projects`)
- ✅ Create Project (`POST /`)
- ✅ Get All Projects (`GET /`)
- ✅ Get Specific Project (`GET /{id}`)
- ✅ Update Project (`PUT /{id}`)
- ✅ Delete Project (cleanup)

### Meetings (`/api/meetings`)
- ✅ Create Meeting (`POST /`)
- ✅ Get All Meetings (`GET /`)
- ✅ Get Specific Meeting (`GET /{id}`)

### Actions (`/api/actions`)
- ✅ Get All Actions (`GET /`)
- ✅ Get Pending Actions (`GET /pending`)

### Emails (`/api/emails`)
- ✅ Create Email Draft (`POST /drafts`)

## Test Data
The script uses predefined test data:
- **User**: `testuser@example.com` with password `testpassword123`
- **Project**: "Test Project" with sample description
- **Meeting**: "Team Standup Meeting" with current date

## Features
- **Comprehensive Coverage**: Tests all major API endpoints
- **Error Handling**: Tests both success and failure scenarios
- **Authentication Flow**: Complete auth workflow testing
- **Data Cleanup**: Automatically removes test data
- **Detailed Reporting**: JSON report with timestamps and details
- **Real-time Feedback**: Live test results with status indicators

## Output
- Console output with real-time test results
- Detailed JSON report (`api_test_report.json`)
- Success rate and summary statistics

## Customization
You can modify the test data at the top of the file:
- `TEST_USER`: User registration/login data
- `TEST_PROJECT`: Project creation data
- `TEST_MEETING`: Meeting creation data
- `BASE_URL`: API server URL (default: http://localhost:8000)

## Troubleshooting

### Server Not Running
```
❌ Health Check: FAIL - Exception: Connection refused
```
**Solution**: Start the backend server first:
```bash
cd backend
python -m app.main
```

### Database Issues
```
❌ User Registration: FAIL - Status code: 500
```
**Solution**: Check database connection and environment variables

### Authentication Failures
```
❌ User Login: FAIL - Status code: 401
```
**Solution**: Verify user was created successfully, check password

## Notes
- Tests run in sequence to maintain data dependencies
- Failed tests show response data for debugging
- Cleanup removes created test data
- Script can be stopped with Ctrl+C
