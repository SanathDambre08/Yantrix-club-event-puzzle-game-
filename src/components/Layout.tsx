import { Outlet, Link, useLocation } from 'react-router-dom';
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
        <div className="max-w-5xl mx-auto px-4 py-2 sm:py-3 flex items-center justify-between gap-2">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
            {/* Miniature Brutalist Logo */}
            <div className="w-10 h-10 bg-surface border-2 border-black flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-300 shrink-0 hazard-stripes">
              <div className="absolute inset-0 bg-background/80 m-0.5 border border-black flex flex-col items-center justify-center overflow-hidden">
                <img 
                  src="/robot-logo.png" 
                  alt="YANI Logo" 
                  className="w-6 object-contain grayscale contrast-125 group-hover:grayscale-0 transition-all duration-500 mix-blend-luminosity relative z-10" 
                />
                <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_2px] pointer-events-none mix-blend-overlay z-20" />
              </div>
            </div>
            
            <div className="hidden sm:block">
              <h1 className="text-base font-bold text-text leading-tight group-hover:text-primary transition-colors">
                YANI Puzzle
              </h1>
              <p className="text-[10px] text-text-muted leading-tight uppercase tracking-wider">
                Yantrix Challenge
              </p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-3 sm:gap-4 shrink-0 ml-auto">
            {!isAdminRoute && (
              <>
                <Link
                  to="/leaderboard"
                  className="text-xs sm:text-sm font-medium text-text-muted hover:text-text transition-colors uppercase tracking-wider"
                >
                  Leaderboard
                </Link>
              </>
            )}
            {isAdminRoute && (
              <Link
                to="/admin"
                className="text-xs sm:text-sm font-medium text-text-muted hover:text-text transition-colors uppercase tracking-wider"
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
