"""
Abstract base class for all spiders.
Each concrete spider implements fetch_page + parse + clean.
"""
import re
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class RawEvent:
    title: str
    source_external_id: Optional[str] = None
    description: Optional[str] = None
    source_url: Optional[str] = None
    start_time: Optional[str] = None     # ISO 8601 string; cleaned before DB insert
    end_time: Optional[str] = None
    location_name: Optional[str] = None
    address: Optional[str] = None
    price_min: Optional[float] = None
    price_max: Optional[float] = None
    age_min: Optional[int] = None
    age_max: Optional[int] = None
    registration_required: bool = False
    indoor_outdoor: Optional[str] = None  # "indoor" | "outdoor" | "both"
    category: Optional[str] = None
    tags: list[str] = field(default_factory=list)


# ─── Cleaning utilities ───────────────────────────────────────────────────────

def clean_price(text: str) -> tuple[Optional[float], Optional[float]]:
    if not text:
        return None, None
    text = text.strip().lower()
    if "free" in text:
        return 0.0, 0.0
    # "$10–20" or "$10-20"
    m = re.search(r"\$?(\d+(?:\.\d+)?)\s*[–\-]\s*\$?(\d+(?:\.\d+)?)", text)
    if m:
        return float(m.group(1)), float(m.group(2))
    # "under $15"
    m = re.search(r"under\s+\$?(\d+(?:\.\d+)?)", text)
    if m:
        return 0.0, float(m.group(1))
    # "$25 per person"
    m = re.search(r"\$?(\d+(?:\.\d+)?)", text)
    if m:
        v = float(m.group(1))
        return v, v
    return None, None


def clean_age_range(text: str) -> tuple[Optional[int], Optional[int]]:
    if not text:
        return None, None
    text = text.strip().lower()
    if "family friendly" in text or "all ages" in text:
        return 0, 18
    # "ages 5–10" or "ages 5-10"
    m = re.search(r"ages?\s+(\d+)\s*[–\-]\s*(\d+)", text)
    if m:
        return int(m.group(1)), int(m.group(2))
    # "for kids 3+" or "3 and up"
    m = re.search(r"(\d+)\s*\+", text)
    if m:
        return int(m.group(1)), 18
    return None, None


def normalize_indoor_outdoor(text: str) -> Optional[str]:
    if not text:
        return None
    text = text.strip().lower()
    if "indoor" in text and "outdoor" in text:
        return "both"
    if "indoor" in text:
        return "indoor"
    if "outdoor" in text or "outside" in text:
        return "outdoor"
    return None


def clean_registration(text: str) -> bool:
    if not text:
        return False
    text = text.strip().lower()
    return any(k in text for k in (
        "registration required", "register", "book in advance",
        "booking required", "tickets required", "pre-register",
    ))


# ─── Base spider ─────────────────────────────────────────────────────────────

class BaseSpider(ABC):
    requires_js: bool = False
    source_name: str = ""
    base_url: str = ""

    async def fetch_page(self, url: str) -> str:
        if self.requires_js:
            return await self._fetch_with_playwright(url)
        return await self._fetch_with_httpx(url)

    async def _fetch_with_httpx(self, url: str) -> str:
        import httpx
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.get(url, follow_redirects=True)
            r.raise_for_status()
            return r.text

    async def _fetch_with_playwright(self, url: str) -> str:
        from playwright.async_api import async_playwright
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            await page.goto(url, wait_until="networkidle")
            html = await page.content()
            await browser.close()
            return html

    @abstractmethod
    async def parse(self, html: str) -> list[RawEvent]:
        """Extract raw events from rendered HTML."""

    def clean(self, event: RawEvent) -> RawEvent:
        """Normalize fields in-place and return the event."""
        return event

    async def run(self) -> list[RawEvent]:
        html = await self.fetch_page(self.base_url)
        events = await self.parse(html)
        return [self.clean(e) for e in events]
