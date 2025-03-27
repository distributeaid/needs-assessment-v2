from backend.app import app
from backend.models import db, Site, Assessment, SiteAssessment, SitePage
from backend.utils import create_site_assessment
import pytest

@pytest.fixture
def setup_site_assessment(client):
    """Setup test data for SiteAssessment and SitePages."""
    with app.app_context():
        # Ensure a test site and assessment exist
        site = Site.query.filter_by(name="Test Site").first()

        assessment = Assessment.query.first()

        assert site is not None, "Test Site should exist"
        assert assessment is not None, "Assessment should exist"

        # Create a SiteAssessment and SitePages
        site_assessment = create_site_assessment(site.id, assessment.id)
        db.session.commit()

        return db.session.get(SiteAssessment, site_assessment.id)


def test_get_site_assessment(client, setup_site_assessment):
    """Test fetching a SiteAssessment and its associated SitePages."""
    response = client.get(f"/api/site-assessment?email=user1@example.com")
    print(response)
    assert response.status_code == 200
    data = response.json

    assert "assessment_id" in data
    assert "pages" in data
    assert len(data["pages"]) > 0, "SiteAssessment should contain pages"

    # Verify required pages are Unstarted, others are Locked
    for page in data["pages"]:
        if page["required"]:
            assert page["progress"] == "Unstarted"
        else:
            assert page["progress"] == "Locked"


def test_save_site_page(client, setup_site_assessment):
    """Test saving a SitePage (sets progress to In Progress)."""
    with app.app_context():
        site_page = SitePage.query.filter_by(site_assessment_id=setup_site_assessment.id).first()
        assert site_page is not None, "SitePage should exist"

        response = client.post(f"/api/site-page/{site_page.id}/save", json={"responses": []})
        assert response.status_code == 200
        assert response.json["message"] == "SitePage saved successfully"

        # Verify the SitePage progress is now "In Progress"
        updated_page = db.session.get(SitePage, site_page.id)
        assert updated_page.progress == "In Progress"



def test_complete_site_page(client, setup_site_assessment):
    """Test completing all required SitePages and unlocking non-required ones."""
    with app.app_context():
        # Complete all required pages
        required_pages = SitePage.query.filter_by(site_assessment_id=setup_site_assessment.id, required=True).all()
        for page in required_pages:
            response = client.post(f"/api/site-page/{page.id}/complete", json={"responses": []})
            assert response.status_code == 200
            assert response.json["message"] == "SitePage completed successfully"

        # Verify all required pages are marked Complete
        for page in required_pages:
            refreshed = db.session.get(SitePage, page.id)
            assert refreshed.progress == "Complete"

        # Check that non-required pages are now Unstarted
        non_required_pages = SitePage.query.filter_by(site_assessment_id=setup_site_assessment.id, required=False).all()
        for page in non_required_pages:
            refreshed = db.session.get(SitePage, page.id)
            assert refreshed.progress == "Unstarted"

