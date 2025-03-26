from datetime import datetime

from flask import Blueprint, request, jsonify

from backend.models import db, User, SiteAssessment, Assessment, Page, SitePage
from backend.consts import STANDARD_ITEMS
from backend.validation import validate_responses
from backend.utils import create_site_assessment, get_current_user, get_current_season


api_bp = Blueprint("api", __name__)


@api_bp.route("/api/status", methods=["GET"])
def status():
    return jsonify({"status": "API is running"}), 200




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


@api_bp.route("/api/login", methods=["POST"])
def login():
    """Handle ensure a SiteAssessment exists for the user's site."""
    data = request.get_json()
    username = data.get("username")

    user = User.query.filter_by(username=username).first()

    if not user:
        # query by email
        user = User.query.filter_by(email=username).first()

    if not user:
        return jsonify({"error": "User not found"}), 404
    ensure_assessment_exists(user.site_id)

    return jsonify({
        "message": "Login successful",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
        },
    })

@api_bp.route("/api/current_assessment", methods=["GET"])
def current_assessment():
    """Handle ensure a SiteAssessment exists for the user's site."""
    data = request.get_json()
    username = data.get("username")

    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    site_assessment = ensure_assessment_exists(user.site_id)
    if not site_assessment:
        return jsonify({"error": "No assessment template found"}), 400

    return jsonify({
        "message": "Login successful",
        "site_assessment_id": site_assessment.id
    })


@api_bp.route("/api/standard-items/<page>", methods=["GET"])
def get_standard_items(page):
    """Return standard items for a given page (e.g., Clothing -> Pants, Shirts)."""
    items = STANDARD_ITEMS.get(page, [])
    return jsonify({"page": page, "items": items})

@api_bp.route("/api/pages", methods=["GET"])
def get_pages():
    """Return all pages with their associated questions."""
    pages = Page.query.all()
    response = []

    for page in pages:
        response.append({
            "page": page.name,
            "questions": [
                {
                    "id": q.id,
                    "text": q.text,
                    "subtext": q.subtext,
                    "mandatory": q.mandatory,
                    "question_type": q.question_type,
                    "response_options": q.response_options.split(", ") if q.response_options else [],
                    "order": q.order,
                }
                for q in page.questions
            ]
        })

    return jsonify(response)

@api_bp.route("/api/site-assessment", methods=["GET"])
def get_site_assessment():
    """Fetch the current user's SiteAssessment and associated SitePages."""
    user = get_current_user()
    if not user:
        return jsonify({"error": "User not found"}), 404

    site_assessment = SiteAssessment.query.filter_by(site_id=user.site_id).first()
    if not site_assessment:
        return jsonify({"error": "No SiteAssessment found"}), 404

    site_pages = SitePage.query.filter_by(site_assessment_id=site_assessment.id).all()
    response = {
        "assessment_id": site_assessment.id,
        "site_id": site_assessment.site_id,
        "pages": [
            {
                "page_id": sp.page_id,
                "name": db.session.get(Page, sp.page_id).name,
                "required": sp.required,
                "progress": sp.progress
            }
            for sp in site_pages
        ]
    }
    return jsonify(response)


@api_bp.route("/api/site-page/<int:site_page_id>/save", methods=["POST"])
def save_site_page(site_page_id):
    """Save a SitePage with validation, but do not require mandatory questions."""
    data = request.get_json()
    site_page = db.session.get(SitePage, site_page_id)

    if not site_page:
        return jsonify({"error": "SitePage not found"}), 404

    # Validate data (ensure proper types)
    validation_errors = validate_responses(data["responses"])
    if validation_errors:
        return jsonify({"errors": validation_errors}), 400

    # Mark as "In Progress"
    site_page.progress = "In Progress"
    db.session.commit()

    return jsonify({"message": "SitePage saved successfully"})


@api_bp.route("/api/site-page/<int:site_page_id>/complete", methods=["POST"])
def complete_site_page(site_page_id):
    """Complete a SitePage, ensuring all mandatory questions are answered."""
    data = request.get_json()
    site_page = db.session.get(SitePage, site_page_id)

    if not site_page:
        return jsonify({"error": "SitePage not found"}), 404

    # Validate data (ensure required questions are answered)
    validation_errors = validate_responses(data["responses"], require_all=True)
    if validation_errors:
        return jsonify({"errors": validation_errors}), 400

    # Mark as "Complete"
    site_page.progress = "Complete"
    db.session.commit()

    # Check if all Required SitePages are completed, unlock remaining pages
    unlock_remaining_pages(site_page.site_assessment_id)

    return jsonify({"message": "SitePage completed successfully"})


def unlock_remaining_pages(site_assessment_id):
    """Unlock non-required SitePages once all required SitePages are complete."""
    site_pages = SitePage.query.filter_by(site_assessment_id=site_assessment_id).all()
    required_pages = [sp for sp in site_pages if sp.required]

    # If all required pages are complete, unlock remaining pages
    if all(sp.progress == "Complete" for sp in required_pages):
        for sp in site_pages:
            if not sp.required and sp.progress == "Locked":
                sp.progress = "Unstarted"
        db.session.commit()
