import * as d3 from "d3";
import { useEffect, useMemo, useState } from "react";
import View1KcDeltaChart from "../components/charts/View1KcDeltaChart";
import View1RepeatBarChart from "../components/charts/View1RepeatBarChart";
import View1TransitionHeatmap from "../components/charts/View1TransitionHeatmap";
import View2HierarchyIcicle from "../components/charts/View2HierarchyIcicle";
import View2KcRankingChart from "../components/charts/View2KcRankingChart";
import View2RouteBarChart from "../components/charts/View2RouteBarChart";
import View3CohortBars from "../components/charts/View3CohortBars";
import View3ProgressLineChart from "../components/charts/View3ProgressLineChart";
import View3StudentScatter from "../components/charts/View3StudentScatter";

function SummaryCard({ label, value, help }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p>
      {help ? <p className="mt-2 text-sm leading-6 text-slate-600">{help}</p> : null}
    </div>
  );
}

function VisualizationsPage() {
  const [transitionData, setTransitionData] = useState([]);
  const [repeatAccuracy, setRepeatAccuracy] = useState([]);
  const [kcDelta, setKcDelta] = useState([]);
  const [manifest, setManifest] = useState(null);
  const [routeSummary, setRouteSummary] = useState([]);
  const [kcDifficulty, setKcDifficulty] = useState([]);
  const [routeHierarchy, setRouteHierarchy] = useState(null);
  const [view2Manifest, setView2Manifest] = useState(null);
  const [studentProfiles, setStudentProfiles] = useState([]);
  const [progressBins, setProgressBins] = useState([]);
  const [cohortSummary, setCohortSummary] = useState([]);
  const [view3Manifest, setView3Manifest] = useState(null);
  const [topN, setTopN] = useState(8);
  const [deltaMode, setDeltaMode] = useState("improve");
  const [routeMetric, setRouteMetric] = useState("delta_repeat_minus_first");
  const [hierarchyMetric, setHierarchyMetric] = useState("accuracy_total");
  const [kcMode, setKcMode] = useState("hardest");
  const [selectedRoute, setSelectedRoute] = useState("all");
  const [activityFilter, setActivityFilter] = useState("all");

  useEffect(() => {
    const load = async () => {
      const [
        transitionRows,
        repeatRows,
        kcRows,
        manifestData,
        routeRows,
        kcDifficultyRows,
        routeHierarchyData,
        view2ManifestData,
        studentRows,
        progressRows,
        cohortRows,
        view3ManifestData,
      ] = await Promise.all([
        d3.csv("/data/view1/view1_transition_matrix.csv", (d) => ({
          transition_type: d.transition_type,
          count: Number(d.count),
          pct: Number(d.pct),
        })),
        d3.csv("/data/view1/view1_repeat_accuracy.csv", (d) => ({
          attempt_mode: d.attempt_mode,
          n: Number(d.n),
          accuracy_rate: Number(d.accuracy_rate),
        })),
        d3.csv("/data/view1/view1_repeat_delta_by_kc.csv", (d) => ({
          kc_id: d.kc_id,
          n_first: Number(d.n_first),
          n_repeat: Number(d.n_repeat),
          accuracy_first: Number(d.accuracy_first),
          accuracy_repeat: Number(d.accuracy_repeat),
          delta_repeat_minus_first: Number(d.delta_repeat_minus_first),
        })),
        d3.json("/data/view1/manifest.json"),
        d3.csv("/data/view2/view2_route_summary.csv", (d) => ({
          route_group: d.route_group,
          route_group_es: d.route_group_es,
          n_total: Number(d.n_total),
          students: Number(d.students),
          kcs: Number(d.kcs),
          accuracy_total: Number(d.accuracy_total),
          n_first: Number(d.n_first),
          n_repeat: Number(d.n_repeat),
          accuracy_first: Number(d.accuracy_first),
          accuracy_repeat: Number(d.accuracy_repeat),
          delta_repeat_minus_first: Number(d.delta_repeat_minus_first),
        })),
        d3.csv("/data/view2/view2_kc_difficulty.csv", (d) => ({
          kc_id: d.kc_id,
          kc_name: d.kc_name,
          kc_name_es: d.kc_name_es,
          route_group: d.route_group,
          route_group_es: d.route_group_es,
          route_leaf: d.route_leaf,
          route_leaf_es: d.route_leaf_es,
          n_total: Number(d.n_total),
          accuracy_total: Number(d.accuracy_total),
          n_first: Number(d.n_first),
          n_repeat: Number(d.n_repeat),
          accuracy_first: d.accuracy_first === "" ? NaN : Number(d.accuracy_first),
          accuracy_repeat: d.accuracy_repeat === "" ? NaN : Number(d.accuracy_repeat),
          delta_repeat_minus_first: d.delta_repeat_minus_first === "" ? NaN : Number(d.delta_repeat_minus_first),
        })),
        d3.json("/data/view2/view2_route_hierarchy.json"),
        d3.json("/data/view2/manifest.json"),
        d3.csv("/data/view3/view3_student_profiles.csv", (d) => ({
          uid: Number(d.uid),
          n_interactions: Number(d.n_interactions),
          n_questions: Number(d.n_questions),
          n_kcs: Number(d.n_kcs),
          accuracy_total: Number(d.accuracy_total),
          repeat_rate: Number(d.repeat_rate),
          first_accuracy: Number(d.first_accuracy),
          repeat_accuracy: Number(d.repeat_accuracy),
          repeat_gain: Number(d.repeat_gain),
          sequence_duration_days: Number(d.sequence_duration_days),
          activity_bucket: d.activity_bucket,
          cohort: d.cohort,
        })),
        d3.csv("/data/view3/view3_progress_bins.csv", (d) => ({
          uid: Number(d.uid),
          progress_bin: d.progress_bin,
          n: Number(d.n),
          accuracy: Number(d.accuracy),
          repeat_rate: Number(d.repeat_rate),
        })),
        d3.csv("/data/view3/view3_cohort_summary.csv", (d) => ({
          cohort: d.cohort,
          n_students: Number(d.n_students),
          avg_accuracy: Number(d.avg_accuracy),
          avg_repeat_rate: Number(d.avg_repeat_rate),
          avg_repeat_gain: Number(d.avg_repeat_gain),
          avg_interactions: Number(d.avg_interactions),
        })),
        d3.json("/data/view3/manifest.json"),
      ]);

      setTransitionData(transitionRows);
      setRepeatAccuracy(repeatRows);
      setKcDelta(kcRows);
      setManifest(manifestData);
      setRouteSummary(routeRows);
      setKcDifficulty(kcDifficultyRows);
      setRouteHierarchy(routeHierarchyData);
      setView2Manifest(view2ManifestData);
      setStudentProfiles(studentRows);
      setProgressBins(progressRows);
      setCohortSummary(cohortRows);
      setView3Manifest(view3ManifestData);
    };

    load();
  }, []);

  const repeatGain = useMemo(() => {
    const first = repeatAccuracy.find((item) => item.attempt_mode === "first");
    const repeat = repeatAccuracy.find((item) => item.attempt_mode === "repeat");
    if (!first || !repeat) return null;
    return repeat.accuracy_rate - first.accuracy_rate;
  }, [repeatAccuracy]);

  const strongestTransition = useMemo(() => {
    if (!transitionData.length) return null;
    return [...transitionData].sort((a, b) => b.pct - a.pct)[0];
  }, [transitionData]);

  const routeOptions = useMemo(
    () => [{ value: "all", label: "Todas" }, ...routeSummary.map((item) => ({ value: item.route_group, label: item.route_group_es || item.route_group }))],
    [routeSummary]
  );

  const filteredKcs = useMemo(() => {
    if (selectedRoute === "all") return kcDifficulty;
    return kcDifficulty.filter((item) => item.route_group === selectedRoute);
  }, [kcDifficulty, selectedRoute]);

  const hardestKc = useMemo(() => {
    const valid = kcDifficulty.filter((item) => Number.isFinite(item.accuracy_total));
    if (!valid.length) return null;
    return [...valid].sort((a, b) => a.accuracy_total - b.accuracy_total)[0];
  }, [kcDifficulty]);

  const strongestRoute = useMemo(() => {
    const valid = routeSummary.filter((item) => Number.isFinite(item.delta_repeat_minus_first));
    if (!valid.length) return null;
    return [...valid].sort((a, b) => b.delta_repeat_minus_first - a.delta_repeat_minus_first)[0];
  }, [routeSummary]);

  const filteredStudents = useMemo(() => {
    if (activityFilter === "all") return studentProfiles;
    return studentProfiles.filter((item) => item.activity_bucket === activityFilter);
  }, [studentProfiles, activityFilter]);

  const progressAverage = useMemo(() => {
    if (!progressBins.length) return [];
    return progressBins.reduce((acc, item) => {
      const existing = acc[item.progress_bin] ?? { progress_bin: item.progress_bin, accuracy_sum: 0, repeat_sum: 0, n: 0 };
      existing.accuracy_sum += item.accuracy;
      existing.repeat_sum += item.repeat_rate;
      existing.n += 1;
      acc[item.progress_bin] = existing;
      return acc;
    }, {});
  }, [progressBins]);

  const progressAverageRows = useMemo(() => {
    const order = ["0-25%", "25-50%", "50-75%", "75-100%"];
    return order
      .map((bin) => progressAverage[bin])
      .filter(Boolean)
      .map((item) => ({
        progress_bin: item.progress_bin,
        accuracy: item.accuracy_sum / item.n,
        repeat_rate: item.repeat_sum / item.n,
      }));
  }, [progressAverage]);

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Vista 1 · Repetición y desempeño</p>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="Interacciones válidas" value={manifest ? d3.format(",")(manifest.summary.rows) : "—"} help="Interacciones construidas desde la muestra limpia de kc_level." />
          <SummaryCard label="Estudiantes" value={manifest ? d3.format(",")(manifest.summary.students) : "—"} help="Cantidad aproximada de estudiantes presentes en esta capa analítica." />
          <SummaryCard label="Repeat rate" value={manifest ? d3.format(".1%")(manifest.summary.repeat_rate) : "—"} help="Proporción de interacciones marcadas como repetición." />
          <SummaryCard label="Ganancia en repetición" value={repeatGain !== null ? d3.format("+.2%")(repeatGain) : "—"} help="Diferencia entre accuracy de repetición y primer intento." />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Heatmap de transición</p>
          {transitionData.length ? <View1TransitionHeatmap data={transitionData} /> : null}
        </div>

        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Accuracy por intento</p>
          {repeatAccuracy.length ? <View1RepeatBarChart data={repeatAccuracy} /> : null}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-4 rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Delta por KC</p>
            <p className="mt-2 text-sm leading-7 text-slate-600">Compara la diferencia entre accuracy en repetición y accuracy en primer intento para cada KC con soporte suficiente.</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="space-y-2 text-sm text-slate-600">
              <span className="block font-medium text-slate-900">Orden</span>
              <select value={deltaMode} onChange={(event) => setDeltaMode(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none ring-0">
                <option value="improve">Mayor mejora</option>
                <option value="decline">Mayor caída</option>
              </select>
            </label>

            <label className="space-y-2 text-sm text-slate-600">
              <span className="block font-medium text-slate-900">Top N</span>
              <select value={topN} onChange={(event) => setTopN(Number(event.target.value))} className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none ring-0">
                {[5, 8, 10, 12, 15].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {kcDelta.length ? <View1KcDeltaChart data={kcDelta} topN={topN} mode={deltaMode} /> : null}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">Lectura inicial</p>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
            <li>La transición dominante es el mantenimiento de respuestas correctas.</li>
            <li>La accuracy en repetición supera levemente a la de primer intento.</li>
            <li>Existen KCs donde la repetición parece asociarse con mejoras mucho más fuertes.</li>
          </ul>
        </div>

        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">Dato a vigilar</p>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            {strongestTransition
              ? `La transición más frecuente en esta muestra es ${strongestTransition.transition_type}, con ${d3.format(".1%")(strongestTransition.pct)} del total de transiciones observadas.`
              : "Cargando resumen de transiciones."}
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Vista 2 · Dificultad por KC y ruta conceptual</p>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="Grupos de ruta" value={view2Manifest ? d3.format(",")(view2Manifest.summary.route_groups) : "—"} help="Agrupaciones de ruta conceptual detectadas desde metadata." />
          <SummaryCard label="KCs mapeados" value={view2Manifest ? d3.format(",")(view2Manifest.summary.kcs) : "—"} help="KCs con nombre y resumen de dificultad dentro de la muestra." />
          <SummaryCard label="Ruta con mayor mejora" value={strongestRoute ? strongestRoute.route_group_es || strongestRoute.route_group : "—"} help={strongestRoute ? d3.format("+.2%")(strongestRoute.delta_repeat_minus_first) : "Cargando delta por ruta."} />
          <SummaryCard label="KC más difícil" value={hardestKc ? hardestKc.kc_id : "—"} help={hardestKc ? `${hardestKc.kc_name_es || hardestKc.kc_name} · ${d3.format(".1%")(hardestKc.accuracy_total)}` : "Cargando dificultad por KC."} />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-4 rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Relación jerárquica</p>
            <p className="mt-2 text-sm leading-7 text-slate-600">Ordena la estructura grupo de ruta → ruta → KC usando la relación conceptual reportada por el paper.</p>
          </div>

          <label className="space-y-2 text-sm text-slate-600">
            <span className="block font-medium text-slate-900">Color</span>
            <select value={hierarchyMetric} onChange={(event) => setHierarchyMetric(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none ring-0">
              <option value="accuracy_total">Accuracy total</option>
              <option value="accuracy_repeat">Accuracy repetición</option>
              <option value="delta_repeat_minus_first">Delta repetición</option>
            </select>
          </label>
        </div>

        {routeHierarchy ? <View2HierarchyIcicle data={routeHierarchy} metric={hierarchyMetric} /> : null}
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-4 rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Lectura por ruta</p>
            <p className="mt-2 text-sm leading-7 text-slate-600">Resume cómo cambia el desempeño entre primer intento y repetición a nivel de grupos de ruta conceptual.</p>
          </div>

          <label className="space-y-2 text-sm text-slate-600">
            <span className="block font-medium text-slate-900">Métrica</span>
            <select value={routeMetric} onChange={(event) => setRouteMetric(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none ring-0">
              <option value="delta_repeat_minus_first">Delta repetición</option>
              <option value="accuracy_total">Accuracy total</option>
              <option value="accuracy_repeat">Accuracy repetición</option>
            </select>
          </label>
        </div>

        {routeSummary.length ? <View2RouteBarChart data={routeSummary} metric={routeMetric} /> : null}
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-4 rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Ranking por KC</p>
            <p className="mt-2 text-sm leading-7 text-slate-600">Permite revisar KCs más difíciles o aquellos donde repetir parece asociarse con mayor cambio.</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="space-y-2 text-sm text-slate-600">
              <span className="block font-medium text-slate-900">Ruta</span>
              <select value={selectedRoute} onChange={(event) => setSelectedRoute(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none ring-0">
                {routeOptions.map((route) => (
                  <option key={route.value} value={route.value}>
                    {route.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm text-slate-600">
              <span className="block font-medium text-slate-900">Modo</span>
              <select value={kcMode} onChange={(event) => setKcMode(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none ring-0">
                <option value="hardest">Más difíciles</option>
                <option value="improve">Mayor mejora</option>
                <option value="decline">Mayor caída</option>
              </select>
            </label>

            <label className="space-y-2 text-sm text-slate-600">
              <span className="block font-medium text-slate-900">Top N</span>
              <select value={topN} onChange={(event) => setTopN(Number(event.target.value))} className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none ring-0">
                {[5, 8, 10, 12, 15].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {filteredKcs.length ? <View2KcRankingChart data={filteredKcs} topN={topN} mode={kcMode} /> : null}
      </section>

      <section className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Vista 3 · Perfil de estudiantes</p>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="Estudiantes perfilados" value={view3Manifest ? d3.format(",")(view3Manifest.summary.students) : "—"} help="Perfiles agregados desde la tabla de interacción." />
          <SummaryCard label="Cohortes" value={view3Manifest ? d3.format(",")(view3Manifest.summary.cohorts) : "—"} help="Agrupaciones simples según accuracy y repetición." />
          <SummaryCard label="Ganancia promedio" value={view3Manifest ? d3.format("+.2%")(view3Manifest.summary.avg_repeat_gain) : "—"} help="Cambio medio entre accuracy de repetición y primer intento." />
          <SummaryCard label="Filtro actual" value={activityFilter === "all" ? "Todas" : activityFilter} help="Permite observar perfiles por nivel de actividad." />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-4 rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Dispersión de perfiles</p>
            <p className="mt-2 text-sm leading-7 text-slate-600">Relaciona tasa de repetición, ganancia observada y volumen de interacciones por estudiante.</p>
          </div>
          <label className="space-y-2 text-sm text-slate-600">
            <span className="block font-medium text-slate-900">Actividad</span>
            <select value={activityFilter} onChange={(event) => setActivityFilter(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none ring-0">
              {["all", "baja", "media", "alta", "muy alta"].map((value) => (
                <option key={value} value={value}>
                  {value === "all" ? "Todas" : value}
                </option>
              ))}
            </select>
          </label>
        </div>
        {filteredStudents.length ? <View3StudentScatter data={filteredStudents} /> : null}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Progreso dentro de la secuencia</p>
          {progressAverageRows.length ? <View3ProgressLineChart data={progressAverageRows} /> : null}
        </div>
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Distribución de cohortes</p>
          {cohortSummary.length ? <View3CohortBars data={cohortSummary} /> : null}
        </div>
      </section>
    </div>
  );
}

export default VisualizationsPage;
