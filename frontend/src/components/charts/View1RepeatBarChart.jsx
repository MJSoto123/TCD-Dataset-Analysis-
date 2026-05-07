import * as d3 from "d3";

function View1RepeatBarChart({ data }) {
  const width = 460;
  const height = 320;
  const margin = { top: 20, right: 20, bottom: 52, left: 52 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const labels = {
    first: "Primer intento",
    repeat: "Repetición",
  };

  const xScale = d3
    .scaleBand()
    .domain(data.map((d) => d.attempt_mode))
    .range([0, innerWidth])
    .padding(0.28);
  const yScale = d3.scaleLinear().domain([0, 1]).range([innerHeight, 0]);
  const ticks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-900">Accuracy por modo de intento</p>
      <svg viewBox={`0 0 ${width} ${height}`} className="mt-4 w-full">
        <g transform={`translate(${margin.left},${margin.top})`}>
          {ticks.map((tick) => (
            <g key={tick} transform={`translate(0,${yScale(tick)})`}>
              <line x1="0" x2={innerWidth} stroke="#e2e8f0" strokeDasharray="4 4" />
              <text x="-10" y="4" textAnchor="end" className="fill-slate-500 text-[11px]">
                {d3.format(".0%")(tick)}
              </text>
            </g>
          ))}

          {data.map((item) => {
            const x = xScale(item.attempt_mode) ?? 0;
            const y = yScale(item.accuracy_rate);
            const barHeight = innerHeight - y;

            return (
              <g key={item.attempt_mode}>
                <rect x={x} y={y} width={xScale.bandwidth()} height={barHeight} rx="18" fill="#2563eb" />
                <text x={x + xScale.bandwidth() / 2} y={y - 10} textAnchor="middle" className="fill-slate-700 text-[12px] font-semibold">
                  {d3.format(".1%")(item.accuracy_rate)}
                </text>
                <text
                  x={x + xScale.bandwidth() / 2}
                  y={innerHeight + 24}
                  textAnchor="middle"
                  className="fill-slate-600 text-[12px]"
                >
                  {labels[item.attempt_mode]}
                </text>
                <text
                  x={x + xScale.bandwidth() / 2}
                  y={innerHeight + 40}
                  textAnchor="middle"
                  className="fill-slate-400 text-[11px]"
                >
                  n={d3.format(",")(item.n)}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

export default View1RepeatBarChart;
