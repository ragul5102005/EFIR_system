"""Build FAISS vector indices from enriched local datasets."""

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
INDEX_DIR = ROOT / "ml" / "model"


def _build(records, text_fields, name, model):
    import faiss

    texts = []
    for item in records:
        parts = []
        for field in text_fields:
            val = item.get(field, "")
            if isinstance(val, list):
                parts.append(" ".join(str(x) for x in val))
            elif val:
                parts.append(str(val))
        texts.append(" - ".join(parts))

    vectors = model.encode(texts, normalize_embeddings=True).astype("float32")
    index = faiss.IndexFlatIP(vectors.shape[1])
    index.add(vectors)
    INDEX_DIR.mkdir(parents=True, exist_ok=True)
    faiss.write_index(index, str(INDEX_DIR / f"{name}.faiss"))
    (INDEX_DIR / f"{name}.json").write_text(json.dumps(records, indent=2), encoding="utf-8")
    print(f"Successfully saved {len(records)} {name} dense vectors (dim={vectors.shape[1]}) to {INDEX_DIR}")


def build_index() -> None:
    from sentence_transformers import SentenceTransformer

    print("Loading SentenceTransformer model (all-MiniLM-L6-v2)...")
    model = SentenceTransformer("all-MiniLM-L6-v2")
    
    cases_path = ROOT / "data" / "cases.json"
    legal_path = ROOT / "data" / "legal_documents.json"
    
    cases = json.loads(cases_path.read_text(encoding="utf-8"))
    legal_documents = json.loads(legal_path.read_text(encoding="utf-8"))
    
    print(f"Indexing {len(cases)} historical case precedents...")
    _build(cases, ("title", "description", "modus_operandi", "applicable_sections"), "cases", model)
    
    print(f"Indexing {len(legal_documents)} statutory legal reference documents...")
    _build(legal_documents, ("title", "section", "act", "content", "key_elements"), "legal", model)
    print("FAISS indexing build completed successfully.")


if __name__ == "__main__":
    build_index()