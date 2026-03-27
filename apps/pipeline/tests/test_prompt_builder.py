from app.pipeline.prompt_builder import build_prompt


def test_build_prompt_includes_system_and_user() -> None:
    prompt = build_prompt("System", [], "User text")
    assert prompt[0]["role"] == "system"
    assert prompt[-1]["content"] == "User text"


def test_build_prompt_keeps_context_order() -> None:
    context = [{"role": "user", "content": "A"}, {"role": "bot", "content": "B"}]
    prompt = build_prompt("System", context, "C")
    assert prompt[1]["content"] == "A"
    assert prompt[2]["content"] == "B"
