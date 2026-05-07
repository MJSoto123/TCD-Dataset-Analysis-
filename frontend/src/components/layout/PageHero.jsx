function PageHero({ eyebrow, title, description, aside }) {
  return (
    <section className="grid gap-6 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm lg:grid-cols-[1.2fr_0.8fr] lg:p-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">{eyebrow}</p>
        <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">{title}</h2>
        <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">{description}</p>
      </div>
      <div className="rounded-[1.5rem] border border-brand-100 bg-brand-50 p-6 text-sm leading-7 text-slate-700">
        {aside}
      </div>
    </section>
  );
}

export default PageHero;
