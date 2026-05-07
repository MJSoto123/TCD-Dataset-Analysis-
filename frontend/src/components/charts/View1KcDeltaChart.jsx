import * as d3 from "d3";

function View1KcDeltaChart({ data, topN = 8, mode = "improve" }) {
  const prepared = [...data]
    .sort((a, b) =>
      mode === "improve"
        ? b.delta_repeat_minus_first - a.delta_repeat_minus_first
        : a.delta_repeat_minus_first - b.delta_repeat_minus_first
    )
    .slice(0, topN);

  const width = 760;
  const barHeight = 42;
  const height = prepared.length * barHeight + 80;
  const margin = { top: 20, right: 24, bottom: 32, left: 88 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xExtent = d3.extent(prepared, (d) => d.delta_repeat_minus_first);
  const min = Math.min(0, xExtent[0] ?? 0);
  const max = Math.max(0, xExtent[1] ?? 0);
  const xScale = d3.scaleLinear().domain([min, max]).nice().range([0, innerWidth]);
  const yScale = d3.scaleBand().domain(prepared.map((d) => d.kc_id)).range([0, innerHeight]).padding(0.18);

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-900">Delta de accuracy por KC</p>
      <svg viewBox={`0 0 ${width} ${height}`} className="mt-4 w-full">
        <g transform={`translate(${margin.left},${margin.top})`}>
          <line x1={xScale(0)} x2={xScale(0)} y1="0" y2={innerHeight} stroke="#cbd5e1" />

          {prepared.map((item) => {
            const y = yScale(item.kc_id) ?? 0;
            const start = xScale(Math.min(0, item.delta_repeat_minus_first));
            const end = xScale(Math.max(0, item.delta_repeat_minus_first));
            const widthBar = Math.max(2, end - start);

            return (
              <g key={item.kc_id}>
                <text x="-12" y={y + yScale.bandwidth() / 2} textAnchor="end" dominantBaseline="middle" className="fill-slate-600 text-[12px]">
                  {item.kc_id}
                </text>
                <rect
                  x={start}
                  y={y}
                  width={widthBar}
                  height={yScale.bandwidth()}
                  rx="14"
                  fill={item.delta_repeat_minus_first >= 0 ? "#2563eb" : "#dc2626"}
                />
                <text
                  x={item.delta_repeat_minus_first >= 0 ? end + 8 : start - 8}
                  y={y + yScale.bandwidth() / 2}
                  textAnchor={item.delta_repeat_minus_first >= 0 ? "start" : "end"}
                  dominantBaseline="middle"
                  className="fill-slate-700 text-[11px] font-medium"
                >
                  {d3.format("+.1%")(item.delta_repeat_minus_first)}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

export default View1KcDeltaChart;
