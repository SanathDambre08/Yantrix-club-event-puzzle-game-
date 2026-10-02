import { Outlet, Link, useLocation } from 'react-router-dom';
import { Cpu } from 'lucide-react';
import { CyberBackground } from './ui';

export function Layout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isGameRoute = location.pathname === '/game';

  // Don't show header during active game (PRD §11.4: "No unnecessary navigation while game is active")
  if (isGameRoute) {
    return (
      <>
        <CyberBackground />
        <main className="min-h-dvh">
          <Outlet />
        </main>
      </>
    );
  }

  return (
    <>
      <CyberBackground />
      <div className="min-h-dvh flex flex-col relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-accent/20">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
              <Cpu className="text-primary" size={20} />
            </div>
            <div>
              <h1 className="text-base font-bold text-text leading-tight">
                YANI Puzzle
              </h1>
              <p className="text-[10px] text-text-muted leading-tight uppercase tracking-wider">
                Yantrix Challenge
              </p>
            </div>
          </Link>

          <nav className="flex items-center gap-4">
            {!isAdminRoute && (
              <>
                <Link
                  to="/leaderboard"
                  className="text-sm text-text-muted hover:text-text transition-colors"
                >
                  Leaderboard
                </Link>
              </>
            )}
            {isAdminRoute && (
              <Link
                to="/admin"
                className="text-sm text-text-muted hover:text-text transition-colors"
              >
                Dashboard
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-auto">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-sm text-text-muted">
            <span className="text-text font-semibold">YANI Puzzle Challenge</span>
            {' · '}
            Yantrix Robotics & Aeronautics Club
          </p>
          <p className="text-xs text-text-dim mt-1">
            DY Patil International University
          </p>
        </div>
      </footer>
    </div>
    </>
  );
}
