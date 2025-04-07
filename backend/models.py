from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, UTC
from sqlalchemy.dialects.mysql import JSON
from sqlalchemy.ext.declarative import declared_attr
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey

db = SQLAlchemy()


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    hashed_password = db.Column(db.String(255), nullable=False)
    organization_id = db.Column(db.Integer, db.ForeignKey("organization.id"), nullable=False)
    site_id = db.Column(db.Integer, db.ForeignKey("site.id"), nullable=True)


class Organization(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    sites = db.relationship("Site", backref="organization", lazy=True)

    question_responses = db.relationship(
        "OrganizationQuestionResponse", back_populates="organization", lazy=True
    )


class Site(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    assessments = db.relationship("SiteAssessment", backref="site", lazy=True)
    people_served = db.Column(db.Integer, default=0)
    organization_id = db.Column(db.Integer, db.ForeignKey("organization.id"), nullable=False)
    question_responses = db.relationship("SiteQuestionResponse", back_populates="site", lazy=True)


class Assessment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    year = db.Column(db.Integer, nullable=False)
    season = db.Column(db.String(10), nullable=False)
    pages = db.relationship("Page", backref="assessment", lazy=True)


class Page(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    assessment_id = db.Column(db.Integer, db.ForeignKey("assessment.id"), nullable=False)
    questions = db.relationship("Question", backref="page", lazy=True)
    order = db.Column(db.Integer, nullable=False)
    is_confirmation_page = db.Column(db.Boolean, default=False)
    is_profile_page = db.Column(db.Boolean, default=False)


class QuestionMixin:
    __abstract__ = True

    id = Column(Integer, primary_key=True)
    text = Column(String(255), nullable=False)
    subtext = Column(String(255), nullable=True)
    required = Column(Boolean, default=False)
    question_type = Column(String(50), nullable=False)
    options = Column(JSON, nullable=True)
    order = Column(Integer, nullable=False)
    allows_additional_input = Column(Boolean, default=False)
    slug = Column(String(255), nullable=True)

    @declared_attr
    def parent_question_id(cls):
        # each subclass will get its own FK to its own table
        return Column(Integer, ForeignKey(f"{cls.__tablename__}.id"), nullable=True)


class Question(QuestionMixin, db.Model):
    __tablename__ = "question"

    page_id = Column(Integer, ForeignKey("page.id"), nullable=False)


class OrganizationQuestion(QuestionMixin, db.Model):
    __tablename__ = "organization_question"


class SiteQuestion(QuestionMixin, db.Model):
    __tablename__ = "site_question"


class SiteAssessment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    site_id = db.Column(db.Integer, db.ForeignKey("site.id"), nullable=False)
    assessment_id = db.Column(db.Integer, db.ForeignKey("assessment.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now(UTC))
    site_pages = db.relationship("SitePage", backref="site_assessment", lazy=True)
    confirmed = db.Column(db.Boolean, default=False)


class SitePage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    site_assessment_id = db.Column(db.Integer, db.ForeignKey("site_assessment.id"), nullable=False)
    page_id = db.Column(db.Integer, db.ForeignKey("page.id"), nullable=False)
    order = db.Column(db.Integer, nullable=False)
    state = db.Column(db.String(10), default="required")
    required = db.Column(db.Boolean, default=False)
    progress = db.Column(db.String(20), default="LOCKED")
    responses = db.relationship("QuestionResponse", back_populates="site_page", lazy=True)
    is_confirmation_page = db.Column(db.Boolean, default=False)
    title = db.Column(db.String(255), nullable=False)


class ResponseMixin:
    __abstract__ = True

    id = Column(Integer, primary_key=True)
    value = Column(JSON, nullable=True)

    @declared_attr
    def question_id(cls):
        # if __tablename__ is "question_response" → base_table="question"
        # if "organization_question_response" → "organization_question", etc.
        base = cls.__tablename__.replace("_response", "")
        return Column(Integer, ForeignKey(f"{base}.id"), nullable=False)


class QuestionResponse(ResponseMixin, db.Model):
    __tablename__ = "question_response"

    site_page_id = Column(Integer, ForeignKey("site_page.id"), nullable=False)

    # optional backrefs
    site_page = db.relationship("SitePage", back_populates="responses")
    question = db.relationship("Question")


# your existing org + site response classes now simply inherit:
class OrganizationQuestionResponse(ResponseMixin, db.Model):
    __tablename__ = "organization_question_response"

    organization_id = Column(Integer, ForeignKey("organization.id"), nullable=False)
    organization = db.relationship("Organization", back_populates="question_responses")
    question = db.relationship("OrganizationQuestion")


class SiteQuestionResponse(ResponseMixin, db.Model):
    __tablename__ = "site_question_response"

    site_id = Column(Integer, ForeignKey("site.id"), nullable=False)
    site = db.relationship("Site", back_populates="question_responses")
    question = db.relationship("SiteQuestion")


class SiteAssessmentResult(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    site_assessment_id = db.Column(db.Integer, db.ForeignKey("site_assessment.id"), nullable=False)
    data = db.Column(JSON, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.now(UTC), onupdate=datetime.now(UTC))
