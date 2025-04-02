from flask import request, jsonify
from datetime import datetime
from backend.models import db, User, SiteAssessment, SitePage, Page, Question, QuestionResponse
from sqlalchemy.orm import joinedload

def serialize_question(q: Question) -> dict:
    return {
        "id": q.id,
        "type": q.type,
        "pageId": q.page_id,
        "text": q.text,
        "defaultValue": "",  # If you add a default_value column, use that here
        "options": q.response_options.split(", ") if q.response_options else [],
        "order": q.order,
    }

def serialize_question_response(r: QuestionResponse) -> dict:
    return {
        "id": r.id,
        "questionId": r.question_id,
        "value": r.value,
        "sitePageId": r.site_page_id,
    }

def serialize_user(user: User) -> dict:
    return {
        "id": str(user.id),
        "email": user.email,
        "siteId": user.site_id,
    }