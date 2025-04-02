import logging

from flask import Blueprint, request, jsonify
from sqlalchemy.orm import joinedload

from backend.models import db, User, SiteAssessment, Page, SitePage, QuestionResponse, Site
from backend.consts import STANDARD_ITEMS
from backend.validation import validate_responses
from backend.utils.utils import ensure_assessment_exists, unlock_remaining_pages
from backend.serialize.serialize import serialize_question, serialize_question_response, \
    serialize_user, serialize_site_assessment
from backend.utils.jwt_utils import generate_jwt_payload, get_current_user, JWTError

api_bp = Blueprint("api", __name__)

@api_bp.route("/api/status", methods=["GET"])
def status():
    return jsonify({"status": "API is running"}), 200


@api_bp.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "User not found"}), 404
    # create assessment on user creation
    ensure_assessment_exists(user.site_id)
    # get the users site and print any site assessments
    # TODO: Verify the password here

    token = generate_jwt_payload(user)
    result = {
        "message": "Login successful",
        "user": serialize_user(user),
        "accessToken": token
    }

    return jsonify(result)


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
                    "options": q.options,
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
        logging.error(f"JWT Error: {e}")
        return jsonify({"error": str(e)}), 401

    # Look up or create a SiteAssessment instance for the user's site.
    site_assessment = SiteAssessment.query.filter_by(site_id=user.site_id).first()
    if not site_assessment:
        ensure_assessment_exists(user.site_id)
        site_assessment = SiteAssessment.query.filter_by(site_id=user.site_id).first()

    response = serialize_site_assessment(site_assessment)
    return jsonify(response)



@api_bp.route("/api/site-assessment/<int:site_assessment_id>/site-page/<int:site_page_id>/save", methods=["POST"])
def save_site_page(site_assessment_id, site_page_id):
    """Save a SitePage with validation, but do not require mandatory questions."""
    logging.info(f"Saving SitePage {site_page_id} for assessment {site_assessment_id}")
    data = request.get_json()
    site_page = db.session.get(SitePage, site_page_id)
    if not site_page:
        logging.error(f"SitePage {site_page_id} not found")
        return jsonify({"error": "SitePage not found"}), 404

    # Validate data (ensure proper types)
    validation_errors = validate_responses(data.get("responses", []))
    if validation_errors:
        logging.error(f"Validation errors: {validation_errors}")
        return jsonify({"errors": validation_errors}), 400

    # Update progress based on confirmation flag
    if data.get("confirmed"):
        site_page.progress = "COMPLETE"
        unlock_remaining_pages(site_assessment_id)
    else:
        # todo update for optional
        site_page.progress = "STARTEDREQUIRED"

    # Process each response
    responses_data = data.get("responses", [])
    for response in responses_data:
        question_id = response.get("questionId")
        answer = response.get("value")
        if not question_id:
            continue  # Skip if questionId is missing
        # Look for an existing response for this question on this site_page
        question_response = QuestionResponse.query.filter_by(
            site_page_id=site_page.id,
            question_id=question_id
        ).first()
        if question_response:
            question_response.value = answer
        else:
            new_response = QuestionResponse(
                site_page_id=site_page.id,
                question_id=question_id,
                value=answer
            )
            db.session.add(new_response)
        logging.info(f"Response saved: {question_id} -> {answer}")

    db.session.commit()
    if data.get("confirmed"):
        return jsonify({"message": "SitePage completed successfully"})
    else:
        return jsonify({"message": "SitePage saved successfully"})



@api_bp.route("/api/site-assessment/<int:site_assessment_id>/site-page/<int:site_page_id>", methods=["GET"])
def get_assessment_page(site_assessment_id, site_page_id):
    try:
        user = get_current_user()
    except JWTError as e:
        logging.error(f"JWT Error: {e}")
        return jsonify({"error": str(e)}), 401

    # Look up the page with its questions
    page = Page.query.options(joinedload(Page.questions)).filter_by(id=site_page_id).first()
    if not page:
        return jsonify({"error": "Page not found"}), 404

    # Look up the SitePage for this page, given the assessment and the user's site.
    site_page = SitePage.query.join(SiteAssessment).filter(
        SitePage.page_id == site_page_id,
        SiteAssessment.id == site_assessment_id,
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