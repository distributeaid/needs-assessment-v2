
from backend.app import app
from backend.models import Site, SiteAssessment

def test_user_login_creates_assessment(client):
    """Ensure a new SiteAssessment is created when a user logs in and none exists for the current season."""
    with app.app_context():
        response = client.post("/api/login", json={"email": "testuser@example.com"})
        assert response.status_code == 200
        assert response.json["message"] == "Login successful"

        # get the site for the "testuser"
        site = Site.query.filter_by(name="Test Site").first()
        assert site
        site_assessments = SiteAssessment.query.filter_by(site_id=site.id).all()
        assert len(site_assessments) == 1  # A new SiteAssessment should be created
