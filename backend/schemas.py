"""
Pydantic v2 request/response schemas for all API endpoints.
"""
from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, EmailStr, field_validator


# ─── Auth ─────────────────────────────────────────────────────────────────────

class SendLinkRequest(BaseModel):
    email: EmailStr
    redirect_url: Optional[str] = None


class SendLinkResponse(BaseModel):
    message: str


class VerifyTokenResponse(BaseModel):
    user_id: str
    email: str
    session_token: str


class UserOut(BaseModel):
    id: str
    email: str
    display_name: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── City ─────────────────────────────────────────────────────────────────────

class CityOut(BaseModel):
    id: str
    name: str
    country: str
    region: Optional[str]
    timezone: str
    currency: str
    lat: float
    lng: float
    default_radius_km: int
    support_status: str
    coverage_level: str
    is_featured: bool
    sort_order: int

    model_config = {"from_attributes": True}


class WaitlistIn(BaseModel):
    email: EmailStr
    city_name: str
    country: Optional[str] = None
    children_age_range: Optional[str] = None
    notes: Optional[str] = None


class WaitlistOut(BaseModel):
    id: str
    message: str


# ─── Family ───────────────────────────────────────────────────────────────────

class ChildIn(BaseModel):
    age: int


class FamilyCreateIn(BaseModel):
    city_id: str
    neighborhood: Optional[str] = None
    children: list[ChildIn]
    budget: str
    transport: str
    distance: str
    interests: list[str]
    availability: list[str]
    reminder: str

    @field_validator("city_id")
    @classmethod
    def city_id_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("city_id must not be empty")
        return v


class FamilyUpdateIn(FamilyCreateIn):
    pass


class ChildOut(BaseModel):
    id: str
    age: int

    model_config = {"from_attributes": True}


class FamilyOut(BaseModel):
    id: str
    user_id: str
    city_id: str
    neighborhood: Optional[str]
    transportation_mode: str
    budget_level: str
    distance_preference: str
    reminder_preference: str
    children: list[ChildOut]
    interests: list[str]
    availability: list[str]

    model_config = {"from_attributes": True}


# ─── Plans ────────────────────────────────────────────────────────────────────

class AnonymousFamilyIn(BaseModel):
    city_id: str
    children: list[ChildIn] = []
    budget: str = "20_50"
    transport: str = "flexible"
    distance: str = "flexible"
    interests: list[str] = []
    availability: list[str] = []


class GeneratePlansIn(BaseModel):
    family_id: Optional[str] = None
    family_profile: Optional[AnonymousFamilyIn] = None
    user_text: Optional[str] = None
    selected_filters: Optional[dict[str, Any]] = None
    request_type: str = "initial"


class ClaimPlansIn(BaseModel):
    plan_request_id: str


class GeneratePlansOut(BaseModel):
    plan_request_id: str
    plans: list["GeneratedPlanOut"]


class TimelineItemOut(BaseModel):
    time: str
    description: str


class GeneratedPlanOut(BaseModel):
    id: str
    plan_type: str
    title: str
    summary: Optional[str]
    recommended_date: Optional[str]
    estimated_duration: Optional[str]
    budget: Optional[str]
    location: Optional[str]
    age_min: Optional[int]
    age_max: Optional[int]
    is_indoor: Optional[bool]
    is_rain_friendly: bool
    registration_required: bool
    timeline: list[dict]
    preparation_items: list[str]
    backup_plan: Optional[str]
    source_name: Optional[str]
    source_url: Optional[str]
    recommendation_reason: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class SavePlanIn(BaseModel):
    generated_plan_id: str
    family_id: str
    scheduled_date: Optional[str] = None
    scheduled_start_time: Optional[str] = None
    reminder: str = "day_before"


class ChecklistItemOut(BaseModel):
    id: str
    text: str
    is_completed: bool
    sort_order: int

    model_config = {"from_attributes": True}


class SavedPlanOut(BaseModel):
    id: str
    generated_plan_id: str
    plan_title: str
    plan_type: str
    scheduled_date: Optional[str]
    scheduled_start_time: Optional[str]
    status: str
    checklist_items: list[ChecklistItemOut]
    created_at: datetime

    model_config = {"from_attributes": True}


class UpdateChecklistItemIn(BaseModel):
    is_completed: bool


class FeedbackIn(BaseModel):
    generated_plan_id: str
    rating: str
    reasons: list[str] = []
    comment: Optional[str] = None


# ─── Admin ────────────────────────────────────────────────────────────────────

class AdminStatsOut(BaseModel):
    total_users: int
    total_families: int
    total_generated_plans: int
    total_saved_plans: int
    total_events: int
    total_places: int


class CityUpdateIn(BaseModel):
    support_status: Optional[str] = None
    coverage_level: Optional[str] = None
    is_featured: Optional[bool] = None
    sort_order: Optional[int] = None


class EventCreateIn(BaseModel):
    city_id: str
    source_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    source_url: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    location_name: Optional[str] = None
    address: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    price_min: Optional[float] = None
    price_max: Optional[float] = None
    age_min: Optional[int] = None
    age_max: Optional[int] = None
    registration_required: bool = False
    indoor_outdoor: Optional[str] = None
    category: Optional[str] = None
    tags: list[str] = []
    status: str = "needs_review"


class PlaceCreateIn(BaseModel):
    city_id: str
    source_id: Optional[str] = None
    name: str
    category: Optional[str] = None
    official_url: Optional[str] = None
    address: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    suitable_age_min: Optional[int] = None
    suitable_age_max: Optional[int] = None
    estimated_duration: Optional[str] = None
    cost_level: Optional[str] = None
    indoor_outdoor: Optional[str] = None
    rainy_day_friendly: bool = False
    booking_required: bool = False
    tags: list[str] = []
    status: str = "active"
