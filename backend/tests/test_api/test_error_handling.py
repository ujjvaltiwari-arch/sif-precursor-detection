"""Tests for API error handling and edge cases."""


class TestHealthEndpoint:
    def test_health_returns_200(self, client):
        resp = client.get("/health")
        assert resp.status_code == 200
        data = resp.json()
        assert "status" in data

    def test_root_returns_metadata(self, client):
        resp = client.get("/")
        assert resp.status_code == 200
        data = resp.json()
        assert "name" in data
        assert "version" in data
        assert "docs" in data


class TestAnalyzeEndpoint:
    def test_analyze_valid_report(self, client):
        resp = client.post("/api/v1/analyze", json={
            "report_text": "Worker slipped near drilling rig area",
            "report_type": "unsafe_act",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "analysis" in data
        assert "risk_level" in data["analysis"]
        assert data["analysis"]["risk_level"] in ["HIGH", "MEDIUM", "LOW"]

    def test_analyze_missing_fields(self, client):
        resp = client.post("/api/v1/analyze", json={})
        assert resp.status_code == 422

    def test_analyze_with_site_and_dept(self, client):
        resp = client.post("/api/v1/analyze", json={
            "report_text": "Gas leak detected in processing area",
            "report_type": "near_miss",
            "site": "TestSite",
            "department": "Safety",
        })
        assert resp.status_code == 200


class TestReportsEndpoint:
    def test_list_reports(self, client):
        resp = client.get("/api/v1/reports")
        assert resp.status_code == 200
        data = resp.json()
        assert "reports" in data
        assert "total" in data

    def test_list_reports_pagination(self, client):
        resp = client.get("/api/v1/reports?page=1&limit=5")
        assert resp.status_code == 200

    def test_get_nonexistent_report(self, client):
        resp = client.get("/api/v1/reports/99999")
        assert resp.status_code == 404

    def test_delete_nonexistent_report(self, client):
        resp = client.delete("/api/v1/reports/99999")
        assert resp.status_code == 404


class TestAlertsEndpoint:
    def test_list_alerts(self, client):
        resp = client.get("/api/v1/alerts")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_acknowledge_nonexistent(self, client):
        resp = client.post("/api/v1/alerts/99999/acknowledge")
        assert resp.status_code == 404

    def test_resolve_nonexistent(self, client):
        resp = client.post("/api/v1/alerts/99999/resolve")
        assert resp.status_code == 404

    def test_dismiss_nonexistent(self, client):
        resp = client.delete("/api/v1/alerts/99999")
        assert resp.status_code == 404


class TestModelEndpoint:
    def test_model_info(self, client):
        resp = client.get("/api/v1/model/info")
        assert resp.status_code == 200
        data = resp.json()
        assert "model_name" in data or "stage" in data


class TestAnalyticsEndpoint:
    def test_overview(self, client):
        resp = client.get("/api/v1/analytics/overview")
        assert resp.status_code == 200
        data = resp.json()
        assert "total_reports" in data

    def test_trends(self, client):
        resp = client.get("/api/v1/analytics/trends")
        assert resp.status_code == 200

    def test_heatmap(self, client):
        resp = client.get("/api/v1/analytics/heatmap")
        assert resp.status_code == 200
