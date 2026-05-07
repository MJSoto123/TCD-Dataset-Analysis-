import { ArrowRight, DatabaseZap, FlaskConical, Search, Sparkles, Waypoints } from "lucide-react";
import SectionCard from "../components/layout/SectionCard";

const pipelineSteps = [
  {
    title: "Tema, problema y preguntas",
    text: "El proyecto parte de la idea de visualizar el conocimiento del estudiante y, más adelante, recomendar práctica puntual o integral según su desempeño.",
    items: [
      "Se definió una motivación centrada en práctica efectiva y rutas de repaso.",
      "Se conectó el problema con Knowledge Tracing como base conceptual.",
      "Se eligieron papers de contexto, benchmark y recomendación.",
    ],
    icon: Sparkles,
  },
  {
    title: "Inventario y metadata",
    text: "Con el notebook 01 se revisó XES3G5M, se identificaron los CSV y JSON principales y se entendió cómo se separan question_level, kc_level y metadata.",
    items: [
      "Se inventariaron los archivos principales del dataset.",
      "Se verificó la presencia de metadata en questions.json y kc_routes_map.json.",
      "Se distinguieron los niveles question_level, kc_level y metadata.",
    ],
    icon: DatabaseZap,
  },
  {
    title: "Data wrangling",
    text: "Con los notebooks 02 y 04 al 08 se trabajó el wrangling de muestras de 10,000 filas para limpiar secuencias serializadas, revisar calidad y guardar salidas intermedias por archivo.",
    items: [
      "Se trabajó con muestras controladas de 10,000 filas por archivo.",
      "Se limpiaron secuencias, nulos, duplicados y columnas serializadas.",
      "Se guardaron salidas separadas para no sobreescribir resultados.",
    ],
    icon: FlaskConical,
  },
  {
    title: "Análisis exploratorio",
    text: "Con los notebooks 03 y 09 al 13 se exploraron longitudes de secuencia, respuestas, preguntas, KCs y repetición para obtener una lectura inicial del comportamiento del dataset.",
    items: [
      "Se revisaron distribuciones de respuestas y longitudes de secuencia.",
      "Se identificaron patrones iniciales sobre preguntas, KCs y repetición.",
      "Se exportaron tablas, figuras y archivos auxiliares para dashboard.",
    ],
    icon: Search,
  },
  {
    title: "Documentación y dashboard",
    text: "Después se organizó la arquitectura en docs y se inició el frontend del dashboard para presentar contexto, dataset, pipeline, wrangling, AED y visualizaciones interactivas.",
    items: [
      "Se documentaron hipótesis, vistas y datasets intermedios en docs.",
      "Se creó la estructura dashboard con scripts, data y frontend.",
      "Se inició una app con Vite, React, D3, Tailwind y Lucide.",
    ],
    icon: Waypoints,
  },
];

function PipelinePage() {
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Etapas del proyecto</p>
        </div>
        <div className="space-y-4">
          {pipelineSteps.map(({ title, text, items, icon: Icon }, index) => (
            <div key={title} className="space-y-3">
              <SectionCard title="">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-brand-50 p-3 text-brand-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{title}</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{text}</p>
                    <ul className="mt-3 space-y-2 text-sm text-slate-600">
                      {items.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand-600" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </SectionCard>
              {index < pipelineSteps.length - 1 ? (
                <div className="flex justify-center">
                  <ArrowRight className="h-5 w-5 rotate-90 text-slate-300" />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default PipelinePage;
