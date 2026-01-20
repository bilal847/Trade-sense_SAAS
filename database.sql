-- TradeSense Quant Database Schema (PostgreSQL Compatible)

-- Drop tables if they exist (for clean re-import)
-- DROP TABLE IF EXISTS payments, learning_progress, quiz_attempts, quizzes, learning_lessons, learning_modules, watchlist_items, watchlists, equity_snapshots, trades, positions, user_challenges, challenges, instruments, users CASCADE;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    role VARCHAR(20) DEFAULT 'user' NOT NULL, -- user, admin, superadmin
    last_login TIMESTAMP,
    
    -- Suspension details
    suspension_type VARCHAR(20), -- TEMPORARY, PERMANENT
    suspension_end TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Instruments table
CREATE TABLE IF NOT EXISTS instruments (
    id SERIAL PRIMARY KEY,
    asset_class VARCHAR(20) NOT NULL,
    display_symbol VARCHAR(20) NOT NULL,
    provider VARCHAR(20) NOT NULL,
    provider_symbol VARCHAR(20) NOT NULL,
    exchange VARCHAR(50),
    currency VARCHAR(10) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    min_qty DECIMAL(15,8) DEFAULT 0.01,
    max_qty DECIMAL(15,8) DEFAULT 1000000.0,
    tick_size DECIMAL(15,8) DEFAULT 0.00001,
    metadata_json JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Challenges table
CREATE TABLE IF NOT EXISTS challenges (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    start_balance DECIMAL(15,2) NOT NULL DEFAULT 10000.00,
    daily_max_loss DECIMAL(5,4) NOT NULL DEFAULT 0.0500,
    total_max_loss DECIMAL(5,4) NOT NULL DEFAULT 0.1000,
    profit_target DECIMAL(5,4) NOT NULL DEFAULT 0.1000,
    max_duration_days INTEGER,
    max_trade_quantity DECIMAL(15,8),
    is_active BOOLEAN DEFAULT TRUE,
    rules_json JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Challenges table
CREATE TABLE IF NOT EXISTS user_challenges (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    challenge_id INTEGER REFERENCES challenges(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'IN_PROGRESS', 
    start_balance DECIMAL(15,2) NOT NULL,
    start_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    daily_start_equity DECIMAL(15,2) NOT NULL,
    current_equity DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    max_equity DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    min_equity DECIMAL(15,2) NOT NULL DEFAULT 999999999.00,
    min_equity_all_time DECIMAL(15,2) DEFAULT 0.00,
    min_equity_today DECIMAL(15,2) DEFAULT 0.00,
    last_eval_at TIMESTAMP,
    stats_json JSONB,
    
    -- Violation monitoring
    violated_rules JSONB, -- List of strings
    flagged_by_admin BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Positions table
CREATE TABLE IF NOT EXISTS positions (
    id SERIAL PRIMARY KEY,
    user_challenge_id INTEGER REFERENCES user_challenges(id) ON DELETE CASCADE,
    instrument_id INTEGER REFERENCES instruments(id) ON DELETE CASCADE,
    side VARCHAR(10) NOT NULL, -- LONG or SHORT
    qty DECIMAL(15,8) NOT NULL,
    avg_price DECIMAL(15,8) NOT NULL,
    opened_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trades table
CREATE TABLE IF NOT EXISTS trades (
    id SERIAL PRIMARY KEY,
    user_challenge_id INTEGER REFERENCES user_challenges(id) ON DELETE CASCADE,
    instrument_id INTEGER REFERENCES instruments(id) ON DELETE CASCADE,
    side VARCHAR(10) NOT NULL, -- BUY or SELL
    qty DECIMAL(15,8) NOT NULL,
    price DECIMAL(15,8) NOT NULL,
    fee DECIMAL(15,8) DEFAULT 0.00,
    realized_pnl DECIMAL(15,8) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Equity Snapshots table
CREATE TABLE IF NOT EXISTS equity_snapshots (
    id SERIAL PRIMARY KEY,
    user_challenge_id INTEGER REFERENCES user_challenges(id) ON DELETE CASCADE,
    instrument_id INTEGER REFERENCES instruments(id) ON DELETE SET NULL,
    equity DECIMAL(15,2) NOT NULL,
    balance DECIMAL(15,2) NOT NULL,
    unrealized_pnl DECIMAL(15,2) NOT NULL,
    ts TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Watchlists table
CREATE TABLE IF NOT EXISTS watchlists (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Watchlist Items table
CREATE TABLE IF NOT EXISTS watchlist_items (
    id SERIAL PRIMARY KEY,
    watchlist_id INTEGER REFERENCES watchlists(id) ON DELETE CASCADE,
    instrument_id INTEGER REFERENCES instruments(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Learning Modules table
CREATE TABLE IF NOT EXISTS learning_modules (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(500),
    order_num INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Learning Lessons table
CREATE TABLE IF NOT EXISTS learning_lessons (
    id SERIAL PRIMARY KEY,
    module_id INTEGER REFERENCES learning_modules(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    order_num INTEGER DEFAULT 0,
    lesson_type VARCHAR(50) DEFAULT 'text', 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
    id SERIAL PRIMARY KEY,
    lesson_id INTEGER REFERENCES learning_lessons(id) ON DELETE CASCADE,
    question VARCHAR(500) NOT NULL,
    options_json JSONB NOT NULL,
    correct_answer VARCHAR(100) NOT NULL,
    explanation VARCHAR(1000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quiz Attempts table
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
    selected_answer VARCHAR(100) NOT NULL,
    is_correct BOOLEAN NOT NULL,
    score DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Learning Progress table
CREATE TABLE IF NOT EXISTS learning_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    module_id INTEGER REFERENCES learning_modules(id) ON DELETE CASCADE,
    lesson_id INTEGER REFERENCES learning_lessons(id) ON DELETE SET NULL,
    completed BOOLEAN DEFAULT FALSE,
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    plan VARCHAR(50) NOT NULL, 
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'PENDING', 
    provider VARCHAR(20) DEFAULT 'MOCK', 
    provider_transaction_id VARCHAR(100),
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_instruments_symbol ON instruments(display_symbol);
CREATE INDEX IF NOT EXISTS idx_user_challenges_user ON user_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenges_status ON user_challenges(status);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);