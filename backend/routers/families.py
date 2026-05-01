from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from deps import get_current_user
from models import ChildProfile, City, Family, FamilyPreference, User
from schemas import FamilyCreateIn, FamilyOut, FamilyUpdateIn

router = APIRouter(prefix="/api/families", tags=["families"])


def _build_family_out(family: Family) -> FamilyOut:
    interests = [
        p.preference_value
        for p in family.preferences
        if p.preference_type == "interest"
    ]
    availability = [
        p.preference_value
        for p in family.preferences
        if p.preference_type == "availability"
    ]
    return FamilyOut(
        id=family.id,
        user_id=family.user_id,
        city_id=family.city_id,
        neighborhood=family.neighborhood,
        transportation_mode=family.transportation_mode,
        budget_level=family.budget_level,
        distance_preference=family.distance_preference,
        reminder_preference=family.reminder_preference,
        children=[{"id": c.id, "age": c.age} for c in family.children],
        interests=interests,
        availability=availability,
    )


def _apply_payload(family: Family, payload: FamilyCreateIn, db: Session) -> None:
    family.city_id = payload.city_id
    family.neighborhood = payload.neighborhood
    family.transportation_mode = payload.transport
    family.budget_level = payload.budget
    family.distance_preference = payload.distance
    family.reminder_preference = payload.reminder

    db.query(ChildProfile).filter(ChildProfile.family_id == family.id).delete()
    db.add_all([ChildProfile(family_id=family.id, age=c.age) for c in payload.children])

    db.query(FamilyPreference).filter(FamilyPreference.family_id == family.id).delete()
    db.add_all([
        FamilyPreference(family_id=family.id, preference_type="interest", preference_value=v)
        for v in payload.interests
    ] + [
        FamilyPreference(family_id=family.id, preference_type="availability", preference_value=v)
        for v in payload.availability
    ])


@router.get("/me", response_model=FamilyOut)
def get_my_family(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    family = db.query(Family).filter(Family.user_id == current_user.id).first()
    if not family:
        raise HTTPException(status_code=404, detail="Family profile not found")
    return _build_family_out(family)


def _validate_city(city_id: str, db: Session) -> None:
    if not city_id:
        raise HTTPException(status_code=400, detail="city_id is required")
    if not db.query(City).filter(City.id == city_id).first():
        raise HTTPException(status_code=400, detail=f"City '{city_id}' not found")


@router.post("", response_model=FamilyOut, status_code=201)
def create_family(
    payload: FamilyCreateIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _validate_city(payload.city_id, db)

    if db.query(Family).filter(Family.user_id == current_user.id).first():
        raise HTTPException(status_code=409, detail="Family profile already exists. Use PUT to update.")

    family = Family(user_id=current_user.id, city_id=payload.city_id)
    db.add(family)
    db.flush()
    _apply_payload(family, payload, db)
    db.commit()
    db.refresh(family)
    return _build_family_out(family)


@router.put("/{family_id}", response_model=FamilyOut)
def update_family(
    family_id: str,
    payload: FamilyUpdateIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _validate_city(payload.city_id, db)

    family = db.query(Family).filter(Family.id == family_id).first()
    if not family:
        raise HTTPException(status_code=404, detail="Family not found")
    if family.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your family profile")
    _apply_payload(family, payload, db)
    db.commit()
    db.refresh(family)
    return _build_family_out(family)
