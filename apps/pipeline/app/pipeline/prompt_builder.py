from __future__ import annotations


def build_prompt(system: str, context: list[dict[str, str]], user_message: str) -> list[dict[str, str]]:
    """Build the final prompt sequence for providers."""
    prompt: list[dict[str, str]] = [{"role": "system", "content": system}]
    prompt.extend(context)
    prompt.append({"role": "user", "content": user_message})
    return prompt
