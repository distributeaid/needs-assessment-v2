from flask import Flask
from backend.models import db
from backend.routes import api_bp

app = Flask(__name__)

# Configure Database
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Initialize Database with Flask app
db.init_app(app)

# Register Routes
app.register_blueprint(api_bp)

with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
