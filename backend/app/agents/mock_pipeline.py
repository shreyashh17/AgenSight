import asyncio
import random
from typing import AsyncGenerator, Dict, Any, List
from app.agents.base import AgentType, EventType, AgentStreamEvent
from app.services.token_service import token_service

MOCK_SOURCE_TEMPLATES = [
    {
        "title": "State of AI & Modern Architectural Paradigms 2026",
        "domain": "arxiv.org",
        "url": "https://arxiv.org/abs/2602.04918",
        "snippet": "An exhaustive empirical evaluation of multi-agent reasoning topologies, latency trade-offs, and tool synthesis benchmarks across modern enterprise workloads.",
        "scraped_text": "Executive Summary: Multi-agent coordination patterns have evolved significantly. Hierarchical delegation paired with critic-in-the-loop validation outperforms single-pass chain prompts by over 38% in factual consistency and contextual depth. High-throughput pipelines benefit from streaming architectures with resilient error boundaries."
    },
    {
        "title": "Deep Dive: Real-time Distributed Agent Workflows & Streaming Patterns",
        "domain": "acm.org",
        "url": "https://dl.acm.org/doi/10.1145/3688192",
        "snippet": "Investigating Server-Sent Events (SSE) vs WebSockets for token-streaming LLM applications with stateful recovery and asynchronous worker pools.",
        "scraped_text": "Key Findings: Server-Sent Events (SSE) offer superior simplicity and native reconnect capabilities for unidirectional agent streaming pipelines, reducing client memory footprint while supporting real-time token rendering and step progression telemetry."
    },
    {
        "title": "Engineering Practical Multi-Agent Systems for Enterprise Knowledge Mining",
        "domain": "mit.edu",
        "url": "https://news.mit.edu/2026/multi-agent-research-systems-scale",
        "snippet": "How specialized agent roles (Search, Reader, Writer, Critic) simulate peer review mechanisms to eliminate hallucinations and synthesize actionable intelligence.",
        "scraped_text": "Specialized division of labor between discovery agents and synthesis agents prevents context contamination. By decoupling web search scraping from final report compilation, token utilization drops by 45% while citation fidelity reaches 99.2%."
    },
    {
        "title": "Industry Trends & Strategic Implementation Guide",
        "domain": "nature.com",
        "url": "https://www.nature.com/articles/s41586-026-07891",
        "snippet": "A survey of modern data ingestion techniques, real-time web crawlers, and structured synthesis frameworks in high-velocity research operations.",
        "scraped_text": "Modern synthesis pipelines combine heuristic-driven web scrapers with real-time semantic parsers to extract authoritative paragraphs while discarding advertising clutter and telemetry noise."
    }
]

def generate_mock_report(topic: str, tone: str, length: str) -> str:
    return f"""# {topic.title()}: Comprehensive Research & Strategic Analysis

## Executive Summary
This report provides a systematic evaluation of **{topic}**, examining current technological state, primary architecture paradigms, benchmark performance, and future trajectory. Recent breakthroughs demonstrate substantial advancements in scalability, precision, and integration efficiency across diverse operational environments.

> **Key Takeaway:** Adopting a modular, multi-tier methodology for *{topic}* yields significant efficiency gains, minimizing hallucination risks while optimizing throughput and resource allocation.

---

## 1. Background & Foundational Context
Over the past 24 months, the landscape surrounding **{topic}** has undergone fundamental transformations. Driven by demands for higher accuracy and faster iteration cycles, legacy monolithic systems are increasingly displaced by specialized, cooperative agent pipelines.

- **First Wave:** Monolithic single-prompt approaches with high latency and frequent context drift.
- **Second Wave:** Basic sequential chains with rudimentary web scraping integrations.
- **Modern Era:** Role-specialized multi-agent swarms equipped with automated critic feedback loops, real-time token streaming, and dynamic source verification.

```
[User Query] ──► [Search Agent (Tavily)] ──► [Reader Agent (Deep Scrape)]
                                                       │
[Final Report] ◄── [Critic Review] ◄── [Writer Agent (Synthesis)]
```

---

## 2. Key Findings & Empirical Data

### 2.1 Performance & Reliability Metrics
Empirical benchmarking across authoritative industry sources reveals distinct performance characteristics:
- **Context Retention:** Specialized extraction pipelines reduce noise tokens by up to **42%**.
- **Factual Precision:** Multi-stage validation mechanisms (Writer + Critic verification) achieve an estimated **98.4% factual consistency**.
- **Latency Optimization:** Asynchronous streaming via SSE delivers first-token render times under **350ms**.

### 2.2 Core Architectural Advantages
1. **Separation of Concerns:** Discovery agents focus purely on domain authority and snippet relevance, shielding synthesis models from raw DOM clutter.
2. **Deterministic Evaluation:** The Critic Agent introduces quantitative scoring (0-10) and structured revision criteria prior to final export.
3. **Dynamic Citation Linking:** Every extracted statement links directly to verified source domains with favicons and preview metadata.

---

## 3. Strategic Implications & Risk Considerations

| Dimension | Primary Benefit | Risk / Trade-off | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **Data Fidelity** | Verified multi-source grounding | Rate limits & scraping blocks | Adaptive timeouts & fallback mirrors |
| **Compute Cost** | Tiered model routing (`gpt-4o-mini` vs `gpt-4o`) | Variable token expenditure | Dynamic token budgets & cache layers |
| **User Velocity** | Inline editing & instant PDF/MD exports | Draft version divergence | Session history snapshotting |

---

## 4. Recommendations & Implementation Roadmap
1. **Phase 1 (Immediate):** Standardize discovery pipelines with verified search APIs (e.g. Tavily) and enforce automated URL cleaning.
2. **Phase 2 (Near-Term):** Implement iterative feedback loops where low critic scores (<8.0) trigger automated writer refinement passes.
3. **Phase 3 (Long-Term):** Deploy comparative analytics matrices to evaluate multi-topic scenarios side-by-side.

---

## Conclusion
**{topic}** represents a pivotal evolution in intelligent data discovery and automated report generation. By combining specialized agent roles with real-time feedback loops, organizations can accelerate research workflows while upholding rigorous standards of accuracy and transparency."""

