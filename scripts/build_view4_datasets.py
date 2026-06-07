from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import pandas as pd


ROOT = Path(__file__).resolve().parents[2]
INPUT_FILE = ROOT / "dashboard" / "data" / "view3" / "view3_student_profiles.csv"
OUTPUT_DIR = ROOT / "dashboard" / "data" / "view4"
OUTPUT_FILE = OUTPUT_DIR / "view4_student_embedding.csv"
MANIFEST_FILE = OUTPUT_DIR / "manifest.json"
PUBLIC_OUTPUT_DIR = ROOT / "dashboard" / "frontend" / "public" / "data" / "view4"
PUBLIC_OUTPUT_FILE = PUBLIC_OUTPUT_DIR / "view4_student_embedding.csv"
PUBLIC_MANIFEST_FILE = PUBLIC_OUTPUT_DIR / "manifest.json"

FEATURE_COLUMNS = [
    "n_interactions",
    "n_questions",
    "n_kcs",
    "accuracy_total",
    "repeat_rate",
    "first_accuracy",
    "repeat_accuracy",
    "repeat_gain",
    "sequence_duration_days",
]


def compute_pca_2d(frame: pd.DataFrame, columns: list[str]) -> tuple[np.ndarray, list[float]]:
    matrix = frame[columns].astype(float).to_numpy()
    means = matrix.mean(axis=0)
    stds = matrix.std(axis=0, ddof=0)
    stds = np.where(stds == 0, 1.0, stds)
    z = (matrix - means) / stds

    u, s, vt = np.linalg.svd(z, full_matrices=False)
    components = z @ vt.T[:, :2]
    explained = (s**2) / np.sum(s**2)
    explained_2 = explained[:2].tolist()
    return components, explained_2


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    PUBLIC_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    df = pd.read_csv(INPUT_FILE)
    missing = [col for col in FEATURE_COLUMNS if col not in df.columns]
    if missing:
        raise ValueError(f"Missing required columns for view4: {missing}")

    pca_coords, explained = compute_pca_2d(df, FEATURE_COLUMNS)
    df["x_pca"] = pca_coords[:, 0]
    df["y_pca"] = pca_coords[:, 1]
    df["x_view"] = df["x_pca"]
    df["y_view"] = df["y_pca"]
    df["projection_method"] = "pca"

    export_columns = [
        "uid",
        *FEATURE_COLUMNS,
        "activity_bucket",
        "cohort",
        "x_pca",
        "y_pca",
        "x_view",
        "y_view",
        "projection_method",
    ]

    df[export_columns].to_csv(OUTPUT_FILE, index=False)
    df[export_columns].to_csv(PUBLIC_OUTPUT_FILE, index=False)

    manifest = {
        "view": "view4",
        "subview": "4A_student_profiles",
        "title": "Reducción de dimensionalidad de perfiles de estudiantes",
        "source_file": str(INPUT_FILE.relative_to(ROOT)).replace("\\", "/"),
        "output_file": str(OUTPUT_FILE.relative_to(ROOT)).replace("\\", "/"),
        "rows": int(len(df)),
        "features": FEATURE_COLUMNS,
        "projection_method": "pca",
        "projection_methods_available": ["pca"],
        "umap_available": False,
        "pca_explained_variance_ratio": explained,
        "notes": [
            "Esta primera iteración usa PCA como baseline explicable.",
            "UMAP queda pendiente para una futura versión cuando esté disponible en el entorno.",
        ],
    }

    MANIFEST_FILE.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    PUBLIC_MANIFEST_FILE.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"[view4] wrote {OUTPUT_FILE}")
    print(f"[view4] wrote {MANIFEST_FILE}")
    print(f"[view4] wrote {PUBLIC_OUTPUT_FILE}")
    print(f"[view4] wrote {PUBLIC_MANIFEST_FILE}")


if __name__ == "__main__":
    main()
