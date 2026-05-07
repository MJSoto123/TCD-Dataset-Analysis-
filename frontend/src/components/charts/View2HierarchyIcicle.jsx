import * as d3 from "d3";
import { useMemo, useState } from "react";

function metricLabel(metric) {
  if (metric === "delta_repeat_minus_first") return "Delta repetición - primer intento";
  if (metric === "accuracy_repeat") return "Accuracy en repetición";
  return "Accuracy total";
}

function metricFormatter(metric) {
  return metric === "delta_repeat_minus_first" ? d3.format("+.1%") : d3.format(".1%");
}

function nodeLabel(node) {
  return node.data.name_es || node.data.name || "Sin nombre";
}

function fillColor(node, metric, colorScale) {
  if (node.depth === 0) return "#e2e8f0";
  const value = node.data?.[metric];
  if (!Number.isFinite(value)) return "#cbd5e1";
  return colorScale(value);
}

function truncateLabel(label, maxLength = 20) {
  return label.length > maxLength ? `${label.slice(0, maxLength - 1)}…` : label;
}

function pathKeyFromNode(node) {
  return node.ancestors().map((item) => item.data.name).reverse().join("::");
}

function focusPathFromRenderedNode(node, currentFocusPath) {
  const partial = node
    .ancestors()
    .map((item) => item.data.name)
    .reverse();

  if (!currentFocusPath) {
    return partial.join("::");
  }

  const base = currentFocusPath.split("::");
  return [...base, ...partial.slice(1)].join("::");
}

function findNodeByPath(root, focusPath) {
  if (!focusPath) return root;
  return root
    .descendants()
    .find((node) => pathKeyFromNode(node) === focusPath);
}

function buildFocusedHierarchy(data, focusPath) {
  const originalRoot = d3
    .hierarchy(data)
    .sum((node) => (node.node_type === "kc" ? node.n_total || 0 : 0))
    .sort((a, b) => (b.value || 0) - (a.value || 0));

  const focusedOriginal = findNodeByPath(originalRoot, focusPath) || originalRoot;
  const focusedRoot = d3
    .hierarchy(focusedOriginal.data)
    .sum((node) => (node.node_type === "kc" ? node.n_total || 0 : 0))
    .sort((a, b) => (b.value || 0) - (a.value || 0));

  return { originalRoot, focusedOriginal, focusedRoot };
}

