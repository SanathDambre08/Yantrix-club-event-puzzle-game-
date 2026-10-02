import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Move as MoveIcon, LogOut } from 'lucide-react';
import { PuzzleBoard } from '../components/PuzzleBoard';
import { Timer } from '../components/Timer';
import { Button } from '../components/ui';
import { useGame } from '../contexts/GameContext';
import { supabase } from '../lib/supabase';
import { calculateScore } from '../lib/scoring';
import { sendToGoogleSheets } from '../lib/googleSheets';

export function Game() {
  const navigate = useNavigate();
  const { state, dispatch } = useGame();
  const [moveCount, setMoveCount] = useState(() => state.puzzleGameState?.moves || 0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [boardSize, setBoardSize] = useState(300);

  // Calculate the optimal board size so both boards fit on screen without scrolling
  useEffect(() => {
    const updateSize = () => {
      const maxWidth = window.innerWidth - 48; // Account for horizontal padding
      // Account for HUD (~100px), titles (~60px), gaps (~60px), exit button (~60px) = ~280px total vertical space
      const maxHeight = (window.innerHeight - 280) / 2; // Divide by 2 because there are 2 boards stacked on mobile
      
      // If we're on desktop (lg breakpoint), they are side-by-side, so maxHeight doesn't need to be divided by 2
      const isDesktop = window.innerWidth >= 1024;
      const finalMaxHeight = isDesktop ? window.innerHeight - 200 : maxHeight;

      setBoardSize(Math.max(150, Math.min(340, maxWidth, finalMaxHeight)));
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Redirect if no game session
  useEffect(() => {
    if (!state.gameSession || !state.puzzleGameState) {
      navigate('/register');
    }
  }, [state.gameSession, state.puzzleGameState, navigate]);

  const handleMove = useCallback((newTiles: number[], newMoveCount: number) => {
    setMoveCount(newMoveCount);
    dispatch({
      type: 'UPDATE_PUZZLE_GAME_STATE',
      payload: { tiles: newTiles, moves: newMoveCount }
    });
  }, [dispatch]);

  const handleComplete = useCallback(
    async (finalTiles: number[], finalMoves: number) => {
      if (!state.gameSession || isSubmitting) return;

      setIsCompleted(true);
      setIsSubmitting(true);

      try {
        const completedAt = new Date().toISOString();
        const durationSeconds = elapsedSeconds;
        const score = calculateScore(durationSeconds, finalMoves);

        // Update game session on server
        const { error } = await supabase
          .from('game_sessions')
          .update({
            status: 'completed',
            completed_at: completedAt,
            duration_seconds: durationSeconds,
            moves: finalMoves,
            score,
            puzzle_state: finalTiles, // optional server save
          })
          .eq('id', state.gameSession.id);

        if (error) throw error;

        // Send to Google Sheets
        if (state.student) {
          sendToGoogleSheets({
            PlayerName: state.student.name,
            Email: state.student.email,
            Phone: state.student.optional_contact || '',
            TimeSeconds: durationSeconds,
            Moves: finalMoves,
            Status: 'completed'
          });
        }

        // Update context
        dispatch({
          type: 'SET_GAME_SESSION',
          payload: {
            ...state.gameSession,
            status: 'completed',
            completed_at: completedAt,
            duration_seconds: durationSeconds,
            moves: finalMoves,
            score,
          },
        });

        // Navigate to result after short delay for animation
        setTimeout(() => navigate('/result'), 1500);
      } catch (err) {
        console.error('Failed to save completion:', err);
        setIsSubmitting(false); // Only allow retry if it failed entirely
        setTimeout(() => navigate('/result'), 1500);
      }
    },
    [state.gameSession, elapsedSeconds, dispatch, navigate, isSubmitting]
  );

  const handleAbandon = async () => {
    if (!state.gameSession) return;

    try {
      await supabase
        .from('game_sessions')
        .update({
          status: 'abandoned',
          duration_seconds: elapsedSeconds,
          moves: moveCount,
        })
        .eq('id', state.gameSession.id);

      // Send abandon status to Google Sheets
      if (state.student) {
        sendToGoogleSheets({
          PlayerName: state.student.name,
          Email: state.student.email,
          Phone: state.student.optional_contact || '',
          TimeSeconds: elapsedSeconds,
          Moves: moveCount,
          Status: 'abandoned'
        });
      }

    } catch (err) {
      console.error('Failed to mark session abandoned:', err);
    }

    dispatch({ type: 'RESET' });
    navigate('/');
  };

  if (!state.gameSession || !state.puzzleGameState || !state.puzzle) {
    return null;
  }

  // Preview score
  const previewScore = calculateScore(elapsedSeconds, moveCount);

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-2 py-4 relative z-10 overflow-hidden">
      {/* Game HUD - Top Bar */}
      <div className="w-full max-w-sm mb-4 slide-up">
        <div className="flex items-center justify-between glass-panel px-4 py-3 border border-primary/30 shadow-glow-primary">
          <Timer
            isRunning={!isCompleted}
            startTimeString={state.gameSession.started_at || undefined}
            onTick={setElapsedSeconds}
          />

          <div className="flex items-center gap-2 text-text font-mono text-lg font-bold group">
            <MoveIcon size={18} className="text-primary group-hover:text-accent transition-colors" />
            <span className="group-hover:text-primary transition-colors">{moveCount}</span>
          </div>
        </div>

        {/* Live score preview */}
        <div className="text-center mt-2 font-mono">
          <span className="text-xs text-text-muted uppercase tracking-wider">Est. Score: </span>
          <span className="text-sm font-bold text-gradient">{previewScore}</span>
        </div>
      </div>

      {/* Puzzle Board */}
      <div className="mb-4">
        <PuzzleBoard
          initialTiles={state.puzzleGameState.tiles}
          initialMoveCount={state.puzzleGameState.moves || 0}
          imageUrl={state.puzzle.image_url}
          onMove={handleMove}
          onComplete={handleComplete}
          isActive={!isCompleted}
          boardSize={boardSize}
        />
      </div>

      {/* Exit button */}
      {!isCompleted && (
        <div className="mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowExitConfirm(true)}
            icon={<LogOut size={16} />}
          >
            Exit Game
          </Button>
        </div>
      )}

      {/* Exit confirmation modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-surface border border-border rounded-xl p-6 max-w-sm mx-4 shadow-card scale-in">
            <h3 className="text-lg font-bold text-text mb-2">Exit Game?</h3>
            <p className="text-sm text-text-muted mb-6">
              This will mark your session as <strong className="text-danger">abandoned</strong>.
              Your progress will not be saved and this attempt will be forfeited.
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setShowExitConfirm(false)}
              >
                Continue Playing
              </Button>
              <Button
                variant="danger"
                fullWidth
                onClick={handleAbandon}
              >
                Exit & Forfeit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
