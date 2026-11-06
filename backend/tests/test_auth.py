import pytest

def test_user_registration(client):
    payload = {
        "email": "testnewuser@queuesense.ai",
        "password": "Password@123",
        "full_name": "Test User",
        "role": "user"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "testnewuser@queuesense.ai"

def test_user_login(client):
    payload = {
        "email": "admin@queuesense.ai",
        "password": "Admin@123"
    }
    response = client.post("/api/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "admin"

def test_login_invalid_password(client):
    payload = {
        "email": "admin@queuesense.ai",
        "password": "WrongPassword"
    }
    response = client.post("/api/auth/login", json=payload)
    assert response.status_code == 401

def test_auth_me_endpoint(client, user_headers):
    response = client.get("/api/auth/me", headers=user_headers)
    assert response.status_code == 200
    assert response.json()["email"] == "user@queuesense.ai"
