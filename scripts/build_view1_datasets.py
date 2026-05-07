from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

import pandas as pd


ROOT = Path(__file__).resolve().parents[2]
INPUT_FILE = ROOT / "data" / "interim" / "kc_level_train_valid_sequences__xes3g5m_sample_clean.csv"
OUTPUT_DIR = ROOT / "dashboard" / "data" / "view1"

SEQUENCE_COLUMNS = ["questions", "concepts", "responses", "timestamps", "selectmasks", "is_repeat"]


@dataclass
class OutputPaths:
    interaction_level: Path
    transition_matrix: Path
    repeat_accuracy: Path
    repeat_delta_by_kc: Path


def parse_sequence(value: object) -> list[str]:
    if pd.isna(value):
        return []
    text = str(value).strip()
    if not text:
        return []
    return [part.strip() for part in text.split(",")]


def normalize_lengths(sequences: dict[str, list[str]], row_id: int) -> dict[str, list[str]]:
    lengths = {name: len(values) for name, values in sequences.items()}
    target = max(lengths.values(), default=0)
    if len(set(lengths.values())) <= 1:
        return sequences

    fixed: dict[str, list[str]] = {}
    for name, values in sequences.items():
        if len(values) < target:
            fixed[name] = values + [""] * (target - len(values))
        else:
            fixed[name] = values[:target]

    print(f"[warn] Row {row_id} had uneven sequence lengths: {lengths}")
    return fixed


def build_interaction_level(df: pd.DataFrame) -> pd.DataFrame:
    rows: list[dict[str, object]] = []

    for row_index, row in df.iterrows():
        sequences = {column: parse_sequence(row.get(column, "")) for column in SEQUENCE_COLUMNS}
        sequences = normalize_lengths(sequences, row_index)
        length = len(sequences["questions"])

        for position in range(length):
            question = sequences["questions"][position]
            kc = sequences["concepts"][position]
            response = sequences["responses"][position]
            timestamp = sequences["timestamps"][position]
            selectmask = sequences["selectmasks"][position]
            is_repeat = sequences["is_repeat"][position]

            if selectmask != "1":
                continue
            if response in {"", "-1"} or question in {"", "-1"}:
                continue

            rows.append(
                {
                    "row_id": int(row_index),
                    "fold": int(row["fold"]),
                    "uid": int(row["uid"]),
                    "position": position,
                    "question_id": question,
                    "kc_id": kc,
                    "response": int(response),
                    "is_correct": int(response),
                    "timestamp": int(timestamp) if timestamp not in {"", "-1"} else pd.NA,
                    "is_repeat": int(is_repeat) if is_repeat not in {"", "-1"} else 0,
                }
            )

    interaction_df = pd.DataFrame(rows)
    if interaction_df.empty:
        raise ValueError("No se pudieron construir interacciones válidas.")

    interaction_df = interaction_df.sort_values(["uid", "timestamp", "row_id", "position"], kind="stable").reset_index(drop=True)
    interaction_df["attempt_mode"] = interaction_df["is_repeat"].map({0: "first", 1: "repeat"})
    interaction_df["attempt_key"] = interaction_df["uid"].astype(str) + "::" + interaction_df["question_id"].astype(str)
    interaction_df["question_attempt_order"] = interaction_df.groupby("attempt_key").cumcount() + 1
    interaction_df["prev_response_same_question"] = interaction_df.groupby("attempt_key")["response"].shift(1)

    interaction_df["transition_type"] = interaction_df.apply(classify_transition, axis=1)
    return interaction_df


def classify_transition(row: pd.Series) -> str | pd.NA:
    previous = row["prev_response_same_question"]
    current = row["response"]
    if pd.isna(previous):
        return pd.NA
    if previous == 0 and current == 0:
        return "wrong_to_wrong"
    if previous == 0 and current == 1:
        return "wrong_to_correct"
    if previous == 1 and current == 0:
        return "correct_to_wrong"
    if previous == 1 and current == 1:
        return "correct_to_correct"
    return pd.NA


def build_transition_matrix(interaction_df: pd.DataFrame) -> pd.DataFrame:
    transitions = interaction_df.dropna(subset=["transition_type"]).copy()
    grouped = transitions.groupby("transition_type").size().rename("count").reset_index()
    total = grouped["count"].sum()
    grouped["pct"] = grouped["count"] / total if total else 0
    return grouped.sort_values("count", ascending=False).reset_index(drop=True)


