import pytest
from backend.app import app
from backend.models import db, User
from backend.seed import seed_database
from backend.utils.import_data import load_seed_data
from backend.utils.jwt_utils import generate_jwt_payload

@pytest.fixture
def client():
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {"connect_args": {"check_same_thread": False}}

    with app.app_context():
        db.drop_all()
        db.create_all()
        load_seed_data(db)

        with app.test_client() as client:
            yield client

        db.drop_all()


@pytest.fixture
def auth_header():
    """Fixture to generate an Authorization header with a valid JWT token."""
    with app.app_context():
        user = User.query.filter_by(email="testuser@example.com").first()
        if not user:
            pytest.skip("No user exists for testing JWT")
        token = generate_jwt_payload(user)
        return {"Authorization": f"Bearer {token}"}
