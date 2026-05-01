"""
Burnaby Public Library spider.
P0: returns mock data for validation. Real CSS selectors added in P1.
"""
from crawler.base import BaseSpider, RawEvent, clean_age_range, clean_price


class BurnabyLibrarySpider(BaseSpider):
    requires_js = True
    source_name = "Burnaby Public Library"
    base_url = "https://www.bpl.bc.ca/events"

    async def parse(self, html: str) -> list[RawEvent]:
        # P0 mock — replace with BeautifulSoup selectors in P1
        return [
            RawEvent(
                title="Family Storytime",
                source_external_id="bpl-storytime-001",
                description="Fun stories and songs for young children.",
                source_url="https://www.bpl.bc.ca/events/storytime",
                start_time="2026-04-26T14:00:00-07:00",
                end_time="2026-04-26T15:00:00-07:00",
                location_name="Burnaby Public Library – Metrotown Branch",
                address="6100 Willingdon Ave, Burnaby, BC",
                price_min=0.0,
                price_max=0.0,
                age_min=3,
                age_max=8,
                registration_required=False,
                indoor_outdoor="indoor",
                category="Library / Reading",
                tags=["storytime", "free", "drop-in"],
            ),
            RawEvent(
                title="LEGO Club",
                source_external_id="bpl-lego-001",
                description="Open LEGO building session for kids.",
                source_url="https://www.bpl.bc.ca/events/lego",
                start_time="2026-04-27T10:00:00-07:00",
                end_time="2026-04-27T11:30:00-07:00",
                location_name="Burnaby Public Library – Bob Prittie Branch",
                address="6228 Kingsway, Burnaby, BC",
                price_min=0.0,
                price_max=0.0,
                age_min=6,
                age_max=12,
                registration_required=False,
                indoor_outdoor="indoor",
                category="STEM",
                tags=["lego", "free", "drop-in", "stem"],
            ),
        ]
