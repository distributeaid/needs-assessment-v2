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