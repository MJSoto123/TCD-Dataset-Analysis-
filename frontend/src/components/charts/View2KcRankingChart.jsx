import * as d3 from "d3";

function View2KcRankingChart({ data, topN = 8, mode = "hardest" }) {
  const sorted = [...data]
    .filter((item) => Number.isFinite(item.accuracy_total) && Number.isFinite(item.delta_repeat_minus_first))
    .sort((a, b) => {
      if (mode === "hardest") return a.accuracy_total - b.accuracy_total;
      if (mode === "improve") return b.delta_repeat_minus_first - a.delta_repeat_minus_first;
      return a.delta_repeat_minus_first - b.delta_repeat_minus_first;
    })
    .slice(0, topN);

  const width = 780;
  const barHeight = 58;
  const height = sorted.length * barHeight + 80;
  const margin = { top: 20, right: 28, bottom: 32, left: 180 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const valueKey = mode === "hardest" ? "accuracy_total" : "delta_repeat_minus_first";
  const values = sorted.map((d) => d[valueKey]);
  const min = mode === "hardest" ? 0 : Math.min(0, d3.min(values) ?? 0);
  const max = Math.max(0, d3.max(values) ?? 0);
  const xScale = d3.scaleLinear().domain([min, max]).nice().range([0, innerWidth]);
  const yScale = d3.scaleBand().domain(sorted.map((d) => d.kc_id)).range([0, innerHeight]).padding(0.18);
  const formatter = mode === "hardest" ? d3.format(".1%") : d3.format("+.1%");

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-900">Ranking de KCs</p>
      <svg viewBox={`0 0 ${width} ${height}`} className="mt-4 w-full">
        <g transform={`translate(${margin.left},${margin.top})`}>
          {mode !== "hardest" ? <line x1={xScale(0)} x2={xScale(0)} y1="0" y2={innerHeight} stroke="#cbd5e1" /> : null}

          {sorted.map((item) => {
            const y = yScale(item.kc_id) ?? 0;
            const start = mode === "hardest" ? 0 : xScale(Math.min(0, item[valueKey]));
            const end = xScale(Math.max(mode === "hardest" ? 0 : 0, item[valueKey]));
            const widthBar = Math.max(2, end - start);
            const labelX = mode === "hardest" ? end + 8 : item[valueKey] >= 0 ? end + 8 : start - 8;

            return (
              <g key={`${item.kc_id}-${mode}`}>
                <text x="-12" y={y + 18} textAnchor="end" className="fill-slate-700 text-[12px] font-medium">
                  {item.kc_id}
                </text>
                <text x="-12" y={y + 34} textAnchor="end" className="fill-slate-400 text-[10px]">
                  {(item.kc_name_es || item.kc_name).length > 20
                    ? `${(item.kc_name_es || item.kc_name).slice(0, 20)}…`
                    : item.kc_name_es || item.kc_name}
                </text>
                <rect
                  x={start}
                  y={y}
                  width={widthBar}
                  height={yScale.bandwidth()}
                  rx="14"
                  fill={mode === "hardest" ? "#0f766e" : item[valueKey] >= 0 ? "#2563eb" : "#dc2626"}
                />
                <text
                  x={labelX}
                  y={y + yScale.bandwidth() / 2}
                  textAnchor={mode === "hardest" || item[valueKey] >= 0 ? "start" : "end"}
                  dominantBaseline="middle"
                  className="fill-slate-700 text-[11px] font-medium"
                >
                  {formatter(item[valueKey])}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

export default View2KcRankingChart;
