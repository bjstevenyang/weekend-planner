"""
Spider factory — maps spider class names to instances.
Adding a new source = writing one new Spider class and registering it here.
"""
from crawler.base import BaseSpider
from crawler.spiders.burnaby_library import BurnabyLibrarySpider
from crawler.spiders.science_world import ScienceWorldSpider
from crawler.spiders.vag import VAGSpider

SPIDER_REGISTRY: dict[str, type[BaseSpider]] = {
    "BurnabyLibrarySpider": BurnabyLibrarySpider,
    "ScienceWorldSpider": ScienceWorldSpider,
    "VAGSpider": VAGSpider,
}


def get_spider(class_name: str) -> BaseSpider:
    cls = SPIDER_REGISTRY.get(class_name)
    if not cls:
        raise ValueError(f"Unknown spider: {class_name!r}. Available: {list(SPIDER_REGISTRY)}")
    return cls()


async def run_all(city_id: str | None = None) -> dict[str, list]:
    results = {}
    for name, cls in SPIDER_REGISTRY.items():
        spider = cls()
        try:
            events = await spider.run()
            results[name] = [e.__dict__ for e in events]
        except Exception as exc:
            results[name] = {"error": str(exc)}
    return results
