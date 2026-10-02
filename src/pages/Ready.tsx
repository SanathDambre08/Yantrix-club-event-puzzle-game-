import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, Play, Clock, Move } from 'lucide-react';
import { Button } from '../components/ui';
import { Card } from '../components/ui';
import { useGame } from '../contexts/GameContext';
import { supabase } from '../lib/supabase';
import { createInitialState } from '../lib/puzzle';

export function Ready() {
  const navigate = useNavigate();
  const { state, dispatch } = useGame();
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if no student is registered
  useEffect(() => {
    if (!state.student) {
      navigate('/register');
    }
  }, [state.student, navigate]);

  const handleStartGame = async () => {
    if (!state.student) return;

    setIsStarting(true);
    setError(null);

    try {
      // 1. Fetch active puzzle
      const { data: puzzle, error: puzzleError } = await supabase
        .from('puzzles')
        .select('*')
        .eq('active', true)
        .single();

      if (puzzleError || !puzzle) {
        throw new Error('No active puzzle found. Please contact an admin.');
      }

      // 2. Generate solvable shuffle
      const puzzleTiles = createInitialState();

      // 3. Create game session
      const { data: session, error: sessionError } = await supabase
        .from('game_sessions')
        .insert({
          student_id: state.student.id,
          puzzle_id: puzzle.id,
          status: 'in_progress',
          started_at: new Date().toISOString(),
          moves: 0,
          puzzle_state: puzzleTiles,
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // 4. Update context
      dispatch({ type: 'SET_PUZZLE', payload: puzzle });
      dispatch({ type: 'SET_GAME_SESSION', payload: session });
      dispatch({
        type: 'SET_PUZZLE_GAME_STATE',
        payload: {
          tiles: puzzleTiles,
          emptyIndex: -1,
          gridSize: 4,
          moves: 0,
          isCompleted: false,
        },
      });

      // 5. Navigate to game
      navigate('/game');
    } catch (err) {
      console.error('Failed to start game:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to start game. Please try again.'
      );
    } finally {
      setIsStarting(false);
    }
  };

  if (!state.student) return null;

  return (
    <div className="max-w-lg mx-auto px-4 py-8 sm:py-12 relative z-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-gradient mb-2 hover-glitch cursor-default">
          Standby, Pilot {state.student.name.split(' ')[0]}
        </h1>
        <p className="text-accent/80 font-mono text-sm">
          Core assembly sequence initiated
        </p>
      </div>

      <Card className="text-center" glow tilt>
        {/* Puzzle Preview */}
        <div className="w-32 h-32 mx-auto mb-6 rounded-xl bg-surface-elevated border border-border flex items-center justify-center">
          <div className="grid grid-cols-4 gap-0.5">
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-sm bg-primary/20 border border-primary/10"
              />
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-3 mb-8 text-left max-w-xs mx-auto">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Clock size={16} className="text-primary" />
            </div>
            <span className="text-text-muted">
              Timer starts when you tap <strong className="text-text">Start Game</strong>
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Move size={16} className="text-primary" />
            </div>
            <span className="text-text-muted">
              Each legal tile movement counts as <strong className="text-text">one move</strong>
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Cpu size={16} className="text-primary" />
            </div>
            <span className="text-text-muted">
              Reassemble the <strong className="text-text">YANI robot</strong> image to win
            </span>
          </div>
        </div>

        {/* Attempt */}
        <p className="text-sm text-text-dim mb-4">
          Attempt <span className="text-accent font-bold">1</span> of{' '}
          <span className="text-text">1</span>
        </p>

        {/* Error */}
        {error && (
          <div className="p-3 mb-4 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
            {error}
          </div>
        )}

        {/* Start Button */}
        <Button
          size="xl"
          fullWidth
          onClick={handleStartGame}
          isLoading={isStarting}
          icon={<Play size={24} />}
          className="glow-pulse"
        >
          START GAME
        </Button>
      </Card>
    </div>
  );
}
