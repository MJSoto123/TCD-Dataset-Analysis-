from __future__ import annotations

import json
from pathlib import Path
from typing import Iterable

import pandas as pd


ROOT = Path(__file__).resolve().parents[2]
INTERACTION_FILE = ROOT / "dashboard" / "data" / "view1" / "interaction_level_kc_train_valid_sample.csv"
QUESTIONS_FILE = ROOT / "XES3G5M" / "metadata" / "questions.json"
KC_MAP_FILE = ROOT / "XES3G5M" / "metadata" / "kc_routes_map.json"
TRANSLATIONS_FILE = ROOT / "dashboard" / "data" / "translations" / "view2_labels_es.json"
OUTPUT_DIR = ROOT / "dashboard" / "data" / "view2"


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def load_translations() -> dict:
    if not TRANSLATIONS_FILE.exists():
        return {"routes": {}, "route_leafs": {}, "kcs": {}}
    return load_json(TRANSLATIONS_FILE)


def decode_route_for_question(question_meta: dict) -> str | None:
    routes = question_meta.get("kc_routes") or []
    if not routes:
        return None
    route = routes[0]
    if not route:
        return None
    return str(route)


def top_category_from_route(route: str | None) -> str:
    if not route:
        return "Sin ruta"
    return route.split("----")[0].strip() or "Sin ruta"


def leaf_category_from_route(route: str | None) -> str:
    if not route:
        return "Sin ruta"
    return route.split("----")[-1].strip() or "Sin ruta"


def route_segments_from_path(route: str | None) -> list[str]:
    if not route:
        return ["Sin ruta"]
    parts = [part.strip() for part in str(route).split("----") if part.strip()]
    return parts or ["Sin ruta"]


def kc_name_from_id(kc_id: str, kc_map: dict[str, str]) -> str:
    parts = [part.strip() for part in str(kc_id).split("_") if part.strip()]
    names = [kc_map.get(part, part) for part in parts]
    return " + ".join(names)


def mode_or_unknown(series: pd.Series, fallback: str = "Sin ruta") -> str:
    cleaned = series.dropna().astype(str)
    if cleaned.empty:
        return fallback
    mode = cleaned.mode()
    if mode.empty:
        return fallback
    value = str(mode.iloc[0]).strip()
    return value or fallback


def translate_route_segment(value: str, translations: dict) -> str:
    value = str(value)
    return (
        translations.get("routes", {}).get(value)
        or translations.get("route_leafs", {}).get(value)
        or value
    )


def build_enriched_interactions() -> pd.DataFrame:
    interactions = pd.read_csv(INTERACTION_FILE)
    questions = load_json(QUESTIONS_FILE)
    kc_map = load_json(KC_MAP_FILE)
    translations = load_translations()

    question_route_map = {str(question_id): decode_route_for_question(meta) for question_id, meta in questions.items()}
    interactions["question_id"] = interactions["question_id"].astype(str)
    interactions["kc_id"] = interactions["kc_id"].astype(str)
    interactions["route_path"] = interactions["question_id"].map(question_route_map)
    interactions["route_group"] = interactions["route_path"].map(top_category_from_route)
    interactions["route_leaf"] = interactions["route_path"].map(leaf_category_from_route)
    interactions["kc_name"] = interactions["kc_id"].map(lambda value: kc_name_from_id(value, kc_map))
    interactions["route_group_es"] = interactions["route_group"].map(lambda value: translations.get("routes", {}).get(str(value), str(value)))
    interactions["route_leaf_es"] = interactions["route_leaf"].map(lambda value: translations.get("route_leafs", {}).get(str(value), str(value)))
    interactions["kc_name_es"] = interactions["kc_name"].map(lambda value: translations.get("kcs", {}).get(str(value), str(value)))
    return interactions


