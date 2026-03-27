from app.pipeline.normalizer import normalize


def test_normalize_removes_markers_and_extra_spaces() -> None:
    result = normalize("Hello [profanity]    team")
    assert result == "Hello team"


def test_normalize_removes_emojis() -> None:
    result = normalize("Please fix this ASAP 😡")
    assert "😡" not in result
    assert result == "Please fix this ASAP"
