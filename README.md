# Dashboard

Este directorio concentra todo lo relacionado con la entrega web interactiva del proyecto.

## Estructura

```text
dashboard/
├── data/        # datasets agregados y artefactos listos para consumir en la web
├── frontend/    # frontend del dashboard (D3.js y UI)
└── scripts/     # scripts para generar datasets intermedios y agregados
```

## Propósito

Separar la implementación del dashboard del resto del proyecto para evitar mezclar:

- notebooks exploratorios
- scripts analíticos generales
- frontend de la entrega final

## Flujo esperado

1. `dashboard/scripts/` genera datasets agregados a partir de `data/` o de tablas analíticas intermedias.
2. `dashboard/data/` almacena esos archivos listos para visualización.
3. `dashboard/frontend/` consume esos datos y renderiza la experiencia interactiva final.

## Referencia funcional

La arquitectura analítica y las hipótesis del dashboard están documentadas en:

- `docs/aed-dashboard-architecture.md`
