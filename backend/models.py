"""
SQLAlchemy ORM models — maps 1:1 to the DB schema in the P0 design doc (section 9).
"""
import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean, Column, DateTime, Enum, Float, ForeignKey,
    Integer, JSON, String, Text, UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


def gen_uuid():
    return str(uuid.uuid4())


# ─── Auth ─────────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    email = Column(String, unique=True, nullable=False, index=True)
    display_name = Column(String, nullable=True)
    timezone = Column(String, default="America/Vancouver")
    preferred_language = Column(String, default="en")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    family = relationship("Family", back_populates="user", uselist=False)
    login_tokens = relationship("LoginToken", back_populates="user")


class LoginToken(Base):
    __tablename__ = "login_tokens"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=True)
    email = Column(String, nullable=False)
    token_hash = Column(String, nullable=False, unique=True)
    redirect_url = Column(String, nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="login_tokens")


# ─── City ─────────────────────────────────────────────────────────────────────

class City(Base):
    __tablename__ = "cities"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    name = Column(String, nullable=False)
    country = Column(String, nullable=False)
    region = Column(String, nullable=True)
    timezone = Column(String, nullable=False)
    currency = Column(String, nullable=False, default="CAD")
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    default_radius_km = Column(Integer, default=30)
    support_status = Column(
        Enum("active", "beta", "waitlist", "hidden", name="city_status"),
        nullable=False,
        default="waitlist",
    )
    coverage_level = Column(
        Enum("none", "places_only", "limited_events", "full", name="coverage_level"),
        nullable=False,
        default="none",
    )
    is_featured = Column(Boolean, default=False)
    sort_order = Column(Integer, default=99)

    neighbors = relationship(
        "CityNeighbor", foreign_keys="CityNeighbor.city_id", back_populates="city"
    )
    families = relationship("Family", back_populates="city")
    events = relationship("Event", back_populates="city")
    places = relationship("Place", back_populates="city")


class CityNeighbor(Base):
    __tablename__ = "city_neighbors"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    city_id = Column(UUID(as_uuid=False), ForeignKey("cities.id"), nullable=False)
    nearby_city_id = Column(UUID(as_uuid=False), ForeignKey("cities.id"), nullable=False)
    priority = Column(Integer, default=1)
    enabled = Column(Boolean, default=True)

    city = relationship("City", foreign_keys=[city_id], back_populates="neighbors")

    __table_args__ = (UniqueConstraint("city_id", "nearby_city_id"),)


class WaitlistRequest(Base):
    __tablename__ = "waitlist_requests"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    email = Column(String, nullable=False)
    city_name = Column(String, nullable=False)
    country = Column(String, nullable=True)
    children_age_range = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ─── Family ───────────────────────────────────────────────────────────────────

class Family(Base):
    __tablename__ = "families"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), unique=True, nullable=False)
    city_id = Column(UUID(as_uuid=False), ForeignKey("cities.id"), nullable=False)
    neighborhood = Column(String, nullable=True)
    transportation_mode = Column(
        Enum("car", "transit", "walking", "flexible", name="transport_mode"),
        default="car",
    )
    budget_level = Column(
        Enum("free", "under_20", "20_50", "50_plus", name="budget_level"),
        default="20_50",
    )
    distance_preference = Column(
        Enum("nearby", "30min", "flexible", name="distance_pref"),
        default="30min",
    )
    reminder_preference = Column(
        Enum("day_before", "same_day", "none", name="reminder_pref"),
        default="day_before",
    )
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    user = relationship("User", back_populates="family")
    city = relationship("City", back_populates="families")
    children = relationship("ChildProfile", back_populates="family", cascade="all, delete-orphan")
    preferences = relationship("FamilyPreference", back_populates="family", cascade="all, delete-orphan")
    plan_requests = relationship("PlanRequest", back_populates="family")
    saved_plans = relationship("SavedPlan", back_populates="family")


class ChildProfile(Base):
    __tablename__ = "children_profiles"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    family_id = Column(UUID(as_uuid=False), ForeignKey("families.id"), nullable=False)
    age = Column(Integer, nullable=False)

    family = relationship("Family", back_populates="children")


class FamilyPreference(Base):
    __tablename__ = "family_preferences"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    family_id = Column(UUID(as_uuid=False), ForeignKey("families.id"), nullable=False)
    preference_type = Column(String, nullable=False)   # e.g. "interest", "availability"
    preference_value = Column(String, nullable=False)  # e.g. "outdoor", "Sat morning"
    weight = Column(Float, default=1.0)

    family = relationship("Family", back_populates="preferences")


# ─── Content ──────────────────────────────────────────────────────────────────

