import * as d3 from "d3";

function View3StudentScatter({ data }) {
  const width = 760;
  const height = 420;
  const margin = { top: 20, right: 28, bottom: 56, left: 64 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xScale = d3.scaleLinear().domain([0, d3.max(data, (d) => d.repeat_rate) || 0]).nice().range([0, innerWidth]);
  const yExtent = d3.extent(data, (d) => d.repeat_gain);
  const yScale = d3
    .scaleLinear()
    .domain([Math.min(0, yExtent[0] ?? 0), Math.max(0, yExtent[1] ?? 0)])
    .nice()
    .range([innerHeight, 0]);
  const sizeScale = d3.scaleSqrt().domain(d3.extent(data, (d) => d.n_interactions)).range([3, 13]);
  const colorScale = d3.scaleOrdinal()
    .domain(["high_accuracy_low_repeat", "high_repeat_positive_gain", "high_repeat_negative_gain", "mixed_profile"])
    .range(["#0f766e", "#2563eb", "#dc2626", "#64748b"]);

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-900">Repeat rate vs repeat gain</p>
      <svg viewBox={`0 0 ${width} ${height}`} className="mt-4 w-full">
        <g transform={`translate(${margin.left},${margin.top})`}>
          <line x1={0} x2={innerWidth} y1={yScale(0)} y2={yScale(0)} stroke="#cbd5e1" />
          {data.map((item, index) => (
            <circle
              key={`${item.uid}-${index}`}
              cx={xScale(item.repeat_rate)}
              cy={yScale(item.repeat_gain)}
              r={sizeScale(item.n_interactions)}
              fill={colorScale(item.cohort)}
              fillOpacity="0.72"
            />
          ))}

          {xScale.ticks(5).map((tick) => (
            <g key={tick} transform={`translate(${xScale(tick)},0)`}>
              <line y1={0} y2={innerHeight} stroke="#f1f5f9" />
              <text y={innerHeight + 24} textAnchor="middle" className="fill-slate-500 text-[11px]">
                {d3.format(".0%")(tick)}
              </text>
            </g>
          ))}

          {yScale.ticks(5).map((tick) => (
            <g key={tick} transform={`translate(0,${yScale(tick)})`}>
              <line x1={0} x2={innerWidth} stroke="#f1f5f9" />
              <text x={-10} y={4} textAnchor="end" className="fill-slate-500 text-[11px]">
                {d3.format("+.0%")(tick)}
              </text>
            </g>
          ))}

          <text x={innerWidth / 2} y={innerHeight + 46} textAnchor="middle" className="fill-slate-500 text-[12px]">
            Tasa de repetición
          </text>
          <text transform={`translate(${-48},${innerHeight / 2}) rotate(-90)`} textAnchor="middle" className="fill-slate-500 text-[12px]">
            Ganancia por repetición
          </text>
        </g>
      </svg>
    </div>
  );
}

export default View3StudentScatter;
