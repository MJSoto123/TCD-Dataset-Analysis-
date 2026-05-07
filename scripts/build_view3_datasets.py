from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import pandas as pd


ROOT = Path(__file__).resolve().parents[2]
INTERACTION_FILE = ROOT / "dashboard" / "data" / "view1" / "interaction_level_kc_train_valid_sample.csv"
OUTPUT_DIR = ROOT / "dashboard" / "data" / "view3"


def assign_cohort(row: pd.Series) -> str:
    if row["repeat_rate"] >= 0.2 and row["repeat_gain"] >= 0:
        return "high_repeat_positive_gain"
    if row["repeat_rate"] >= 0.2 and row["repeat_gain"] < 0:
        return "high_repeat_negative_gain"
    if row["accuracy_total"] >= 0.85 and row["repeat_rate"] < 0.2:
        return "high_accuracy_low_repeat"
    return "mixed_profile"


def build_student_profiles(interactions: pd.DataFrame) -> pd.DataFrame:
    grouped = (
        interactions.groupby("uid")
        .agg(
            n_interactions=("response", "size"),
            n_questions=("question_id", "nunique"),
            n_kcs=("kc_id", "nunique"),
            accuracy_total=("is_correct", "mean"),
            repeat_rate=("is_repeat", "mean"),
            first_accuracy=("is_correct", lambda s: interactions.loc[s.index].query("is_repeat == 0")["is_correct"].mean()),
            repeat_accuracy=("is_correct", lambda s: interactions.loc[s.index].query("is_repeat == 1")["is_correct"].mean()),
            first_timestamp=("timestamp", "min"),
            last_timestamp=("timestamp", "max"),
        )
        .reset_index()
    )

    grouped["first_accuracy"] = grouped["first_accuracy"].fillna(grouped["accuracy_total"])
    grouped["repeat_accuracy"] = grouped["repeat_accuracy"].fillna(grouped["accuracy_total"])
    grouped["repeat_gain"] = grouped["repeat_accuracy"] - grouped["first_accuracy"]
    grouped["sequence_duration_days"] = (grouped["last_timestamp"] - grouped["first_timestamp"]) / (1000 * 60 * 60 * 24)
    grouped["activity_bucket"] = pd.qcut(
        grouped["n_interactions"],
        q=4,
        labels=["baja", "media", "alta", "muy alta"],
        duplicates="drop",
    )
    grouped["cohort"] = grouped.apply(assign_cohort, axis=1)

    for column in ["accuracy_total", "repeat_rate", "first_accuracy", "repeat_accuracy", "repeat_gain", "sequence_duration_days"]:
        grouped[column] = grouped[column].round(6)

    return grouped


def build_progress_bins(interactions: pd.DataFrame) -> pd.DataFrame:
    ordered = interactions.sort_values(["uid", "timestamp", "row_id", "position"], kind="stable").copy()
    ordered["student_order"] = ordered.groupby("uid").cumcount() + 1
    total_per_student = ordered.groupby("uid")["student_order"].transform("max")
    ordered["progress_ratio"] = ordered["student_order"] / total_per_student

    bins = [0, 0.25, 0.5, 0.75, 1.0]
    labels = ["0-25%", "25-50%", "50-75%", "75-100%"]
    ordered["progress_bin"] = pd.cut(ordered["progress_ratio"], bins=bins, labels=labels, include_lowest=True)

    summary = (
        ordered.groupby(["uid", "progress_bin"], observed=True)
        .agg(
            n=("response", "size"),
            accuracy=("is_correct", "mean"),
            repeat_rate=("is_repeat", "mean"),
        )
        .reset_index()
    )

    summary["accuracy"] = summary["accuracy"].round(6)
    summary["repeat_rate"] = summary["repeat_rate"].round(6)
    return summary


def build_cohort_summary(student_profiles: pd.DataFrame) -> pd.DataFrame:
    summary = (
        student_profiles.groupby("cohort")
        .agg(
            n_students=("uid", "size"),
            avg_accuracy=("accuracy_total", "mean"),
            avg_repeat_rate=("repeat_rate", "mean"),
            avg_repeat_gain=("repeat_gain", "mean"),
            avg_interactions=("n_interactions", "mean"),
        )
        .reset_index()
    )
    for column in ["avg_accuracy", "avg_repeat_rate", "avg_repeat_gain", "avg_interactions"]:
        summary[column] = summary[column].round(6)
    return summary


def ensure_output_dir() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def save_outputs(student_profiles: pd.DataFrame, progress_bins: pd.DataFrame, cohort_summary: pd.DataFrame) -> None:
    ensure_output_dir()
    student_profiles.to_csv(OUTPUT_DIR / "view3_student_profiles.csv", index=False, encoding="utf-8")
    progress_bins.to_csv(OUTPUT_DIR / "view3_progress_bins.csv", index=False, encoding="utf-8")
    cohort_summary.to_csv(OUTPUT_DIR / "view3_cohort_summary.csv", index=False, encoding="utf-8")

    manifest = {
        "source_file": str(INTERACTION_FILE.relative_to(ROOT)),
        "outputs": {
            "student_profiles": str((OUTPUT_DIR / "view3_student_profiles.csv").relative_to(ROOT)),
            "progress_bins": str((OUTPUT_DIR / "view3_progress_bins.csv").relative_to(ROOT)),
            "cohort_summary": str((OUTPUT_DIR / "view3_cohort_summary.csv").relative_to(ROOT)),
        },
        "summary": {
            "students": int(student_profiles["uid"].nunique()),
            "cohorts": int(cohort_summary["cohort"].nunique()),
            "avg_repeat_gain": round(float(student_profiles["repeat_gain"].mean()), 6),
        },
    }
    (OUTPUT_DIR / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")


def main() -> None:
    print(f"[info] Reading {INTERACTION_FILE.relative_to(ROOT)}")
    interactions = pd.read_csv(INTERACTION_FILE)
    student_profiles = build_student_profiles(interactions)
    progress_bins = build_progress_bins(interactions)
    cohort_summary = build_cohort_summary(student_profiles)
    save_outputs(student_profiles, progress_bins, cohort_summary)
    print("[done] Generated datasets:")
    print(f"  - {(OUTPUT_DIR / 'view3_student_profiles.csv').relative_to(ROOT)}")
    print(f"  - {(OUTPUT_DIR / 'view3_progress_bins.csv').relative_to(ROOT)}")
    print(f"  - {(OUTPUT_DIR / 'view3_cohort_summary.csv').relative_to(ROOT)}")
    print(f"  - {(OUTPUT_DIR / 'manifest.json').relative_to(ROOT)}")


if __name__ == "__main__":
    main()
