from __future__ import annotations

import json
import re
from pathlib import Path

import pandas as pd


ROOT = Path(__file__).resolve().parents[2]
ROUTE_FILE = ROOT / "dashboard" / "data" / "view2" / "view2_route_summary.csv"
KC_FILE = ROOT / "dashboard" / "data" / "view2" / "view2_kc_difficulty.csv"
TRANSLATIONS_FILE = ROOT / "dashboard" / "data" / "translations" / "view2_labels_es.json"
OUTPUT_DIR = ROOT / "dashboard" / "data" / "translations"
OUTPUT_CSV = OUTPUT_DIR / "view2_translation_queue.csv"
OUTPUT_JSON = OUTPUT_DIR / "view2_translation_queue.json"


CHINESE_PATTERN = re.compile(r"[\u4e00-\u9fff]")


def contains_chinese(text: str) -> bool:
    return bool(CHINESE_PATTERN.search(str(text)))


def build_rows(route_df: pd.DataFrame, kc_df: pd.DataFrame, translations: dict) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []

    seen = set()

    def add_row(kind: str, original: str, current: str) -> None:
        key = (kind, original)
        if key in seen:
            return
        seen.add(key)
        rows.append(
            {
                "kind": kind,
                "original_text": original,
                "current_translation": current,
                "translation_es": "",
            }
        )

    for value in sorted(route_df["route_group"].dropna().astype(str).unique()):
        current = translations.get("routes", {}).get(value, value)
        if contains_chinese(current) or current == value:
            add_row("route_group", value, current)

    for value in sorted(kc_df["route_leaf"].dropna().astype(str).unique()):
        current = translations.get("route_leafs", {}).get(value, value)
        if contains_chinese(current) or current == value:
            add_row("route_leaf", value, current)

    for value in sorted(kc_df["kc_name"].dropna().astype(str).unique()):
        current = translations.get("kcs", {}).get(value, value)
        if contains_chinese(current) or current == value:
            add_row("kc_name", value, current)

    return rows


def main() -> None:
    route_df = pd.read_csv(ROUTE_FILE)
    kc_df = pd.read_csv(KC_FILE)
    translations = json.loads(TRANSLATIONS_FILE.read_text(encoding="utf-8")) if TRANSLATIONS_FILE.exists() else {}

    rows = build_rows(route_df, kc_df, translations)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    df = pd.DataFrame(rows)
    df.to_csv(OUTPUT_CSV, index=False, encoding="utf-8")
    OUTPUT_JSON.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"[done] Saved {OUTPUT_CSV.relative_to(ROOT)}")
    print(f"[done] Saved {OUTPUT_JSON.relative_to(ROOT)}")
    print(f"[info] Pending translations: {len(rows)}")


if __name__ == "__main__":
    main()
