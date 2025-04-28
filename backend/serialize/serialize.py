from flask import request, jsonify
from datetime import datetime
from backend.models import (
    db,
    User,
    SiteAssessment,
    SitePage,
    Page,
    Question,
    QuestionResponse,
    Site,
    Organization,
)
from sqlalchemy.orm import joinedload


def serialize_question(q: Question) -> dict:
    res = {
        "id": q.id,
        "type": q.question_type,
        "text": q.text,
        "subtext": q.subtext,
        "defaultValue": "",
        "options": q.options,
        "order": q.order,
        "allowsAdditionalInput": q.allows_additional_input,
        "required": q.required,
        "parentQuestionId": q.parent_question_id,
    }
    # if there is a page_id, serialize it.
    if hasattr(q, "page_id"):
        res["pageId"] = q.page_id
    # if there is a slug, serialize it.
    if hasattr(q, "slug"):
        res["slug"] = q.slug
    return res


def serialize_question_response(r: QuestionResponse) -> dict:
    res = {
        "id": r.id,
        "questionId": r.question_id,
        "value": r.value,
    }
    if hasattr(r, "site_page_id"):
        res["sitePageId"] = r.site_page_id
    return res


def serialize_user(user: User) -> dict:
    return {
        "id": str(user.id),
        "email": user.email,
        "siteId": user.site_id,
    }


def serialize_site_page(site_page: SitePage) -> dict:
    page = Page.query.options(joinedload(Page.questions)).filter_by(id=site_page.page_id).first()
    site = Site.query.filter_by(id=site_page.site_assessment.site_id).first()
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
            "questions": [serialize_question(q) for q in page.questions],
        },
        "isConfirmationPage": site_page.is_confirmation_page,
        "site": serialize_site(site),
    }


def serialize_site_assessment(assessment: SiteAssessment) -> dict:
    site = Site.query.filter_by(id=assessment.site_id).first()
    serialized_site_pages = [serialize_site_page(sp) for sp in assessment.site_pages]
    return {
        "id": assessment.id,
        "siteId": assessment.site_id,
        "assessmentId": assessment.assessment_id,
        "createdAt": assessment.created_at.isoformat(),
        "sitePages": serialized_site_pages,
        "confirmed": assessment.confirmed,
        "site": serialize_site(site),
    }


def serialize_site(site: Site) -> dict:
    return {
        "id": site.id,
        "name": site.name,
        "siteId": site.id,
        "peopleServed": site.people_served,
    }


def serialize_organization(org: Organization) -> dict:
    return {
        "name": org.name,
        "organizationId": org.id,
        "mission": getattr(org, "mission", None),
        "regions": getattr(org, "regions", None),
    }


def serialize_user_data(user: User) -> dict:
    # Basic user info
    user_data = serialize_user(user)

    # Organization info (if any)
    org = None
    if user.organization_id:
        org_obj = Organization.query.get(user.organization_id)
        if org_obj:
            org = serialize_organization(org_obj)
    # Site info (if any)
    site = None
    if user.site_id:
        site_obj = Site.query.get(user.site_id)
        if site_obj:
            site = serialize_site(site_obj)

    return {
        "user": user_data,
        "organization": org,
        "site_id": user.site_id,
        "site": site,
    }
