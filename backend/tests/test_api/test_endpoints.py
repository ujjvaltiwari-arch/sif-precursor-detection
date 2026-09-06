"""Tests for API endpoints."""

import pytest


def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_root(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "running"


def test_model_info(client):
    response = client.get("/api/v1/model/info")
    assert response.status_code == 200
    data = response.json()
    assert "current_model" in data
    assert "model_loaded" in data


def test_analyze_report(client):
    response = client.post("/api/v1/analyze", json={
        "report_text": "Worker entered confined space without gas testing and no permit",
        "report_type": "unsafe_act",
        "site": "Dibrugarh Terminal",
        "department": "Drilling",
    })
    assert response.status_code == 200
    data = response.json()
    assert "report_id" in data
    assert "analysis" in data
    assert data["analysis"]["risk_level"] in ["HIGH", "MEDIUM", "LOW"]
    assert 0 <= data["analysis"]["confidence_score"] <= 1
    assert len(data["analysis"]["explanation"]) > 0


def test_analyze_creates_alert_for_high_risk(client):
    response = client.post("/api/v1/analyze", json={
        "report_text": "Electrician performed live electrical work without LOTO isolation near flammable chemicals",
        "report_type": "unsafe_act",
    })
    assert response.status_code == 200
    data = response.json()
    if data["analysis"]["risk_level"] == "HIGH":
        alerts_response = client.get("/api/v1/alerts?status=open")
        assert alerts_response.status_code == 200
        alerts = alerts_response.json()
        assert any(a["report_id"] == data["report_id"] for a in alerts)


def test_list_reports(client):
    client.post("/api/v1/analyze", json={
        "report_text": "Test report for listing",
        "report_type": "near_miss",
    })
    response = client.get("/api/v1/reports")
    assert response.status_code == 200
    data = response.json()
    assert "reports" in data
    assert "total" in data
    assert data["total"] >= 1


def test_get_report(client):
    analyze_resp = client.post("/api/v1/analyze", json={
        "report_text": "Test report for get endpoint",
        "report_type": "unsafe_condition",
    })
    report_id = analyze_resp.json()["report_id"]

    response = client.get(f"/api/v1/reports/{report_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == report_id
    assert "report_text" in data


def test_get_report_not_found(client):
    response = client.get("/api/v1/reports/99999")
    assert response.status_code == 404


def test_delete_report(client):
    analyze_resp = client.post("/api/v1/analyze", json={
        "report_text": "Test report for deletion",
        "report_type": "near_miss",
    })
    report_id = analyze_resp.json()["report_id"]

    response = client.delete(f"/api/v1/reports/{report_id}")
    assert response.status_code == 200

    get_resp = client.get(f"/api/v1/reports/{report_id}")
    assert get_resp.status_code == 404


def test_analytics_overview(client):
    client.post("/api/v1/analyze", json={
        "report_text": "Overview test report with confined space hazard",
        "report_type": "unsafe_act",
    })
    response = client.get("/api/v1/analytics/overview")
    assert response.status_code == 200
    data = response.json()
    assert "total_reports" in data
    assert "high_risk_count" in data
    assert data["total_reports"] >= 1


def test_analytics_trends(client):
    response = client.get("/api/v1/analytics/trends")
    assert response.status_code == 200
    data = response.json()
    assert "risk_distribution" in data
    assert "precursor_trends" in data


def test_analytics_heatmap(client):
    response = client.get("/api/v1/analytics/heatmap")
    assert response.status_code == 200
    assert "sites" in response.json()


def test_alerts_list(client):
    response = client.get("/api/v1/alerts")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_analyze_missing_fields(client):
    response = client.post("/api/v1/analyze", json={})
    assert response.status_code == 422
