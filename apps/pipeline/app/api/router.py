from __future__ import annotations

from fastapi import APIRouter

from app.api.schemas import RewriteRequest, RewriteResponse
from app.config.settings import settings
from app.pipeline.context_builder import build_context
from app.pipeline.executor import execute
from app.pipeline.normalizer import normalize
from app.pipeline.postprocessor import postprocess
from app.pipeline.prompt_builder import build_prompt
from app.prompts.system_prompt import get_system_prompt

router = APIRouter()


@router.post("/rewrite", response_model=RewriteResponse)
def rewrite(request: RewriteRequest) -> RewriteResponse:
    clean_text = normalize(request.message.raw_text)
    context = build_context(request.message.history)
    system = get_system_prompt(request.tone_preset)
    prompt = build_prompt(system=system, context=context, user_message=clean_text)
    provider_used = settings.default_provider
    raw_output, tokens = execute(prompt, provider_used)
    rewritten = postprocess(raw_output)

    return RewriteResponse(
        rewritten_text=rewritten,
        provider_used=provider_used,
        tokens_used=tokens,
    )
