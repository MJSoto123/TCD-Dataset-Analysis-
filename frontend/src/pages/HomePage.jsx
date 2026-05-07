import { BookOpenText, BrainCircuit, Database, GitBranch, Network, ScrollText } from "lucide-react";
import SectionCard from "../components/layout/SectionCard";

const proposalCards = [
  {
    title: "Visión del sistema",
    text: "Visualizar el conocimiento de un área, detectar fortalezas y debilidades, sugerir práctica puntual o integral, y luego recomendar ejercicios y rutas de repaso según el desempeño del estudiante.",
    icon: ScrollText,
  },
  {
    title: "Motivación principal",
    text: "El objetivo de fondo es ayudar a un estudiante a practicar de forma más efectiva: aprender más resolviendo menos ejercicios, identificar qué áreas domina, qué áreas necesita reforzar y qué camino de repaso le conviene seguir.",
    icon: BrainCircuit,
  },
  {
    title: "Propuesta",
    text: "Construir una experiencia web que permita visualizar el estado del conocimiento del estudiante, distinguir entre práctica integral y práctica puntual, y sentar las bases para recomendar ejercicios relevantes y rutas de repaso teórico según el desempeño observado.",
    icon: Network,
  },
  {
    title: "Enfoque",
    text: "Antes de llegar a esa recomendación, este trabajo se apoya en Knowledge Tracing para entender cómo modelar secuencias de interacción, repetición, dificultad conceptual y evolución del desempeño. Las hipótesis del dashboard organizan ese análisis.",
    icon: BrainCircuit,
  },
];

const papers = [
  {
    title: "XES3G5M: A Knowledge Tracing Benchmark Dataset with Auxiliary Information",
    type: "Paper fuente del dataset",
    note: "NeurIPS 2023. Es la base para entender el origen del dataset, su escala y el valor de la información auxiliar como rutas de KC, tipos de pregunta, contenido y análisis.",
    icon: Database,
    linkLabel: "Ver paper",
    href: "https://proceedings.neurips.cc/paper_files/paper/2023/hash/67fc628f17c2ad53621fb961c6bafcaf-Abstract-Datasets_and_Benchmarks.html",
  },
  {
    title: "Knowledge Tracing: A Survey 2023",
    type: "Survey del área",
    note: "Nos ayuda a ubicar el problema dentro de Knowledge Tracing y a entender por qué modelar secuencias históricas es un paso previo para construir apoyo personalizado al aprendizaje.",
    icon: BookOpenText,
    linkLabel: "Ver paper",
    href: "https://dl.acm.org/doi/10.1145/3569576",
  },
  {
    title: "A survey of deep learning based knowledge tracing from cognitive processing perspective",
    type: "Survey técnico",
    note: "Sirve para entender las familias de modelos, el rol de las secuencias históricas y cómo distintos enfoques estiman el estado de conocimiento del estudiante.",
    icon: BrainCircuit,
    linkLabel: "Ver paper",
    href: "https://www.sciencedirect.com/science/article/abs/pii/S0925231225025512",
  },
  {
    title: "Personalized Learning Path Recommendation Based on Knowledge Graphs: A Survey",
    type: "Trabajo relacionado",
    note: "Aporta contexto para la meta posterior del proyecto: recomendar caminos de práctica y repaso usando relaciones conceptuales entre contenidos.",
    icon: GitBranch,
    linkLabel: "Ver paper",
    href: "https://www.mdpi.com/2079-9292/15/1/238",
  },
];

function HomePage() {
  return (
    <div className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-2">
        {proposalCards.map(({ title, text, icon: Icon }) => (
          <SectionCard key={title} title={title}>
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-brand-50 p-3 text-brand-700">
                <Icon className="h-5 w-5" />
              </div>
              <p>{text}</p>
            </div>
          </SectionCard>
        ))}
      </div>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Papers relacionados</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            Base teórica y antecedentes utilizados
          </h3>
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          {papers.map((paper) => {
            const Icon = paper.icon;
            return (
            <SectionCard key={paper.title} title="">
              <div className="mb-4 flex items-start gap-3">
                <div className="inline-flex rounded-2xl bg-brand-50 p-3 text-brand-700">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-slate-950">{paper.title}</h4>
                  <p className="mt-1 font-medium text-brand-700">{paper.type}</p>
                </div>
              </div>
              <p>{paper.note}</p>
              <a
                href={paper.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
              >
                <BookOpenText className="h-3.5 w-3.5" />
                {paper.linkLabel}
              </a>
            </SectionCard>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
