from datetime import datetime

from flask import session, request
from flask import jsonify

from backend.models import db, SiteAssessment, SitePage, Page, User, Assessment
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


def ensure_assessment_exists(site_id):
    """Ensure a SiteAssessment exists for the user's site."""
    # Get current year & season
    current_year = datetime.utcnow().year
    current_season = get_current_season()

    # Find the corresponding Assessment
    assessment = Assessment.query.filter_by(year=current_year, season=current_season).first()
    if not assessment:
        return jsonify({"error": "No assessment template found"}), 400

    # Find or create a SiteAssessment
    site_assessment = SiteAssessment.query.filter_by(site_id=site_id, assessment_id=assessment.id).first()
    if not site_assessment:
        site_assessment = create_site_assessment(site_id, assessment.id)

    return site_assessment

