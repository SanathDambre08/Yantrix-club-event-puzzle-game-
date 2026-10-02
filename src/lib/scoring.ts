/**
 * YANI Puzzle Challenge — Scoring Engine
 * PRD §6.5: Server-side authoritative scoring
 *
 * Formula:
 *   base_score = 1000
 *   time_penalty = completion_time_seconds × 2
 *   move_penalty = moves × 5
 *   score = max(0, base_score - time_penalty - move_penalty)
 */

const BASE_SCORE = 1000;
const TIME_PENALTY_MULTIPLIER = 2;
const MOVE_PENALTY_MULTIPLIER = 5;

/**
 * Calculate the puzzle score from time and moves.
 * This runs on both client (display preview) and server (authoritative).
 */
export function calculateScore(
  completionTimeSeconds: number,
  moves: number
): number {
  if (completionTimeSeconds < 0 || moves < 0) {
    throw new Error('Invalid scoring inputs: time and moves must be non-negative');
  }

  const timePenalty = completionTimeSeconds * TIME_PENALTY_MULTIPLIER;
  const movePenalty = moves * MOVE_PENALTY_MULTIPLIER;
  const score = Math.max(0, BASE_SCORE - timePenalty - movePenalty);

  return Math.round(score);
}

/**
 * Format seconds into mm:ss display.
 */
export function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Format score with leading zeros for display consistency.
 */
export function formatScore(score: number): string {
  return score.toString().padStart(4, '0');
}

/**
 * Get a qualitative label for a given score.
 */
export function getScoreLabel(score: number): {
  label: string;
  color: string;
} {
  if (score >= 800) return { label: 'Outstanding!', color: 'var(--color-accent)' };
  if (score >= 600) return { label: 'Excellent!', color: 'var(--color-success)' };
  if (score >= 400) return { label: 'Great Job!', color: 'var(--color-primary)' };
  if (score >= 200) return { label: 'Good Effort!', color: 'var(--color-warning)' };
  return { label: 'Keep Trying!', color: 'var(--color-text-muted)' };
}
