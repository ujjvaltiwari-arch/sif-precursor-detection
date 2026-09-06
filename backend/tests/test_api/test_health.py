"""Tests for health check endpoint."""


def test_health_check(client):
    """Test health endpoint returns 200 with correct fields."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "version" in data
    assert "model_loaded" in data
    assert "database_connected" in data
    assert "uptime_seconds" in data


def test_root_endpoint(client):
    """Test root endpoint returns application metadata."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "SIF Precursor Detection"
    assert "version" in data
    assert data["status"] == "running"
