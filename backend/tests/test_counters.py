import pytest

def test_list_counters(client):
    response = client.get("/api/counters")
    assert response.status_code == 200
    counters = response.json()
    assert len(counters) >= 1
    assert any(c["number"] == 1 for c in counters)

def test_counter_recommendation(client):
    payload = {
        "service_category": "Emergency",
        "priority_level": "Emergency"
    }
    response = client.post("/api/counters/recommend", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["recommended_counter_id"] is not None
    assert "recommended" in data["reason"].lower()

def test_call_next_token(client):
    # Ensure there is a waiting token
    client.post("/api/tokens", json={"service_category": "General Consultation", "user_name": "Call Test"})
    
    response = client.post("/api/counters/1/call-next")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "Called"
    assert data["assigned_counter_id"] == 1
