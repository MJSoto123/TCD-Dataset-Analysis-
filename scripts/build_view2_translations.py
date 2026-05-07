from __future__ import annotations

import json
from pathlib import Path

import pandas as pd
from deep_translator import GoogleTranslator


ROOT = Path(__file__).resolve().parents[2]
KC_FILE = ROOT / "dashboard" / "data" / "view2" / "view2_kc_difficulty.csv"
ROUTE_FILE = ROOT / "dashboard" / "data" / "view2" / "view2_route_summary.csv"
OUTPUT_DIR = ROOT / "dashboard" / "data" / "translations"
OUTPUT_FILE = OUTPUT_DIR / "view2_labels_es.json"


def load_existing() -> dict:
    if not OUTPUT_FILE.exists():
        return {"routes": {}, "route_leafs": {}, "kcs": {}}
    return json.loads(OUTPUT_FILE.read_text(encoding="utf-8"))


def unique_values(series: pd.Series) -> list[str]:
    return sorted({str(value).strip() for value in series.dropna().astype(str) if str(value).strip()})


def save_partial(result: dict) -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")


def chunked(values: list[str], size: int) -> list[list[str]]:
    return [values[index : index + size] for index in range(0, len(values), size)]


def translate_values(
    values: list[str],
    existing: dict[str, str],
    translator: GoogleTranslator,
    label: str,
    result_ref: dict,
    result_key: str,
    batch_size: int = 25,
) -> dict[str, str]:
    translated = dict(existing)
    missing = [value for value in values if value not in translated]
    if not missing:
        print(f"[info] No missing translations for {label}")
        return translated

    print(f"[info] Translating {len(missing)} values for {label}")
    batches = chunked(missing, batch_size)
    processed = 0
    for batch_index, batch in enumerate(batches, start=1):
        try:
            translated_batch = translator.translate_batch(batch)
            if not isinstance(translated_batch, list):
                translated_batch = [translated_batch]
            for original, translated_value in zip(batch, translated_batch):
                translated[original] = translated_value
            processed += len(batch)
            sample_original = ascii(batch[0])
            sample_translated = ascii(translated[batch[0]])
            print(f"  [batch {batch_index}/{len(batches)}] processed {processed}/{len(missing)} · {sample_original} -> {sample_translated}")
        except Exception as error:  # pragma: no cover - network and API variability
            for value in batch:
                translated[value] = value
            safe_original = ascii(batch[0])
            safe_error = ascii(str(error))
            print(f"  [warn] Failed batch starting at {safe_original}: {safe_error}")
        result_ref[result_key] = translated
        save_partial(result_ref)
    return translated


def main() -> None:
    kc_df = pd.read_csv(KC_FILE)
    route_df = pd.read_csv(ROUTE_FILE)
    existing = load_existing()
    translator = GoogleTranslator(source="zh-CN", target="es")

    route_values = unique_values(route_df["route_group"])
    route_leaf_values = unique_values(kc_df["route_leaf"])
    kc_values = unique_values(kc_df["kc_name"])

    result = {
        "routes": existing.get("routes", {}),
        "route_leafs": existing.get("route_leafs", {}),
        "kcs": existing.get("kcs", {}),
    }

    result["routes"] = translate_values(route_values, result["routes"], translator, "routes", result, "routes")
    result["route_leafs"] = translate_values(route_leaf_values, result["route_leafs"], translator, "route_leafs", result, "route_leafs")
    result["kcs"] = translate_values(kc_values, result["kcs"], translator, "kcs", result, "kcs")

    save_partial(result)
    print(f"[done] Saved {OUTPUT_FILE.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
