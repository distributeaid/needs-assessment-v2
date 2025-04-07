import csv
from datetime import datetime
import json
import pandas as pd
from collections import defaultdict
from datetime import datetime, UTC

import bcrypt

from backend.models import (
    db,
    Page,
    Question,
    Assessment,
    User,
    Site,
    Organization,
    OrganizationQuestion,
    SiteQuestion,
)
from backend.utils.export_data import export_seed_data


def choices_from_google():
    sheet_url = "https://docs.google.com/spreadsheets/d/1hh41TeFexc-0Byg3iDSzbA2nLYd05bgSuwrKu-DUmww/export?format=csv&id=1hh41TeFexc-0Byg3iDSzbA2nLYd05bgSuwrKu-DUmww&gid=0"
    df = pd.read_csv(sheet_url, header=1)
    needs_assessment_df = df[df["Include in Needs Assessment"] == True]
    needs_assessment_df = needs_assessment_df[["Category", "Item"]]
    # strip whitespac e from data
    needs_assessment_df["Category"] = needs_assessment_df["Category"].str.strip()
    needs_assessment_df["Item"] = needs_assessment_df["Item"].str.strip()

    category_mapper = {
        "Baby": "Infants and Children",
        "Cleaning": "Hygeine",
        "Clothing": "Clothing",
        "Cooking": "Food",
        "Education": "Infants and Children",
        "Electronic": "Household",
        "Food": "Food",
        "Health": "Hygeine",
        "Infrastructure": "Infrastructure",
        "Office": "Household",
        "Shelter": "Shelter",
        "Toys & Activities": "Infants and Children",
        "W.A.S.H.": "Hygeine",
    }
    needs_assessment_df["Category"] = needs_assessment_df["Category"].map(category_mapper)
    # drop duplicates
    needs_assessment_df = needs_assessment_df.drop_duplicates()
    # create a dictionary of categories and items
    choices = defaultdict(list)
    for _, row in needs_assessment_df.iterrows():
        category = row["Category"]
        item = row["Item"]
        choices[category].append(item)
    return choices


