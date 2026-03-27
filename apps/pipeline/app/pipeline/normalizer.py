import re

_PROFANITY_MARKERS = re.compile(r"\[(?:expletive|curse|profanity)\]", re.IGNORECASE)
_EMOJI_BLOCKS = re.compile(r"[\U0001F300-\U0001FAFF]+")
_WHITESPACE = re.compile(r"\s+")


def normalize(text: str) -> str:
    """Normalize user text before prompt assembly."""
    cleaned = _PROFANITY_MARKERS.sub("", text)
    cleaned = _EMOJI_BLOCKS.sub("", cleaned)
    cleaned = _WHITESPACE.sub(" ", cleaned)
    return cleaned.strip()
