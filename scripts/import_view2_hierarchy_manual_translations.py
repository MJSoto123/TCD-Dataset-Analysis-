from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
SOURCE_FILE = ROOT / "dashboard" / "data" / "translations" / "traduccion_2_es.json"
TARGET_FILE = ROOT / "dashboard" / "data" / "translations" / "view2_labels_es.json"


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> None:
    if not SOURCE_FILE.exists():
        raise FileNotFoundError(f"No existe {SOURCE_FILE}")

    target = {"routes": {}, "route_leafs": {}, "kcs": {}}
    if TARGET_FILE.exists():
        target = load_json(TARGET_FILE)

    source_rows = load_json(SOURCE_FILE)
    applied = 0

    for row in source_rows:
        translated = str(row.get("translation_es", "")).strip()
        original = str(row.get("original_text", "")).strip()
        node_type = str(row.get("node_type", "")).strip()
        if not translated or not original:
            continue

        if node_type == "group":
            target["routes"][original] = translated
            applied += 1
        elif node_type == "route":
            target["route_leafs"][original] = translated
            applied += 1
        elif node_type == "kc":
            target["kcs"][original] = translated
            applied += 1

    TARGET_FILE.write_text(json.dumps(target, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"[done] Updated {TARGET_FILE.relative_to(ROOT)}")
    print(f"[info] Applied hierarchy translations: {applied}")


if __name__ == "__main__":
    main()
