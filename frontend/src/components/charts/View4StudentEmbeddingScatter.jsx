import * as d3 from "d3";
import { useMemo, useState } from "react";

const cohortColors = {
  high_accuracy_low_repeat: "#0f766e",
  high_repeat_positive_gain: "#2563eb",
  high_repeat_negative_gain: "#dc2626",
  mixed_profile: "#64748b",
};

function View4StudentEmbeddingScatter({ data }) {
  const width = 820;
  const height = 460;
  const margin = { top: 20, right: 28, bottom: 56, left: 64 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const [active, setActive] = useState(null);

  const xScale = useMemo(
    () => d3.scaleLinear().domain(d3.extent(data, (d) => d.x_view)).nice().range([0, innerWidth]),
    [data, innerWidth]
  );
  const yScale = useMemo(
    () => d3.scaleLinear().domain(d3.extent(data, (d) => d.y_view)).nice().range([innerHeight, 0]),
    [data, innerHeight]
  );
  const sizeScale = useMemo(
    () => d3.scaleSqrt().domain(d3.extent(data, (d) => d.n_interactions)).range([3, 12]),
    [data]
  );

  const legendEntries = useMemo(
    () =>
      Object.entries(cohortColors).map(([key, value]) => ({
        key,
        color: value,
      })),
    []
  );

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Mapa latente de perfiles de estudiantes</p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Proyección 2D basada en PCA sobre variables agregadas de desempeño, repetición, cobertura y actividad.
          </p>
        </div>

        <div className="grid gap-2 text-xs text-slate-600">
          {legendEntries.map((entry) => (
            <div key={entry.key} className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span>{entry.key}</span>
            </div>
          ))}
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="mt-4 w-full">
        <g transform={`translate(${margin.left},${margin.top})`}>
          {xScale.ticks(6).map((tick) => (
            <g key={`x-${tick}`} transform={`translate(${xScale(tick)},0)`}>
              <line y1={0} y2={innerHeight} stroke="#f1f5f9" />
              <text y={innerHeight + 24} textAnchor="middle" className="fill-slate-500 text-[11px]">
                {d3.format(".2f")(tick)}
              </text>
            </g>
          ))}

          {yScale.ticks(6).map((tick) => (
            <g key={`y-${tick}`} transform={`translate(0,${yScale(tick)})`}>
              <line x1={0} x2={innerWidth} stroke="#f1f5f9" />
              <text x={-10} y={4} textAnchor="end" className="fill-slate-500 text-[11px]">
                {d3.format(".2f")(tick)}
              </text>
            </g>
          ))}

          <line x1={0} x2={innerWidth} y1={yScale(0)} y2={yScale(0)} stroke="#cbd5e1" />
          <line x1={xScale(0)} x2={xScale(0)} y1={0} y2={innerHeight} stroke="#cbd5e1" />

          {data.map((item, index) => (
            <circle
              key={`${item.uid}-${index}`}
              cx={xScale(item.x_view)}
              cy={yScale(item.y_view)}
              r={sizeScale(item.n_interactions)}
              fill={cohortColors[item.cohort] ?? "#64748b"}
              fillOpacity={active?.uid === item.uid ? 1 : 0.75}
              stroke={active?.uid === item.uid ? "#0f172a" : "transparent"}
              strokeWidth={1.5}
              onMouseEnter={() => setActive(item)}
              onMouseLeave={() => setActive(null)}
            />
          ))}

          <text x={innerWidth / 2} y={innerHeight + 46} textAnchor="middle" className="fill-slate-500 text-[12px]">
            Componente principal 1
          </text>
          <text transform={`translate(${-48},${innerHeight / 2}) rotate(-90)`} textAnchor="middle" className="fill-slate-500 text-[12px]">
            Componente principal 2
          </text>
        </g>
      </svg>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
        {active ? (
          <div className="grid gap-1 md:grid-cols-2">
            <p><span className="font-semibold text-slate-900">UID:</span> {active.uid}</p>
            <p><span className="font-semibold text-slate-900">Cohorte:</span> {active.cohort}</p>
            <p><span className="font-semibold text-slate-900">Interacciones:</span> {d3.format(",")(active.n_interactions)}</p>
            <p><span className="font-semibold text-slate-900">Preguntas:</span> {d3.format(",")(active.n_questions)}</p>
            <p><span className="font-semibold text-slate-900">KCs:</span> {d3.format(",")(active.n_kcs)}</p>
            <p><span className="font-semibold text-slate-900">Accuracy:</span> {d3.format(".1%")(active.accuracy_total)}</p>
            <p><span className="font-semibold text-slate-900">Repeat rate:</span> {d3.format(".1%")(active.repeat_rate)}</p>
            <p><span className="font-semibold text-slate-900">Repeat gain:</span> {d3.format("+.1%")(active.repeat_gain)}</p>
          </div>
        ) : (
          <p>Pasa el cursor sobre un punto para ver el perfil resumido del estudiante.</p>
        )}
      </div>
    </div>
  );
}

export default View4StudentEmbeddingScatter;
