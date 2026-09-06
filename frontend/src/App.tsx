import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingLayout from './layouts/LandingLayout';
import DashboardLayout from './layouts/DashboardLayout';
import LandingPage from './pages/LandingPage';
import AnalyzePage from './pages/AnalyzePage';
import DashboardPage from './pages/DashboardPage';
import ReportsPage from './pages/ReportsPage';
import TeamPage from './pages/TeamPage';
import RiskInsightsPage from './pages/RiskInsightsPage';
import AIModelPage from './pages/AIModelPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LandingLayout />}>
          <Route path="/" element={<LandingPage />} />
        </Route>
        <Route element={<DashboardLayout />}>
          <Route path="/analyze" element={<AnalyzePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/risk-insights" element={<RiskInsightsPage />} />
          <Route path="/ai-model" element={<AIModelPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
