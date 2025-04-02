import csv
from datetime import datetime
import json

import bcrypt

from backend.models import db, Page, Question, Assessment, User, Site
from backend.consts import QUESTION_TYPES

def seed_database_from_csv(filepath="backend/data/questions.csv",
                           options_file="backend/data/response_options.json"):
    """Reads a CSV file and seeds the database with Assessments, Pages, and Questions."""
    # Get current Year & Season
    current_year = datetime.utcnow().year
    current_season = "Spring" if datetime.utcnow().month < 7 else "Fall"
    with open(options_file, "r", encoding="utf-8") as f:
        response_options_dict = json.load(f)

    # Ensure there is an Assessment for the current season
    assessment = Assessment.query.filter_by(year=current_year, season=current_season).first()
    if not assessment:
        assessment = Assessment(year=current_year, season=current_season)
        db.session.add(assessment)
        db.session.commit()

    # Open CSV with error handling for encoding issues
    with open(filepath, mode="r", encoding="utf-8", errors="replace") as file:
        reader = csv.DictReader(file)
        # Compute page order from CSV before the loop
        file.seek(0)  # rewind file to re-read for mapping
        reader_for_order = csv.DictReader(file)
        page_order_mapping = {}
        for row in reader_for_order:
            page = row["Page"]
            try:
                q_order = int(row["QuestionOrder"])
            except (ValueError, TypeError):
                continue
            if page and (page not in page_order_mapping or q_order < page_order_mapping[page]):
                page_order_mapping[page] = q_order
        file.seek(0)  # rewind again to use in the main loop
        reader = csv.DictReader(file)

        for row in reader:
            if row["Page"] == "Preamble":
                continue
            # Fetch or create page within the current assessment
            page = Page.query.filter_by(title=row["Page"], assessment_id=assessment.id).first()
            if not page:
                page = Page(
                    title=row["Page"],
                    assessment_id=assessment.id,
                    order=page_order_mapping.get(row["Page"], 9999)
                )
                db.session.add(page)
                db.session.commit()

            # Check if question already exists for this page
            existing_question = Question.query.filter_by(
                page_id=page.id,
                text=row["ItemText"]
            ).first()
            if existing_question:
                continue  # Skip this question if it already exists

            # Create question since it doesn't exist yet
            raw_response_options = row["Response Options"].strip() if row["Response Options"] else ""
            options = response_options_dict.get(row["ItemText"], None)
            if options:
                response_options = ",".join(options)
            else:
                response_options = raw_response_options or None

            question = Question(
                page_id=page.id,
                text=row["ItemText"],
                subtext=row["Item Subtext"] if row["Item Subtext"] else None,
                mandatory=True if row["Mandatory in Section"] == "Y" else False,
                type=QUESTION_TYPES.get(row["Type"].strip(), "Short Answer"),
                response_options=response_options,
                order=int(row["QuestionOrder"])
            )
            db.session.add(question)

    db.session.commit()


def seed_users():
    """Seeds the database with three sites and four users for testing."""
    # Create sites (if they don't exist)
    site1 = Site.query.filter_by(name="Test Site").first()
    if not site1:
        site1 = Site(name="Test Site")
        db.session.add(site1)
        db.session.commit()
    site2 = Site.query.filter_by(name="Admin Site").first()
    if not site2:
        site2 = Site(name="Admin Site")
        db.session.add(site2)
        db.session.commit()
    site3 = Site.query.filter_by(name="Shared Site").first()
    if not site3:
        site3 = Site(name="Shared Site")
        db.session.add(site3)
        db.session.commit()

    # Hash the password "password123" using bcrypt
    hashed_pw = bcrypt.hashpw("password123".encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    # Create the original test user (belongs to site1)
    testuser = User.query.filter_by(username="testuser").first()
    if not testuser:
        testuser = User(
            username="testuser",
            email="testuser@example.com",
            hashed_password=hashed_pw,
            site_id=site1.id
        )
        db.session.add(testuser)

    # Create an admin user (belongs to site2)
    admin = User.query.filter_by(username="admin").first()
    if not admin:
        admin = User(
            username="admin",
            email="admin@example.com",
            hashed_password=hashed_pw,
            site_id=site2.id
        )
        db.session.add(admin)

    # Create two additional users sharing site3
    user1 = User.query.filter_by(username="user1").first()
    if not user1:
        user1 = User(
            username="user1",
            email="user1@example.com",
            hashed_password=hashed_pw,
            site_id=site3.id
        )
        db.session.add(user1)
    user2 = User.query.filter_by(username="user2").first()
    if not user2:
        user2 = User(
            username="user2",
            email="user2@example.com",
            hashed_password=hashed_pw,
            site_id=site3.id
        )
        db.session.add(user2)

    db.session.commit()


def seed_database():
    """Seed the database with test data."""
    seed_database_from_csv()
    seed_users()
    print("Database seeded successfully.")