import logging
import json

from flask import Blueprint, request, jsonify
from sqlalchemy.orm import joinedload

from backend.models import db, User, SiteAssessment, Page, SitePage, QuestionResponse, Question, Site
from backend.validation import validate_responses
from backend.utils.utils import ensure_assessment_exists, unlock_remaining_pages, update_from_profile_page
from backend.serialize.serialize import serialize_question, serialize_question_response, \
    serialize_user, serialize_site_assessment, serialize_site
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



@api_bp.route("/api/site-assessment/<int:site_assessment_id>", methods=["GET"])
def get_site_assessment_by_id(site_assessment_id):
    try:
        user = get_current_user()
    except JWTError as e:
        logging.error(f"JWT Error: {e}")
        return jsonify({"error": str(e)}), 401

    site_assessment = SiteAssessment.query.filter_by(id=site_assessment_id, site_id=user.site_id).first()
    if not site_assessment:
        return jsonify({"error": "SiteAssessment not found"}), 404

    response = serialize_site_assessment(site_assessment)
    return jsonify(response)



@api_bp.route("/api/site-assessment/<int:site_assessment_id>/site-page/<int:site_page_id>/save", methods=["POST"])
def save_site_page(site_assessment_id, site_page_id):
    """Save a SitePage with validation, but do not require mandatory questions."""
    logging.info(f"Saving SitePage {site_page_id} for assessment {site_assessment_id}")
    data = request.get_json()

    site_page = db.session.get(SitePage, site_page_id)
    site_assessment = db.session.get(SiteAssessment, site_assessment_id)
    page = db.session.get(Page, site_page.page_id)
    if not site_page:
        logging.error(f"SitePage {site_page_id} not found")
        return jsonify({"error": "SitePage not found"}), 404

    responses_data = data.get("responses", [])
    validation_errors = validate_responses(responses_data)
    if validation_errors:
        logging.error(f"Validation errors: {validation_errors}")
        return jsonify({"errors": validation_errors}), 400

    # Update progress
    if data.get("confirmed"):
        site_page.progress = "COMPLETE"
        unlock_remaining_pages(site_assessment_id)
    else:
        if site_page.required:
            site_page.progress = "STARTEDREQUIRED"
        else:
            site_page.progress = "STARTEDOPTIONAL"
    db.session.commit()

    if page.is_profile_page:
        update_from_profile_page(page, site_assessment, responses_data)

    # Save or update responses
    for response in responses_data:
        question_id = response.get("questionId")
        value = response.get("value")

        if question_id is None:
            continue  # skip incomplete response

        existing = QuestionResponse.query.filter_by(
            site_page_id=site_page.id,
            question_id=question_id
        ).first()

        if existing:
            existing.value = value
        else:
            db.session.add(QuestionResponse(
                site_page_id=site_page.id,
                question_id=question_id,
                value=value
            ))

        logging.info(f"Saved: Question {question_id} -> {value}")

    db.session.commit()

    return jsonify({
        "message": "SitePage completed successfully" if data.get("confirmed") else "SitePage saved successfully"
    })


@api_bp.route("/api/site-assessment/<int:site_assessment_id>/site-page/<int:site_page_id>", methods=["GET"])
def get_assessment_page(site_assessment_id, site_page_id):
    try:
        user = get_current_user()
    except JWTError as e:
        logging.error(f"JWT Error: {e}")
        return jsonify({"error": str(e)}), 401

    # Look up the SitePage
    site_page = SitePage.query.get(site_page_id)
    if not site_page:
        return jsonify({"error": "SitePage not found"}), 404

    page = Page.query.get(site_page.page_id)

    responses = []
    if site_page:
        responses = [serialize_question_response(r) for r in site_page.responses]

    questions = [serialize_question(q) for q in page.questions]
    site = Site.query.get(user.site_id)

    return jsonify({
        "title": page.title,
        "questions": questions,
        "responses": responses,
        "isConfirmationPage": page.is_confirmation_page,
        "site": serialize_site(site),
    })

@api_bp.route("/api/site-assessment/<int:site_assessment_id>/summary", methods=["GET"])
def get_site_assessment_summary(site_assessment_id):
    site_assessment = SiteAssessment.query.get(site_assessment_id)
    # set the site assessment to complete

    if not site_assessment:
        return jsonify({"error": "SiteAssessment not found"}), 404
    if site_assessment:
        site_assessment.confirmed = True
        db.session.commit()
    summary = []
    top_needs = []
    cards = []
    for site_page in site_assessment.site_pages:
        page = Page.query.get(site_page.page_id)
        questions_data = []
        for response in site_page.responses:
            if not response.value or len(str(response.value)) == 0:
                continue
            question = Question.query.get(response.question_id)
            value = response.value
            str_value = str(response.value)
            if str_value[-1] == '|':
                value = value[:-1]
            if str_value == "true":
                value = "Yes"
            if str_value == "false":
                value = "No"

            if "need" in question.text.lower():
                top_needs.append(str_value)
                if type(value) == list:
                    str_value = ", ".join(value)

                cards.append({
                    "title": f"{site_assessment.site.name} needs {page.title} items",
                    "highlight": str_value,
                    "subtext": question.subtext if question.subtext else "",
                    "backgroundColor": "#082B76"
                })

            questions_data.append({
                "questionId": question.id,
                "questionText": question.text,
                "responseValue": value,
            })
        if questions_data:
            summary.append({
                "sitePageId": site_page.id,
                "sitePageTitle": page.title,
                "responses": questions_data
            })

    return jsonify({
        "summary": summary,
        "carousel": {
            "organizationName": site_assessment.site.name,
            "peopleServed": site_assessment.site.people_served,
            "cards": cards
        }
    })