def build_kc_difficulty(interactions: pd.DataFrame, min_support: int = 30) -> pd.DataFrame:
    grouped = (
        interactions.groupby(["kc_id", "attempt_mode"])
        .agg(
            n=("response", "size"),
            accuracy_rate=("is_correct", "mean"),
            kc_name=("kc_name", lambda s: mode_or_unknown(s, "")),
            kc_name_es=("kc_name_es", lambda s: mode_or_unknown(s, "")),
            route_group=("route_group", lambda s: mode_or_unknown(s)),
            route_group_es=("route_group_es", lambda s: mode_or_unknown(s)),
            route_leaf=("route_leaf", lambda s: mode_or_unknown(s)),
            route_leaf_es=("route_leaf_es", lambda s: mode_or_unknown(s)),
        )
        .reset_index()
    )

    pivot_acc = grouped.pivot(index="kc_id", columns="attempt_mode", values="accuracy_rate").rename_axis(None, axis=1)
    pivot_n = grouped.pivot(index="kc_id", columns="attempt_mode", values="n").rename_axis(None, axis=1)

    static = (
        interactions.groupby("kc_id")
        .agg(
            kc_name=("kc_name", lambda s: mode_or_unknown(s, "")),
            kc_name_es=("kc_name_es", lambda s: mode_or_unknown(s, "")),
            route_group=("route_group", lambda s: mode_or_unknown(s)),
            route_group_es=("route_group_es", lambda s: mode_or_unknown(s)),
            route_leaf=("route_leaf", lambda s: mode_or_unknown(s)),
            route_leaf_es=("route_leaf_es", lambda s: mode_or_unknown(s)),
            n_total=("response", "size"),
            accuracy_total=("is_correct", "mean"),
        )
        .reset_index()
    )

    result = static.copy()
    result["n_first"] = result["kc_id"].map(pivot_n.get("first", pd.Series(dtype=float))).fillna(0).astype(int)
    result["n_repeat"] = result["kc_id"].map(pivot_n.get("repeat", pd.Series(dtype=float))).fillna(0).astype(int)
    result["accuracy_first"] = result["kc_id"].map(pivot_acc.get("first", pd.Series(dtype=float)))
    result["accuracy_repeat"] = result["kc_id"].map(pivot_acc.get("repeat", pd.Series(dtype=float)))
    result["delta_repeat_minus_first"] = result["accuracy_repeat"] - result["accuracy_first"]

    filtered = result[(result["n_total"] >= min_support)].copy()
    for column in ["accuracy_total", "accuracy_first", "accuracy_repeat", "delta_repeat_minus_first"]:
      filtered[column] = filtered[column].round(6)
    return filtered.sort_values("n_total", ascending=False).reset_index(drop=True)


def build_route_summary(interactions: pd.DataFrame, min_support: int = 100) -> pd.DataFrame:
    grouped = (
        interactions.groupby(["route_group", "attempt_mode"])
        .agg(n=("response", "size"), accuracy_rate=("is_correct", "mean"))
        .reset_index()
    )
    pivot_acc = grouped.pivot(index="route_group", columns="attempt_mode", values="accuracy_rate").rename_axis(None, axis=1)
    pivot_n = grouped.pivot(index="route_group", columns="attempt_mode", values="n").rename_axis(None, axis=1)

    static = (
        interactions.groupby("route_group")
        .agg(
            n_total=("response", "size"),
            route_group_es=("route_group_es", lambda s: mode_or_unknown(s)),
            students=("uid", "nunique"),
            kcs=("kc_id", "nunique"),
            accuracy_total=("is_correct", "mean"),
        )
        .reset_index()
    )

    result = static.copy()
    result["n_first"] = result["route_group"].map(pivot_n.get("first", pd.Series(dtype=float))).fillna(0).astype(int)
    result["n_repeat"] = result["route_group"].map(pivot_n.get("repeat", pd.Series(dtype=float))).fillna(0).astype(int)
    result["accuracy_first"] = result["route_group"].map(pivot_acc.get("first", pd.Series(dtype=float)))
    result["accuracy_repeat"] = result["route_group"].map(pivot_acc.get("repeat", pd.Series(dtype=float)))
    result["delta_repeat_minus_first"] = result["accuracy_repeat"] - result["accuracy_first"]
    filtered = result[result["n_total"] >= min_support].copy()
    for column in ["accuracy_total", "accuracy_first", "accuracy_repeat", "delta_repeat_minus_first"]:
      filtered[column] = filtered[column].round(6)
    return filtered.sort_values("n_total", ascending=False).reset_index(drop=True)


