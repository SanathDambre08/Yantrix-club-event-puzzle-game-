import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trophy, Clock, Move as MoveIcon, Star, Home } from 'lucide-react';
import { Button } from '../components/ui';
import { Card } from '../components/ui';
import { useGame } from '../contexts/GameContext';
import { formatTime, formatScore, getScoreLabel } from '../lib/scoring';
import confetti from 'canvas-confetti';

export function Result() {
  const navigate = useNavigate();
  const { state } = useGame();

  useEffect(() => {
    if (!state.gameSession || state.gameSession.status !== 'completed') {
      navigate('/');
    } else {
      // Fire confetti when reaching the result page
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#FF2A85', '#8A2BE2', '#4169E1', '#00FFFF'],
      });
    }
  }, [state.gameSession, navigate]);

  if (!state.gameSession || !state.student) return null;

  const { score, duration_seconds, moves } = state.gameSession;
  const scoreLabel = getScoreLabel(score || 0);

  return (
    <div className="max-w-lg mx-auto px-4 py-8 sm:py-12 relative z-10">
      {/* Success Header */}
      <div className="text-center mb-8 slide-up">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-success/10 border-2 border-success flex items-center justify-center shadow-glow-success">
          <Star className="text-success" size={36} />
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary mb-2 hover-glitch cursor-default">
          You Made Yani!
        </h1>
        <p className="text-text-muted text-lg">
          Amazing job assembling the robot, {state.student.name.split(' ')[0]}!
        </p>
      </div>

      {/* Score Card */}
      <Card className="text-center mb-6" tilt>
        <p className="text-sm text-text-muted mb-1">Your Score</p>
        <p
          className="text-5xl sm:text-6xl font-black font-mono mb-2 drop-shadow-lg"
          style={{ color: scoreLabel.color, textShadow: `0 0 15px ${scoreLabel.color}80` }}
        >
          {formatScore(score || 0)}
        </p>
        <p
          className="text-lg font-bold uppercase tracking-widest"
          style={{ color: scoreLabel.color }}
        >
          {scoreLabel.label}
        </p>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <Card className="text-center py-4" tilt>
          <Clock className="mx-auto text-primary mb-2" size={22} />
          <p className="text-lg font-bold text-text font-mono">
            {formatTime(duration_seconds || 0)}
          </p>
          <p className="text-xs text-text-muted">Time</p>
        </Card>

        <Card className="text-center py-4" tilt>
          <MoveIcon className="mx-auto text-accent mb-2" size={22} />
          <p className="text-lg font-bold text-text font-mono">{moves}</p>
          <p className="text-xs text-text-muted">Moves</p>
        </Card>

        <Card className="text-center py-4" tilt>
          <Trophy className="mx-auto text-warning mb-2" size={22} />
          <p className="text-lg font-bold text-text font-mono">—</p>
          <p className="text-xs text-text-muted">Rank</p>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        <Link to="/leaderboard" className="block w-full">
          <Button size="lg" fullWidth icon={<Trophy size={20} />}>
            View Leaderboard
          </Button>
        </Link>
        <Link to="/" className="block w-full">
          <Button size="lg" fullWidth variant="secondary" icon={<Home size={20} />}>
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
