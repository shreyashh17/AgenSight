import tiktoken
from typing import Dict

# Pricing per 1k tokens (USD)
PRICING_PER_1K: Dict[str, Dict[str, float]] = {
    "gpt-4o-mini": {
        "input": 0.00015,
        "output": 0.00060,
    },
    "gpt-4o": {
        "input": 0.0025,
        "output": 0.0100,
    },
    "default": {
        "input": 0.0002,
        "output": 0.0008,
    }
}

class TokenService:
    @staticmethod
    def count_tokens(text: str, model: str = "gpt-4o-mini") -> int:
        if not text:
            return 0
        try:
            encoding = tiktoken.encoding_for_model(model)
        except Exception:
            try:
                encoding = tiktoken.get_encoding("cl100k_base")
            except Exception:
                return len(text) // 4
        return len(encoding.encode(text))

    @staticmethod
    def calculate_cost(input_tokens: int, output_tokens: int, model: str = "gpt-4o-mini") -> float:
        pricing = PRICING_PER_1K.get(model, PRICING_PER_1K["default"])
        input_cost = (input_tokens / 1000.0) * pricing["input"]
        output_cost = (output_tokens / 1000.0) * pricing["output"]
        return round(input_cost + output_cost, 6)

token_service = TokenService()
