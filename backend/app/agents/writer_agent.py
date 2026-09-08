import os
from typing import List, Dict, Any, AsyncGenerator, Optional
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import HumanMessage, SystemMessage
from app.agents.base import AgentType, EventType, AgentStreamEvent
from app.services.token_service import token_service

class WriterAgent:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY", "")

    async def execute(
        self,
        topic: str,
        sources: List[Dict[str, Any]],
        model_name: str = "gpt-4o-mini",
        tone: str = "analytical",
        length: str = "detailed",
        revision_feedback: Optional[str] = None
    ) -> AsyncGenerator[AgentStreamEvent, None]:
        yield AgentStreamEvent(
            agent=AgentType.WRITER,
            event_type=EventType.START,
            message=f"Writer Agent synthesizing report (Tone: {tone.capitalize()}, Length: {length.capitalize()})...",
            step_number=3
        )

        yield AgentStreamEvent(
            agent=AgentType.WRITER,
            event_type=EventType.THOUGHT,
            message=f"Analyzing consolidated source texts, structuring executive takeaways, and formatting markdown sections...",
            step_number=3
        )

        # Prepare context from sources
        context_parts = []
        for s in sources:
            domain = s.get("domain", "")
            title = s.get("title", "")
            url = s.get("url", "")
            text = s.get("scraped_text") or s.get("snippet", "")
            context_parts.append(f"Source: {title} ({url})\nContent:\n{text[:1200]}\n")
        
        research_context = "\n---\n".join(context_parts) if context_parts else "No direct sources available."

        tone_instructions = {
            "analytical": "Maintain an objective, data-driven, balanced and rigorous tone with critical nuance.",
            "formal": "Use high-level professional, academic language with formal terminology.",
            "executive": "Be concise, high-impact, focusing on strategic implications, key metrics, and executive summaries.",
            "casual": "Use engaging, accessible, relatable prose that explains complex concepts simply."
        }.get(tone.lower(), "Maintain an objective, data-driven tone.")

        length_instructions = {
            "brief": "Keep the report crisp and concise (~400-600 words) with bullet points.",
            "detailed": "Provide a comprehensive report (~900-1400 words) with deep analysis in each section.",
            "exhaustive": "Provide an in-depth, thorough whitepaper (~1500-2200 words) covering nuances, case studies, and projections."
        }.get(length.lower(), "Provide a detailed report (~1000 words).")

        system_prompt = f"""You are an elite research analyst and writer. Your job is to generate a comprehensive, beautifully structured research report in GitHub-flavored Markdown.

Writing Guidelines:
- Tone: {tone_instructions}
- Length: {length_instructions}
- Structure:
  # [Engaging, Comprehensive Report Title]
  ## Executive Summary
  ## Background & Context
  ## Deep Analysis & Key Findings (Provide multiple detailed subsections with concrete insights)
  ## Strategic Implications / Future Outlook
  ## Key Takeaways & Recommendations
- Integrate factual points derived directly from the provided research context.
- Use bolding, clean headers, bullet lists, and callouts to make it easy to read.
- Do not make up fake URLs; adhere strictly to facts and cited context.
"""

        user_content = f"Topic: {topic}\n\nResearch Context Gathered by Agents:\n{research_context}"
        if revision_feedback:
            user_content += f"\n\nCRITIC FEEDBACK FROM PREVIOUS DRAFT (Please specifically address and improve these points):\n{revision_feedback}"

        try:
            llm = ChatOpenAI(
                model=model_name,
                temperature=0.3,
                streaming=True,
                api_key=self.api_key or os.getenv("OPENAI_API_KEY")
            )

            full_report_text = ""
            total_tokens = 0

            # Stream chunks from LLM
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_content)
            ]

            async for chunk in llm.astream(messages):
                chunk_text = chunk.content
                if chunk_text:
                    full_report_text += chunk_text
                    yield AgentStreamEvent(
                        agent=AgentType.WRITER,
                        event_type=EventType.REPORT_CHUNK,
                        message=chunk_text,
                        data={"chunk": chunk_text},
                        step_number=3
                    )

            # Derive clean title from generated markdown
            lines = full_report_text.strip().split("\n")
            title = topic
            for l in lines:
                if l.startswith("# "):
                    title = l.replace("# ", "").strip()
                    break

            # Calculate token telemetry
            input_tokens = token_service.count_tokens(system_prompt + user_content, model=model_name)
            output_tokens = token_service.count_tokens(full_report_text, model=model_name)
            cost = token_service.calculate_cost(input_tokens, output_tokens, model=model_name)

            yield AgentStreamEvent(
                agent=AgentType.WRITER,
                event_type=EventType.COMPLETE,
                message="Report drafting successfully finalized.",
                data={
                    "report_content": full_report_text,
                    "title": title,
                    "input_tokens": input_tokens,
                    "output_tokens": output_tokens,
                    "cost": cost
                },
                tokens=input_tokens + output_tokens,
                step_number=3
            )

        except Exception as e:
            yield AgentStreamEvent(
                agent=AgentType.WRITER,
                event_type=EventType.ERROR,
                message=f"Writer agent encountered error: {str(e)}",
                step_number=3
            )

writer_agent = WriterAgent()
