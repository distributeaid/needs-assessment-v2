from datetime import datetime

from flask import session, request

from backend.models import db, SiteAssessment, SitePage, Page, User
from backend.consts import REQUIRED_PAGES

def create_site_assessment(site_id, assessment_id):
    """Create a SiteAssessment and associated SitePages for a given site and assessment."""
    site_assessment = SiteAssessment(site_id=site_id, assessment_id=assessment_id)
    db.session.add(site_assessment)
    db.session.commit()

    # Create SitePages for the assessment
    pages = Page.query.filter_by(assessment_id=assessment_id).all()
    for page in pages:
        is_required = page.title in REQUIRED_PAGES
        site_page = SitePage(
            site_assessment_id=site_assessment.id,
            page_id=page.id,
            required=is_required,
            progress="UNSTARTED" if is_required else "LOCKED"
        )
        db.session.add(site_page)

    db.session.commit()
    return site_assessment

def get_current_user():
    """Retrieve the current user based on the username provided in the request."""
    username = request.args.get("username") or request.headers.get("Username")
    if not username:
        return None
    return User.query.filter_by(username=username).first()

def get_current_season():
    """Determine the current season based on the month."""
    month = datetime.utcnow().month
    return "Spring" if month < 7 else "Fall"


def serialize_user(user: User) -> dict:
    return {
        "id": str(user.id),
        "email": user.email,
        "siteId": user.site_id,
    }