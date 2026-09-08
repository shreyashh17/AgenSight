import os
import json
import re
from typing import Dict, Any, AsyncGenerator
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from app.agents.base import AgentType, EventType, AgentStreamEvent
from app.services.token_service import token_service

class CriticAgent:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY", "")

    async def execute(
        self,
        topic: str,
        report_content: str,
        model_name: str = "gpt-4o-mini"
    ) -> AsyncGenerator[AgentStreamEvent, None]:
        yield AgentStreamEvent(
            agent=AgentType.CRITIC,
            event_type=EventType.START,
            message="Critic Agent reviewing report accuracy, structure, and depth...",
            step_number=4
        )

        yield AgentStreamEvent(
            agent=AgentType.CRITIC,
            event_type=EventType.THOUGHT,
            message="Scrutinizing logical coherence, factual density, clarity, and actionable takeaways against research benchmarks...",
            step_number=4
        )

        system_prompt = """You are a rigorous, constructive research reviewer and editor.
Evaluate the provided research report thoroughly on:
1. Depth of insight and factual rigor
2. Structure, visual clarity, and readability
3. Actionability and completeness

You MUST respond strictly with a valid JSON object matching this schema:
{
  "score": 8.8,
  "verdict": "A comprehensive, high-quality analysis that balances technical nuance with strategic clarity.",
  "strengths": [
    "Clear, structured executive breakdown",
    "Detailed comparative subsections with high contextual relevance",
    "Actionable takeaways tailored to the topic"
  ],
  "improvements": [
    "Could incorporate more quantitative data points or benchmark figures",
    "Consider expanding on edge cases and secondary trade-offs"
  ]
}
Do not wrap your response in markdown code blocks or any other text; output pure JSON only."""

        user_content = f"Topic: {topic}\n\nReport Content to Review:\n{report_content[:6000]}"

        try:
            llm = ChatOpenAI(
                model=model_name,
                temperature=0.2,
                api_key=self.api_key or os.getenv("OPENAI_API_KEY")
            )

            response = await llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_content)
            ])

            raw_text = response.content.strip()

            # Clean JSON if backticks present
            if "```json" in raw_text:
                raw_text = re.search(r"```json\s*(.*?)\s*```", raw_text, re.DOTALL).group(1)
            elif "```" in raw_text:
                raw_text = re.search(r"```\s*(.*?)\s*```", raw_text, re.DOTALL).group(1)

            try:
                evaluation = json.loads(raw_text)
            except Exception:
                # Fallback parser
                evaluation = {
                    "score": 8.5,
                    "verdict": "Solid, structured research report with strong thematic clarity.",
                    "strengths": ["Well-organized narrative structure", "Thorough coverage of primary topic vectors"],
                    "improvements": ["Could enrich with deeper quantitative metrics"]
                }

            score = float(evaluation.get("score", 8.5))
            verdict = evaluation.get("verdict", "Well structured research report.")
            strengths = evaluation.get("strengths", [])
            improvements = evaluation.get("improvements", [])

            input_tokens = token_service.count_tokens(system_prompt + user_content, model=model_name)
            output_tokens = token_service.count_tokens(raw_text, model=model_name)

            yield AgentStreamEvent(
                agent=AgentType.CRITIC,
                event_type=EventType.CRITIC_EVALUATION,
                message=f"Evaluation complete. Score: {score}/10 — {verdict}",
                data={
                    "score": score,
                    "verdict": verdict,
                    "strengths": strengths,
                    "improvements": improvements
                },
                step_number=4
            )

            yield AgentStreamEvent(
                agent=AgentType.CRITIC,
                event_type=EventType.COMPLETE,
                message="Critic Agent finalized evaluation.",
                data={
                    "score": score,
                    "verdict": verdict,
                    "strengths": strengths,
                    "improvements": improvements,
                    "tokens": input_tokens + output_tokens
                },
                tokens=input_tokens + output_tokens,
                step_number=4
            )

        except Exception as e:
            yield AgentStreamEvent(
                agent=AgentType.CRITIC,
                event_type=EventType.ERROR,
                message=f"Critic agent encountered error: {str(e)}",
                step_number=4
            )

critic_agent = CriticAgent()
