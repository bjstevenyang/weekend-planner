import os
from contextlib import asynccontextmanager

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import admin, auth, cities, families, plans

# ─── Scheduler ────────────────────────────────────────────────────────────────

scheduler = AsyncIOScheduler()


async def scheduled_crawl():
    """Run all enabled spiders and upsert events into the DB."""
    from crawler.factory import run_all
    from database import SessionLocal
    from models import ContentSource, CrawlJob, Event
    from datetime import datetime, timezone

    db = SessionLocal()
    try:
        sources = db.query(ContentSource).filter(ContentSource.crawl_enabled == True).all()
        for source in sources:
            if not source.spider_class:
                continue
            from crawler.factory import get_spider
            spider = get_spider(source.spider_class)
            job = CrawlJob(source_id=source.id, status="running",
                           started_at=datetime.now(timezone.utc))
            db.add(job)
            db.flush()
            try:
                raw_events = await spider.run()
                upserted = 0
                for raw in raw_events:
                    existing = (
                        db.query(Event)
                        .filter(
                            Event.source_id == source.id,
                            Event.source_external_id == raw.source_external_id,
                        )
                        .first()
                    ) if raw.source_external_id else None

                    if existing:
                        for k, v in raw.__dict__.items():
                            if not k.startswith("_") and v is not None:
                                setattr(existing, k, v)
                    else:
                        event = Event(
                            city_id=source.city_id,
                            source_id=source.id,
                            **{k: v for k, v in raw.__dict__.items()
                               if not k.startswith("_")},
                        )
                        db.add(event)
                        upserted += 1

                source.last_checked_at = datetime.now(timezone.utc)
                job.events_found = len(raw_events)
                job.events_upserted = upserted
                job.status = "done"
            except Exception as exc:
                job.status = "failed"
                job.error_message = str(exc)
            finally:
                job.finished_at = datetime.now(timezone.utc)
        db.commit()
    finally:
        db.close()


async def scheduled_reminders():
    """Send pending email reminders whose scheduled_at has passed."""
    from datetime import datetime, timezone
    from database import SessionLocal
    from models import Reminder, SavedPlan
    import resend

    resend.api_key = os.getenv("RESEND_API_KEY", "")
    db = SessionLocal()
    try:
        pending = (
            db.query(Reminder)
            .filter(
                Reminder.status == "pending",
                Reminder.scheduled_at <= datetime.now(timezone.utc),
            )
            .all()
        )
        for reminder in pending:
            saved_plan = db.query(SavedPlan).filter(
                SavedPlan.id == reminder.saved_plan_id
            ).first()
            if not saved_plan or saved_plan.status != "saved":
                reminder.status = "cancelled"
                continue
            try:
                from models import User, GeneratedPlan
                user = db.query(User).filter(User.id == reminder.user_id).first()
                gp = db.query(GeneratedPlan).filter(
                    GeneratedPlan.id == saved_plan.generated_plan_id
                ).first()
                prep_summary = ", ".join((gp.preparation_items or [])[:3]) if gp else ""
                resend.Emails.send({
                    "from": "Weekend Planner <noreply@weekendplanner.app>",
                    "to": user.email,
                    "subject": f"Reminder: {gp.title if gp else 'Your plan'} is coming up!",
                    "html": (
                        f"<h2>Your plan is scheduled for {saved_plan.scheduled_date}</h2>"
                        f"<p>Don't forget: {prep_summary}</p>"
                    ),
                })
                reminder.status = "sent"
                reminder.sent_at = datetime.now(timezone.utc)
            except Exception as exc:
                reminder.status = "failed"
        db.commit()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Crawl Mon/Wed/Fri at 2AM; reminders every 15 min
    scheduler.add_job(scheduled_crawl, "cron", day_of_week="mon,wed,fri", hour=2)
    scheduler.add_job(scheduled_reminders, "interval", minutes=15)
    scheduler.start()
    yield
    scheduler.shutdown()


# ─── App ──────────────────────────────────────────────────────────────────────

app = FastAPI(title="Weekend Family Planner API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(cities.router)
app.include_router(families.router)
app.include_router(plans.router)
app.include_router(admin.router)


@app.get("/health")
def health():
    return {"status": "ok"}
