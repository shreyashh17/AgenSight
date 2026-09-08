import asyncio
from datetime import datetime, timedelta
from app.core.database import AsyncSessionLocal, init_db
from app.models.models import ResearchSession, Report, Source, AgentEvent, UserSettings

SAMPLE_SESSIONS = [
    {
        "topic": "Next-Generation Retrieval-Augmented Generation (RAG) Architectures",
        "tone": "analytical",
        "length": "detailed",
        "model": "gpt-4o",
        "score": 9.3,
        "duration": 18.4,
        "tokens": 4250,
        "cost": 0.0215,
        "tags": ["#ai-research", "#rag", "#architecture"],
        "is_favorite": True,
        "verdict": "Exceptional architectural breakdown with rigorous multi-stage routing evaluation.",
        "strengths": [
            "Comprehensive breakdown of Self-RAG and Corrective RAG paradigms",
            "Clear latency and cost trade-off matrix",
            "Actionable chunking and vector index recommendations"
        ],
        "improvements": [
            "Include benchmarks on hybrid dense-sparse vector hybrid indexing",
            "Expand on graph-augmented knowledge retrieval (GraphRAG)"
        ],
        "content": """# Next-Generation Retrieval-Augmented Generation (RAG) Architectures

## Executive Summary
Retrieval-Augmented Generation (RAG) has matured from naive vector-similarity top-k search into hierarchical, adaptive, and agentic retrieval pipelines. Modern enterprise RAG systems integrate dynamic query decomposition, graph-based knowledge traversal, and real-time reranking to achieve sub-second latency and 99%+ factual precision.

## 1. Limitations of Naive RAG
Standard vector database search (e.g. cosine distance on 512-token chunks) suffers from three systemic failure modes:
1. **Context Fragmentation:** Semantically relevant facts split across chunk boundaries are lost or truncated.
2. **Noise Contamination:** Irrelevant chunks retrieved via surface keyword matches pollute the LLM context window.
3. **Multi-Hop Reasoning Blindspots:** Answering complex queries requiring synthesis across disjoint documents fails completely.

## 2. Advanced Architectural Patterns
Modern architectures solve these deficiencies through active agent loops:

- **Self-RAG (Self-Reflective RAG):** Employs reflection tokens to dynamically assess whether retrieval is necessary, evaluating retrieved passage relevance before synthesis.
- **Corrective RAG (CRAG):** Integrates an automated evaluator that triggers web search fallbacks whenever document store confidence falls below a calibrated threshold.
- **GraphRAG (Knowledge Graph Augmented):** Traverses structured entity relationships alongside vector embeddings, enabling comprehensive global topic summaries and multi-hop link discovery.

```
[User Query] ──► [Query Rewriter / Expansion] ──► [Hybrid Search (Dense + BM25)]
                                                          │
[Synthesized Output] ◄── [Self-Reflection Critic] ◄── [Cross-Encoder Reranker]
```

## 3. Production Deployment Guidelines
1. **Reranking:** Always deploy a cross-encoder reranker (e.g., Cohere or BGE-Reranker) on the top 25 retrieved candidates.
2. **Metadata Filtering:** Enforce strict tenant, timestamp, and domain metadata pre-filtering prior to vector distance calculation.
3. **Adaptive Routing:** Route straightforward analytical questions to local caches and reserve agentic multi-hop retrieval for exploratory queries.

## Conclusion
Next-generation RAG represents the foundational bridge between static model weights and dynamic enterprise knowledge. Implementing reflective loops and cross-encoder rerankers delivers orders of magnitude improvement in factual grounding."""
    },
    {
        "topic": "Server-Sent Events (SSE) vs WebSockets for High-Concurrency Agent Streaming",
        "tone": "technical",
        "length": "detailed",
        "model": "gpt-4o-mini",
        "score": 9.1,
        "duration": 14.2,
        "tokens": 3120,
        "cost": 0.0028,
        "tags": ["#engineering", "#streaming", "#fastapi"],
        "is_favorite": True,
        "verdict": "Thorough technical analysis highlighting protocol ergonomics and operational trade-offs.",
        "strengths": [
            "Clear protocol comparison matrix across HTTP/2 multiplexing, reconnection, and firewall traversal",
            "Practical code patterns for FastAPI and Next.js client consumption",
            "Precise connection pool overhead benchmarking"
        ],
        "improvements": [
            "Include mobile client background reconnect considerations"
        ],
        "content": """# Server-Sent Events (SSE) vs WebSockets for Agent Streaming

## Executive Summary
For AI agent platforms delivering real-time thought streams, milestone telemetry, and token-by-token text generation, Server-Sent Events (SSE) over HTTP/2 provide superior developer ergonomics, automatic reconnection, and firewall traversal compared to stateful bidirectional WebSockets.

## Protocol Comparison Matrix

| Feature | Server-Sent Events (SSE) | WebSockets (WS) |
| :--- | :--- | :--- |
| **Directionality** | Unidirectional (Server ➔ Client) | Bidirectional (Full Duplex) |
| **Transport** | Standard HTTP/1.1 or HTTP/2 | Upgraded TCP connection |
| **Automatic Reconnect** | Built-in native browser support | Requires custom client heartbeat logic |
| **Proxy / Load Balancer Traversal** | Seamless (Standard HTTP) | Requires explicit sticky session & WS upgrade rules |
| **Message Format** | UTF-8 text streams / JSON | UTF-8 text & raw binary |

## Architecture Recommendation
For AI research assistants where client requests are issued via standard REST POST/GET endpoints and agent thoughts are streamed downstream, SSE is the optimal architecture."""
    },
    {
        "topic": "Evaluating Multi-Agent Coordination Frameworks in 2026",
        "tone": "executive",
        "length": "detailed",
        "model": "gpt-4o-mini",
        "score": 8.8,
        "duration": 16.0,
        "tokens": 3800,
        "cost": 0.0034,
        "tags": ["#multi-agent", "#langchain", "#orchestration"],
        "is_favorite": False,
        "verdict": "Concise executive overview of multi-agent orchestration frameworks.",
        "strengths": [
            "Clear breakdown of LangGraph, CrewAI, and AutoGen topologies",
            "Focus on state machine determinism and debugging tooling"
        ],
        "improvements": [
            "Add quantitative latency overhead per subagent jump"
        ],
        "content": """# Evaluating Multi-Agent Coordination Frameworks

## Executive Summary
As autonomous AI applications transition from experimental demos to production workloads, multi-agent frameworks that emphasize deterministic cyclic graphs, state snapshotting, and human-in-the-loop validation are dominating enterprise adoption.

## Key Findings
1. **Graph-Centric Orchestration:** Cyclic state machines provide explicit control flow over agent transitions, preventing unbounded recursive loops.
2. **Role Specialization:** Isolating discovery, parsing, drafting, and critique into discrete agent nodes reduces hallucinations by over 40%.
3. **Telemetry & Observability:** Real-time event emitters enable end users to observe step-by-step reasoning, dramatically building user trust."""
    }
]

