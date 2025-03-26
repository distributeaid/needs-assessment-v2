import pytest
from datetime import datetime
from flask_migrate import Migrate

from backend.app import app
from backend.models import db, User, Site, Assessment
from backend.seed import seed_database

@pytest.fixture
def client():
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"  # Use in-memory DB for tests

    with app.test_client() as client:
        with app.app_context():
            Migrate(app, db)
            db.create_all()
            seed_database()

        yield client
        with app.app_context():
            db.drop_all()  # Cleanup after tests
