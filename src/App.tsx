import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GameProvider } from './contexts/GameContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Analytics } from '@vercel/analytics/react';

// Student pages
import { Home } from './pages/Home';
import { Registration } from './pages/Registration';
import { Ready } from './pages/Ready';
import { Game } from './pages/Game';
import { Result } from './pages/Result';
import { LeaderboardPage } from './pages/LeaderboardPage';

// Admin pages
import { AdminLogin } from './pages/admin/Login';
import { Dashboard } from './pages/admin/Dashboard';
import { Questions } from './pages/admin/Questions';
import { Students } from './pages/admin/Students';
import { Export } from './pages/admin/Export';
import { Settings } from './pages/admin/Settings';

function App() {
  return (
    <>
      <BrowserRouter>
        <GameProvider>
          <Routes>
            {/* Public student routes */}
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Registration />} />
              <Route path="/ready" element={<Ready />} />
              <Route path="/game" element={<Game />} />
              <Route path="/result" element={<Result />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
            </Route>

            {/* Admin login (no layout) */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Protected admin routes */}
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/admin" element={<Dashboard />} />
              <Route path="/admin/questions" element={<Questions />} />
              <Route path="/admin/students" element={<Students />} />
              <Route path="/admin/export" element={<Export />} />
              <Route path="/admin/settings" element={<Settings />} />
            </Route>
          </Routes>
        </GameProvider>
      </BrowserRouter>
      <Analytics />
    </>
  );
}

export default App;
