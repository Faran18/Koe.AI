from pathlib import Path
import re

KNOWLEDGE_DIR = Path(__file__).resolve().parents[2] / "knowledge_docs"


def retrieve_store_info(query: str, topic: str | None = None, max_chunks: int = 5) -> list[str]:
    query_words = set(re.findall(r"[a-z0-9]+", query.lower()))
    documents = sorted(KNOWLEDGE_DIR.glob("*.md"))
    if topic:
        documents = [path for path in documents if topic.lower() in path.stem.lower()]

    chunks: list[tuple[int, str]] = []
    for path in documents:
        for paragraph in path.read_text(encoding="utf-8").splitlines():
            text = paragraph.strip()
            if not text or text.startswith("#"):
                continue
            words = set(re.findall(r"[a-z0-9]+", text.lower()))
            score = len(query_words & words)
            if score:
                chunks.append((score, text))

    chunks.sort(key=lambda item: item[0], reverse=True)
    return [text for _, text in chunks[:max_chunks]]
