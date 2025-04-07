import json

from backend.models import Assessment, Page, Question, Site, User


def load_seed_data(db, path="data/test_seed.json"):
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    id_maps = {
        "assessment": {},
        "page": {},
        "question": {},
        "site": {},
        "user": {},
    }

    # Insert assessments
    for obj in data["assessments"]:
        old_id = obj.pop("id")
        a = Assessment(**obj)
        db.session.add(a)
        db.session.flush()  # Get new ID
        id_maps["assessment"][old_id] = a.id

    # Insert pages
    for obj in data["pages"]:
        old_id = obj.pop("id")
        obj["assessment_id"] = id_maps["assessment"][obj["assessment_id"]]
        p = Page(**obj)
        db.session.add(p)
        db.session.flush()
        id_maps["page"][old_id] = p.id

    # Insert questions
    for obj in data["questions"]:
        old_id = obj.pop("id")
        obj["page_id"] = id_maps["page"][obj["page_id"]]
        if obj["parent_question_id"]:
            obj["parent_question_id"] = id_maps["question"].get(obj["parent_question_id"])
        q = Question(**obj)
        db.session.add(q)
        db.session.flush()
        id_maps["question"][old_id] = q.id

    # Insert sites
    for obj in data["sites"]:
        old_id = obj.pop("id")
        s = Site(**obj)
        db.session.add(s)
        db.session.flush()
        id_maps["site"][old_id] = s.id

    # Insert users
    for obj in data["users"]:
        old_id = obj.pop("id")
        obj["site_id"] = id_maps["site"][obj["site_id"]]
        u = User(**obj)
        db.session.add(u)
        db.session.flush()
        id_maps["user"][old_id] = u.id

    db.session.commit()
    print("✅ Test database loaded from JSON")
