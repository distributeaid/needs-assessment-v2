import csv
from datetime import datetime
from backend.models import db, Page, Question, Assessment
from backend.consts import QUESTION_TYPES, REQUIRED_PAGES

def seed_database_from_csv(filepath="backend/data/questions.csv"):
    """Reads a CSV file and seeds the database with Assessments, Pages, and Questions."""

    # Get current Year & Season
    current_year = datetime.utcnow().year
    current_season = "Spring" if datetime.utcnow().month < 7 else "Fall"

    # Ensure there is an Assessment for the current season
    assessment = Assessment.query.filter_by(year=current_year, season=current_season).first()
    if not assessment:
        assessment = Assessment(year=current_year, season=current_season)
        db.session.add(assessment)
        db.session.commit()

    # Open CSV with error handling for encoding issues
    with open(filepath, mode="r", encoding="utf-8", errors="replace") as file:
        reader = csv.DictReader(file)
        for row in reader:
            # Fetch or create page within the current assessment
            page = Page.query.filter_by(name=row["Page"], assessment_id=assessment.id).first()
            if not page:
                page = Page(name=row["Page"], assessment_id=assessment.id)
                db.session.add(page)
                db.session.commit()

            # Create question
            question = Question(
                page_id=page.id,
                text=row["ItemText"],
                subtext=row["Item Subtext"] if row["Item Subtext"] else None,
                mandatory=True if row["Mandatory in Section"] == "Y" else False,
                question_type=QUESTION_TYPES.get(row["Type"].strip().lower(), "Short Answer"),
                response_options=row["Response Options"] if row["Response Options"] else None,
                order=int(row["QuestionOrder"])
            )
            db.session.add(question)

    db.session.commit()
