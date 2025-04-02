def test_api_status(client):
    response = client.get("/api/status")
    assert response.status_code == 200
    assert response.json == {"status": "API is running"}
