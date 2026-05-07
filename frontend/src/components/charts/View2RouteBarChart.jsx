import * as d3 from "d3";

function splitLabel(label, maxChars = 18) {
  const words = String(label).split(" ");
  const lines = [];
  let current = "";

  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars) {
      current = candidate;
      return;
    }
    if (current) lines.push(current);
    current = word;
  });

  if (current) lines.push(current);
  return lines.slice(0, 2);
}

function View2RouteBarChart({ data, metric = "delta_repeat_minus_first" }) {
  const labels = {
    delta_repeat_minus_first: "Delta repetición - primer intento",
    accuracy_total: "Accuracy total",
    accuracy_repeat: "Accuracy en repetición",
  };

  const sorted = [...data].sort((a, b) => b[metric] - a[metric]);
  const width = 760;
  const barHeight = 44;
  const height = sorted.length * barHeight + 80;
  const margin = { top: 20, right: 24, bottom: 32, left: 200 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const values = sorted.map((d) => d[metric]);
  const min = Math.min(0, d3.min(values) ?? 0);
  const max = Math.max(0, d3.max(values) ?? 0);
  const xScale = d3.scaleLinear().domain([min, max]).nice().range([0, innerWidth]);
  const yScale = d3.scaleBand().domain(sorted.map((d) => d.route_group)).range([0, innerHeight]).padding(0.2);
  const formatter = metric === "delta_repeat_minus_first" ? d3.format("+.1%") : d3.format(".1%");

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-900">Resumen por grupo de ruta</p>
      <p className="mt-1 text-xs text-slate-500">{labels[metric]}</p>
      <svg viewBox={`0 0 ${width} ${height}`} className="mt-4 w-full">
        <g transform={`translate(${margin.left},${margin.top})`}>
          <line x1={xScale(0)} x2={xScale(0)} y1="0" y2={innerHeight} stroke="#cbd5e1" />
          {sorted.map((item) => {
            const y = yScale(item.route_group) ?? 0;
            const start = xScale(Math.min(0, item[metric]));
            const end = xScale(Math.max(0, item[metric]));
            const widthBar = Math.max(2, end - start);

            return (
              <g key={item.route_group}>
                <text x="-14" y={y + yScale.bandwidth() / 2 - 8} textAnchor="end" className="fill-slate-600 text-[12px]">
                  {splitLabel(item.route_group_es || item.route_group).map((line, index) => (
                    <tspan key={`${item.route_group}-line-${index}`} x="-14" dy={index === 0 ? 0 : 14}>
                      {line}
                    </tspan>
                  ))}
                </text>
                <rect
                  x={start}
                  y={y}
                  width={widthBar}
                  height={yScale.bandwidth()}
                  rx="14"
                  fill={item[metric] >= 0 ? "#2563eb" : "#dc2626"}
                />
                <text
                  x={item[metric] >= 0 ? end + 8 : start - 8}
                  y={y + yScale.bandwidth() / 2}
                  textAnchor={item[metric] >= 0 ? "start" : "end"}
                  dominantBaseline="middle"
                  className="fill-slate-700 text-[11px] font-medium"
                >
                  {formatter(item[metric])}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

export default View2RouteBarChart;