def build_route_hierarchy(interactions: pd.DataFrame, translations: dict, min_support: int = 30) -> dict:
    filtered = interactions.copy()
    filtered["route_path"] = filtered["route_path"].fillna("Sin ruta")

    kc_level = (
        filtered.groupby(["route_path", "kc_id"])
        .agg(
            n_total=("response", "size"),
            correct_sum=("is_correct", "sum"),
            n_first=("attempt_mode", lambda s: int((s == "first").sum())),
            n_repeat=("attempt_mode", lambda s: int((s == "repeat").sum())),
            first_correct_sum=("is_correct", lambda s: float(s[filtered.loc[s.index, "attempt_mode"] == "first"].sum())),
            repeat_correct_sum=("is_correct", lambda s: float(s[filtered.loc[s.index, "attempt_mode"] == "repeat"].sum())),
            kc_name=("kc_name", lambda s: mode_or_unknown(s, "")),
            kc_name_es=("kc_name_es", lambda s: mode_or_unknown(s, "")),
        )
        .reset_index()
    )

    kc_level = kc_level[kc_level["n_total"] >= min_support].copy()

    root = {
        "name": "Rutas conceptuales",
        "name_es": "Rutas conceptuales",
        "node_type": "root",
        "children": [],
    }
    node_index = {(): root}

    def ensure_child(parent: dict, key: tuple[str, ...], name: str, name_es: str, node_type: str) -> dict:
        if key in node_index:
            return node_index[key]
        child = {
            "name": name,
            "name_es": name_es,
            "node_type": node_type,
            "children": [],
        }
        parent["children"].append(child)
        node_index[key] = child
        return child

    for row in kc_level.itertuples(index=False):
        segments = route_segments_from_path(row.route_path)
        current = root
        current_key: tuple[str, ...] = ()

        for depth, segment in enumerate(segments):
            current_key = current_key + (segment,)
            node_type = "group" if depth == 0 else "route"
            current = ensure_child(
                current,
                current_key,
                segment,
                translate_route_segment(segment, translations),
                node_type,
            )

        leaf_key = current_key + (f"kc::{row.kc_id}",)
        ensure_child(
            current,
            leaf_key,
            str(row.kc_name),
            str(row.kc_name_es) if str(row.kc_name_es).strip() else str(row.kc_name),
            "kc",
        ).update(
            {
                "kc_id": str(row.kc_id),
                "n_total": int(row.n_total),
                "accuracy_total": round(float(row.correct_sum) / float(row.n_total), 6) if row.n_total else None,
                "n_first": int(row.n_first),
                "n_repeat": int(row.n_repeat),
                "accuracy_first": round(float(row.first_correct_sum) / float(row.n_first), 6) if row.n_first else None,
                "accuracy_repeat": round(float(row.repeat_correct_sum) / float(row.n_repeat), 6) if row.n_repeat else None,
                "delta_repeat_minus_first": round(
                    (float(row.repeat_correct_sum) / float(row.n_repeat) if row.n_repeat else 0.0)
                    - (float(row.first_correct_sum) / float(row.n_first) if row.n_first else 0.0),
                    6,
                )
                if row.n_first and row.n_repeat
                else None,
            }
        )

    def finalize(node: dict, depth: int = 0) -> dict:
        children = [finalize(child, depth + 1) for child in node.get("children", [])]
        node["depth"] = depth
        node["children"] = sorted(children, key=lambda child: child.get("n_total", 0), reverse=True)

        if node["node_type"] == "kc":
            return node

        n_total = sum(child.get("n_total", 0) for child in node["children"])
        n_first = sum(child.get("n_first", 0) for child in node["children"])
        n_repeat = sum(child.get("n_repeat", 0) for child in node["children"])

        weighted_total = sum((child.get("accuracy_total") or 0) * child.get("n_total", 0) for child in node["children"])
        weighted_first = sum((child.get("accuracy_first") or 0) * child.get("n_first", 0) for child in node["children"])
        weighted_repeat = sum((child.get("accuracy_repeat") or 0) * child.get("n_repeat", 0) for child in node["children"])

        node["n_total"] = int(n_total)
        node["n_first"] = int(n_first)
        node["n_repeat"] = int(n_repeat)
        node["accuracy_total"] = round(weighted_total / n_total, 6) if n_total else None
        node["accuracy_first"] = round(weighted_first / n_first, 6) if n_first else None
        node["accuracy_repeat"] = round(weighted_repeat / n_repeat, 6) if n_repeat else None
        node["delta_repeat_minus_first"] = (
            round(node["accuracy_repeat"] - node["accuracy_first"], 6)
            if node["accuracy_first"] is not None and node["accuracy_repeat"] is not None
            else None
        )
        return node

    return finalize(root)