class ContentSource(Base):
    __tablename__ = "content_sources"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    city_id = Column(UUID(as_uuid=False), ForeignKey("cities.id"), nullable=False)
    name = Column(String, nullable=False)
    source_type = Column(String, nullable=False)  # "website", "api", "manual"
    base_url = Column(String, nullable=True)
    spider_class = Column(String, nullable=True)
    reliability_score = Column(Float, default=1.0)
    crawl_enabled = Column(Boolean, default=True)
    last_checked_at = Column(DateTime(timezone=True), nullable=True)

    events = relationship("Event", back_populates="source")
    places = relationship("Place", back_populates="source")
    crawl_jobs = relationship("CrawlJob", back_populates="source")


class Event(Base):
    __tablename__ = "events"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    city_id = Column(UUID(as_uuid=False), ForeignKey("cities.id"), nullable=False, index=True)
    source_id = Column(UUID(as_uuid=False), ForeignKey("content_sources.id"), nullable=True)
    source_external_id = Column(String, nullable=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    source_url = Column(String, nullable=True)
    start_time = Column(DateTime(timezone=True), nullable=True, index=True)
    end_time = Column(DateTime(timezone=True), nullable=True)
    location_name = Column(String, nullable=True)
    address = Column(String, nullable=True)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    price_min = Column(Float, nullable=True)
    price_max = Column(Float, nullable=True)
    age_min = Column(Integer, nullable=True)
    age_max = Column(Integer, nullable=True)
    registration_required = Column(Boolean, default=False)
    indoor_outdoor = Column(String, nullable=True)  # "indoor" | "outdoor" | "both"
    category = Column(String, nullable=True)
    tags = Column(JSON, default=list)
    status = Column(
        Enum("needs_review", "active", "hidden", "expired", "cancelled", "invalid",
             name="event_status"),
        default="needs_review",
    )
    last_checked_at = Column(DateTime(timezone=True), nullable=True)

    city = relationship("City", back_populates="events")
    source = relationship("ContentSource", back_populates="events")

    __table_args__ = (
        UniqueConstraint("source_id", "source_external_id"),
    )


class Place(Base):
    __tablename__ = "places"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    city_id = Column(UUID(as_uuid=False), ForeignKey("cities.id"), nullable=False, index=True)
    source_id = Column(UUID(as_uuid=False), ForeignKey("content_sources.id"), nullable=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=True)
    official_url = Column(String, nullable=True)
    address = Column(String, nullable=True)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    suitable_age_min = Column(Integer, nullable=True)
    suitable_age_max = Column(Integer, nullable=True)
    estimated_duration = Column(String, nullable=True)
    cost_level = Column(String, nullable=True)  # "free", "low", "medium", "high"
    indoor_outdoor = Column(String, nullable=True)
    rainy_day_friendly = Column(Boolean, default=False)
    booking_required = Column(Boolean, default=False)
    tags = Column(JSON, default=list)
    status = Column(
        Enum("active", "hidden", "invalid", name="place_status"),
        default="active",
    )

    city = relationship("City", back_populates="places")
    source = relationship("ContentSource", back_populates="places")


# ─── Plans ────────────────────────────────────────────────────────────────────

class PlanRequest(Base):
    __tablename__ = "plan_requests"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    family_id = Column(UUID(as_uuid=False), ForeignKey("families.id"), nullable=True)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=True)
    city_id = Column(UUID(as_uuid=False), ForeignKey("cities.id"), nullable=False)
    request_type = Column(
        Enum("initial", "custom_idea", "regenerate", name="request_type"),
        default="initial",
    )
    user_text = Column(Text, nullable=True)
    selected_filters = Column(JSON, default=dict)
    parsed_constraints = Column(JSON, default=dict)
    status = Column(String, default="pending")  # pending | processing | done | failed
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    family = relationship("Family", back_populates="plan_requests")
    generated_plans = relationship("GeneratedPlan", back_populates="plan_request")
    exposures = relationship("RecommendationExposure", back_populates="plan_request")


