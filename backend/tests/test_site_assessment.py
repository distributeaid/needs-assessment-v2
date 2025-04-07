from backend.app import app
from backend.models import db, SiteAssessment, SitePage, Page, User


def test_get_site_assessment(client, auth_header):
    """Test fetching a SiteAssessment and its associated SitePages."""
    with app.app_context():
        response = client.get("/api/site-assessment", headers=auth_header)
        assert response.status_code == 200
        data = response.json
        assert "id" in data
        assert "assessmentId" in data
        assert "sitePages" in data
        assert len(data["sitePages"]) > 0, "SiteAssessment should contain pages"

        # Verify required pages are Unstarted, others are Locked
        for page in data["sitePages"]:
            if page["required"] and page["page"]["title"] == "Demographics":
                assert page["progress"] == "UNSTARTEDREQUIRED"
            else:
                assert page["progress"] == "LOCKED"


def test_save_site_page(client, auth_header):
    """Test saving a SitePage (sets progress to STARTEDREQUIRED)."""
    with app.app_context():
        user = User.query.filter_by(email="testuser@example.com").first()
        response = client.get("/api/site-assessment", headers=auth_header)

        site_assessment = SiteAssessment.query.filter_by(site_id=user.site_id).first()
        site_page = SitePage.query.filter_by(site_assessment_id=site_assessment.id).first()
        assert site_page is not None, "SitePage should exist"

        response = client.post(
            f"/api/site-assessment/{site_page.site_assessment_id}/site-page/{site_page.id}/save",
            json={"responses": []},
        )
        assert response.status_code == 200
        assert response.json["message"] == "SitePage saved successfully"

        updated_page = db.session.get(SitePage, site_page.id)
        assert updated_page.progress == "STARTEDREQUIRED"


def test_complete_site_page(client, auth_header):
    """Test completing all required SitePages and unlocking non-required ones."""
    with app.app_context():
        client.get("/api/site-assessment", headers=auth_header)
        # Complete all required pages
        user = User.query.filter_by(email="testuser@example.com").first()
        site_assessment = SiteAssessment.query.filter_by(site_id=user.site_id).first()
        required_pages = SitePage.query.filter_by(
            site_assessment_id=site_assessment.id, required=True
        ).all()
        for page in required_pages:
            response = client.post(
                f"/api/site-assessment/{page.site_assessment_id}/site-page/{page.id}/save",
                json={"responses": [], "confirmed": True},
            )
            assert response.status_code == 200
            assert response.json["message"] == "SitePage completed successfully"

        # Verify all required pages are marked Complete
        for page in required_pages:
            refreshed = db.session.get(SitePage, page.id)
            assert refreshed.progress == "COMPLETE"

        # Check that non-required pages are now Unstarted
        non_required_pages = SitePage.query.filter_by(
            site_assessment_id=site_assessment.id, required=False
        ).all()
        for site_page in non_required_pages:
            refreshed = db.session.get(SitePage, site_page.id)
            page = db.session.get(Page, site_page.page_id)
            if page.is_confirmation_page:
                assert refreshed.progress == "UNSTARTEDREQUIRED"
            else:
                assert refreshed.progress == "UNSTARTEDOPTIONAL"
