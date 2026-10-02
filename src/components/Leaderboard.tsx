import { useEffect, useState } from 'react';
import { Trophy, Clock, Move, Medal } from 'lucide-react';
import { formatTime } from '../lib/scoring';
import type { LeaderboardEntry } from '../types';
import { supabase } from '../lib/supabase';

interface LeaderboardProps {
  highlightStudentId?: string;
  compact?: boolean;
  maxEntries?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function Leaderboard({
  compact = false,
  maxEntries = 50,
  autoRefresh = true,
  refreshInterval = 10000,
}: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('game_sessions')
        .select(`
          id,
          score,
          duration_seconds,
          moves,
          completed_at,
          students (
            id,
            name,
            course,
            year
          )
        `)
        .eq('status', 'completed')
        .not('score', 'is', null)
        .order('score', { ascending: false })
        .order('duration_seconds', { ascending: true })
        .order('moves', { ascending: true })
        .order('completed_at', { ascending: true })
        .limit(maxEntries);

      if (fetchError) throw fetchError;

      const leaderboardEntries: LeaderboardEntry[] = (data || []).map(
        (session: Record<string, unknown>, index: number) => {
          const student = session.students as Record<string, unknown> | null;
          return {
            rank: index + 1,
            student_name: (student?.name as string) || 'Anonymous',
            course: (student?.course as string) || '',
            year: (student?.year as number) || 0,
            score: (session.score as number) || 0,
            duration_seconds: (session.duration_seconds as number) || 0,
            moves: (session.moves as number) || 0,
            completed_at: (session.completed_at as string) || '',
          };
        }
      );

      setEntries(leaderboardEntries);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
      setError('Failed to load leaderboard. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();

    if (autoRefresh) {
      const interval = setInterval(fetchLeaderboard, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-400">
            <Medal size={18} />
          </div>
        );
      case 2:
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-300/20 text-gray-300">
            <Medal size={18} />
          </div>
        );
      case 3:
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-700/20 text-amber-600">
            <Medal size={18} />
          </div>
        );
      default:
        return (
          <span className="flex items-center justify-center w-8 h-8 text-sm font-bold text-text-muted">
            {rank}
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-danger mb-3">{error}</p>
        <button
          onClick={fetchLeaderboard}
          className="text-primary hover:text-primary-hover text-sm font-medium"
        >
          Retry
        </button>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <Trophy className="mx-auto mb-3 text-text-muted" size={40} />
        <p className="text-text-muted">No completed games yet.</p>
        <p className="text-text-dim text-sm mt-1">Be the first to play!</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Top 3 podium (non-compact mode) */}
      {!compact && entries.length >= 3 && (
        <div className="flex items-end justify-center gap-3 mb-8">
          {/* 2nd place */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-gray-300/10 border-2 border-gray-400 flex items-center justify-center mb-2">
              <span className="text-lg font-bold text-gray-300">2</span>
            </div>
            <p className="text-sm font-semibold text-text truncate max-w-[100px]">
              {entries[1].student_name}
            </p>
            <p className="text-xs text-text-muted">{entries[1].score} pts</p>
            <div className="w-20 h-16 bg-gray-400/10 rounded-t-lg mt-2 flex items-center justify-center">
              <span className="text-lg font-bold text-gray-400">🥈</span>
            </div>
          </div>

          {/* 1st place */}
          <div className="flex flex-col items-center -mt-4">
            <div className="w-20 h-20 rounded-full bg-yellow-400/10 border-2 border-yellow-400 flex items-center justify-center mb-2 shadow-glow-primary">
              <span className="text-xl font-bold text-yellow-400">1</span>
            </div>
            <p className="text-base font-bold text-text truncate max-w-[120px]">
              {entries[0].student_name}
            </p>
            <p className="text-sm text-accent font-semibold">{entries[0].score} pts</p>
            <div className="w-24 h-24 bg-yellow-400/10 rounded-t-lg mt-2 flex items-center justify-center">
              <span className="text-2xl">🏆</span>
            </div>
          </div>

          {/* 3rd place */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-amber-600/10 border-2 border-amber-600 flex items-center justify-center mb-2">
              <span className="text-lg font-bold text-amber-600">3</span>
            </div>
            <p className="text-sm font-semibold text-text truncate max-w-[100px]">
              {entries[2].student_name}
            </p>
            <p className="text-xs text-text-muted">{entries[2].score} pts</p>
            <div className="w-20 h-12 bg-amber-600/10 rounded-t-lg mt-2 flex items-center justify-center">
              <span className="text-lg font-bold text-amber-700">🥉</span>
            </div>
          </div>
        </div>
      )}

      {/* Full table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface-elevated">
            <tr>
              <th className="text-left px-4 py-3 text-text-muted font-semibold">#</th>
              <th className="text-left px-4 py-3 text-text-muted font-semibold">Name</th>
              {!compact && (
                <th className="text-left px-4 py-3 text-text-muted font-semibold hidden sm:table-cell">
                  Course
                </th>
              )}
              <th className="text-right px-4 py-3 text-text-muted font-semibold">
                <span className="flex items-center justify-end gap-1">
                  <Trophy size={14} /> Score
                </span>
              </th>
              <th className="text-right px-4 py-3 text-text-muted font-semibold hidden sm:table-cell">
                <span className="flex items-center justify-end gap-1">
                  <Clock size={14} /> Time
                </span>
              </th>
              <th className="text-right px-4 py-3 text-text-muted font-semibold hidden md:table-cell">
                <span className="flex items-center justify-end gap-1">
                  <Move size={14} /> Moves
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr
                key={`${entry.rank}-${entry.student_name}`}
                className={`border-t border-border transition-colors duration-150
                  ${entry.rank <= 3 ? 'bg-primary/5' : 'hover:bg-surface-elevated'}
                `}
              >
                <td className="px-4 py-3">{getRankBadge(entry.rank)}</td>
                <td className="px-4 py-3">
                  <span className={`font-medium ${entry.rank <= 3 ? 'text-text' : 'text-text-muted'}`}>
                    {entry.student_name}
                  </span>
                  {!compact && (
                    <span className="block text-xs text-text-dim sm:hidden">
                      {entry.course} • Year {entry.year}
                    </span>
                  )}
                </td>
                {!compact && (
                  <td className="px-4 py-3 text-text-muted hidden sm:table-cell">
                    {entry.course} • Y{entry.year}
                  </td>
                )}
                <td className="px-4 py-3 text-right font-bold text-accent">
                  {entry.score}
                </td>
                <td className="px-4 py-3 text-right text-text-muted font-mono hidden sm:table-cell">
                  {formatTime(entry.duration_seconds)}
                </td>
                <td className="px-4 py-3 text-right text-text-muted hidden md:table-cell">
                  {entry.moves}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
