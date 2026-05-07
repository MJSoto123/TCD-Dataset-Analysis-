import { createColumnHelper } from "@tanstack/react-table";
import DataTable from "../components/data/DataTable";

const columnHelper = createColumnHelper();

const generalRows = [
  { campo: "Entradas analizadas", valor: "10,000" },
  { campo: "Columnas", valor: "7" },
  { campo: "Estudiantes únicos aproximados", valor: "4,681" },
  { campo: "Preguntas únicas aproximadas", valor: "7,103" },
  { campo: "KCs únicos aproximados", valor: "1,256" },
  { campo: "Interacciones válidas estimadas", valor: "1,441,744" },
  { campo: "Longitud válida promedio", valor: "144.17" },
  { campo: "Accuracy general", valor: "79.45%" },
];

const hypothesisRows = [
  {
    hipotesis: "H1",
    pregunta: "¿La repetición se asocia con cambios en el desempeño del estudiante?",
    foco: "responses, repetición, transiciones entre intentos",
  },
  {
    hipotesis: "H2",
    pregunta: "¿Existen KCs o rutas conceptuales cuya dificultad persiste?",
    foco: "concepts, dificultad por KC, rutas conceptuales",
  },
  {
    hipotesis: "H3",
    pregunta: "¿La estructura de las secuencias permite distinguir perfiles de estudiantes?",
    foco: "longitud de secuencia, actividad, accuracy, repetición",
  },
];

const responseRows = [
  { respuesta: "0", conteo: "296,289", porcentaje: "20.55%" },
  { respuesta: "1", conteo: "1,145,455", porcentaje: "79.45%" },
];

const sequenceRows = [
  { columna: "questions", media: "200", mediana: "200", minimo: "200", maximo: "200", observacion: "Longitud fija por entrada." },
  { columna: "concepts", media: "200", mediana: "200", minimo: "200", maximo: "200", observacion: "Longitud fija por entrada." },
  { columna: "responses", media: "200", mediana: "200", minimo: "200", maximo: "200", observacion: "Longitud fija por entrada." },
  { columna: "timestamps", media: "200", mediana: "200", minimo: "200", maximo: "200", observacion: "Longitud fija por entrada." },
  { columna: "selectmasks", media: "200", mediana: "200", minimo: "200", maximo: "200", observacion: "La validez real depende de la máscara." },
];

const topKcRows = [
  { kc: "78", conteo: "34,867" },
  { kc: "55", conteo: "27,187" },
  { kc: "155", conteo: "24,901" },
  { kc: "138", conteo: "22,991" },
  { kc: "18", conteo: "22,579" },
];

const topQuestionRows = [
  { pregunta: "182", conteo: "4,124" },
  { pregunta: "313", conteo: "3,129" },
  { pregunta: "181", conteo: "3,127" },
  { pregunta: "372", conteo: "3,012" },
  { pregunta: "409", conteo: "2,584" },
];

const difficultyRows = [
  { kc: "627", n: "113", accuracy: "2.65%" },
  { kc: "399_400", n: "234", accuracy: "17.52%" },
  { kc: "257_261", n: "542", accuracy: "19.56%" },
  { kc: "604", n: "106", accuracy: "20.75%" },
  { kc: "380", n: "776", accuracy: "26.42%" },
];

const generalColumns = [
  columnHelper.accessor("campo", {
    header: "Campo",
    cell: (info) => <span className="font-medium text-slate-900">{info.getValue()}</span>,
  }),
  columnHelper.accessor("valor", {
    header: "Valor",
  }),
];

const hypothesisColumns = [
  columnHelper.accessor("hipotesis", {
    header: "Hipótesis",
    cell: (info) => <span className="font-medium text-slate-900">{info.getValue()}</span>,
  }),
  columnHelper.accessor("pregunta", {
    header: "Pregunta",
  }),
  columnHelper.accessor("foco", {
    header: "Foco",
  }),
];

const responseColumns = [
  columnHelper.accessor("respuesta", {
    header: "Respuesta",
    cell: (info) => <span className="font-medium text-slate-900">{info.getValue()}</span>,
  }),
  columnHelper.accessor("conteo", {
    header: "Conteo",
  }),
  columnHelper.accessor("porcentaje", {
    header: "Porcentaje",
  }),
];

const sequenceColumns = [
  columnHelper.accessor("columna", {
    header: "Columna",
    cell: (info) => <span className="font-medium text-slate-900">{info.getValue()}</span>,
  }),
  columnHelper.accessor("media", {
    header: "Media",
  }),
  columnHelper.accessor("mediana", {
    header: "Mediana",
  }),
  columnHelper.accessor("minimo", {
    header: "Mínimo",
  }),
  columnHelper.accessor("maximo", {
    header: "Máximo",
  }),
  columnHelper.accessor("observacion", {
    header: "Observación",
  }),
];

const topKcColumns = [
  columnHelper.accessor("kc", {
    header: "KC",
    cell: (info) => <span className="font-medium text-slate-900">{info.getValue()}</span>,
  }),
  columnHelper.accessor("conteo", {
    header: "Conteo",
  }),
];

const topQuestionColumns = [
  columnHelper.accessor("pregunta", {
    header: "Pregunta",
    cell: (info) => <span className="font-medium text-slate-900">{info.getValue()}</span>,
  }),
  columnHelper.accessor("conteo", {
    header: "Conteo",
  }),
];

const difficultyColumns = [
  columnHelper.accessor("kc", {
    header: "KC",
    cell: (info) => <span className="font-medium text-slate-900">{info.getValue()}</span>,
  }),
  columnHelper.accessor("n", {
    header: "n",
  }),
  columnHelper.accessor("accuracy", {
    header: "Accuracy",
  }),
];

function AedPage() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Resumen general</p>
        <DataTable columns={generalColumns} data={generalRows} />
      </section>

      <section className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Hipótesis de trabajo</p>
        <DataTable columns={hypothesisColumns} data={hypothesisRows} />
      </section>

      <section className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Distribución de respuestas</p>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <DataTable columns={responseColumns} data={responseRows} />
          <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm">
            <img
              src="/eda/response_distribution.png"
              alt="Distribución de respuestas"
              className="h-full w-full rounded-2xl object-contain"
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Estructura de las secuencias</p>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <DataTable columns={sequenceColumns} data={sequenceRows} />
          <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm">
            <img
              src="/eda/sequence_length_distribution.png"
              alt="Distribución de longitud de secuencia"
              className="h-full w-full rounded-2xl object-contain"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">KCs más frecuentes</p>
          <div className="space-y-6">
            <DataTable columns={topKcColumns} data={topKcRows} />
            <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm">
              <img src="/eda/top_kcs.png" alt="Top KCs" className="h-full w-full rounded-2xl object-contain" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Preguntas más frecuentes</p>
          <div className="space-y-6">
            <DataTable columns={topQuestionColumns} data={topQuestionRows} />
            <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm">
              <img
                src="/eda/top_questions.png"
                alt="Top preguntas"
                className="h-full w-full rounded-2xl object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Muestra de dificultad por KC</p>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <DataTable columns={difficultyColumns} data={difficultyRows} />
          <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm">
            <img src="/eda/kc_difficulty.png" alt="Dificultad por KC" className="h-full w-full rounded-2xl object-contain" />
          </div>
        </div>
      </section>
    </div>
  );
}

export default AedPage;
