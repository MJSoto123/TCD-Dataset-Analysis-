import * as d3 from "d3";

function View3CohortBars({ data }) {
  const width = 760;
  const height = 340;
  const margin = { top: 20, right: 24, bottom: 60, left: 54 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xScale = d3.scaleBand().domain(data.map((d) => d.cohort)).range([0, innerWidth]).padding(0.28);
  const yScale = d3.scaleLinear().domain([0, d3.max(data, (d) => d.n_students) || 0]).nice().range([innerHeight, 0]);

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-900">Tamaño de cohortes</p>
      <svg viewBox={`0 0 ${width} ${height}`} className="mt-4 w-full">
        <g transform={`translate(${margin.left},${margin.top})`}>
          {yScale.ticks(4).map((tick) => (
            <g key={tick} transform={`translate(0,${yScale(tick)})`}>
              <line x1={0} x2={innerWidth} stroke="#eef2f7" />
              <text x={-10} y={4} textAnchor="end" className="fill-slate-500 text-[11px]">
                {d3.format(",")(tick)}
              </text>
            </g>
          ))}

          {data.map((item) => {
            const x = xScale(item.cohort) ?? 0;
            const y = yScale(item.n_students);
            return (
              <g key={item.cohort}>
                <rect x={x} y={y} width={xScale.bandwidth()} height={innerHeight - y} rx="16" fill="#2563eb" />
                <text x={x + xScale.bandwidth() / 2} y={y - 10} textAnchor="middle" className="fill-slate-700 text-[11px] font-medium">
                  {d3.format(",")(item.n_students)}
                </text>
                <text x={x + xScale.bandwidth() / 2} y={innerHeight + 22} textAnchor="middle" className="fill-slate-500 text-[10px]">
                  {item.cohort}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

export default View3CohortBars;
