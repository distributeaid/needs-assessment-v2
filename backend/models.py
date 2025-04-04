from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, UTC
from sqlalchemy.dialects.mysql import JSON

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    hashed_password = db.Column(db.String(255), nullable=False)
    site_id = db.Column(db.Integer, db.ForeignKey('site.id'), nullable=False)

class Site(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    assessments = db.relationship('SiteAssessment', backref='site', lazy=True)
    people_served = db.Column(db.Integer, default=0)

class Assessment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    year = db.Column(db.Integer, nullable=False)
    season = db.Column(db.String(10), nullable=False)
    pages = db.relationship('Page', backref='assessment', lazy=True)

class Page(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    assessment_id = db.Column(db.Integer, db.ForeignKey('assessment.id'), nullable=False)
    questions = db.relationship('Question', backref='page', lazy=True)
    order = db.Column(db.Integer, nullable=False)
    is_confirmation_page = db.Column(db.Boolean, default=False)
    is_profile_page = db.Column(db.Boolean, default=False)

class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    page_id = db.Column(db.Integer, db.ForeignKey('page.id'), nullable=False)
    text = db.Column(db.String(255), nullable=False)
    subtext = db.Column(db.String(255), nullable=True)
    required = db.Column(db.Boolean, default=False)
    type = db.Column(db.String(50), nullable=False)
    options = db.Column(JSON, nullable=True)
    order = db.Column(db.Integer, nullable=False)
    allows_additional_input = db.Column(db.Boolean, default=False)
    parent_question_id = db.Column(db.Integer, db.ForeignKey('question.id'), nullable=True)


class SiteAssessment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    site_id = db.Column(db.Integer, db.ForeignKey('site.id'), nullable=False)
    assessment_id = db.Column(db.Integer, db.ForeignKey('assessment.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now(UTC))
    site_pages = db.relationship('SitePage', backref='site_assessment', lazy=True)
    confirmed = db.Column(db.Boolean, default=False)

class SitePage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    site_assessment_id = db.Column(db.Integer, db.ForeignKey('site_assessment.id'), nullable=False)
    page_id = db.Column(db.Integer, db.ForeignKey("page.id"), nullable=False)
    order = db.Column(db.Integer, nullable=False)
    state = db.Column(db.String(10), default='required')
    required = db.Column(db.Boolean, default=False)
    progress = db.Column(db.String(20), default="LOCKED")
    responses = db.relationship('QuestionResponse', backref='site_page', lazy=True)
    is_confirmation_page = db.Column(db.Boolean, default=False)
    title = db.Column(db.String(255), nullable=False)


class QuestionResponse(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    site_page_id = db.Column(db.Integer, db.ForeignKey('site_page.id'), nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('question.id'), nullable=False)
    value = db.Column(JSON, nullable=True)

class SiteAssessmentResult(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    site_assessment_id = db.Column(db.Integer, db.ForeignKey('site_assessment.id'), nullable=False)
    data = db.Column(db.JSON, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.now(UTC), onupdate=datetime.now(UTC))
