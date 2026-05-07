import * as d3 from "d3";

function View3ProgressLineChart({ data }) {
  const width = 760;
  const height = 360;
  const margin = { top: 20, right: 24, bottom: 48, left: 54 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xDomain = data.map((d) => d.progress_bin);
  const xScale = d3.scalePoint().domain(xDomain).range([0, innerWidth]);
  const yScale = d3.scaleLinear().domain([0, 1]).range([innerHeight, 0]);
  const line = d3
    .line()
    .x((d) => xScale(d.progress_bin))
    .y((d) => yScale(d.accuracy));

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-900">Accuracy promedio por tramo de secuencia</p>
      <svg viewBox={`0 0 ${width} ${height}`} className="mt-4 w-full">
        <g transform={`translate(${margin.left},${margin.top})`}>
          {yScale.ticks(5).map((tick) => (
            <g key={tick} transform={`translate(0,${yScale(tick)})`}>
              <line x1={0} x2={innerWidth} stroke="#eef2f7" />
              <text x={-10} y={4} textAnchor="end" className="fill-slate-500 text-[11px]">
                {d3.format(".0%")(tick)}
              </text>
            </g>
          ))}

          <path d={line(data)} fill="none" stroke="#2563eb" strokeWidth="3" />

          {data.map((item) => (
            <g key={item.progress_bin}>
              <circle cx={xScale(item.progress_bin)} cy={yScale(item.accuracy)} r="5" fill="#2563eb" />
              <text x={xScale(item.progress_bin)} y={yScale(item.accuracy) - 12} textAnchor="middle" className="fill-slate-700 text-[11px] font-medium">
                {d3.format(".1%")(item.accuracy)}
              </text>
              <text x={xScale(item.progress_bin)} y={innerHeight + 24} textAnchor="middle" className="fill-slate-500 text-[11px]">
                {item.progress_bin}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}

export default View3ProgressLineChart;
