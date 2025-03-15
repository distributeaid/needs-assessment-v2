import pytest
from datetime import datetime

from backend.app import app
from backend.models import db, User, Site, Assessment

@pytest.fixture
def client():
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"  # Use in-memory DB for tests

    with app.test_client() as client:
        with app.app_context():
            db.create_all()  # Create test database
            # Seed a test site
            site = Site(name="Test Site")
            db.session.add(site)
            db.session.commit()

            # Seed a test user
            user = User(username="testuser", site_id=site.id)
            db.session.add(user)
            db.session.commit()

            # Seed an assessment template for the current year & season
            current_year = datetime.utcnow().year
            current_season = "Spring" if datetime.utcnow().month < 7 else "Fall"

            assessment = Assessment(year=current_year, season=current_season)
            db.session.add(assessment)
            db.session.commit()
            # Debug: Print all assessments

        yield client
        with app.app_context():
            db.drop_all()  # Cleanup after tests
