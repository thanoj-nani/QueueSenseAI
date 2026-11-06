import pytest

def test_ml_prediction_endpoint(client):
    payload = {
        "people_waiting": 12,
        "active_counters": 4,
        "average_service_time": 8.0,
        "service_category": "General Consultation",
        "priority_level": "Regular",
        "arrival_hour": 10,
        "day_of_week": 1
    }
    response = client.post("/api/predictions/waiting-time", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "predicted_wait_minutes" in data
    assert data["predicted_wait_minutes"] > 0
    assert "Random Forest Regressor" in data["model_used"] or "Trained" in data["model_used"]
    assert "confidence_interval" in data

def test_model_performance_endpoint(client):
    response = client.get("/api/predictions/model-performance")
    assert response.status_code == 200
    data = response.json()
    assert "mae" in data
    assert "rmse" in data
    assert "r2" in data
    assert data["r2"] > 0.8
    assert "comparison" in data
