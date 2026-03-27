import re

_PREFIXES = re.compile(r"^(sure[!,.\s]+here\s+is\s+your\s+message[:\s-]*|rewritten[:\s-]*)", re.IGNORECASE)


def postprocess(raw_output: str) -> str:
    cleaned = _PREFIXES.sub("", raw_output.strip())
    return cleaned.strip()