def build_repeat_accuracy(interaction_df: pd.DataFrame) -> pd.DataFrame:
    grouped = (
        interaction_df.groupby("attempt_mode")
        .agg(n=("response", "size"), accuracy_rate=("is_correct", "mean"))
        .reset_index()
        .sort_values("attempt_mode")
    )
    grouped["accuracy_rate"] = grouped["accuracy_rate"].round(6)
    return grouped


def build_repeat_delta_by_kc(interaction_df: pd.DataFrame, min_support: int = 30) -> pd.DataFrame:
    grouped = (
        interaction_df.groupby(["kc_id", "attempt_mode"])
        .agg(n=("response", "size"), accuracy_rate=("is_correct", "mean"))
        .reset_index()
    )

    pivot = grouped.pivot(index="kc_id", columns="attempt_mode", values="accuracy_rate").rename_axis(None, axis=1)
    counts = grouped.pivot(index="kc_id", columns="attempt_mode", values="n").rename_axis(None, axis=1)
    result = pd.DataFrame(index=pivot.index)
    result["n_first"] = counts.get("first", 0).fillna(0).astype(int)
    result["n_repeat"] = counts.get("repeat", 0).fillna(0).astype(int)
    result["accuracy_first"] = pivot.get("first", pd.Series(index=result.index, dtype=float))
    result["accuracy_repeat"] = pivot.get("repeat", pd.Series(index=result.index, dtype=float))
    result["delta_repeat_minus_first"] = result["accuracy_repeat"] - result["accuracy_first"]
    result = result.reset_index(names="kc_id")

    filtered = result[(result["n_first"] >= min_support) & (result["n_repeat"] >= min_support)].copy()
    filtered = filtered.sort_values("delta_repeat_minus_first", ascending=False).reset_index(drop=True)
    for column in ["accuracy_first", "accuracy_repeat", "delta_repeat_minus_first"]:
        filtered[column] = filtered[column].round(6)
    return filtered


def ensure_output_dir() -> OutputPaths:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    return OutputPaths(
        interaction_level=OUTPUT_DIR / "interaction_level_kc_train_valid_sample.csv",
        transition_matrix=OUTPUT_DIR / "view1_transition_matrix.csv",
        repeat_accuracy=OUTPUT_DIR / "view1_repeat_accuracy.csv",
        repeat_delta_by_kc=OUTPUT_DIR / "view1_repeat_delta_by_kc.csv",
    )


def save_csv(df: pd.DataFrame, path: Path) -> None:
    df.to_csv(path, index=False, encoding="utf-8")


def save_manifest(paths: OutputPaths, interaction_df: pd.DataFrame) -> None:
    manifest = {
        "source_file": str(INPUT_FILE.relative_to(ROOT)),
        "outputs": {
            "interaction_level": str(paths.interaction_level.relative_to(ROOT)),
            "transition_matrix": str(paths.transition_matrix.relative_to(ROOT)),
            "repeat_accuracy": str(paths.repeat_accuracy.relative_to(ROOT)),
            "repeat_delta_by_kc": str(paths.repeat_delta_by_kc.relative_to(ROOT)),
        },
        "summary": {
            "rows": int(interaction_df.shape[0]),
            "students": int(interaction_df["uid"].nunique()),
            "questions": int(interaction_df["question_id"].nunique()),
            "kcs": int(interaction_df["kc_id"].nunique()),
            "repeat_rate": round(float(interaction_df["is_repeat"].mean()), 6),
        },
    }
    (OUTPUT_DIR / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")


def main() -> None:
    print(f"[info] Reading {INPUT_FILE.relative_to(ROOT)}")
    df = pd.read_csv(INPUT_FILE)

    paths = ensure_output_dir()
    interaction_df = build_interaction_level(df)
    transition_matrix = build_transition_matrix(interaction_df)
    repeat_accuracy = build_repeat_accuracy(interaction_df)
    repeat_delta_by_kc = build_repeat_delta_by_kc(interaction_df)

    save_csv(interaction_df, paths.interaction_level)
    save_csv(transition_matrix, paths.transition_matrix)
    save_csv(repeat_accuracy, paths.repeat_accuracy)
    save_csv(repeat_delta_by_kc, paths.repeat_delta_by_kc)
    save_manifest(paths, interaction_df)

    print("[done] Generated datasets:")
    for path in [paths.interaction_level, paths.transition_matrix, paths.repeat_accuracy, paths.repeat_delta_by_kc]:
        print(f"  - {path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