async def seed():
    await init_db()
    async with AsyncSessionLocal() as db:
        # Seed default user settings
        user_settings = await db.get(UserSettings, "default_user")
        if not user_settings:
            user_settings = UserSettings(
                id="default_user",
                default_model="gpt-4o-mini",
                default_tone="analytical",
                default_length="detailed",
                max_search_results=5,
                theme="dark"
            )
            db.add(user_settings)

        for data in SAMPLE_SESSIONS:
            session = ResearchSession(
                topic=data["topic"],
                mode="standard",
                status="completed",
                model=data["model"],
                tone=data["tone"],
                length=data["length"],
                total_tokens=data["tokens"],
                estimated_cost=data["cost"],
                duration_seconds=data["duration"],
                created_at=datetime.utcnow() - timedelta(days=len(data["tags"]))
            )
            db.add(session)
            await db.flush()

            report = Report(
                session_id=session.id,
                title=data["topic"],
                summary=f"In-depth research and synthesis on {data['topic']}",
                content=data["content"],
                score=data["score"],
                verdict=data["verdict"],
                strengths=data["strengths"],
                improvements=data["improvements"],
                tags=data["tags"],
                is_favorite=data["is_favorite"]
            )
            db.add(report)

            # Sources
            s1 = Source(
                session_id=session.id,
                title=f"Authoritative Review: {data['topic'][:35]}",
                url="https://arxiv.org/abs/2601.09214",
                domain="arxiv.org",
                favicon_url="https://www.google.com/s2/favicons?domain=arxiv.org&sz=64",
                snippet="Empirical results and comprehensive benchmarks in production environments.",
                is_scraped=True,
                relevance_score=0.98
            )
            s2 = Source(
                session_id=session.id,
                title=f"Industry Standards & Implementation Guide",
                url="https://news.mit.edu/2026/multi-agent-research-systems-scale",
                domain="mit.edu",
                favicon_url="https://www.google.com/s2/favicons?domain=mit.edu&sz=64",
                snippet="Practical architectural guide for enterprise multi-agent deployment.",
                is_scraped=True,
                relevance_score=0.94
            )
            db.add(s1)
            db.add(s2)

        await db.commit()
        print("InsightForge database successfully seeded with sample sessions and reports!")

if __name__ == "__main__":
    asyncio.run(seed())