class GeneratedPlan(Base):
    __tablename__ = "generated_plans"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    plan_request_id = Column(UUID(as_uuid=False), ForeignKey("plan_requests.id"), nullable=False)
    family_id = Column(UUID(as_uuid=False), ForeignKey("families.id"), nullable=True)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=True)
    city_id = Column(UUID(as_uuid=False), ForeignKey("cities.id"), nullable=False)
    plan_type = Column(
        Enum("low_cost", "rain_friendly", "special_event", "place_based_fallback",
             "custom_idea", name="plan_type"),
        nullable=False,
    )
    title = Column(String, nullable=False)
    summary = Column(Text, nullable=True)
    recommended_date = Column(String, nullable=True)
    recommended_time = Column(String, nullable=True)
    estimated_duration = Column(String, nullable=True)
    budget = Column(String, nullable=True)
    location = Column(String, nullable=True)
    age_min = Column(Integer, nullable=True)
    age_max = Column(Integer, nullable=True)
    is_indoor = Column(Boolean, nullable=True)
    is_rain_friendly = Column(Boolean, default=False)
    registration_required = Column(Boolean, default=False)
    timeline = Column(JSON, default=list)
    preparation_items = Column(JSON, default=list)
    backup_plan = Column(Text, nullable=True)
    source_event_ids = Column(JSON, default=list)
    source_place_ids = Column(JSON, default=list)
    source_name = Column(String, nullable=True)
    source_url = Column(String, nullable=True)
    recommendation_reason = Column(Text, nullable=True)
    generation_status = Column(String, default="pending")  # pending | done | failed
    llm_model = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    plan_request = relationship("PlanRequest", back_populates="generated_plans")
    saved_plan = relationship("SavedPlan", back_populates="generated_plan", uselist=False)
    exposures = relationship("RecommendationExposure", back_populates="generated_plan")
    feedback = relationship("PlanFeedback", back_populates="generated_plan", uselist=False)


class RecommendationExposure(Base):
    __tablename__ = "recommendation_exposures"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=True)
    family_id = Column(UUID(as_uuid=False), ForeignKey("families.id"), nullable=True)
    plan_request_id = Column(UUID(as_uuid=False), ForeignKey("plan_requests.id"), nullable=False)
    generated_plan_id = Column(UUID(as_uuid=False), ForeignKey("generated_plans.id"), nullable=False)
    source_event_ids = Column(JSON, default=list)
    source_place_ids = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    plan_request = relationship("PlanRequest", back_populates="exposures")
    generated_plan = relationship("GeneratedPlan", back_populates="exposures")


# ─── Saved Plans ──────────────────────────────────────────────────────────────

class SavedPlan(Base):
    __tablename__ = "saved_plans"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False)
    family_id = Column(UUID(as_uuid=False), ForeignKey("families.id"), nullable=False)
    generated_plan_id = Column(UUID(as_uuid=False), ForeignKey("generated_plans.id"), nullable=False)
    scheduled_date = Column(String, nullable=True)
    scheduled_start_time = Column(String, nullable=True)
    status = Column(
        Enum("saved", "completed", "cancelled", "expired", name="saved_plan_status"),
        default="saved",
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    family = relationship("Family", back_populates="saved_plans")
    generated_plan = relationship("GeneratedPlan", back_populates="saved_plan")
    checklist_items = relationship(
        "ChecklistItem", back_populates="saved_plan",
        cascade="all, delete-orphan", order_by="ChecklistItem.sort_order",
    )
    reminders = relationship("Reminder", back_populates="saved_plan", cascade="all, delete-orphan")


class ChecklistItem(Base):
    __tablename__ = "checklist_items"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    saved_plan_id = Column(UUID(as_uuid=False), ForeignKey("saved_plans.id"), nullable=False)
    text = Column(String, nullable=False)
    is_completed = Column(Boolean, default=False)
    sort_order = Column(Integer, default=0)

    saved_plan = relationship("SavedPlan", back_populates="checklist_items")


class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False)
    saved_plan_id = Column(UUID(as_uuid=False), ForeignKey("saved_plans.id"), nullable=False)
    reminder_type = Column(
        Enum("day_before", "same_day", "registration_check", "feedback_request",
             name="reminder_type"),
        nullable=False,
    )
    scheduled_at = Column(DateTime(timezone=True), nullable=False, index=True)
    sent_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(String, default="pending", index=True)  # pending | sent | failed | cancelled

    saved_plan = relationship("SavedPlan", back_populates="reminders")


# ─── Feedback ─────────────────────────────────────────────────────────────────

class PlanFeedback(Base):
    __tablename__ = "plan_feedback"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    generated_plan_id = Column(UUID(as_uuid=False), ForeignKey("generated_plans.id"), nullable=False)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False)
    rating = Column(
        Enum("helpful", "okay", "not_helpful", name="feedback_rating"),
        nullable=False,
    )
    reasons = Column(JSON, default=list)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    generated_plan = relationship("GeneratedPlan", back_populates="feedback")


# ─── Crawler ──────────────────────────────────────────────────────────────────

class CrawlJob(Base):
    __tablename__ = "crawl_jobs"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    source_id = Column(UUID(as_uuid=False), ForeignKey("content_sources.id"), nullable=False)
    status = Column(String, default="pending")  # pending | running | done | failed
    events_found = Column(Integer, default=0)
    events_upserted = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    finished_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    source = relationship("ContentSource", back_populates="crawl_jobs")


# ─── Analytics ────────────────────────────────────────────────────────────────

class AnalyticsEvent(Base):
    __tablename__ = "analytics_events"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), nullable=True)
    event_name = Column(String, nullable=False)
    properties = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
