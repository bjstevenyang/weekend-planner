"""
Vancouver Art Gallery spider.
P0: returns mock data for validation. Real CSS selectors added in P1.
"""
from crawler.base import BaseSpider, RawEvent


class VAGSpider(BaseSpider):
    requires_js = False
    source_name = "Vancouver Art Gallery"
    base_url = "https://www.vanartgallery.bc.ca/programs-and-events"

    async def parse(self, html: str) -> list[RawEvent]:
        # P0 mock — replace with BeautifulSoup selectors in P1
        return [
            RawEvent(
                title="Family Art Workshop",
                source_external_id="vag-family-workshop-001",
                description="Creative art-making session for families.",
                source_url="https://www.vanartgallery.bc.ca/programs-and-events/family",
                start_time="2026-04-26T10:00:00-07:00",
                end_time="2026-04-26T12:00:00-07:00",
                location_name="Vancouver Art Gallery",
                address="750 Hornby St, Vancouver, BC",
                price_min=5.0,
                price_max=15.0,
                age_min=5,
                age_max=12,
                registration_required=True,
                indoor_outdoor="indoor",
                category="Music / Art",
                tags=["art", "workshop", "family"],
            ),
        ]
