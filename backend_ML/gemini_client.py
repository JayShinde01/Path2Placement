import logging
import os
from dataclasses import dataclass
from typing import Iterable, List, Optional

import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

GOOGLE_GEMINI_API_KEY = os.getenv("GOOGLE_GEMINI_API_KEY")


@dataclass(frozen=True)
class GeminiTaskConfig:
    models: List[str]
    max_output_tokens: int


GEMINI_TASKS = {
    "assistant_chat": GeminiTaskConfig(
        models=["gemini-2.5-flash", "gemini-1.5-flash"],
        max_output_tokens=256,
    ),
    "assistant_insights": GeminiTaskConfig(
        models=["gemini-2.5-flash", "gemini-1.5-flash"],
        max_output_tokens=220,
    ),
    "interview_feedback": GeminiTaskConfig(
        models=["gemini-2.5-flash", "gemini-1.5-flash"],
        max_output_tokens=160,
    ),
    "interview_final_feedback": GeminiTaskConfig(
        models=["gemini-2.5-flash", "gemini-1.5-flash"],
        max_output_tokens=220,
    ),
}


def _task_config(task: str) -> GeminiTaskConfig:
    return GEMINI_TASKS.get(task, GeminiTaskConfig(models=["gemini-2.5-flash"], max_output_tokens=256))


def _unique_models(models: Iterable[str]) -> List[str]:
    seen = set()
    ordered = []
    for model_name in models:
        if model_name and model_name not in seen:
            seen.add(model_name)
            ordered.append(model_name)
    return ordered


def generate_gemini_text(prompt: str, *, task: str) -> str:
    if not GOOGLE_GEMINI_API_KEY:
        return ""

    config = _task_config(task)
    model_names = _unique_models(config.models)

    genai.configure(api_key=GOOGLE_GEMINI_API_KEY)

    last_error: Optional[Exception] = None
    generation_config = {"max_output_tokens": config.max_output_tokens}

    for model_name in model_names:
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(prompt, generation_config=generation_config)
            text = response.text.strip() if hasattr(response, "text") and response.text else ""
            if text:
                return text
        except Exception as exc:
            last_error = exc
            logger.warning("Gemini task '%s' failed on model '%s': %s", task, model_name, exc)

    if last_error:
        logger.error("All Gemini models failed for task '%s': %s", task, last_error)
    return ""
