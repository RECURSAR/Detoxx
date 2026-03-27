from app.providers.base import LLMProvider


class DummyProvider(LLMProvider):
    def complete(self, messages: list[dict[str, str]]) -> tuple[str, int]:
        return messages[-1]["content"], len(messages)


def test_dummy_provider_returns_last_message() -> None:
    provider = DummyProvider()
    text, tokens = provider.complete(
        [{"role": "system", "content": "S"}, {"role": "user", "content": "U"}]
    )
    assert text == "U"
    assert tokens == 2


def test_dummy_provider_handles_single_message() -> None:
    provider = DummyProvider()
    text, tokens = provider.complete([{"role": "user", "content": "Only"}])
    assert text == "Only"
    assert tokens == 1
