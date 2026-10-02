/**
 * YANI Puzzle Challenge — 4×4 Assembly Puzzle Engine
 * 
 * Re-designed per user request: "two boxes, one box will contain jumbled pieces...
 * arrange the robot... do not have to remove any piece"
 *
 * State representation:
 * Array of 32 numbers.
 * - Indices 0-15: The 4x4 Board (0 = empty slot, 1-16 = placed piece)
 * - Indices 16-31: The Tray (0 = empty slot, 1-16 = available piece)
 */

import type { PuzzleGameState } from '../types';

const GRID_SIZE = 4;
const TOTAL_TILES = GRID_SIZE * GRID_SIZE;

/**
 * Generate the solved state:
 * Board is [1, 2, ..., 16]
 * Tray is [0, 0, ..., 0]
 */
export function getSolvedState(): number[] {
  const state: number[] = [];
  // Board
  for (let i = 1; i <= TOTAL_TILES; i++) {
    state.push(i);
  }
  // Tray
  for (let i = 0; i < TOTAL_TILES; i++) {
    state.push(0);
  }
  return state;
}

/**
 * Check if the current state matches the solved state (i.e. board is correctly assembled)
 */
export function isSolved(state: number[]): boolean {
  for (let i = 0; i < TOTAL_TILES; i++) {
    if (state[i] !== i + 1) return false;
  }
  return true;
}

/**
 * Shuffle array in place (Fisher-Yates)
 */
function shuffleArray(array: number[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

/**
 * Create the initial game state:
 * Board is entirely empty [0..0]
 * Tray contains pieces [1..16] randomly shuffled
 */
export function createInitialState(): number[] {
  const state = new Array(32).fill(0);
  const pieces = Array.from({ length: TOTAL_TILES }, (_, i) => i + 1);
  shuffleArray(pieces);
  
  // Place shuffled pieces into the tray (indices 16-31)
  for (let i = 0; i < TOTAL_TILES; i++) {
    state[i + TOTAL_TILES] = pieces[i];
  }
  
  return state;
}

/**
 * Move a tile from one index to another.
 * Validates that fromIndex has a tile, and toIndex is empty.
 */
export function moveTile(state: number[], fromIndex: number, toIndex: number): number[] | null {
  if (fromIndex < 0 || fromIndex >= 32 || toIndex < 0 || toIndex >= 32) return null;
  if (state[fromIndex] === 0) return null; // No tile to move
  if (state[toIndex] !== 0) {
    // If target is occupied, we swap them! This makes it "easy for user"
    const newState = [...state];
    const temp = newState[toIndex];
    newState[toIndex] = newState[fromIndex];
    newState[fromIndex] = temp;
    return newState;
  }

  // Target is empty, just move it
  const newState = [...state];
  newState[toIndex] = newState[fromIndex];
  newState[fromIndex] = 0;
  return newState;
}

/**
 * Create a new puzzle game state wrapper.
 */
export function createGameState(): PuzzleGameState {
  const tiles = createInitialState();
  return {
    tiles,
    emptyIndex: -1, // Unused in this mode
    gridSize: GRID_SIZE,
    moves: 0,
    isCompleted: false,
  };
}

/**
 * Get the tile image position for CSS background-position.
 * Given tile value (1-16), returns the percentage position for the source image.
 */
export function getTileImagePosition(
  tileValue: number
): { backgroundPositionX: string; backgroundPositionY: string } {
  if (tileValue === 0) {
    return { backgroundPositionX: '0%', backgroundPositionY: '0%' };
  }

  // Tile values 1-16 map to positions in the 4x4 grid
  const tileIndex = tileValue - 1; // 0-indexed
  const col = tileIndex % GRID_SIZE;
  const row = Math.floor(tileIndex / GRID_SIZE);

  // Calculate percentage positions
  const xPercent = (col / (GRID_SIZE - 1)) * 100;
  const yPercent = (row / (GRID_SIZE - 1)) * 100;

  return {
    backgroundPositionX: `${xPercent}%`,
    backgroundPositionY: `${yPercent}%`,
  };
}

export { GRID_SIZE, TOTAL_TILES };
