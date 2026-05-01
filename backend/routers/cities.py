from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import City, WaitlistRequest
from schemas import CityOut, WaitlistIn, WaitlistOut

router = APIRouter(prefix="/api/cities", tags=["cities"])


@router.get("", response_model=list[CityOut])
def list_cities(db: Session = Depends(get_db)):
    return (
        db.query(City)
        .filter(City.support_status != "hidden")
        .order_by(City.sort_order)
        .all()
    )


@router.get("/{city_id}", response_model=CityOut)
def get_city(city_id: str, db: Session = Depends(get_db)):
    city = db.query(City).filter(City.id == city_id).first()
    if not city:
        raise HTTPException(status_code=404, detail="City not found")
    return city


@router.post("/waitlist", response_model=WaitlistOut)
def join_waitlist(payload: WaitlistIn, db: Session = Depends(get_db)):
    entry = WaitlistRequest(
        email=payload.email,
        city_name=payload.city_name,
        country=payload.country,
        children_age_range=payload.children_age_range,
        notes=payload.notes,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return WaitlistOut(id=entry.id, message="You're on the waitlist!")
