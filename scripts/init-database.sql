-- Create recovery_data table
CREATE TABLE IF NOT EXISTS recovery_data (
    id SERIAL PRIMARY KEY,
    start_date DATE NOT NULL,
    current_streak INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create journal_entries table
CREATE TABLE IF NOT EXISTS journal_entries (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create relapse_records table
CREATE TABLE IF NOT EXISTS relapse_records (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    day_count INTEGER NOT NULL,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_recovery_data_created_at ON recovery_data(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(date DESC);
CREATE INDEX IF NOT EXISTS idx_relapse_records_date ON relapse_records(date DESC);
