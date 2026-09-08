from typing import List, Dict, Any, AsyncGenerator
from app.agents.base import AgentType, EventType, AgentStreamEvent
from app.services.scraper_service import scraper_service

class ReaderAgent:
    async def execute(self, sources: List[Dict[str, Any]], topic: str) -> AsyncGenerator[AgentStreamEvent, None]:
        yield AgentStreamEvent(
            agent=AgentType.READER,
            event_type=EventType.START,
            message=f"Reader Agent activating. Inspecting {len(sources)} source candidate(s)...",
            step_number=2
        )

        if not sources:
            yield AgentStreamEvent(
                agent=AgentType.READER,
                event_type=EventType.COMPLETE,
                message="No sources to read.",
                data={"scraped_sources": []},
                step_number=2
            )
            return

        yield AgentStreamEvent(
            agent=AgentType.READER,
            event_type=EventType.THOUGHT,
            message=f"Prioritizing deep DOM extraction and content cleansing for authoritative domain pages...",
            step_number=2
        )

        scraped_sources = []
        # Scrape top 3 most relevant URLs deeply
        target_sources = sources[:3]

        for idx, src in enumerate(target_sources, 1):
            url = src.get("url", "")
            domain = src.get("domain", "web")
            
            yield AgentStreamEvent(
                agent=AgentType.READER,
                event_type=EventType.SCRAPE_PROGRESS,
                message=f"Scraping & reading deep content from [{idx}/{len(target_sources)}] {domain}...",
                data={"url": url, "index": idx, "total": len(target_sources)},
                step_number=2
            )

            scrape_result = await scraper_service.scrape_url(url, timeout_seconds=8)
            
            scraped_item = dict(src)
            if scrape_result.get("success") and scrape_result.get("content"):
                scraped_item["scraped_text"] = scrape_result["content"]
                scraped_item["is_scraped"] = True
                if scrape_result.get("title") and not scraped_item.get("title"):
                    scraped_item["title"] = scrape_result["title"]
                
                char_count = len(scrape_result["content"])
                yield AgentStreamEvent(
                    agent=AgentType.READER,
                    event_type=EventType.STEP,
                    message=f"Extracted {char_count} chars of clean context from {domain}",
                    data={"domain": domain, "char_count": char_count, "url": url},
                    step_number=2
                )
            else:
                scraped_item["scraped_text"] = src.get("snippet", "")
                scraped_item["is_scraped"] = False
                yield AgentStreamEvent(
                    agent=AgentType.READER,
                    event_type=EventType.STEP,
                    message=f"Used fallback search snippet for {domain}",
                    data={"domain": domain, "url": url},
                    step_number=2
                )

            scraped_sources.append(scraped_item)

        # Include remaining unscraped sources as snippet-backed sources
        for src in sources[3:]:
            scraped_sources.append({**src, "is_scraped": False, "scraped_text": src.get("snippet", "")})

        yield AgentStreamEvent(
            agent=AgentType.READER,
            event_type=EventType.COMPLETE,
            message=f"Content distillation complete across {len(scraped_sources)} sources.",
            data={"scraped_sources": scraped_sources},
            step_number=2
        )

reader_agent = ReaderAgent()
