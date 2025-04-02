from datetime import datetime

from flask import session, request
from flask import jsonify

from backend.models import db, SiteAssessment, SitePage, Page, User, Assessment, Question
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
            progress="UNSTARTEDREQUIRED" if is_required else "LOCKED",
            order=page.order,
            is_confirmation_page=page.is_confirmation_page,
            title=page.title,
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

def unlock_remaining_pages(site_assessment_id):
    """Unlock non-required SitePages once all required SitePages are complete."""
    site_pages = SitePage.query.filter_by(site_assessment_id=site_assessment_id).all()
    original_required_pages = [sp for sp in site_pages if sp.title in REQUIRED_PAGES]

    # If all required pages are complete, unlock remaining pages
    if all(sp.progress == "COMPLETE" for sp in original_required_pages):
        for sp in site_pages:
            if not sp.required and sp.progress == "LOCKED":
                sp.progress = "UNSTARTEDOPTIONAL"
            if sp.is_confirmation_page and sp.progress == "LOCKED":
                sp.progress = "UNSTARTEDREQUIRED"
        db.session.commit()

def update_from_profile_page(page, site_assessment, responses_data):
    """Update requires pages from the services the user has selected."""
    from pprint import pprint
    pprint(responses_data)
    for response in responses_data:
        question = Question.query.filter_by(id=response["questionId"]).first()
        if question and question.text == "Which of the following areas do you have needs in?":
            required_pages = response["value"]
            for site_page in site_assessment.site_pages:
                page = Page.query.filter_by(id=site_page.page_id).first()
                if page.title in required_pages:
                    site_page.required = True
                    db.session.add(site_page)
    db.session.commit()