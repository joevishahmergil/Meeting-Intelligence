#!/usr/bin/env python3
"""
Test simple password hashing
"""

from app.core.security import get_password_hash

def test_simple_password():
    """Test password hashing with simple password"""
    try:
        # Test with very short password
        password = "test123"
        print(f"Testing password: '{password}' (length: {len(password)})")
        
        hashed = get_password_hash(password)
        print(f"✅ Password hashed successfully: {hashed[:50]}...")
        
        return True
        
    except Exception as e:
        print(f"❌ Password hashing failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_simple_password()
