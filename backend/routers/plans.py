"""
Plan generation, saving, and feedback endpoints.
Rule-based matching only for P0; LLM integration added in Sprint 6.
"""
import random
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from deps import get_current_user, get_current_user_optional
from models import (
    ChecklistItem, Family, GeneratedPlan, Place, PlanFeedback,
    PlanRequest, Reminder, RecommendationExposure, SavedPlan, User,
)
from schemas import (
    AnonymousFamilyIn, ClaimPlansIn, FeedbackIn, GeneratedPlanOut,
    GeneratePlansIn, GeneratePlansOut, SavedPlanOut, SavePlanIn,
    UpdateChecklistItemIn,
)

router = APIRouter(prefix="/api/plans", tags=["plans"])


# ─── Rule-based plan selector (Sprint 4) ──────────────────────────────────────

def _rule_based_plans(
    city_id: str,
    children_ages: list[int],
    budget_level: str,
    db: Session,
) -> list[dict]:
    """Returns up to 3 plan dicts by matching places. LLM augments this in Sprint 6."""
    age_min = min(children_ages) if children_ages else 0
    age_max = max(children_ages) if children_ages else 12

    places = (
        db.query(Place)
        .filter(
            Place.city_id == city_id,
            Place.status == "active",
            Place.suitable_age_min <= age_max,
            Place.suitable_age_max >= age_min,
        )
        .all()
    )

    if not places:
        return []

    random.shuffle(places)
    plan_types = ["low_cost", "rain_friendly", "special_event"]
    plans = []
    for i, place in enumerate(places[:3]):
        plans.append({
            "plan_type": plan_types[i % len(plan_types)],
            "title": place.name,
            "summary": f"A great {place.category} outing for kids aged {age_min}–{age_max}.",
            "recommended_date": "This Saturday",
            "recommended_time": "2:00 PM",
            "estimated_duration": place.estimated_duration or "2–3 hours",
            "budget": place.cost_level or "Free",
            "location": place.address or place.name,
            "age_min": place.suitable_age_min,
            "age_max": place.suitable_age_max,
            "is_indoor": place.indoor_outdoor == "indoor",
            "is_rain_friendly": place.rainy_day_friendly,
            "registration_required": place.booking_required,
            "timeline": [
                {"time": "1:30 PM", "description": "Leave home"},
                {"time": "2:00 PM", "description": f"Arrive at {place.name}"},
                {"time": "4:00 PM", "description": "Head home"},
            ],
            "preparation_items": ["Bring water bottles", "Check opening hours"],
            "backup_plan": "If it rains, check their indoor facilities.",
            "source_place_ids": [str(place.id)],
            "source_event_ids": [],
            "source_name": place.name,
            "source_url": place.official_url,
            "recommendation_reason": f"Matches your family's {budget_level} budget.",
        })
    return plans


# ─── Generate ─────────────────────────────────────────────────────────────────

