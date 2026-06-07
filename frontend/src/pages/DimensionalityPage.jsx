import { BrainCircuit, GitBranch, Layers3, UserRoundSearch } from "lucide-react";
import * as d3 from "d3";
import { useEffect, useMemo, useState } from "react";
import View4StudentEmbeddingScatter from "../components/charts/View4StudentEmbeddingScatter";
import SectionCard from "../components/layout/SectionCard";

const currentScope = [
  {
    title: "Objetivo inmediato",
    text: "Construir una vista de reducción de dimensionalidad para perfiles de estudiantes usando variables agregadas de desempeño, repetición, cobertura conceptual y actividad. Esta será la Vista 4A del dashboard.",
    icon: UserRoundSearch,
  },
  {
    title: "Por qué no va en AED",
    text: "Las vistas actuales del AED responden hipótesis exploratorias sobre repetición, dificultad y perfiles. La reducción de dimensionalidad pertenece al nuevo proyecto porque busca representar estructuras latentes y mapas de similitud entre entidades.",
    icon: Layers3,
  },
  {
    title: "Entrada principal",
    text: "La base inicial más razonable es view3_student_profiles.csv, porque ya resume variables útiles por estudiante: accuracy total, repeat rate, cobertura de preguntas/KCs, interacción total, duración y cohortes.",
    icon: BrainCircuit,
  },
  {
    title: "Siguiente extensión",
    text: "Después de la Vista 4A se puede construir una Vista 4B para KCs o conceptos, lo que conectaría mejor con el futuro grafo de conocimiento y con la visualización del dominio matemático.",
    icon: GitBranch,
  },
];

const proposedFeatures = [
  "n_interactions",
  "n_questions",
  "n_kcs",
  "accuracy_total",
  "repeat_rate",
  "first_accuracy",
  "repeat_accuracy",
  "repeat_gain",
  "sequence_duration_days",
];

const methods = [
  {
    name: "PCA",
    role: "Baseline explicable",
    note: "Útil para justificar la transformación y reportar varianza explicada con una técnica clásica y académicamente defendible.",
  },
  {
    name: "UMAP",
    role: "Vista principal",
    note: "Más adecuado para una visualización interactiva de vecindades y posibles agrupamientos de estudiantes en 2D.",
  },
  {
    name: "t-SNE",
    role: "Comparación opcional",
    note: "Puede explorarse más adelante, pero no es necesario como primera entrega porque complica más la interpretación global.",
  },
];

