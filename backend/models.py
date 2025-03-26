from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    site_id = db.Column(db.Integer, db.ForeignKey('site.id'), nullable=False)

class Site(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    assessments = db.relationship('SiteAssessment', backref='site', lazy=True)

class Assessment(db.Model):  # Template
    id = db.Column(db.Integer, primary_key=True)
    year = db.Column(db.Integer, nullable=False)
    season = db.Column(db.String(10), nullable=False)
    pages = db.relationship('Page', backref='assessment', lazy=True)

class Page(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    assessment_id = db.Column(db.Integer, db.ForeignKey('assessment.id'), nullable=False)
    questions = db.relationship('Question', backref='page', lazy=True)

class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    page_id = db.Column(db.Integer, db.ForeignKey('page.id'), nullable=False)
    text = db.Column(db.String(255), nullable=False)
    subtext = db.Column(db.String(255), nullable=True)
    mandatory = db.Column(db.Boolean, default=False)
    question_type = db.Column(db.String(50), nullable=False)
    response_options = db.Column(db.Text, nullable=True)
    order = db.Column(db.Integer, nullable=False)

class SiteAssessment(db.Model):  # Instance for a Site
    id = db.Column(db.Integer, primary_key=True)
    site_id = db.Column(db.Integer, db.ForeignKey('site.id'), nullable=False)
    assessment_id = db.Column(db.Integer, db.ForeignKey('assessment.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    site_pages = db.relationship('SitePage', backref='site_assessment', lazy=True)

class SitePage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    site_assessment_id = db.Column(db.Integer, db.ForeignKey('site_assessment.id'), nullable=False)
    page_id = db.Column(db.Integer, db.ForeignKey("page.id"), nullable=False)
    state = db.Column(db.String(10), default='required')
    required = db.Column(db.Boolean, default=False)
    progress = db.Column(db.String(20), default="Locked") # 'Locked', 'Unstarted', 'In Progress', 'Complete'

class QuestionResponse(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    site_page_id = db.Column(db.Integer, db.ForeignKey('site_page.id'), nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('question.id'), nullable=False)
    response = db.Column(db.String(255), nullable=True)
