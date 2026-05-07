import { useEffect, useState } from "react";
import { BookOpenText, Boxes, CircleDot, MessageSquareText, Users } from "lucide-react";
import PageHero from "../components/layout/PageHero";
import SectionCard from "../components/layout/SectionCard";

const repositoryCards = [
  {
    title: "question_level/",
    description:
      "Contiene secuencias a nivel de pregunta. Incluye archivos de train/valid, test y versiones con ventanas. Es útil para estudiar preguntas específicas, frecuencia de interacción y estructura secuencial.",
    details: [
      "train_valid_sequences_quelevel.csv",
      "test_quelevel.csv",
      "test_window_sequences_quelevel.csv",
    ],
  },
  {
    title: "kc_level/",
    description:
      "Contiene secuencias a nivel de knowledge component. Es el repositorio más importante para nuestras hipótesis de repetición, desempeño y dificultad conceptual porque incorpora `is_repeat`.",
    details: ["train_valid_sequences.csv", "test.csv", "test_question_window_sequences.csv"],
  },
  {
    title: "metadata/",
    description:
      "Incluye información auxiliar del dataset: preguntas, rutas conceptuales, embeddings y otros recursos que enriquecen el análisis y permiten conectar interacciones con contenido semántico.",
    details: ["questions.json", "kc_routes_map.json", "embeddings y metadata adicional"],
  },
];

const scaleMetrics = [
  { label: "Estudiantes", value: "18,066", icon: Users },
  { label: "Interacciones", value: "5,549,635", icon: MessageSquareText },
  { label: "Preguntas", value: "7,652", icon: BookOpenText },
  { label: "KCs", value: "865", icon: Boxes },
];

function DatasetPage() {
  return (
    <div className="space-y-8">
      <PageHero
        eyebrow=""
        title="XES3G5M"
        description="XES3G5M es un benchmark de Knowledge Tracing presentado en NeurIPS 2023. El dataset fue construido a partir de una plataforma real de aprendizaje online de matemática K-12 en China y reúne millones de interacciones estudiantiles junto con información auxiliar sobre preguntas, tipos de ejercicio, timestamps y rutas conceptuales."
        aside={
          <>
            <p className="font-semibold text-slate-900">Por qué destaca</p>
            <p className="mt-2">
              Además de secuencias de interacción, el dataset incluye contenido de preguntas, análisis, tipos de
              ejercicio y relaciones entre KCs, lo que lo vuelve especialmente útil para estudiar práctica,
              dificultad conceptual y recomendación.
            </p>
          </>
        }
      />

      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Escala del dataset</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {scaleMetrics.map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
              <div className="rounded-2xl bg-brand-50 p-3 text-brand-700">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  <CountUpValue value={value} />
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Unidad de análisis</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <SectionCard title="">
            <p>
              Una <strong>interacción</strong> es el evento en el que un estudiante responde un ejercicio.
            </p>
            <p>
              En XES3G5M no siempre hay una interacción por entrada: muchas veces una entrada guarda una secuencia completa,
              por eso luego hace falta descomponer esas secuencias con wrangling.
            </p>
          </SectionCard>

          <SectionCard title="">
            <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {["uid", "questions", "concepts / kc", "responses", "timestamps", "is_repeat"].map((field) => (
                <div key={field} className="flex items-center gap-3 text-sm font-medium text-slate-900">
                  <CircleDot className="h-3.5 w-3.5 text-brand-600" />
                  <span>{field}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">
            Estructura interna del dataset
          </p>
        </div>
        <div className="grid gap-6 xl:grid-cols-3">
          {repositoryCards.map((repository) => (
            <SectionCard key={repository.title} title={repository.title}>
              <p>{repository.description}</p>
              <ul className="list-disc space-y-1 pl-5">
                {repository.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </SectionCard>
          ))}
        </div>
      </section>
    </div>
  );
}

function CountUpValue({ value }) {
  const numericValue = Number(String(value).replaceAll(",", ""));
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!Number.isFinite(numericValue)) return;

    const duration = 2200;
    const start = performance.now();
    let animationFrame;

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(numericValue * eased));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(tick);
      }
    };

    animationFrame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animationFrame);
  }, [numericValue]);

  return new Intl.NumberFormat("en-US").format(displayValue);
}

export default DatasetPage;
