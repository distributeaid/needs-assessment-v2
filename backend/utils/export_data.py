import json

from backend.models import Assessment, Page, Question, Site, User

def serialize_model(obj):
    """Convert SQLAlchemy model instance to dict with sorted keys and no None values (excluding relationships)."""
    values = {
        column.name: getattr(obj, column.name)
        for column in sorted(obj.__table__.columns, key=lambda c: c.name)
    }
    return {k: values[k] for k in sorted(values)}


def export_seed_data(path="backend/data/test_seed.json"):
    data = {
        "assessments": [],
        "pages": [],
        "questions": [],
        "sites": [],
        "users": []
    }

    # Export assessments
    assessments = {a.id: serialize_model(a) for a in Assessment.query.all()}
    data["assessments"] = list(assessments.values())

    # Export pages (with assessment ref)
    pages = {}
    for p in Page.query.all():
        obj = serialize_model(p)
        obj["assessment_id"] = p.assessment_id
        pages[p.id] = obj
    data["pages"] = list(pages.values())

    # Export questions (with page and parent question ref)
    questions = {}
    for q in Question.query.all():
        obj = serialize_model(q)
        obj["page_id"] = q.page_id
        obj["parent_question_id"] = q.parent_question_id
        questions[q.id] = obj
    data["questions"] = list(questions.values())

    # Export sites
    sites = {s.id: serialize_model(s) for s in Site.query.all()}
    data["sites"] = list(sites.values())

    # Export users (with site ref)
    users = {}
    for u in User.query.all():
        obj = serialize_model(u)
        obj["site_id"] = u.site_id
        users[u.id] = obj
    data["users"] = list(users.values())

    # Save to JSON
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    print(f"✅ Exported seed data to {path}")
