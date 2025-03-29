from datetime import datetime, timedelta

from flask import Blueprint, request, jsonify
from sqlalchemy.orm import joinedload

from backend.models import db, User, SiteAssessment, Page, SitePage
from backend.consts import STANDARD_ITEMS
from backend.validation import validate_responses
from backend.utils.utils import ensure_assessment_exists
from backend.serialize.serialize import serialize_question, serialize_question_response, serialize_user
from backend.utils.jwt_utils import generate_jwt_payload, get_current_user, JWTError

api_bp = Blueprint("api", __name__)

@api_bp.route("/api/status", methods=["GET"])
def status():
    return jsonify({"status": "API is running"}), 200


@api_bp.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    print(f"Data: {data}")

    email = data.get("email")
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    # TODO: Verify the password here

    token = generate_jwt_payload(user)

    return jsonify({
        "message": "Login successful",
        "user": serialize_user(user),
        "accessToken": token
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
            "page": page.title,
            "questions": [
                {
                    "id": q.id,
                    "text": q.text,
                    "subtext": q.subtext,
                    "mandatory": q.mandatory,
                    "type": q.type,
                    "response_options": q.response_options.split(", ") if q.response_options else [],
                    "order": q.order,
                }
                for q in page.questions
            ]
        })

    return jsonify(response)

@api_bp.route("/api/site-assessment", methods=["GET"])
def get_site_assessment():
    try:
        user = get_current_user()
    except JWTError as e:
        print(f"JWT Error: {e}")
        return jsonify({"error": str(e)}), 401

    site_assessment = SiteAssessment.query.filter_by(site_id=user.site_id).first()
    if not site_assessment:
        ensure_assessment_exists(user.site_id)
        site_assessment = SiteAssessment.query.filter_by(site_id=user.site_id).first()

    site_pages = SitePage.query.filter_by(site_assessment_id=site_assessment.id).all()
    response = {
        "assessment": {'id': site_assessment.id},
        "site_id": site_assessment.site_id,
        "sitePages": [
            {
                "id": sp.page_id,
                "page": {'title': db.session.get(Page, sp.page_id).title},
                "required": sp.required,
                "progress": sp.progress,
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
    site_page.progress = "COMPLETE"
    db.session.commit()

    # Check if all Required SitePages are completed, unlock remaining pages
    unlock_remaining_pages(site_page.site_assessment_id)

    return jsonify({"message": "SitePage completed successfully"})


def unlock_remaining_pages(site_assessment_id):
    """Unlock non-required SitePages once all required SitePages are complete."""
    site_pages = SitePage.query.filter_by(site_assessment_id=site_assessment_id).all()
    required_pages = [sp for sp in site_pages if sp.required]

    # If all required pages are complete, unlock remaining pages
    if all(sp.progress == "COMPLETE" for sp in required_pages):
        for sp in site_pages:
            if not sp.required and sp.progress == "LOCKED":
                sp.progress = "UNSTARTED"
        db.session.commit()


@api_bp.route("/api/assessment/<int:assessment_id>/page/<int:page_id>", methods=["GET"])
def get_assessment_page(assessment_id, page_id):
    # Get user email from query parameters
    user_email = request.args.get("email")
    if not user_email:
        return jsonify({"error": "Email parameter is required"}), 400

    # Look up the page with its questions
    page = Page.query.options(joinedload(Page.questions)).filter_by(id=page_id).first()
    if not page:
        return jsonify({"error": "Page not found"}), 404

    # Get the user
    user = User.query.filter_by(email=user_email).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Look up the SitePage for this page, given the assessment and the user's site.
    site_page = SitePage.query.join(SiteAssessment).filter(
        SitePage.page_id == page_id,
        SiteAssessment.assessment_id == assessment_id,
        SiteAssessment.site_id == user.site_id
    ).first()

    responses = []
    if site_page:
        responses = [serialize_question_response(r) for r in site_page.responses]

    questions = [serialize_question(q) for q in page.questions]

    return jsonify({
        "title": page.title,
        "questions": questions,
        "responses": responses
    })