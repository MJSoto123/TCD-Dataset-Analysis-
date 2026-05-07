import { createColumnHelper } from "@tanstack/react-table";
import DataTable from "../components/data/DataTable";

const columnHelper = createColumnHelper();

const sourceSummary = [
  { campo: "Archivo base trabajado", valor: "question_level/train_valid_sequences_quelevel.csv" },
  { campo: "Muestra usada", valor: "10,000 entradas" },
  { campo: "Columnas", valor: "7" },
  { campo: "Granularidad probable", valor: "secuencia de aprendizaje" },
];

const unitRows = [
  { elemento: "Entrada", representa: "Una secuencia de aprendizaje serializada.", lectura: "No equivale a una sola respuesta individual." },
  { elemento: "Interacción", representa: "Un evento puntual donde el estudiante responde un ejercicio.", lectura: "Se obtiene al descomponer questions, concepts, responses y timestamps." },
  { elemento: "Estudiante", representa: "Usuario identificado por uid.", lectura: "Una misma persona puede aparecer en varias entradas." },
  { elemento: "Granularidad", representa: "Secuencia e interacción.", lectura: "El dataset mezcla nivel de entrada con nivel de evento." },
];

const scaleRows = [
  { aspecto: "Volumen del dataset original", decision: "No cargarlo completo para el primer análisis.", evidencia: "El conjunto ronda varios GB y contiene millones de interacciones." },
  { aspecto: "Capacidad de procesamiento", decision: "Trabajar con muestras controladas.", evidencia: "Se buscó no comprometer CPU, RAM ni reproducibilidad." },
  { aspecto: "Tamaño de muestra", decision: "10,000 entradas por archivo.", evidencia: "Permite comparar archivos sin sobrecargar el entorno." },
];

const attributeRows = [
  { atributo: "fold", tipo: "int64", rol: "partición", nulos: "0", unicos: "2", observacion: "Identifica split dentro de la muestra." },
  { atributo: "uid", tipo: "int64", rol: "identificador", nulos: "0", unicos: "4,681", observacion: "Corresponde al estudiante." },
  { atributo: "questions", tipo: "object", rol: "secuencia", nulos: "0", unicos: "9,993", observacion: "Lista serializada de preguntas." },
  { atributo: "concepts", tipo: "object", rol: "secuencia", nulos: "0", unicos: "9,991", observacion: "Lista serializada de KCs o conceptos." },
  { atributo: "responses", tipo: "object", rol: "secuencia", nulos: "0", unicos: "9,689", observacion: "Respuestas 0/1 y padding." },
  { atributo: "timestamps", tipo: "object", rol: "secuencia", nulos: "0", unicos: "10,000", observacion: "Tiempos serializados por interacción." },
  { atributo: "selectmasks", tipo: "object", rol: "secuencia", nulos: "0", unicos: "198", observacion: "Distingue posiciones válidas y padding." },
];

const formatRows = [
  { aspecto: "Formato de questions, concepts, responses y timestamps", estado: "No adecuado para análisis directo", lectura: "Llegan como texto serializado y requieren parsing." },
  { aspecto: "Datos categóricos", estado: "Presentes dentro de secuencias", lectura: "Preguntas y conceptos funcionan como identificadores categóricos." },
  { aspecto: "Unidades de medida", estado: "Heterogéneas", lectura: "timestamps representa tiempo; responses representa acierto/error binario." },
  { aspecto: "Conversión necesaria", estado: "Sí", lectura: "Hay que pasar de secuencias serializadas a interacciones válidas." },
];

const qualityRows = [
  { indicador: "Duplicados exactos", valor: "0", lectura: "No se detectaron duplicados exactos en la muestra base." },
  { indicador: "Columnas con nulos", valor: "0 de 7", lectura: "No aparecen valores faltantes a nivel de entrada." },
  { indicador: "Interacciones válidas estimadas", valor: "1,441,744", lectura: "Se consideran posiciones válidas según selectmasks." },
  { indicador: "Posiciones de padding", valor: "558,256", lectura: "Parte de la secuencia corresponde a relleno." },
  { indicador: "Accuracy aproximado", valor: "79.45%", lectura: "Tasa inicial observada en la muestra base." },
];

const temporalRows = [
  { aspecto: "Dependencia temporal", estado: "Sí", lectura: "Existen timestamps y orden dentro de la secuencia." },
  { aspecto: "Serie temporal clásica", estado: "No exactamente", lectura: "Es un problema secuencial de interacciones, no una serie agregada por periodos fijos." },
  { aspecto: "Variable de salida potencial", estado: "responses", lectura: "Puede interpretarse como señal binaria de acierto/error en un problema supervisado secuencial." },
];

const outlierRows = [
  { foco: "Longitud de secuencia", decision: "Revisar valores extremos antes de eliminar", lectura: "Pueden ser estudiantes muy activos y no necesariamente errores." },
  { foco: "Duración temporal", decision: "Interpretar con cuidado", lectura: "Intervalos grandes podrían reflejar pausas reales y no ruido." },
  { foco: "Cantidad de interacciones válidas", decision: "Conservar en esta etapa", lectura: "Todavía no hay evidencia suficiente para tratarlos como errores de carga." },
];