def page_order_from_csv(filepath):
    """Reads a CSV file and returns a dictionary mapping page titles to their order."""
    with open(filepath, mode="r", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        page_order_mapping = {}
        for row in reader:
            page = row["Page"]
            try:
                q_order = int(row["QuestionOrder"])
            except (ValueError, TypeError):
                continue
            if page and (page not in page_order_mapping or q_order < page_order_mapping[page]):
                page_order_mapping[page] = q_order
    return page_order_mapping


def maybe_create_page(row, assessment, page_order_mapping):
    """Creates a page if it doesn't already exist."""
    if row["Page"] in ["Site", "Organization"]:
        return None
    page = Page.query.filter_by(title=row["Page"], assessment_id=assessment.id).first()
    if not page:
        page = Page(
            title=row["Page"],
            assessment_id=assessment.id,
            order=page_order_mapping.get(row["Page"], 9999),
            is_confirmation_page=row["Page"] == "Confirmation",
            is_profile_page=row["Page"] == "Basic Info",
        )
        db.session.add(page)
        db.session.commit()
    return page


def maybe_create_question(
    row, page, parent_ids, choices_options, response_options_dict, page_order_mapping
):
    # Check if question already exists for this page
    raw_type = row["Type"]
    normalized_type = raw_type.replace(" With Numeric Entry", "").replace("WithOther", "").strip()
    allows_additional_input = "WithOther" in raw_type or "With Numeric Entry" in raw_type
    if row["ItemText"] == "Which of the following areas do you have needs in?":
        options = list(
            set(page_order_mapping.keys())
            - {"Preamble", "Confirmation", "Site", "Demographics", "Organization"}
        )
    if page:
        existing_question = Question.query.filter_by(page_id=page.id, text=row["ItemText"]).first()
    elif row["Page"] == "Organization":
        existing_question = OrganizationQuestion.query.filter_by(text=row["ItemText"]).first()
    elif row["Page"] == "Site":
        existing_question = SiteQuestion.query.filter_by(text=row["ItemText"]).first()

    if existing_question:
        return existing_question  # Skip this question if it already exists
    options = []
    if "Strapi" in row["ItemText"] or "do you need over the next six months?" in row["ItemText"]:
        options = choices_options.get(row["Page"], None)
    if not options:
        options = response_options_dict.get(row["ItemText"], None)
    parent_id = None
    if row["ParentItemID"]:
        parent_id = parent_ids.get(row["ParentItemID"])
    if row["Page"] == "Organization":
        question = OrganizationQuestion(
            text=row["ItemText"],
            subtext=row["Subtext"] if row["Subtext"] else None,
            required=True if row["Mandatory in Section"] == "Y" else False,
            question_type=normalized_type,
            options=options,
            order=int(row["QuestionOrder"]),
            allows_additional_input=allows_additional_input,
            parent_question_id=parent_id,
            slug=row.get("Slug", None),
        )
    elif row["Page"] == "Site":
        question = SiteQuestion(
            text=row["ItemText"],
            subtext=row["Subtext"] if row["Subtext"] else None,
            required=True if row["Mandatory in Section"] == "Y" else False,
            question_type=normalized_type,
            options=options,
            order=int(row["QuestionOrder"]),
            allows_additional_input=allows_additional_input,
            parent_question_id=parent_id,
            slug=row.get("Slug", None),
        )
    else:
        question = Question(
            page_id=page.id,
            text=row["ItemText"],
            subtext=row["Subtext"] if row["Subtext"] else None,
            required=True if row["Mandatory in Section"] == "Y" else False,
            question_type=normalized_type,
            options=options,
            order=int(row["QuestionOrder"]),
            allows_additional_input=allows_additional_input,
            parent_question_id=parent_id,
            slug=row.get("Slug", None),
        )
    db.session.add(question)
    db.session.commit()
    return question


def seed_assessment_from_csv(
    current_year,
    current_season,
    filepath="data/questions.csv",
    options_file="data/response_options.json",
):
    """Reads a CSV file and seeds the database with Assessments, Pages, and Questions."""
    assessment = Assessment(year=current_year, season=current_season)
    db.session.add(assessment)
    db.session.commit()

    with open(options_file, "r", encoding="utf-8") as f:
        response_options_dict = json.load(f)

    choices_options = choices_from_google()
    parent_ids = {}
    page_order_mapping = page_order_from_csv(filepath)

    # Open CSV with error handling for encoding issues
    with open(filepath, mode="r", encoding="utf-8", errors="replace") as file:
        reader = csv.DictReader(file)

        for row in reader:
            page = maybe_create_page(row, assessment, page_order_mapping)

            question = maybe_create_question(
                row, page, parent_ids, choices_options, response_options_dict, page_order_mapping
            )
            if row["ItemID"]:
                # get the question id - which means accessing it in the database
                question = SiteQuestion.query.filter_by(text=row["ItemText"]).first()
                parent_ids[row["ItemID"]] = question.id

    db.session.commit()


def get_or_create(model, *, lookup: dict, **defaults):
    """
    lookup: fields to filter on (e.g. {"email": "..."} or {"name": "..."} or both)
    defaults: all the other fields to fill in on create
    """
    instance = model.query.filter_by(**lookup).first()
    if instance:
        return instance

    params = {**lookup, **defaults}
    instance = model(**params)
    db.session.add(instance)
    db.session.commit()
    return instance


def seed_users():
    """Seeds the database with three sites and four users for testing."""
    # Create sites and organizations (if they don't exist)
    test_org_id = get_or_create(Organization, lookup={"name": "Test Org"}).id
    admin_org_id = get_or_create(Organization, lookup={"name": "Admin Org"}).id
    shared_org_id = get_or_create(Organization, lookup={"name": "Shared Org"}).id
    site1 = get_or_create(Site, lookup={"name": "Test Site"}, organization_id=test_org_id)
    site2 = get_or_create(Site, lookup={"name": "Admin Site"}, organization_id=admin_org_id)
    site3 = get_or_create(Site, lookup={"name": "Shared Site"}, organization_id=shared_org_id)

    # Hash the password "password123" using bcrypt
    hashed_pw = bcrypt.hashpw("password123".encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    # Create the original test user (belongs to site1)
    get_or_create(
        User,
        lookup={"email": "testuser@example.com"},
        hashed_password=hashed_pw,
        organization_id=test_org_id,
        site_id=site1.id,
    )
    get_or_create(
        User,
        lookup={"email": "admin@example.com"},
        hashed_password=hashed_pw,
        organization_id=admin_org_id,
        site_id=site2.id,
    )
    get_or_create(
        User,
        lookup={"email": "user1@example.com"},
        hashed_password=hashed_pw,
        organization_id=shared_org_id,
        site_id=site3.id,
    )
    get_or_create(
        User,
        lookup={"email": "user2@example.com"},
        hashed_password=hashed_pw,
        organization_id=shared_org_id,
        site_id=site3.id,
    )


def seed_database():
    """Seed the database with test data."""
    current_year = datetime.now(UTC).year
    current_season = "Spring" if datetime.now(UTC).month < 7 else "Fall"
    assessment = Assessment.query.filter_by(year=current_year, season=current_season).first()
    if not assessment:
        seed_assessment_from_csv(current_year=current_year, current_season=current_season)
    seed_users()
    print("✅ Database seeded successfully.")
    export_seed_data()
