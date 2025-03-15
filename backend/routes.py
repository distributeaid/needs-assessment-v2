from datetime import datetime

from flask import Blueprint, request, jsonify

from backend.models import db, User, SiteAssessment, Assessment, Page
from backend.consts import STANDARD_ITEMS

api_bp = Blueprint("api", __name__)

@api_bp.route("/api/status", methods=["GET"])
def status():
    return jsonify({"status": "API is running"}), 200


def get_current_season():
    """Determine the current season based on the month."""
    month = datetime.utcnow().month
    return "Spring" if month < 7 else "Fall"

@api_bp.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")

    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Check if a SiteAssessment exists for this site and current season
    current_year = datetime.utcnow().year
    current_season = get_current_season()

    existing_assessment = SiteAssessment.query.filter_by(
        site_id=user.site_id
    ).join(Assessment).filter(
        Assessment.year == current_year, Assessment.season == current_season
    ).first()

    if not existing_assessment:
        # Create a new SiteAssessment
        assessment_template = Assessment.query.filter_by(
            year=current_year, season=current_season
        ).first()

        if not assessment_template:
            return jsonify({"error": "No assessment template found"}), 400

        new_assessment = SiteAssessment(
            site_id=user.site_id,
            assessment_id=assessment_template.id
        )
        db.session.add(new_assessment)
        db.session.commit()

    return jsonify({"message": "Login successful"}), 200


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
