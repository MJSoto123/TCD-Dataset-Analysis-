import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import AedPage from "./pages/AedPage";
import DatasetPage from "./pages/DatasetPage";
import DimensionalityPage from "./pages/DimensionalityPage";
import HomePage from "./pages/HomePage";
import PipelinePage from "./pages/PipelinePage";
import VisualizationsPage from "./pages/VisualizationsPage";
import WranglingPage from "./pages/WranglingPage";

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/dataset" element={<DatasetPage />} />
        <Route path="/pipeline" element={<PipelinePage />} />
        <Route path="/wrangling" element={<WranglingPage />} />
        <Route path="/aed" element={<AedPage />} />
        <Route path="/reduccion" element={<DimensionalityPage />} />
        <Route path="/visualizaciones" element={<VisualizationsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