def ensure_output_dir() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def save_outputs(interactions: pd.DataFrame, kc_difficulty: pd.DataFrame, route_summary: pd.DataFrame, route_hierarchy: dict) -> None:
    ensure_output_dir()
    interactions.to_csv(OUTPUT_DIR / "view2_interaction_enriched_sample.csv", index=False, encoding="utf-8")
    kc_difficulty.to_csv(OUTPUT_DIR / "view2_kc_difficulty.csv", index=False, encoding="utf-8")
    route_summary.to_csv(OUTPUT_DIR / "view2_route_summary.csv", index=False, encoding="utf-8")
    (OUTPUT_DIR / "view2_route_hierarchy.json").write_text(json.dumps(route_hierarchy, indent=2, ensure_ascii=False), encoding="utf-8")

    summary = {
        "source_files": {
            "interactions": str(INTERACTION_FILE.relative_to(ROOT)),
            "questions_metadata": str(QUESTIONS_FILE.relative_to(ROOT)),
            "kc_routes_map": str(KC_MAP_FILE.relative_to(ROOT)),
        },
        "outputs": {
            "interaction_enriched": str((OUTPUT_DIR / "view2_interaction_enriched_sample.csv").relative_to(ROOT)),
            "kc_difficulty": str((OUTPUT_DIR / "view2_kc_difficulty.csv").relative_to(ROOT)),
            "route_summary": str((OUTPUT_DIR / "view2_route_summary.csv").relative_to(ROOT)),
            "route_hierarchy": str((OUTPUT_DIR / "view2_route_hierarchy.json").relative_to(ROOT)),
        },
        "summary": {
            "rows": int(interactions.shape[0]),
            "route_groups": int(route_summary["route_group"].nunique()),
            "kcs": int(kc_difficulty["kc_id"].nunique()),
            "hierarchy_nodes": int(sum(1 for _ in walk_nodes(route_hierarchy))),
        },
    }
    (OUTPUT_DIR / "manifest.json").write_text(json.dumps(summary, indent=2, ensure_ascii=False), encoding="utf-8")


def walk_nodes(node: dict) -> Iterable[dict]:
    yield node
    for child in node.get("children", []):
        yield from walk_nodes(child)


def main() -> None:
    print(f"[info] Reading {INTERACTION_FILE.relative_to(ROOT)}")
    interactions = build_enriched_interactions()
    translations = load_translations()
    kc_difficulty = build_kc_difficulty(interactions)
    route_summary = build_route_summary(interactions)
    route_hierarchy = build_route_hierarchy(interactions, translations)
    save_outputs(interactions, kc_difficulty, route_summary, route_hierarchy)
    print("[done] Generated datasets:")
    print(f"  - {(OUTPUT_DIR / 'view2_interaction_enriched_sample.csv').relative_to(ROOT)}")
    print(f"  - {(OUTPUT_DIR / 'view2_kc_difficulty.csv').relative_to(ROOT)}")
    print(f"  - {(OUTPUT_DIR / 'view2_route_summary.csv').relative_to(ROOT)}")
    print(f"  - {(OUTPUT_DIR / 'view2_route_hierarchy.json').relative_to(ROOT)}")
    print(f"  - {(OUTPUT_DIR / 'manifest.json').relative_to(ROOT)}")


if __name__ == "__main__":
    main()
