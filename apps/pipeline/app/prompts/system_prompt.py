from __future__ import annotations

from pathlib import Path

_TEMPLATES_DIR = Path(__file__).resolve().parent / "templates"


def get_system_prompt(tone_preset: str = "default") -> str:
    candidate = _TEMPLATES_DIR / f"{tone_preset}.txt"
    selected = candidate if candidate.exists() else _TEMPLATES_DIR / "default.txt"
    return selected.read_text(encoding="utf-8").strip()
