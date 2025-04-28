import logging

from backend.models import (
    db,
    Site,
    SiteQuestion,
    Organization,
    OrganizationQuestion,
    OrganizationQuestionResponse,
)
from backend.consts import ORG_NAME


def update_org_and_responses(organization, name):
    if name:
        org_question = OrganizationQuestion.query.filter_by(slug=ORG_NAME).first()
        existing = OrganizationQuestionResponse.query.filter_by(
            organization_id=organization.id,
            question_id=org_question.id,
        ).first()
        if existing:
            existing.value = name
            db.session.add(existing)
        else:
            new_response = OrganizationQuestionResponse(
                organization_id=organization.id, question_id=org_question.id, value=name
            )
            db.session.add(new_response)
            organization.question_responses.append(new_response)
    db.session.commit()


def create_or_update_site_from_responses(user, responses_data):
    organization = user.organization_id
    responses = {r["questionId"]: r["value"] for r in responses_data}

    # find the sitequestion with slug sitename
    site_name_id = SiteQuestion.query.filter_by(slug="sitename").first().id
    people_served_id = SiteQuestion.query.filter_by(slug="sitenumserved").first().id
    site_name = responses.get(site_name_id, None)
    people_served = responses.get(people_served_id, None)

    site = Site.query.filter_by(name=site_name, organization_id=organization).first()
    # make sure the site is associated with the organization
    if site:
        logging.error(f"Site {site_name} already exists of organization {organization}.")
        return
    # if the site doesn't exist, create it
    if not site:
        site = Site(name=site_name, organization_id=organization)

    # update the site with the new data
    site.people_served = people_served
    db.session.add(site)
    db.session.commit()
    site = Site.query.filter_by(name=site_name, organization_id=organization).first()
    user.site_id = site.id
    db.session.add(user)

    # add the site to the organization
    org = Organization.query.filter_by(id=organization).first()
    if org:
        org.sites.append(site)
        db.session.add(org)
    db.session.commit()
    return site


def create_or_update_org_from_responses(user, responses_data):
    responses = {r["questionId"]: r["value"] for r in responses_data}
    # find the sitequestion with slug sitename
    org_name_id = OrganizationQuestion.query.filter_by(slug="orgname").first().id
    org_name = responses.get(org_name_id, None)

    if user.organization_id:
        # if the user already has an organization, return it
        org = Organization.query.filter_by(id=user.organization_id).first()
        if org:
            org.name = org_name
            db.session.add(org)

    else:
        org = Organization.query.filter_by(name=org_name).first()
        # if the site doesn't exist, create it
        if not org:
            org = Organization(name=org_name)

        db.session.add(org)
        db.session.commit()
        org = Organization.query.filter_by(name=org_name).first()
        user.organization_id = org.id
        db.session.add(user)

    db.session.commit()
    return org
