def test_get_pages(client):
    """Test that /api/pages returns all pages with their questions."""
    response = client.get("/api/pages")
    assert response.status_code == 200

    data = response.json
    assert isinstance(data, list)
    assert len(data) > 0  # At least one page should exist

    first_page = data[0]
    assert "page" in first_page
    assert "questions" in first_page
    assert isinstance(first_page["questions"], list)

def test_get_standard_items(client):
    """Test that /api/standard-items/<page> returns standard items."""
    response = client.get("/api/standard-items/Clothing")
    assert response.status_code == 200

    data = response.json
    assert data["page"] == "Clothing"
    assert isinstance(data["items"], list)
    assert "Pants" in data["items"]
