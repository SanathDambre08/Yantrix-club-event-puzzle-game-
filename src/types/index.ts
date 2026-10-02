/* ========================================
   YANI Puzzle Challenge — Type Definitions
   ======================================== */

// ── Student ──
export interface Student {
  id: string;
  name: string;
  email: string;
  course: string;
  year: number;
  optional_contact?: string;
  created_at: string;
}

export interface CreateStudentPayload {
  name: string;
  email: string;
  course: string;
  year: number;
  optional_contact?: string;
}

// ── Custom Questions ──
export type QuestionType =
  | 'short_text'
  | 'long_text'
  | 'single_choice'
  | 'multiple_choice'
  | 'yes_no'
  | 'rating'
  | 'dropdown';

export interface CustomQuestion {
  id: string;
  question_text: string;
  type: QuestionType;
  options: string[] | null;
  required: boolean;
  active: boolean;
  order_index: number;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface CreateQuestionPayload {
  question_text: string;
  type: QuestionType;
  options?: string[];
  required: boolean;
  active?: boolean;
  order_index?: number;
}

// ── Student Answers ──
export interface StudentAnswer {
  id: string;
  student_id: string;
  question_id: string;
  question_version: number;
  question_text_snapshot: string;
  answer_json: unknown;
  created_at: string;
}

export interface SubmitAnswerPayload {
  student_id: string;
  question_id: string;
  question_version: number;
  question_text_snapshot: string;
  answer_json: unknown;
}

// ── Puzzle ──
export interface Puzzle {
  id: string;
  name: string;
  image_url: string;
  grid_size: number;
  time_limit: number | null;
  active: boolean;
  version: number;
  created_at: string;
}

// ── Game Session ──
export type GameStatus = 'pending' | 'in_progress' | 'completed' | 'abandoned' | 'timed_out';

export interface GameSession {
  id: string;
  student_id: string;
  puzzle_id: string;
  started_at: string | null;
  completed_at: string | null;
  duration_seconds: number | null;
  moves: number;
  score: number | null;
  status: GameStatus;
  puzzle_state: number[];
  created_at: string;
}

// ── Leaderboard Entry ──
export interface LeaderboardEntry {
  rank: number;
  student_name: string;
  course: string;
  year: number;
  score: number;
  duration_seconds: number;
  moves: number;
  completed_at: string;
}

// ── Admin ──
export type AdminRole = 'admin' | 'super_admin';

export interface Admin {
  id: string;
  auth_user_id: string;
  role: AdminRole;
  active: boolean;
  created_at: string;
}

// ── Event Settings ──
export interface EventSettings {
  id: string;
  event_name: string;
  registration_enabled: boolean;
  leaderboard_enabled: boolean;
  max_attempts: number;
  scoring_version: string;
  created_at: string;
  updated_at: string;
}

// ── Audit Log ──
export interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

// ── Puzzle Tile State ──
export interface TilePosition {
  row: number;
  col: number;
}

export interface PuzzleGameState {
  tiles: number[]; // flat array of 16 values (0 = empty)
  emptyIndex: number;
  gridSize: number;
  moves: number;
  isCompleted: boolean;
}

// ── Dashboard Metrics ──
export interface DashboardMetrics {
  totalRegistrations: number;
  gamesStarted: number;
  gamesCompleted: number;
  completionRate: number;
  avgCompletionTime: number;
  medianCompletionTime: number;
  avgMoves: number;
  medianMoves: number;
  avgScore: number;
  abandonedSessions: number;
  studentsByCourse: Record<string, number>;
  studentsByYear: Record<number, number>;
  scoreDistribution: { range: string; count: number }[];
}
