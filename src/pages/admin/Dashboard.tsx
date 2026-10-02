import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Gamepad2,
  CheckCircle,
  Clock,
  Move as MoveIcon,
  Trophy,
  Plus,
  Download,
  Settings,
  BarChart3,
} from 'lucide-react';
import { Card, StatCard, CardHeader } from '../../components/ui';
import { Button } from '../../components/ui';
import { supabase } from '../../lib/supabase';
import { formatTime } from '../../lib/scoring';

interface DashboardStats {
  totalStudents: number;
  gamesStarted: number;
  gamesCompleted: number;
  completionRate: number;
  avgTime: number;
  avgMoves: number;
  avgScore: number;
  abandonedSessions: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    gamesStarted: 0,
    gamesCompleted: 0,
    completionRate: 0,
    avgTime: 0,
    avgMoves: 0,
    avgScore: 0,
    abandonedSessions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [recentCompletions, setRecentCompletions] = useState<
    { name: string; score: number; time: number; moves: number }[]
  >([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch counts
        const [studentsRes, sessionsRes, completedRes, abandonedRes] =
          await Promise.all([
            supabase.from('students').select('id', { count: 'exact', head: true }),
            supabase.from('game_sessions').select('id', { count: 'exact', head: true }),
            supabase
              .from('game_sessions')
              .select('id', { count: 'exact', head: true })
              .eq('status', 'completed'),
            supabase
              .from('game_sessions')
              .select('id', { count: 'exact', head: true })
              .eq('status', 'abandoned'),
          ]);

        const totalStudents = studentsRes.count || 0;
        const gamesStarted = sessionsRes.count || 0;
        const gamesCompleted = completedRes.count || 0;
        const abandonedSessions = abandonedRes.count || 0;

        // Fetch completed session aggregates
        const { data: completedData } = await supabase
          .from('game_sessions')
          .select('duration_seconds, moves, score')
          .eq('status', 'completed');

        let avgTime = 0;
        let avgMoves = 0;
        let avgScore = 0;

        if (completedData && completedData.length > 0) {
          avgTime =
            completedData.reduce((a, s) => a + (s.duration_seconds || 0), 0) /
            completedData.length;
          avgMoves =
            completedData.reduce((a, s) => a + (s.moves || 0), 0) /
            completedData.length;
          avgScore =
            completedData.reduce((a, s) => a + (s.score || 0), 0) /
            completedData.length;
        }

        setStats({
          totalStudents,
          gamesStarted,
          gamesCompleted,
          completionRate:
            gamesStarted > 0 ? (gamesCompleted / gamesStarted) * 100 : 0,
          avgTime: Math.round(avgTime),
          avgMoves: Math.round(avgMoves),
          avgScore: Math.round(avgScore),
          abandonedSessions,
        });

        // Fetch recent completions
        const { data: recent } = await supabase
          .from('game_sessions')
          .select('score, duration_seconds, moves, students(name)')
          .eq('status', 'completed')
          .order('completed_at', { ascending: false })
          .limit(5);

        if (recent) {
          setRecentCompletions(
            recent.map((r: Record<string, unknown>) => {
              const student = r.students as Record<string, unknown> | null;
              return {
                name: (student?.name as string) || 'Unknown',
                score: (r.score as number) || 0,
                time: (r.duration_seconds as number) || 0,
                moves: (r.moves as number) || 0,
              };
            })
          );
        }
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text">Admin Dashboard</h1>
          <p className="text-text-muted text-sm">YANI Puzzle Challenge Overview</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/questions">
            <Button size="sm" variant="secondary" icon={<Plus size={16} />}>
              Questions
            </Button>
          </Link>
          <Link to="/admin/export">
            <Button size="sm" variant="secondary" icon={<Download size={16} />}>
              Export
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Registered"
          value={stats.totalStudents}
          icon={<Users size={20} />}
        />
        <StatCard
          label="Games Started"
          value={stats.gamesStarted}
          icon={<Gamepad2 size={20} />}
        />
        <StatCard
          label="Completed"
          value={stats.gamesCompleted}
          icon={<CheckCircle size={20} />}
        />
        <StatCard
          label="Completion Rate"
          value={`${stats.completionRate.toFixed(1)}%`}
          icon={<BarChart3 size={20} />}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Avg Time"
          value={formatTime(stats.avgTime)}
          icon={<Clock size={20} />}
        />
        <StatCard
          label="Avg Moves"
          value={stats.avgMoves}
          icon={<MoveIcon size={20} />}
        />
        <StatCard
          label="Avg Score"
          value={stats.avgScore}
          icon={<Trophy size={20} />}
        />
        <StatCard
          label="Abandoned"
          value={stats.abandonedSessions}
          icon={<Settings size={20} />}
        />
      </div>

      {/* Recent Completions */}
      <Card>
        <CardHeader title="Recent Completions" subtitle="Last 5 games" />
        {recentCompletions.length === 0 ? (
          <p className="text-text-muted text-sm text-center py-4">
            No completed games yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-text-muted font-medium">Name</th>
                  <th className="text-right py-2 text-text-muted font-medium">Score</th>
                  <th className="text-right py-2 text-text-muted font-medium">Time</th>
                  <th className="text-right py-2 text-text-muted font-medium">Moves</th>
                </tr>
              </thead>
              <tbody>
                {recentCompletions.map((r, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-2 font-medium text-text">{r.name}</td>
                    <td className="py-2 text-right text-accent font-bold">{r.score}</td>
                    <td className="py-2 text-right text-text-muted font-mono">
                      {formatTime(r.time)}
                    </td>
                    <td className="py-2 text-right text-text-muted">{r.moves}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Quick Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
        {[
          { to: '/admin/questions', label: 'Questions', icon: <Plus size={18} /> },
          { to: '/admin/students', label: 'Students', icon: <Users size={18} /> },
          { to: '/admin/settings', label: 'Settings', icon: <Settings size={18} /> },
        ].map((nav) => (
          <Link key={nav.to} to={nav.to}>
            <Card hoverable className="text-center py-4">
              <div className="text-primary mb-2 flex justify-center">{nav.icon}</div>
              <p className="text-sm font-medium text-text">{nav.label}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
