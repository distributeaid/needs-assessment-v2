import pytest
from datetime import datetime

from backend.app import app
from backend.models import db, User, Site, Assessment
from backend.seed import seed_database_from_csv

@pytest.fixture
def client():
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"  # Use in-memory DB for tests

    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            site = Site.query.filter_by(name="Test Site").first()
            if not site:
                site = Site(name="Test Site")
                db.session.add(site)
                db.session.commit()

            user = User.query.filter_by(username="testuser").first()
            if not user:
                user = User(username="testuser", email="test@example.com", site_id=site.id)
                db.session.add(user)
                db.session.commit()

            seed_database_from_csv()



        yield client
        with app.app_context():
            db.drop_all()  # Cleanup after tests