@router.post("/generate", response_model=GeneratePlansOut)
def generate_plans(
    payload: GeneratePlansIn,
    current_user: User | None = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    # Resolve city_id, children_ages, budget_level from either DB family or inline profile
    if payload.family_id and current_user:
        family = db.query(Family).filter(
            Family.id == payload.family_id,
            Family.user_id == current_user.id,
        ).first()
        if not family:
            raise HTTPException(status_code=404, detail="Family not found")
        city_id = family.city_id
        children_ages = [c.age for c in family.children]
        budget_level = family.budget_level
        family_id = family.id
        user_id = family.user_id
    elif payload.family_profile:
        fp: AnonymousFamilyIn = payload.family_profile
        city_id = fp.city_id
        children_ages = [c.age for c in fp.children]
        budget_level = fp.budget
        family_id = None
        user_id = current_user.id if current_user else None
    else:
        raise HTTPException(
            status_code=400,
            detail="Provide either family_id (logged-in) or family_profile (anonymous)",
        )

    plan_request = PlanRequest(
        family_id=family_id,
        user_id=user_id,
        city_id=city_id,
        request_type=payload.request_type,
        user_text=payload.user_text,
        selected_filters=payload.selected_filters or {},
        status="processing",
    )
    db.add(plan_request)
    db.flush()

    raw_plans = _rule_based_plans(city_id, children_ages, budget_level, db)

    generated = []
    for raw in raw_plans:
        gp = GeneratedPlan(
            plan_request_id=plan_request.id,
            family_id=family_id,
            user_id=user_id,
            city_id=city_id,
            generation_status="done",
            **raw,
        )
        db.add(gp)
        db.flush()
        db.add(RecommendationExposure(
            user_id=user_id,
            family_id=family_id,
            plan_request_id=plan_request.id,
            generated_plan_id=gp.id,
            source_event_ids=raw.get("source_event_ids", []),
            source_place_ids=raw.get("source_place_ids", []),
        ))
        generated.append(gp)

    plan_request.status = "done"
    db.commit()
    for gp in generated:
        db.refresh(gp)

    return GeneratePlansOut(
        plan_request_id=plan_request.id,
        plans=generated,
    )


# ─── Claim anonymous plans ────────────────────────────────────────────────────

@router.post("/claim")
def claim_plans(
    payload: ClaimPlansIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    plan_request = db.query(PlanRequest).filter(
        PlanRequest.id == payload.plan_request_id,
        PlanRequest.user_id == None,  # noqa: E711
    ).first()
    if not plan_request:
        raise HTTPException(status_code=404, detail="Plan request not found or already claimed")

    family = db.query(Family).filter(Family.user_id == current_user.id).first()
    family_id = family.id if family else None

    plan_request.user_id = current_user.id
    if family_id:
        plan_request.family_id = family_id

    # Update all generated plans and exposures linked to this request
    for gp in plan_request.generated_plans:
        gp.user_id = current_user.id
        if family_id:
            gp.family_id = family_id

    for exp in plan_request.exposures:
        exp.user_id = current_user.id
        if family_id:
            exp.family_id = family_id

    db.commit()
    return {"message": "Plans claimed", "plan_request_id": plan_request.id}


@router.get("/{plan_id}", response_model=GeneratedPlanOut)
def get_plan(plan_id: str, db: Session = Depends(get_db)):
    plan = db.query(GeneratedPlan).filter(GeneratedPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan


# ─── Save ─────────────────────────────────────────────────────────────────────

def _saved_plan_dict(sp: SavedPlan) -> dict:
    gp = sp.generated_plan
    return {
        "id": sp.id,
        "generated_plan_id": sp.generated_plan_id,
        "plan_title": gp.title if gp else "Plan",
        "plan_type": gp.plan_type if gp else "low_cost",
        "scheduled_date": sp.scheduled_date,
        "scheduled_start_time": sp.scheduled_start_time,
        "status": sp.status,
        "checklist_items": [
            {
                "id": ci.id,
                "text": ci.text,
                "is_completed": ci.is_completed,
                "sort_order": ci.sort_order,
            }
            for ci in sp.checklist_items
        ],
        "created_at": sp.created_at,
    }

@router.post("/save", response_model=SavedPlanOut, status_code=201)
def save_plan(
    payload: SavePlanIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    plan = db.query(GeneratedPlan).filter(GeneratedPlan.id == payload.generated_plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Generated plan not found")

    family = db.query(Family).filter(
        Family.id == payload.family_id,
        Family.user_id == current_user.id,
    ).first()
    if not family:
        raise HTTPException(status_code=404, detail="Family not found")

    saved = SavedPlan(
        user_id=family.user_id,
        family_id=family.id,
        generated_plan_id=plan.id,
        scheduled_date=payload.scheduled_date,
        scheduled_start_time=payload.scheduled_start_time,
        status="saved",
    )
    db.add(saved)
    db.flush()

    for i, item_text in enumerate(plan.preparation_items or []):
        db.add(ChecklistItem(
            saved_plan_id=saved.id,
            text=item_text,
            is_completed=False,
            sort_order=i,
        ))

    if payload.reminder != "none" and payload.scheduled_date:
        try:
            plan_date = datetime.strptime(payload.scheduled_date, "%Y-%m-%d").replace(
                tzinfo=timezone.utc
            )
            if payload.reminder == "day_before":
                import datetime as dt
                scheduled_at = plan_date.replace(hour=9, minute=0) - dt.timedelta(days=1)
                db.add(Reminder(
                    user_id=family.user_id,
                    saved_plan_id=saved.id,
                    reminder_type="day_before",
                    scheduled_at=scheduled_at,
                ))
            elif payload.reminder == "same_day":
                scheduled_at = plan_date.replace(hour=8, minute=0)
                db.add(Reminder(
                    user_id=family.user_id,
                    saved_plan_id=saved.id,
                    reminder_type="same_day",
                    scheduled_at=scheduled_at,
                ))
        except ValueError:
            pass

    db.commit()
    db.refresh(saved)
    return _saved_plan_dict(saved)


@router.get("/saved/me", response_model=list[SavedPlanOut])
def get_saved_plans(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(SavedPlan)
        .filter(SavedPlan.user_id == current_user.id, SavedPlan.status == "saved")
        .order_by(SavedPlan.created_at.desc())
        .all()
    )
    return [_saved_plan_dict(sp) for sp in rows]


@router.get("/saved/{saved_plan_id}", response_model=SavedPlanOut)
def get_saved_plan(
    saved_plan_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sp = db.query(SavedPlan).filter(
        SavedPlan.id == saved_plan_id,
        SavedPlan.user_id == current_user.id,
    ).first()
    if not sp:
        raise HTTPException(status_code=404, detail="Saved plan not found")
    return _saved_plan_dict(sp)


@router.patch("/saved/{saved_plan_id}/status")
def update_saved_plan_status(
    saved_plan_id: str,
    status: str,
    db: Session = Depends(get_db),
):
    saved = db.query(SavedPlan).filter(SavedPlan.id == saved_plan_id).first()
    if not saved:
        raise HTTPException(status_code=404, detail="Saved plan not found")
    allowed = {"saved", "completed", "cancelled", "expired"}
    if status not in allowed:
        raise HTTPException(status_code=400, detail=f"Status must be one of {allowed}")
    saved.status = status
    db.commit()
    return {"id": saved_plan_id, "status": status}


@router.patch("/saved/{saved_plan_id}/checklist/{item_id}")
def update_checklist_item(
    saved_plan_id: str,
    item_id: str,
    payload: UpdateChecklistItemIn,
    db: Session = Depends(get_db),
):
    item = (
        db.query(ChecklistItem)
        .filter(ChecklistItem.id == item_id, ChecklistItem.saved_plan_id == saved_plan_id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Checklist item not found")
    item.is_completed = payload.is_completed
    db.commit()
    return {"id": item_id, "is_completed": item.is_completed}


# ─── Feedback ─────────────────────────────────────────────────────────────────

@router.post("/feedback", status_code=201)
def submit_feedback(
    payload: FeedbackIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    plan = db.query(GeneratedPlan).filter(GeneratedPlan.id == payload.generated_plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    feedback = PlanFeedback(
        generated_plan_id=plan.id,
        user_id=current_user.id,
        rating=payload.rating,
        reasons=payload.reasons,
        comment=payload.comment,
    )
    db.add(feedback)
    db.commit()
    return {"message": "Feedback recorded"}
