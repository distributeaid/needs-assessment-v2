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
        "subtext": q.subtext,
        "defaultValue": "",
        "options": q.options,
        "order": q.order,
        "allowsAdditionalInput": q.allows_additional_input,
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

def serialize_site_page(site_page: SitePage) -> dict:
    page = Page.query.options(joinedload(Page.questions)).filter_by(id=site_page.page_id).first()
    return {
        "id": site_page.id,
        "pageId": site_page.page_id,
        "progress": site_page.progress,
        "required": site_page.required,
        "state": site_page.state,
        "siteAssessmentId": site_page.site_assessment_id,
        "page": {
            "id": page.id,
            "title": page.title,
            "questions": [
                serialize_question(q)
                for q in page.questions
            ],
        },
        'isConfirmationPage': site_page.is_confirmation_page,
    }

def serialize_site_assessment(assessment: SiteAssessment) -> dict:
    serialized_site_pages = [
        serialize_site_page(sp)
        for sp in assessment.site_pages
    ]

    return {
        "id": assessment.id,
        "siteId": assessment.site_id,
        "assessmentId": assessment.assessment_id,
        "createdAt": assessment.created_at.isoformat(),
        "sitePages": serialized_site_pages,
        "confirmed": assessment.confirmed,
    }