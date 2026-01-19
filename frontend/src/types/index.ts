// User types
export interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  is_verified: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

// Instrument types
export interface Instrument {
  id: number;
  asset_class: string; // 'FX', 'CRYPTO', 'STOCK'
  display_symbol: string;
  provider: string; // 'BINANCE', 'MT5', 'MOROCCO'
  provider_symbol: string;
  exchange: string;
  currency: string;
  active: boolean;
  min_qty?: number;
  max_qty?: number;
  tick_size?: number;
  metadata_json?: any;
  created_at: string;
  updated_at: string;
}

// Challenge types
export interface Challenge {
  id: number;
  name: string;
  description?: string;
  start_balance: number;
  daily_max_loss: number;
  total_max_loss: number;
  profit_target: number;
  max_duration_days?: number;
  is_active: boolean;
  rules_json?: any;
  created_at: string;
  updated_at: string;
}

export interface UserChallenge {
  id: number;
  user_id: number;
  challenge_id: number;
  status: string; // 'IN_PROGRESS', 'PASSED', 'FAILED'
  start_balance: number;
  start_time: string;
  end_time?: string;
  daily_start_equity: number;
  current_equity: number;
  max_equity: number;
  min_equity: number;
  min_equity_all_time: number;
  min_equity_today: number;
  last_eval_at?: string;
  stats_json?: any;
  created_at: string;
  updated_at: string;
  daily_drawdown?: number;
  total_drawdown?: number;
  profit_percentage?: number;
}

// Position types
export interface Position {
  id: number;
  user_challenge_id: number;
  instrument_id: number;
  side: string; // 'LONG' or 'SHORT'
  qty: number;
  avg_price: number;
  opened_at: string;
  created_at: string;
  updated_at: string;
}

// Trade types
export interface Trade {
  id: number;
  user_challenge_id: number;
  instrument_id: number;
  side: string; // 'BUY' or 'SELL'
  qty: number;
  price: number;
  fee: number;
  realized_pnl: number;
  created_at: string;
  updated_at: string;
}

// Quote types
export interface Quote {
  bid: number;
  ask: number;
  last: number;
  ts: number; // timestamp
}

// OHLCV types
export interface OHLCV {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Equity Snapshot types
export interface EquitySnapshot {
  id: number;
  user_challenge_id: number;
  instrument_id?: number;
  equity: number;
  balance: number;
  unrealized_pnl: number;
  ts: string;
  created_at: string;
  updated_at: string;
}

// Signal types
export interface Signal {
  instrument: string;
  direction: 'LONG' | 'SHORT' | 'NEUTRAL';
  confidence: number;
  indicators: {
    rsi?: number;
    ema20?: number;
    ema50?: number;
    regime?: 'LOW' | 'MED' | 'HIGH';
  };
  notes: string[];
}

// Leaderboard types
export interface LeaderboardEntry {
  user_id: number;
  user_name: string;
  challenge_id: number;
  profit_percentage: number;
  equity: number;
  status: string; // 'PASSED', 'FAILED', 'IN_PROGRESS'
  duration: number; // in days
  created_at: string;
}

// Payment types
export interface Payment {
  id: number;
  user_id: number;
  plan: string; // 'BASIC', 'PREMIUM', 'PRO'
  amount: number;
  currency: string;
  status: string; // 'PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'
  provider: string; // 'MOCK', 'PAYPAL', 'STRIPE'
  provider_transaction_id?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

// Learning types
export interface LearningModule {
  id: number;
  title: string;
  description?: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LearningLesson {
  id: number;
  module_id: number;
  title: string;
  content?: string;
  order: number;
  lesson_type: string; // 'TEXT', 'VIDEO', 'QUIZ', 'LAB'
  content_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Quiz {
  id: number;
  lesson_id: number;
  question: string;
  options: string[];
  correct_answer: number;
  created_at: string;
  updated_at: string;
}

export interface QuizAttempt {
  id: number;
  user_id: number;
  quiz_id: number;
  selected_answer: number;
  is_correct: boolean;
  created_at: string;
  updated_at: string;
}

export interface LearningProgress {
  id: number;
  user_id: number;
  lesson_id: number;
  completed: boolean;
  score?: number;
  created_at: string;
  updated_at: string;
}