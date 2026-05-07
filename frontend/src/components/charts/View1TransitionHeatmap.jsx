import * as d3 from "d3";

const transitionLabels = {
  wrong_to_wrong: { from: "Mal", to: "Mal" },
  wrong_to_correct: { from: "Mal", to: "Bien" },
  correct_to_wrong: { from: "Bien", to: "Mal" },
  correct_to_correct: { from: "Bien", to: "Bien" },
};

function View1TransitionHeatmap({ data }) {
  const width = 420;
  const height = 320;
  const margin = { top: 48, right: 24, bottom: 56, left: 72 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xDomain = ["Mal", "Bien"];
  const yDomain = ["Mal", "Bien"];
  const xScale = d3.scaleBand().domain(xDomain).range([0, innerWidth]).padding(0.08);
  const yScale = d3.scaleBand().domain(yDomain).range([0, innerHeight]).padding(0.08);
  const colorScale = d3.scaleLinear().domain([0, d3.max(data, (d) => d.pct) || 0]).range(["#dbeafe", "#1d4ed8"]);
  const pctFormat = d3.format(".1%");

  const cells = data.map((item) => ({
    ...item,
    from: transitionLabels[item.transition_type]?.from ?? "",
    to: transitionLabels[item.transition_type]?.to ?? "",
  }));

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-900">Transiciones entre intentos</p>
      <svg viewBox={`0 0 ${width} ${height}`} className="mt-4 w-full">
        <g transform={`translate(${margin.left},${margin.top})`}>
          {xDomain.map((label) => (
            <text
              key={label}
              x={(xScale(label) ?? 0) + xScale.bandwidth() / 2}
              y={-14}
              textAnchor="middle"
              className="fill-slate-500 text-[12px] font-medium"
            >
              {label}
            </text>
          ))}

          {yDomain.map((label) => (
            <text
              key={label}
              x={-18}
              y={(yScale(label) ?? 0) + yScale.bandwidth() / 2}
              dominantBaseline="middle"
              textAnchor="end"
              className="fill-slate-500 text-[12px] font-medium"
            >
              {label}
            </text>
          ))}

          {cells.map((cell) => (
            <g key={cell.transition_type}>
              <rect
                x={xScale(cell.to)}
                y={yScale(cell.from)}
                width={xScale.bandwidth()}
                height={yScale.bandwidth()}
                rx="18"
                fill={colorScale(cell.pct)}
              />
              <text
                x={(xScale(cell.to) ?? 0) + xScale.bandwidth() / 2}
                y={(yScale(cell.from) ?? 0) + yScale.bandwidth() / 2 - 6}
                textAnchor="middle"
                className="fill-white text-[14px] font-semibold"
              >
                {pctFormat(cell.pct)}
              </text>
              <text
                x={(xScale(cell.to) ?? 0) + xScale.bandwidth() / 2}
                y={(yScale(cell.from) ?? 0) + yScale.bandwidth() / 2 + 14}
                textAnchor="middle"
                className="fill-white/90 text-[11px]"
              >
                {d3.format(",")(cell.count)}
              </text>
            </g>
          ))}

          <text x={innerWidth / 2} y={innerHeight + 40} textAnchor="middle" className="fill-slate-500 text-[12px]">
            Respuesta actual
          </text>
          <text
            transform={`translate(${-54},${innerHeight / 2}) rotate(-90)`}
            textAnchor="middle"
            className="fill-slate-500 text-[12px]"
          >
            Respuesta previa
          </text>
        </g>
      </svg>
    </div>
  );
}

export default View1TransitionHeatmap;
