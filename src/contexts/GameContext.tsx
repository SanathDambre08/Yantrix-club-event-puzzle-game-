import React, { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { Student, GameSession, PuzzleGameState, Puzzle } from '../types';

// ── State ──
interface GameContextState {
  student: Student | null;
  puzzle: Puzzle | null;
  gameSession: GameSession | null;
  puzzleGameState: PuzzleGameState | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: GameContextState = {
  student: null,
  puzzle: null,
  gameSession: null,
  puzzleGameState: null,
  isLoading: false,
  error: null,
};

// ── Actions ──
type GameAction =
  | { type: 'SET_STUDENT'; payload: Student }
  | { type: 'SET_PUZZLE'; payload: Puzzle }
  | { type: 'SET_GAME_SESSION'; payload: GameSession }
  | { type: 'SET_PUZZLE_GAME_STATE'; payload: PuzzleGameState }
  | { type: 'UPDATE_PUZZLE_GAME_STATE'; payload: Partial<PuzzleGameState> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' };

// ── Reducer ──
function gameReducer(state: GameContextState, action: GameAction): GameContextState {
  switch (action.type) {
    case 'SET_STUDENT':
      return { ...state, student: action.payload, error: null };
    case 'SET_PUZZLE':
      return { ...state, puzzle: action.payload, error: null };
    case 'SET_GAME_SESSION':
      return { ...state, gameSession: action.payload, error: null };
    case 'SET_PUZZLE_GAME_STATE':
      return { ...state, puzzleGameState: action.payload, error: null };
    case 'UPDATE_PUZZLE_GAME_STATE':
      return {
        ...state,
        puzzleGameState: state.puzzleGameState
          ? { ...state.puzzleGameState, ...action.payload }
          : null,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

// ── Context ──
interface GameContextValue {
  state: GameContextState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextValue | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'yani_game_state';

function getInitialState(): GameContextState {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Only recover if the session isn't completed or abandoned
      if (parsed.gameSession?.status !== 'completed' && parsed.gameSession?.status !== 'abandoned') {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse saved game state', e);
  }
  return initialState;
}

// ── Provider ──
interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const [state, dispatch] = useReducer(gameReducer, getInitialState());

  React.useEffect(() => {
    // Sync state to localStorage to recover on refresh
    if (state.student) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, [state]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

// ── Hook ──
export function useGame(): GameContextValue {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