class MockPipeline:
    async def run(
        self,
        topic: str,
        tone: str = "analytical",
        length: str = "detailed",
        model_name: str = "gpt-4o-mini",
        custom_instructions: str = None
    ) -> AsyncGenerator[AgentStreamEvent, None]:
        
        # 1. Search Agent
        yield AgentStreamEvent(
            agent=AgentType.SEARCH,
            event_type=EventType.START,
            message=f"Initializing search strategy for: '{topic}'",
            step_number=1
        )
        await asyncio.sleep(0.35)

        yield AgentStreamEvent(
            agent=AgentType.SEARCH,
            event_type=EventType.THOUGHT,
            message=f"Generating semantic query vectors and querying high-authority knowledge bases for '{topic}'...",
            step_number=1
        )
        await asyncio.sleep(0.4)

        sources = []
        for template in MOCK_SOURCE_TEMPLATES:
            # Customize slightly with topic
            source = {
                "title": f"{template['title']} - Focus on {topic[:30]}",
                "domain": template["domain"],
                "url": template["url"],
                "snippet": template["snippet"],
                "scraped_text": template["scraped_text"],
                "favicon_url": f"https://www.google.com/s2/favicons?domain={template['domain']}&sz=64",
                "relevance_score": round(random.uniform(0.88, 0.99), 2),
                "is_scraped": False
            }
            sources.append(source)

            yield AgentStreamEvent(
                agent=AgentType.SEARCH,
                event_type=EventType.SOURCE_DISCOVERED,
                message=f"Discovered authoritative source: {source['domain']}",
                data=source,
                step_number=1
            )
            await asyncio.sleep(0.25)

        yield AgentStreamEvent(
            agent=AgentType.SEARCH,
            event_type=EventType.COMPLETE,
            message=f"Search completed. {len(sources)} authoritative sources cataloged.",
            data={"sources": sources},
            step_number=1
        )
        await asyncio.sleep(0.3)

        # 2. Reader Agent
        yield AgentStreamEvent(
            agent=AgentType.READER,
            event_type=EventType.START,
            message=f"Reader Agent scraping DOM and distilling deep contextual text...",
            step_number=2
        )
        await asyncio.sleep(0.3)

        scraped_sources = []
        for idx, src in enumerate(sources[:3], 1):
            yield AgentStreamEvent(
                agent=AgentType.READER,
                event_type=EventType.SCRAPE_PROGRESS,
                message=f"Parsing DOM structure and removing noise for [{idx}/3] {src['domain']}...",
                data={"url": src["url"], "index": idx, "total": 3},
                step_number=2
            )
            await asyncio.sleep(0.3)

            scraped_item = dict(src)
            scraped_item["is_scraped"] = True
            scraped_sources.append(scraped_item)

            yield AgentStreamEvent(
                agent=AgentType.READER,
                event_type=EventType.STEP,
                message=f"Extracted {len(src['scraped_text']) * 4} chars of clean context from {src['domain']}",
                data={"domain": src["domain"], "url": src["url"]},
                step_number=2
            )
            await asyncio.sleep(0.2)

        for src in sources[3:]:
            scraped_sources.append(src)

        yield AgentStreamEvent(
            agent=AgentType.READER,
            event_type=EventType.COMPLETE,
            message=f"Reader Agent extracted rich context from {len(scraped_sources)} sources.",
            data={"scraped_sources": scraped_sources},
            step_number=2
        )
        await asyncio.sleep(0.3)

        # 3. Writer Agent
        yield AgentStreamEvent(
            agent=AgentType.WRITER,
            event_type=EventType.START,
            message=f"Writer Agent synthesizing report (Tone: {tone.capitalize()}, Length: {length.capitalize()})...",
            step_number=3
        )
        await asyncio.sleep(0.3)

        yield AgentStreamEvent(
            agent=AgentType.WRITER,
            event_type=EventType.THOUGHT,
            message="Synthesizing multi-agent research into structured Markdown sections with executive takeaways...",
            step_number=3
        )
        await asyncio.sleep(0.3)

        full_report = generate_mock_report(topic, tone, length)
        # Stream report tokens in chunks
        words = full_report.split(" ")
        chunk_size = 6
        for i in range(0, len(words), chunk_size):
            chunk = " ".join(words[i:i+chunk_size]) + " "
            yield AgentStreamEvent(
                agent=AgentType.WRITER,
                event_type=EventType.REPORT_CHUNK,
                message=chunk,
                data={"chunk": chunk},
                step_number=3
            )
            await asyncio.sleep(0.04)

        report_title = f"{topic.title()}: Comprehensive Research & Strategic Analysis"
        input_tokens = token_service.count_tokens(topic + " " + tone + " " + length, model=model_name) + 1200
        output_tokens = token_service.count_tokens(full_report, model=model_name)
        cost = token_service.calculate_cost(input_tokens, output_tokens, model=model_name)

        yield AgentStreamEvent(
            agent=AgentType.WRITER,
            event_type=EventType.COMPLETE,
            message="Report draft synthesis finalized.",
            data={
                "report_content": full_report,
                "title": report_title,
                "input_tokens": input_tokens,
                "output_tokens": output_tokens,
                "cost": cost
            },
            tokens=input_tokens + output_tokens,
            step_number=3
        )
        await asyncio.sleep(0.35)

        # 4. Critic Agent
        yield AgentStreamEvent(
            agent=AgentType.CRITIC,
            event_type=EventType.START,
            message="Critic Agent initiating rigorous review of research depth and accuracy...",
            step_number=4
        )
        await asyncio.sleep(0.3)

        yield AgentStreamEvent(
            agent=AgentType.CRITIC,
            event_type=EventType.THOUGHT,
            message="Evaluating factual density, structural hierarchy, and actionable insights against evaluation rubrics...",
            step_number=4
        )
        await asyncio.sleep(0.4)

        score = round(random.uniform(8.7, 9.4), 1)
        strengths = [
            "Clear structural hierarchy with executive summary and actionable takeaways",
            "Strong empirical grounding with multi-source verified data",
            "Strategic risk and mitigation matrix provides high practical utility"
        ]
        improvements = [
            "Could integrate additional quantitative benchmarks for edge-case scale",
            "Future iterations can include deeper regional regulatory breakdowns"
        ]
        verdict = f"High-caliber research synthesis that delivers clear, authoritative, and actionable insights for {topic}."

        critic_tokens = 450

        yield AgentStreamEvent(
            agent=AgentType.CRITIC,
            event_type=EventType.CRITIC_EVALUATION,
            message=f"Score: {score}/10 — {verdict}",
            data={
                "score": score,
                "verdict": verdict,
                "strengths": strengths,
                "improvements": improvements
            },
            step_number=4
        )
        await asyncio.sleep(0.2)

        yield AgentStreamEvent(
            agent=AgentType.CRITIC,
            event_type=EventType.COMPLETE,
            message="Critic evaluation completed.",
            data={
                "score": score,
                "verdict": verdict,
                "strengths": strengths,
                "improvements": improvements,
                "tokens": critic_tokens
            },
            tokens=critic_tokens,
            step_number=4
        )
        await asyncio.sleep(0.2)

        # 5. Orchestrator Complete
        total_tokens = input_tokens + output_tokens + critic_tokens
        total_cost = cost + token_service.calculate_cost(300, critic_tokens, model=model_name)

        yield AgentStreamEvent(
            agent=AgentType.ORCHESTRATOR,
            event_type=EventType.COMPLETE,
            message="Multi-agent research workflow successfully concluded.",
            data={
                "report_content": full_report,
                "title": report_title,
                "score": score,
                "verdict": verdict,
                "strengths": strengths,
                "improvements": improvements,
                "sources": scraped_sources,
                "total_tokens": total_tokens,
                "estimated_cost": round(total_cost, 6)
            },
            tokens=total_tokens,
            step_number=5
        )

mock_pipeline = MockPipeline()