function HierarchySwitch({ value, onChange }) {
  return (
    <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1">
      {[
        { key: "icicle", label: "Rectangular" },
        { key: "sunburst", label: "Circular" },
      ].map((option) => (
        <button
          key={option.key}
          type="button"
          onClick={() => onChange(option.key)}
          className={`rounded-xl px-3 py-2 text-sm transition ${
            value === option.key ? "bg-brand-700 text-white" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function View2HierarchyIcicle({ data, metric = "accuracy_total" }) {
  const [activeNode, setActiveNode] = useState(null);
  const [layoutMode, setLayoutMode] = useState("icicle");
  const [focusPath, setFocusPath] = useState(null);

  const { originalRoot, focusedOriginal, focusedRoot, colorScale, formatValue, maxDepth } = useMemo(() => {
    const { originalRoot, focusedOriginal, focusedRoot } = buildFocusedHierarchy(data, focusPath);
    const descendants = originalRoot.descendants();
    const values = descendants.map((node) => node.data?.[metric]).filter((value) => Number.isFinite(value));

    const color =
      metric === "delta_repeat_minus_first"
        ? d3.scaleLinear().domain([d3.min(values) ?? -0.05, 0, d3.max(values) ?? 0.05]).range(["#dc2626", "#e2e8f0", "#2563eb"])
        : d3.scaleLinear().domain([d3.min(values) ?? 0.5, d3.max(values) ?? 0.9]).range(["#dbeafe", "#1d4ed8"]);

    return {
      originalRoot,
      focusedOriginal,
      focusedRoot,
      colorScale: color,
      formatValue: metricFormatter(metric),
      maxDepth: focusedRoot.height,
    };
  }, [data, metric, focusPath]);

  const breadcrumbs = useMemo(() => focusedOriginal.ancestors().reverse(), [focusedOriginal]);

  const icicleLayout = useMemo(() => {
    const partition = d3.partition().size([420, (maxDepth + 1) * 190]);
    const root = focusedRoot.copy();
    partition(root);
    return root.descendants();
  }, [focusedRoot, maxDepth]);

  const sunburstLayout = useMemo(() => {
    const partition = d3.partition().size([2 * Math.PI, Math.max(1, maxDepth + 1)]);
    const root = focusedRoot.copy();
    partition(root);
    return root.descendants();
  }, [focusedRoot, maxDepth]);

  const svgWidth = (maxDepth + 1) * 190;
  const svgHeight = 420;
  const sunburstSize = 760;
  const sunburstRadius = Math.min(sunburstSize, sunburstSize) / 2 - 24;
  const ringScale = d3.scaleLinear().domain([0, maxDepth + 1]).range([0, sunburstRadius]);

  const handleNodeClick = (node) => {
    if (!node?.data?.name) return;
    setFocusPath(focusPathFromRenderedNode(node, focusPath));
    setActiveNode(node);
  };

  const resetFocus = () => {
    setFocusPath(null);
    setActiveNode(null);
  };

  const isFocused = Boolean(focusPath);

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Relación jerárquica de rutas y KCs</p>
          <p className="mt-1 text-xs text-slate-500">{metricLabel(metric)}</p>
        </div>

        <HierarchySwitch value={layoutMode} onChange={setLayoutMode} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={resetFocus}
          className={`rounded-full border px-3 py-1.5 text-xs transition ${
            isFocused ? "border-brand-700 text-brand-700 hover:bg-brand-50" : "border-slate-200 text-slate-400"
          }`}
        >
          Ver jerarquía completa
        </button>

        {breadcrumbs.map((node, index) => (
          <button
            key={`${pathKeyFromNode(node)}-crumb`}
            type="button"
            onClick={() => {
              const key = pathKeyFromNode(node);
              setFocusPath(key === pathKeyFromNode(originalRoot) ? null : key);
              setActiveNode(node);
            }}
            className={`rounded-full border px-3 py-1.5 text-xs transition ${
              index === breadcrumbs.length - 1 ? "border-brand-700 bg-brand-50 text-brand-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {nodeLabel(node)}
          </button>
        ))}
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-600">
        Hacé click en un nodo para centrarte en esa parte de la jerarquía. Vas a ver sus superiores en la ruta y sus inferiores en la visual.
      </p>

      {layoutMode === "icicle" ? (
        <div className="mt-5 overflow-x-auto">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="min-w-[900px]">
            {icicleLayout.map((node) => {
              if (node.depth === 0) return null;
              const x = node.y0;
              const y = node.x0;
              const width = Math.max(1, node.y1 - node.y0 - 1);
              const height = Math.max(1, node.x1 - node.x0 - 1);
              const label = nodeLabel(node);
              const showLabel = width > 120 && height > 18;

              return (
                <g
                  key={`${pathKeyFromNode(node)}-${metric}-icicle`}
                  transform={`translate(${x},${y})`}
                  onMouseEnter={() => setActiveNode(node)}
                  onMouseLeave={() => setActiveNode(null)}
                  onClick={() => handleNodeClick(node)}
                  className="cursor-pointer"
                >
                  <title>
                    {`${label}\nTipo: ${node.data.node_type}\nInteracciones: ${d3.format(",")(node.data.n_total || 0)}${
                      Number.isFinite(node.data[metric]) ? `\n${metricLabel(metric)}: ${formatValue(node.data[metric])}` : ""
                    }`}
                  </title>
                  <rect width={width} height={height} rx="8" fill={fillColor(node, metric, colorScale)} stroke="#ffffff" strokeWidth="1" />
                  {showLabel ? (
                    <text x="10" y="18" className="fill-slate-900 text-[11px] font-medium">
                      {truncateLabel(label, Math.max(14, Math.floor(width / 9)))}
                    </text>
                  ) : null}
                </g>
              );
            })}
          </svg>
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <svg viewBox={`0 0 ${sunburstSize} ${sunburstSize}`} className="mx-auto min-w-[760px]">
            <g transform={`translate(${sunburstSize / 2},${sunburstSize / 2})`}>
              {sunburstLayout.map((node) => {
                if (node.depth === 0) return null;
                const arc = d3
                  .arc()
                  .startAngle(node.x0)
                  .endAngle(node.x1)
                  .innerRadius(ringScale(node.y0))
                  .outerRadius(ringScale(node.y1) - 2);

                return (
                  <path
                    key={`${pathKeyFromNode(node)}-${metric}-sunburst`}
                    d={arc()}
                    fill={fillColor(node, metric, colorScale)}
                    stroke="#ffffff"
                    strokeWidth="1"
                    onMouseEnter={() => setActiveNode(node)}
                    onMouseLeave={() => setActiveNode(null)}
                    onClick={() => handleNodeClick(node)}
                    className="cursor-pointer"
                  >
                    <title>
                      {`${nodeLabel(node)}\nTipo: ${node.data.node_type}\nInteracciones: ${d3.format(",")(node.data.n_total || 0)}${
                        Number.isFinite(node.data[metric]) ? `\n${metricLabel(metric)}: ${formatValue(node.data[metric])}` : ""
                      }`}
                    </title>
                  </path>
                );
              })}
            </g>
          </svg>
        </div>
      )}

      <div className="mt-5 h-[180px] rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Detalle</p>
        <div className="mt-3 flex h-[132px] flex-col justify-start overflow-hidden text-sm text-slate-600">
          {activeNode ? (
            <div className="space-y-2">
              <p className="text-base font-medium text-slate-900">{nodeLabel(activeNode)}</p>
              <p>Tipo: {activeNode.data.node_type}</p>
              <p>Interacciones: {d3.format(",")(activeNode.data.n_total || 0)}</p>
              {Number.isFinite(activeNode.data[metric]) ? <p>{metricLabel(metric)}: {formatValue(activeNode.data[metric])}</p> : null}
            </div>
          ) : (
            <p className="leading-6 text-slate-600">Pasá el mouse por un nodo para ver su peso e indicador.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default View2HierarchyIcicle;
