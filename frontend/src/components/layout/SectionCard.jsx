function SectionCard({ title, children }) {
  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-sm">
      <h3 className="text-xl font-semibold text-slate-950">{title}</h3>
      <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600">{children}</div>
    </section>
  );
}

export default SectionCard;
