import pytest

def test_generate_token(client):
    payload = {
        "service_category": "Billing",
        "priority_level": "Regular",
        "user_name": "Test Customer",
        "user_phone": "+91 99999 88888"
    }
    response = client.post("/api/tokens", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "BIL-" in data["token_number"]
    assert data["status"] == "Waiting"
    assert data["estimated_wait_minutes"] > 0
    assert data["assigned_counter_id"] is not None

def test_token_uniqueness(client):
    payload1 = {"service_category": "Registration", "user_name": "User 1"}
    payload2 = {"service_category": "Registration", "user_name": "User 2"}
    r1 = client.post("/api/tokens", json=payload1)
    r2 = client.post("/api/tokens", json=payload2)
    assert r1.status_code == 201
    assert r2.status_code == 201
    assert r1.json()["token_number"] != r2.json()["token_number"]

def test_token_status_lifecycle(client):
    create_res = client.post("/api/tokens", json={
        "service_category": "General Consultation",
        "user_name": "Lifecycle Patient"
    })
    token_id = create_res.json()["id"]

    # 1. Waiting -> Called
    r_called = client.patch(f"/api/tokens/{token_id}/status", json={"status": "Called", "counter_id": 1})
    assert r_called.status_code == 200
    assert r_called.json()["status"] == "Called"

    # 2. Called -> In Service
    r_service = client.patch(f"/api/tokens/{token_id}/status", json={"status": "In Service", "counter_id": 1})
    assert r_service.status_code == 200
    assert r_service.json()["status"] == "In Service"

    # 3. In Service -> Completed
    r_comp = client.patch(f"/api/tokens/{token_id}/status", json={"status": "Completed"})
    assert r_comp.status_code == 200
    assert r_comp.json()["status"] == "Completed"
    assert r_comp.json()["actual_wait_minutes"] is not None