const transformationRows = [
  { paso: "Muestreo", decision: "Se trabajó con muestras de 10,000 entradas por archivo.", motivo: "Reducir costo de memoria y mantener reproducibilidad." },
  { paso: "Parsing", decision: "Se interpretaron columnas serializadas como secuencias.", motivo: "El dataset no viene listo como una interacción por registro." },
  { paso: "Máscaras", decision: "Se usó selectmasks para separar valores válidos de padding.", motivo: "Evitar contar relleno como interacción real." },
  { paso: "Outputs", decision: "Cada notebook guarda salidas con prefijo propio.", motivo: "No sobreescribir tablas, notas ni figuras entre archivos." },
];

const detectedProblems = [
  "Las columnas principales llegan como secuencias serializadas y no en formato analítico directo.",
  "Las entradas mezclan interacciones válidas con padding, por eso selectmasks es indispensable.",
  "Una entrada no equivale a una sola interacción, lo que introduce una diferencia de granularidad.",
  "El volumen del dataset obliga a trabajar primero con muestras controladas.",
  "La presencia de timestamps vuelve importante respetar el orden secuencial al interpretar los datos.",
];

const sourceColumns = [
  columnHelper.accessor("campo", {
    header: "Campo",
    cell: (info) => <span className="font-medium text-slate-900">{info.getValue()}</span>,
  }),
  columnHelper.accessor("valor", {
    header: "Valor",
  }),
];

const unitColumns = [
  columnHelper.accessor("elemento", {
    header: "Elemento",
    cell: (info) => <span className="font-medium text-slate-900">{info.getValue()}</span>,
  }),
  columnHelper.accessor("representa", {
    header: "Representa",
  }),
  columnHelper.accessor("lectura", {
    header: "Lectura",
  }),
];

const scaleColumns = [
  columnHelper.accessor("aspecto", {
    header: "Aspecto",
    cell: (info) => <span className="font-medium text-slate-900">{info.getValue()}</span>,
  }),
  columnHelper.accessor("decision", {
    header: "Decisión",
  }),
  columnHelper.accessor("evidencia", {
    header: "Evidencia",
  }),
];

const attributeColumns = [
  columnHelper.accessor("atributo", {
    header: "Atributo",
    cell: (info) => <span className="font-medium text-slate-900">{info.getValue()}</span>,
  }),
  columnHelper.accessor("tipo", {
    header: "Tipo",
  }),
  columnHelper.accessor("rol", {
    header: "Rol",
  }),
  columnHelper.accessor("nulos", {
    header: "Nulos",
  }),
  columnHelper.accessor("unicos", {
    header: "Únicos",
  }),
  columnHelper.accessor("observacion", {
    header: "Observación",
  }),
];

const formatColumns = [
  columnHelper.accessor("aspecto", {
    header: "Aspecto",
    cell: (info) => <span className="font-medium text-slate-900">{info.getValue()}</span>,
  }),
  columnHelper.accessor("estado", {
    header: "Estado",
  }),
  columnHelper.accessor("lectura", {
    header: "Lectura",
  }),
];

const qualityColumns = [
  columnHelper.accessor("indicador", {
    header: "Indicador",
    cell: (info) => <span className="font-medium text-slate-900">{info.getValue()}</span>,
  }),
  columnHelper.accessor("valor", {
    header: "Valor",
  }),
  columnHelper.accessor("lectura", {
    header: "Lectura",
  }),
];

const temporalColumns = [
  columnHelper.accessor("aspecto", {
    header: "Aspecto",
    cell: (info) => <span className="font-medium text-slate-900">{info.getValue()}</span>,
  }),
  columnHelper.accessor("estado", {
    header: "Estado",
  }),
  columnHelper.accessor("lectura", {
    header: "Lectura",
  }),
];

const outlierColumns = [
  columnHelper.accessor("foco", {
    header: "Foco",
    cell: (info) => <span className="font-medium text-slate-900">{info.getValue()}</span>,
  }),
  columnHelper.accessor("decision", {
    header: "Decisión",
  }),
  columnHelper.accessor("lectura", {
    header: "Lectura",
  }),
];

const transformationColumns = [
  columnHelper.accessor("paso", {
    header: "Paso",
    cell: (info) => <span className="font-medium text-slate-900">{info.getValue()}</span>,
  }),
  columnHelper.accessor("decision", {
    header: "Decisión",
  }),
  columnHelper.accessor("motivo", {
    header: "Motivo",
  }),
];

function WranglingPage() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Base trabajada</p>
        <DataTable columns={sourceColumns} data={sourceSummary} />
      </section>

      <section className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Registro y granularidad</p>
        <DataTable columns={unitColumns} data={unitRows} />
      </section>

      <section className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Escala y decisión de muestreo</p>
        <DataTable columns={scaleColumns} data={scaleRows} />
      </section>

      <section className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Resumen de atributos</p>
        <DataTable columns={attributeColumns} data={attributeRows} />
      </section>

      <section className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Formato de los datos</p>
        <DataTable columns={formatColumns} data={formatRows} />
      </section>

      <section className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Calidad inicial</p>
        <DataTable columns={qualityColumns} data={qualityRows} />
      </section>

      <section className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Problemas detectados en los datos</p>
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-sm">
          <ul className="space-y-3 text-sm leading-7 text-slate-700">
            {detectedProblems.map((problem) => (
              <li key={problem} className="flex items-start gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-brand-600" />
                <span>{problem}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Tiempo y variable de salida</p>
        <DataTable columns={temporalColumns} data={temporalRows} />
      </section>

      <section className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Outliers y criterios</p>
        <DataTable columns={outlierColumns} data={outlierRows} />
      </section>

      <section className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Transformaciones realizadas</p>
        <DataTable columns={transformationColumns} data={transformationRows} />
      </section>
    </div>
  );
}

export default WranglingPage;
