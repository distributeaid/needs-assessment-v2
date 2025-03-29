from flask import Flask
from flask_migrate import Migrate
from flask_cors import CORS

from backend.models import db
from backend.routes import api_bp
from backend.seed import seed_database

app = Flask(__name__)

# Configure Database
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET"] = "your-very-secret-key"
app.config["JWT_ALGORITHM"] = "HS256"
app.config["JWT_EXP_DELTA_SECONDS"] = 3600  # 1 hour

# Initialize Database with Flask app
db.init_app(app)
Migrate(app, db)
CORS(app)

# Register Routes
app.register_blueprint(api_bp)

with app.app_context():
    db.create_all()
    seed_database()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
