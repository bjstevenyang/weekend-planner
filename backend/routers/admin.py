"""
Admin API endpoints — all require X-Admin-Token header for P0.
"""
import os

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import City, ContentSource, Event, Family, GeneratedPlan, Place, SavedPlan, User
from schemas import AdminStatsOut, CityUpdateIn, EventCreateIn, PlaceCreateIn

router = APIRouter(prefix="/api/admin", tags=["admin"])

ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "changeme")


def require_admin(x_admin_token: str = Header(...)):
    if x_admin_token != ADMIN_TOKEN:
        raise HTTPException(status_code=403, detail="Forbidden")


# ─── Dashboard ────────────────────────────────────────────────────────────────

@router.get("/stats", response_model=AdminStatsOut, dependencies=[Depends(require_admin)])
def get_stats(db: Session = Depends(get_db)):
    return AdminStatsOut(
        total_users=db.query(User).count(),
        total_families=db.query(Family).count(),
        total_generated_plans=db.query(GeneratedPlan).count(),
        total_saved_plans=db.query(SavedPlan).count(),
        total_events=db.query(Event).count(),
        total_places=db.query(Place).count(),
    )


# ─── Cities ───────────────────────────────────────────────────────────────────

@router.get("/cities", dependencies=[Depends(require_admin)])
def list_cities(db: Session = Depends(get_db)):
    return db.query(City).order_by(City.sort_order).all()


@router.put("/cities/{city_id}", dependencies=[Depends(require_admin)])
def update_city(city_id: str, payload: CityUpdateIn, db: Session = Depends(get_db)):
    city = db.query(City).filter(City.id == city_id).first()
    if not city:
        raise HTTPException(status_code=404, detail="City not found")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(city, field, value)
    db.commit()
    return city


# ─── Events ───────────────────────────────────────────────────────────────────

@router.get("/events", dependencies=[Depends(require_admin)])
def list_events(city_id: str | None = None, db: Session = Depends(get_db)):
    q = db.query(Event)
    if city_id:
        q = q.filter(Event.city_id == city_id)
    return q.order_by(Event.start_time).all()


@router.post("/events", dependencies=[Depends(require_admin)], status_code=201)
def create_event(payload: EventCreateIn, db: Session = Depends(get_db)):
    event = Event(**payload.model_dump())
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.put("/events/{event_id}", dependencies=[Depends(require_admin)])
def update_event(event_id: str, payload: EventCreateIn, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(event, field, value)
    db.commit()
    return event


@router.delete("/events/{event_id}", dependencies=[Depends(require_admin)])
def delete_event(event_id: str, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(event)
    db.commit()
    return {"deleted": event_id}


# ─── Places ───────────────────────────────────────────────────────────────────

@router.get("/places", dependencies=[Depends(require_admin)])
def list_places(city_id: str | None = None, db: Session = Depends(get_db)):
    q = db.query(Place)
    if city_id:
        q = q.filter(Place.city_id == city_id)
    return q.order_by(Place.name).all()


@router.post("/places", dependencies=[Depends(require_admin)], status_code=201)
def create_place(payload: PlaceCreateIn, db: Session = Depends(get_db)):
    place = Place(**payload.model_dump())
    db.add(place)
    db.commit()
    db.refresh(place)
    return place


@router.put("/places/{place_id}", dependencies=[Depends(require_admin)])
def update_place(place_id: str, payload: PlaceCreateIn, db: Session = Depends(get_db)):
    place = db.query(Place).filter(Place.id == place_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(place, field, value)
    db.commit()
    return place


# ─── Feedback ─────────────────────────────────────────────────────────────────

@router.get("/feedback", dependencies=[Depends(require_admin)])
def list_feedback(db: Session = Depends(get_db)):
    from models import PlanFeedback
    return db.query(PlanFeedback).order_by(PlanFeedback.created_at.desc()).all()


# ─── Plans (audit) ────────────────────────────────────────────────────────────

@router.get("/plans", dependencies=[Depends(require_admin)])
def list_generated_plans(db: Session = Depends(get_db)):
    return db.query(GeneratedPlan).order_by(GeneratedPlan.created_at.desc()).limit(200).all()


# ─── Content Sources ──────────────────────────────────────────────────────────

@router.get("/sources", dependencies=[Depends(require_admin)])
def list_sources(city_id: str | None = None, db: Session = Depends(get_db)):
    q = db.query(ContentSource)
    if city_id:
        q = q.filter(ContentSource.city_id == city_id)
    return q.order_by(ContentSource.name).all()


# ─── Crawl trigger ────────────────────────────────────────────────────────────

@router.post("/crawl/{source_id}", dependencies=[Depends(require_admin)])
def trigger_crawl(source_id: str, db: Session = Depends(get_db)):
    from models import ContentSource, CrawlJob
    source = db.query(ContentSource).filter(ContentSource.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    if not source.spider_class:
        raise HTTPException(status_code=400, detail="No spider configured for this source")

    job = CrawlJob(source_id=source.id, status="pending")
    db.add(job)
    db.commit()
    # Background execution wired in main.py via background tasks
    return {"job_id": str(job.id), "status": "queued"}
