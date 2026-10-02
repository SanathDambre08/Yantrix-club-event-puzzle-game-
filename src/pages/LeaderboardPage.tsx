import { Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Leaderboard } from '../components/Leaderboard';

export function LeaderboardPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 relative z-10 slide-up">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-4 shadow-glow-primary">
          <Trophy className="text-primary" size={28} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-gradient mb-2 hover-glitch cursor-default">
          Global Rankings
        </h1>
        <p className="text-accent/80 font-mono text-sm">
          Top performers of the YANI Protocol
        </p>
        <p className="text-xs text-text-dim mt-1">
          Auto-refreshes every 30 seconds
        </p>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <Link to="/" className="inline-flex items-center text-sm font-medium text-text-muted hover:text-primary transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="m15 18-6-6 6-6"/></svg>
          Back to Terminal
        </Link>
      </div>

      <Leaderboard
        autoRefresh
        refreshInterval={30000}
        maxEntries={100}
      />
    </div>
  );
}
