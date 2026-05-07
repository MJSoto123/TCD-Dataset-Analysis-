# Scripts del dashboard

Este directorio contendrá scripts orientados a la preparación de datos para la entrega web.

## Responsabilidades

- leer tablas analíticas intermedias
- generar agregados por vista
- exportar CSV/JSON a `dashboard/data/`

## Script inicial implementado

### `build_view1_datasets.py`

Genera la primera capa de datos para la vista **Repetición y desempeño** a partir de:

- `data/interim/kc_level_train_valid_sequences__xes3g5m_sample_clean.csv`

Produce:

- `dashboard/data/view1/interaction_level_kc_train_valid_sample.csv`
- `dashboard/data/view1/view1_transition_matrix.csv`
- `dashboard/data/view1/view1_repeat_accuracy.csv`
- `dashboard/data/view1/view1_repeat_delta_by_kc.csv`
- `dashboard/data/view1/manifest.json`

### `build_view2_datasets.py`

Genera la segunda capa de datos para la vista **Dificultad por KC / ruta conceptual** a partir de:

- `dashboard/data/view1/interaction_level_kc_train_valid_sample.csv`
- `XES3G5M/metadata/questions.json`
- `XES3G5M/metadata/kc_routes_map.json`

Produce:

- `dashboard/data/view2/view2_interaction_enriched_sample.csv`
- `dashboard/data/view2/view2_kc_difficulty.csv`
- `dashboard/data/view2/view2_route_summary.csv`
- `dashboard/data/view2/manifest.json`

### `build_view3_datasets.py`

Genera la tercera capa de datos para la vista **Perfil de estudiantes** a partir de:

- `dashboard/data/view1/interaction_level_kc_train_valid_sample.csv`

Produce:

- `dashboard/data/view3/view3_student_profiles.csv`
- `dashboard/data/view3/view3_progress_bins.csv`
- `dashboard/data/view3/view3_cohort_summary.csv`
- `dashboard/data/view3/manifest.json`

### `build_view2_translations.py`

Genera o completa un diccionario de traducciones al español para los labels visibles de la Vista 2:

- grupos de ruta
- hojas de ruta
- nombres de KC

Produce:

- `dashboard/data/translations/view2_labels_es.json`

## Ejecución

```powershell
.\.venv\Scripts\python.exe dashboard/scripts/build_view1_datasets.py
.\.venv\Scripts\python.exe dashboard/scripts/build_view2_datasets.py
.\.venv\Scripts\python.exe dashboard/scripts/build_view2_translations.py
.\.venv\Scripts\python.exe dashboard/scripts/build_view3_datasets.py
```

## Organización objetivo

```text
dashboard/scripts/
├── build_view1_datasets.py
├── build_view2_datasets.py
├── build_view2_translations.py
└── build_view3_datasets.py
```

## Principio

La lógica pesada vive acá, no en el frontend.
