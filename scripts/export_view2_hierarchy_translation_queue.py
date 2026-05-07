from __future__ import annotations

import csv
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
HIERARCHY_FILE = ROOT / "dashboard" / "data" / "view2" / "view2_route_hierarchy.json"
OUTPUT_DIR = ROOT / "dashboard" / "data" / "translations"
CSV_OUTPUT = OUTPUT_DIR / "view2_hierarchy_translation_queue.csv"
JSON_OUTPUT = OUTPUT_DIR / "view2_hierarchy_translation_queue.json"


def has_cjk(text: str | None) -> bool:
    if not isinstance(text, str):
        return False
    return any("\u4e00" <= ch <= "\u9fff" for ch in text)


def walk_missing(node: dict, bucket: list[dict]) -> None:
    original = node.get("name")
    translated = node.get("name_es")

    if has_cjk(translated) or (translated == original and has_cjk(original)):
        bucket.append(
            {
                "node_type": node.get("node_type"),
                "original_text": original,
                "translation_es": "",
            }
        )

    for child in node.get("children", []):
        walk_missing(child, bucket)


def unique_rows(rows: list[dict]) -> list[dict]:
    seen = set()
    unique = []
    for row in rows:
        key = (row["node_type"], row["original_text"])
        if key in seen:
            continue
        seen.add(key)
        unique.append(row)
    return unique


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    hierarchy = json.loads(HIERARCHY_FILE.read_text(encoding="utf-8"))
    rows: list[dict] = []
    walk_missing(hierarchy, rows)
    rows = unique_rows(rows)

    CSV_OUTPUT.write_text("", encoding="utf-8")
    with CSV_OUTPUT.open("w", encoding="utf-8", newline="") as handle:
      writer = csv.DictWriter(handle, fieldnames=["node_type", "original_text", "translation_es"])
      writer.writeheader()
      writer.writerows(rows)

    JSON_OUTPUT.write_text(json.dumps(rows, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"[done] Missing hierarchy translations: {len(rows)}")
    print(f"  - {CSV_OUTPUT.relative_to(ROOT)}")
    print(f"  - {JSON_OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