function DimensionalityPage() {
  const [embeddingRows, setEmbeddingRows] = useState([]);
  const [manifest, setManifest] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [rows, manifestData] = await Promise.all([
          d3.csv("/data/view4/view4_student_embedding.csv", (d) => ({
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
            x_pca: Number(d.x_pca),
            y_pca: Number(d.y_pca),
            x_view: Number(d.x_view),
            y_view: Number(d.y_view),
            projection_method: d.projection_method,
          })),
          d3.json("/data/view4/manifest.json"),
        ]);

        setEmbeddingRows(rows);
        setManifest(manifestData);
      } catch (_error) {
        setEmbeddingRows([]);
        setManifest(null);
      }
    };

    load();
  }, []);

  const varianceText = useMemo(() => {
    if (!manifest?.pca_explained_variance_ratio?.length) return null;
    const [pc1, pc2] = manifest.pca_explained_variance_ratio;
    return `${d3.format(".1%")(pc1)} + ${d3.format(".1%")(pc2)} = ${d3.format(".1%")(pc1 + pc2)} de varianza explicada en 2D`;
  }, [manifest]);

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Vista 4 · Reducción de dimensionalidad</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            Nuevo frente del proyecto: mapa latente de perfiles de estudiantes
          </h2>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600">
            Esta sección se separa del AED porque ya no busca solo resumir hipótesis exploratorias, sino abrir una nueva
            línea del proyecto: representar estudiantes en un espacio latente 2D a partir de variables agregadas de
            desempeño, repetición, cobertura y actividad. La idea es detectar agrupamientos, perfiles similares y outliers
            que luego puedan conectarse con el grafo de conocimiento del proyecto.
          </p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        {currentScope.map(({ title, text, icon: Icon }) => (
          <SectionCard key={title} title={title}>
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-brand-50 p-3 text-brand-700">
                <Icon className="h-5 w-5" />
              </div>
              <p>{text}</p>
            </div>
          </SectionCard>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <SectionCard title="Features iniciales propuestas">
          <div className="space-y-3 text-sm leading-7 text-slate-600">
            <p>
              La primera versión de la vista debe partir de los perfiles ya agregados por estudiante. Estas variables son
              suficientes para construir un embedding inicial sin depender todavía de un modelo complejo de Knowledge Tracing.
            </p>
            <ul className="grid gap-x-6 gap-y-2 md:grid-cols-2">
              {proposedFeatures.map((feature) => (
                <li key={feature} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 font-mono text-xs text-slate-700">
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </SectionCard>

        <SectionCard title="Lectura esperada de la vista 4A">
          <div className="space-y-3 text-sm leading-7 text-slate-600">
            <p>Con una proyección 2D bien construida, esta vista debería permitir identificar:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>estudiantes con comportamiento similar aunque no pertenezcan a la misma cohorte nominal;</li>
              <li>perfiles activos pero frágiles frente a perfiles eficientes y estables;</li>
              <li>outliers con mucha cobertura conceptual pero bajo desempeño;</li>
              <li>regiones densas del espacio de estudiantes que luego puedan cruzarse con rutas o ramas del conocimiento.</li>
            </ul>
          </div>
        </SectionCard>
      </section>

      <section className="space-y-4">
        <div className="grid gap-5 md:grid-cols-3">
          <SectionCard title="Estudiantes proyectados">
            <p className="text-3xl font-semibold text-slate-950">{manifest ? d3.format(",")(manifest.rows) : "—"}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">Cantidad de perfiles estudiantiles incluidos en la proyección actual.</p>
          </SectionCard>
          <SectionCard title="Método disponible">
            <p className="text-3xl font-semibold uppercase text-slate-950">{manifest?.projection_method ?? "PCA"}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">En esta iteración se usa PCA como baseline explicable; UMAP queda para una versión posterior.</p>
          </SectionCard>
          <SectionCard title="Varianza explicada">
            <p className="text-lg font-semibold text-slate-950">{varianceText ?? "Pendiente"}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">Lectura útil para saber cuánto de la estructura original se conserva en la vista 2D.</p>
          </SectionCard>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Vista 4A operativa</p>
        </div>
        {embeddingRows.length ? (
          <View4StudentEmbeddingScatter data={embeddingRows} />
        ) : (
          <SectionCard title="Dataset pendiente">
            <p className="text-sm leading-7 text-slate-600">
              Todavía no se encuentra <code>dashboard/data/view4/view4_student_embedding.csv</code>. El siguiente paso es
              ejecutar el script <code>dashboard/scripts/build_view4_datasets.py</code> para generar esta vista.
            </p>
          </SectionCard>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Métodos propuestos</p>
        </div>
        <div className="grid gap-6 xl:grid-cols-3">
          {methods.map((method) => (
            <SectionCard key={method.name} title={method.name}>
              <p className="text-sm font-semibold text-brand-700">{method.role}</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">{method.note}</p>
            </SectionCard>
          ))}
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-dashed border-brand-300 bg-brand-50/50 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Estado actual</p>
        <h3 className="mt-2 text-lg font-semibold text-slate-950">La sección ya quedó separada del AED; el siguiente paso es generar view4.</h3>
        <p className="mt-3 text-sm leading-7 text-slate-700">
          En la siguiente iteración conviene construir los datasets de <code>dashboard/data/view4/</code> a partir de
          <code> view3_student_profiles.csv</code>, aplicando normalización de variables y exportando coordenadas PCA y
          UMAP para el scatterplot interactivo.
        </p>
      </section>
    </div>
  );
}

export default DimensionalityPage;
