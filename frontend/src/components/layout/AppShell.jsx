import { Database, FlaskConical, LayoutDashboard, LineChart, ScanSearch, Search, Workflow } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const navigation = [
  { to: "/", label: "Introducción", icon: LayoutDashboard },
  { to: "/dataset", label: "Dataset", icon: Database },
  { to: "/pipeline", label: "Pipeline", icon: Workflow },
  { to: "/wrangling", label: "Wrangling", icon: FlaskConical },
  { to: "/aed", label: "AED", icon: Search },
  { to: "/reduccion", label: "Reducción", icon: ScanSearch },
  { to: "/visualizaciones", label: "Visualizaciones", icon: LineChart },
];

function AppShell() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-brand-100 p-3 text-brand-700">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-700">XES3G5M</p>
              <h1 className="text-base font-semibold text-slate-900">Informe interactivo de Ciencia de Datos</h1>
            </div>
          </div>

          <nav className="hidden items-center gap-2 lg:flex">
            {navigation.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-brand-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="border-t border-slate-200/70 bg-white lg:hidden">
          <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3">
            {navigation.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-700"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}

export default AppShell;
