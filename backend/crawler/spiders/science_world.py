"""
Science World spider.
P0: returns mock data for validation. Real CSS selectors added in P1.
"""
from crawler.base import BaseSpider, RawEvent


class ScienceWorldSpider(BaseSpider):
    requires_js = False
    source_name = "Science World"
    base_url = "https://www.scienceworld.ca/events/"

    async def parse(self, html: str) -> list[RawEvent]:
        # P0 mock — replace with BeautifulSoup selectors in P1
        return [
            RawEvent(
                title="Science World General Admission",
                source_external_id="sw-ga-weekend",
                description="Explore hands-on science exhibits.",
                source_url="https://www.scienceworld.ca/visit/",
                start_time="2026-04-26T10:00:00-07:00",
                end_time="2026-04-26T17:00:00-07:00",
                location_name="Science World at TELUS World of Science",
                address="1455 Quebec St, Vancouver, BC",
                price_min=15.75,
                price_max=26.75,
                age_min=3,
                age_max=14,
                registration_required=False,
                indoor_outdoor="indoor",
                category="Science / Museum",
                tags=["museum", "rainy-day", "interactive"],
            ),
        ]
