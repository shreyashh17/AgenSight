import os
from typing import List, Dict, Any, AsyncGenerator
from tavily import TavilyClient
from app.agents.base import AgentType, EventType, AgentStreamEvent
from app.services.scraper_service import scraper_service

class SearchAgent:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("TAVILY_API_KEY", "")
        self.client = TavilyClient(api_key=self.api_key) if self.api_key else None

    async def execute(self, topic: str, max_results: int = 5) -> AsyncGenerator[AgentStreamEvent, None]:
        yield AgentStreamEvent(
            agent=AgentType.SEARCH,
            event_type=EventType.START,
            message=f"Initializing search strategy for: '{topic}'",
            step_number=1
        )

        yield AgentStreamEvent(
            agent=AgentType.SEARCH,
            event_type=EventType.THOUGHT,
            message=f"Formulating optimal query vectors and targeting high-authority domains for '{topic}'...",
            step_number=1
        )

        if not self.client:
            yield AgentStreamEvent(
                agent=AgentType.SEARCH,
                event_type=EventType.ERROR,
                message="Tavily API key not configured.",
                step_number=1
            )
            return

        try:
            # Execute search
            search_response = self.client.search(
                query=f"{topic} detailed analysis overview facts",
                max_results=max_results,
                search_depth="advanced"
            )

            results = search_response.get("results", [])
            yield AgentStreamEvent(
                agent=AgentType.SEARCH,
                event_type=EventType.STEP,
                message=f"Discovered {len(results)} high-relevance web sources",
                data={"count": len(results)},
                step_number=1
            )

            discovered_sources = []
            for r in results:
                url = r.get("url", "")
                title = r.get("title", url)
                domain = scraper_service.extract_domain(url)
                favicon = scraper_service.get_favicon(url)
                snippet = r.get("content", "")

                source_item = {
                    "title": title,
                    "url": url,
                    "domain": domain,
                    "favicon_url": favicon,
                    "snippet": snippet,
                    "relevance_score": r.get("score", 0.95)
                }
                discovered_sources.append(source_item)

                yield AgentStreamEvent(
                    agent=AgentType.SEARCH,
                    event_type=EventType.SOURCE_DISCOVERED,
                    message=f"Discovered source: {domain}",
                    data=source_item,
                    step_number=1
                )

            yield AgentStreamEvent(
                agent=AgentType.SEARCH,
                event_type=EventType.COMPLETE,
                message=f"Search phase concluded. {len(discovered_sources)} sources cataloged.",
                data={"sources": discovered_sources},
                step_number=1
            )

        except Exception as e:
            yield AgentStreamEvent(
                agent=AgentType.SEARCH,
                event_type=EventType.ERROR,
                message=f"Search agent encountered error: {str(e)}",
                step_number=1
            )

search_agent = SearchAgent()
