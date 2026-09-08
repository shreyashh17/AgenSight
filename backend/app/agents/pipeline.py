import time
import os
from typing import AsyncGenerator, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.agents.base import AgentType, EventType, AgentStreamEvent
from app.agents.search_agent import SearchAgent
from app.agents.reader_agent import reader_agent
from app.agents.writer_agent import WriterAgent
from app.agents.critic_agent import CriticAgent
from app.agents.mock_pipeline import mock_pipeline
from app.models.models import ResearchSession, Report, Source, AgentEvent

class ResearchPipeline:
    async def run(
        self,
        session_id: str,
        topic: str,
        tone: str = "analytical",
        length: str = "detailed",
        model_name: str = "gpt-4o-mini",
        max_sources: int = 5,
        mock_mode: bool = False,
        openai_key: Optional[str] = None,
        tavily_key: Optional[str] = None,
        revision_feedback: Optional[str] = None,
        db: Optional[AsyncSession] = None
    ) -> AsyncGenerator[AgentStreamEvent, None]:
        
        start_time = time.time()
        effective_openai_key = openai_key or settings.OPENAI_API_KEY
        effective_tavily_key = tavily_key or settings.TAVILY_API_KEY

        # Check if we should use mock pipeline
        should_use_mock = (
            mock_mode 
            or not effective_openai_key 
            or not effective_tavily_key
        )

        if should_use_mock:
            mock_final_data = {}
            mock_tokens = 0
            async for event in mock_pipeline.run(
                topic=topic,
                tone=tone,
                length=length,
                model_name=model_name,
                custom_instructions=revision_feedback
            ):
                # Save event to DB if db session provided
                if db:
                    await self._record_event(db, session_id, event)
                if event.agent == AgentType.ORCHESTRATOR and event.event_type == EventType.COMPLETE:
                    mock_final_data = event.data or {}
                    mock_tokens = event.tokens
                yield event

            elapsed = round(time.time() - start_time, 2)
            if db:
                await self._finalize_session(
                    db,
                    session_id,
                    elapsed,
                    report_title=mock_final_data.get("title", topic),
                    report_content=mock_final_data.get("report_content", ""),
                    score=mock_final_data.get("score", 9.0),
                    verdict=mock_final_data.get("verdict", ""),
                    strengths=mock_final_data.get("strengths", []),
                    improvements=mock_final_data.get("improvements", []),
                    sources=mock_final_data.get("sources", []),
                    total_tokens=mock_tokens or mock_final_data.get("total_tokens", 3800),
                    cost=mock_final_data.get("estimated_cost", 0.0035)
                )
            return

        # Real multi-agent execution
        search_inst = SearchAgent(api_key=effective_tavily_key)
        writer_inst = WriterAgent(api_key=effective_openai_key)
        critic_inst = CriticAgent(api_key=effective_openai_key)

        gathered_sources = []
        scraped_sources = []
        final_report_text = ""
        report_title = topic
        critic_score = 8.5
        critic_verdict = "Comprehensive analysis."
        critic_strengths = []
        critic_improvements = []
        total_tokens = 0
        total_cost = 0.0

        # Step 1: Search Agent
        async for event in search_inst.execute(topic=topic, max_results=max_sources):
            if db:
                await self._record_event(db, session_id, event)
            yield event
            if event.event_type == EventType.COMPLETE and "sources" in event.data:
                gathered_sources = event.data["sources"]

        # Step 2: Reader Agent
        async for event in reader_agent.execute(sources=gathered_sources, topic=topic):
            if db:
                await self._record_event(db, session_id, event)
            yield event
            if event.event_type == EventType.COMPLETE and "scraped_sources" in event.data:
                scraped_sources = event.data["scraped_sources"]

        # Step 3: Writer Agent
        async for event in writer_inst.execute(
            topic=topic,
            sources=scraped_sources or gathered_sources,
            model_name=model_name,
            tone=tone,
            length=length,
            revision_feedback=revision_feedback
        ):
            if db:
                await self._record_event(db, session_id, event)
            yield event
            if event.event_type == EventType.COMPLETE:
                final_report_text = event.data.get("report_content", "")
                report_title = event.data.get("title", topic)
                total_tokens += event.tokens
                total_cost += event.data.get("cost", 0.0)

        # Step 4: Critic Agent
        async for event in critic_inst.execute(
            topic=topic,
            report_content=final_report_text,
            model_name=model_name
        ):
            if db:
                await self._record_event(db, session_id, event)
            yield event
            if event.event_type == EventType.COMPLETE:
                critic_score = event.data.get("score", 8.5)
                critic_verdict = event.data.get("verdict", "")
                critic_strengths = event.data.get("strengths", [])
                critic_improvements = event.data.get("improvements", [])
                total_tokens += event.tokens

        # Step 5: Orchestrator Final Event
        elapsed = round(time.time() - start_time, 2)
        complete_event = AgentStreamEvent(
            agent=AgentType.ORCHESTRATOR,
            event_type=EventType.COMPLETE,
            message="Multi-agent research workflow successfully concluded.",
            data={
                "report_content": final_report_text,
                "title": report_title,
                "score": critic_score,
                "verdict": critic_verdict,
                "strengths": critic_strengths,
                "improvements": critic_improvements,
                "sources": scraped_sources or gathered_sources,
                "total_tokens": total_tokens,
                "estimated_cost": round(total_cost, 6),
                "duration_seconds": elapsed
            },
            tokens=total_tokens,
            step_number=5
        )

        if db:
            await self._record_event(db, session_id, complete_event)
            await self._finalize_session(
                db, 
                session_id, 
                elapsed,
                report_title=report_title,
                report_content=final_report_text,
                score=critic_score,
                verdict=critic_verdict,
                strengths=critic_strengths,
                improvements=critic_improvements,
                sources=scraped_sources or gathered_sources,
                total_tokens=total_tokens,
                cost=total_cost
            )

        yield complete_event

    async def _record_event(self, db: AsyncSession, session_id: str, event: AgentStreamEvent):
        try:
            # Don't save tiny token chunks to DB to avoid spamming rows; record milestone steps and start/completes
            if event.event_type in (EventType.TOKEN_CHUNK, EventType.REPORT_CHUNK, EventType.CRITIC_CHUNK):
                return
            
            db_event = AgentEvent(
                session_id=session_id,
                agent_name=event.agent.value,
                event_type=event.event_type.value,
                step_number=event.step_number,
                message=event.message,
                data=event.data,
                tokens=event.tokens
            )
            db.add(db_event)
            await db.commit()
        except Exception:
            await db.rollback()

    async def _finalize_session(
        self,
        db: AsyncSession,
        session_id: str,
        duration: float,
        report_title: str = None,
        report_content: str = None,
        score: float = None,
        verdict: str = None,
        strengths: list = None,
        improvements: list = None,
        sources: list = None,
        total_tokens: int = 0,
        cost: float = 0.0
    ):
        try:
            session = await db.get(ResearchSession, session_id)
            if session:
                session.status = "completed"
                session.duration_seconds = duration
                session.total_tokens = total_tokens
                session.estimated_cost = round(cost, 6)
                
                # Check if report exists
                if report_content:
                    existing_report = session.report
                    if not existing_report:
                        new_report = Report(
                            session_id=session_id,
                            title=report_title or session.topic,
                            summary=f"Research synthesis on {session.topic}",
                            content=report_content,
                            score=score,
                            verdict=verdict,
                            strengths=strengths or [],
                            improvements=improvements or [],
                            tags=["#ai-research", f"#{session.tone}"]
                        )
                        db.add(new_report)
                    else:
                        existing_report.content = report_content
                        existing_report.title = report_title or existing_report.title
                        existing_report.score = score
                        existing_report.verdict = verdict
                        existing_report.strengths = strengths or []
                        existing_report.improvements = improvements or []
                        existing_report.version += 1

                # Save sources
                if sources:
                    for s in sources:
                        new_source = Source(
                            session_id=session_id,
                            title=s.get("title", s.get("url", "Source")),
                            url=s.get("url", ""),
                            domain=s.get("domain", "web"),
                            favicon_url=s.get("favicon_url"),
                            snippet=s.get("snippet"),
                            scraped_text=s.get("scraped_text"),
                            is_scraped=s.get("is_scraped", False),
                            relevance_score=s.get("relevance_score", 1.0)
                        )
                        db.add(new_source)

                await db.commit()
        except Exception as e:
            await db.rollback()

research_pipeline = ResearchPipeline()
