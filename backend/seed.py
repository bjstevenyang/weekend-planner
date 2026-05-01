"""
Seed initial cities, places, and content sources.
Run once: python seed.py
"""
from database import SessionLocal, engine
from models import Base, City, ContentSource, Place

Base.metadata.create_all(bind=engine)


def seed():
    db = SessionLocal()
    try:
        if db.query(City).count() > 0:
            print("Database already seeded — skipping.")
            return

        # ── Cities ──────────────────────────────────────────────────────────
        vancouver = City(
            name="Vancouver",
            country="Canada",
            region="BC",
            timezone="America/Vancouver",
            currency="CAD",
            lat=49.2827,
            lng=-123.1207,
            default_radius_km=30,
            support_status="active",
            coverage_level="full",
            is_featured=True,
            sort_order=1,
        )
        burnaby = City(
            name="Burnaby",
            country="Canada",
            region="BC",
            timezone="America/Vancouver",
            currency="CAD",
            lat=49.2488,
            lng=-122.9805,
            default_radius_km=20,
            support_status="active",
            coverage_level="limited_events",
            is_featured=True,
            sort_order=2,
        )
        beijing = City(
            name="Beijing",
            country="China",
            timezone="Asia/Shanghai",
            currency="CNY",
            lat=39.9042,
            lng=116.4074,
            default_radius_km=20,
            support_status="beta",
            coverage_level="places_only",
            is_featured=False,
            sort_order=3,
        )
        shanghai = City(
            name="Shanghai",
            country="China",
            timezone="Asia/Shanghai",
            currency="CNY",
            lat=31.2304,
            lng=121.4737,
            default_radius_km=20,
            support_status="waitlist",
            coverage_level="none",
            is_featured=False,
            sort_order=4,
        )
        db.add_all([vancouver, burnaby, beijing, shanghai])
        db.flush()

        # ── Content sources ──────────────────────────────────────────────────
        src_bpl = ContentSource(
            city_id=burnaby.id,
            name="Burnaby Public Library",
            source_type="website",
            base_url="https://www.bpl.bc.ca/events",
            spider_class="BurnabyLibrarySpider",
            reliability_score=0.9,
        )
        src_sw = ContentSource(
            city_id=vancouver.id,
            name="Science World",
            source_type="website",
            base_url="https://www.scienceworld.ca/events/",
            spider_class="ScienceWorldSpider",
            reliability_score=0.95,
        )
        src_vag = ContentSource(
            city_id=vancouver.id,
            name="Vancouver Art Gallery",
            source_type="website",
            base_url="https://www.vanartgallery.bc.ca/programs-and-events",
            spider_class="VAGSpider",
            reliability_score=0.9,
        )
        db.add_all([src_bpl, src_sw, src_vag])
        db.flush()

        # ── Places (fixed venues) ────────────────────────────────────────────
        places = [
            Place(
                city_id=burnaby.id,
                source_id=src_bpl.id,
                name="Burnaby Public Library – Metrotown",
                category="Library / Reading",
                official_url="https://www.bpl.bc.ca",
                address="6100 Willingdon Ave, Burnaby, BC",
                lat=49.2257,
                lng=-122.9995,
                suitable_age_min=3,
                suitable_age_max=12,
                estimated_duration="1–2 hours",
                cost_level="free",
                indoor_outdoor="indoor",
                rainy_day_friendly=True,
                booking_required=False,
                tags=["library", "storytime", "free", "rainy-day"],
            ),
            Place(
                city_id=burnaby.id,
                name="Deer Lake Park",
                category="Outdoor",
                address="6450 Deer Lake Ave, Burnaby, BC",
                lat=49.2359,
                lng=-122.9715,
                suitable_age_min=2,
                suitable_age_max=14,
                estimated_duration="1–3 hours",
                cost_level="free",
                indoor_outdoor="outdoor",
                rainy_day_friendly=False,
                booking_required=False,
                tags=["park", "nature", "free", "outdoor"],
            ),
            Place(
                city_id=vancouver.id,
                source_id=src_sw.id,
                name="Science World at TELUS World of Science",
                category="Science / Museum",
                official_url="https://www.scienceworld.ca",
                address="1455 Quebec St, Vancouver, BC",
                lat=49.2735,
                lng=-123.1036,
                suitable_age_min=4,
                suitable_age_max=14,
                estimated_duration="2–4 hours",
                cost_level="medium",
                indoor_outdoor="indoor",
                rainy_day_friendly=True,
                booking_required=False,
                tags=["museum", "science", "interactive", "rainy-day"],
            ),
            Place(
                city_id=vancouver.id,
                source_id=src_vag.id,
                name="Vancouver Art Gallery",
                category="Music / Art",
                official_url="https://www.vanartgallery.bc.ca",
                address="750 Hornby St, Vancouver, BC",
                lat=49.2828,
                lng=-123.1207,
                suitable_age_min=5,
                suitable_age_max=14,
                estimated_duration="1.5–3 hours",
                cost_level="medium",
                indoor_outdoor="indoor",
                rainy_day_friendly=True,
                booking_required=False,
                tags=["art", "museum", "family", "workshop"],
            ),
            Place(
                city_id=vancouver.id,
                name="Stanley Park",
                category="Outdoor",
                official_url="https://vancouver.ca/parks-recreation-culture/stanley-park.aspx",
                address="Stanley Park Dr, Vancouver, BC",
                lat=49.3017,
                lng=-123.1417,
                suitable_age_min=2,
                suitable_age_max=14,
                estimated_duration="2–4 hours",
                cost_level="free",
                indoor_outdoor="outdoor",
                rainy_day_friendly=False,
                booking_required=False,
                tags=["park", "nature", "free", "outdoor", "beach"],
            ),
        ]
        db.add_all(places)
        db.commit()

        print("✓ Seed complete:")
        print(f"  Cities: {db.query(City).count()}")
        print(f"  Sources: {db.query(ContentSource).count()}")
        print(f"  Places: {db.query(Place).count()}")

    finally:
        db.close()


if __name__ == "__main__":
    seed()
