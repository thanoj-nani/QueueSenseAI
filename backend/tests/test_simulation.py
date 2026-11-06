import pytest

def test_simulation_arrivals(client):
    payload = {"count": 10, "service_category": "Random"}
    response = client.post("/api/simulation/arrivals", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["injected_count"] == 10
    assert len(data["sample_tokens"]) > 0

def test_simulation_delay(client):
    payload = {"counter_id": 1, "delay_minutes": 10.0, "reason": "System outage"}
    response = client.post("/api/simulation/delay", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["counter_id"] == 1
    assert data["new_avg_service_time"] >= 10.0

def test_simulation_what_if(client):
    response = client.get("/api/simulation/what-if")
    assert response.status_code == 200
    data = response.json()
    assert "baseline" in data
    assert "scenario_additional_counter" in data
    assert "scenario_optimized_allocation" in data
    assert "recommendation" in data

def test_simulation_reset(client):
    response = client.post("/api/simulation/reset")
    assert response.status_code == 200
    assert response.json()["status"] == "success"
