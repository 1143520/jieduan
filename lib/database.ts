import Database from "better-sqlite3"
import { join } from "path"

let db: Database.Database

function getDatabase() {
  if (!db) {
    const dbPath =
      process.env.NODE_ENV === "production" ? "/app/data/recovery.db" : join(process.cwd(), "data", "recovery.db")

    // 确保数据目录存在
    const fs = require("fs")
    const path = require("path")
    const dataDir = path.dirname(dbPath)

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    db = new Database(dbPath)

    // 初始化数据库表
    initializeDatabase()
  }

  return db
}

function initializeDatabase() {
  const initSQL = `
    -- Create recovery_data table
    CREATE TABLE IF NOT EXISTS recovery_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        start_date DATE NOT NULL,
        current_streak INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Create journal_entries table
    CREATE TABLE IF NOT EXISTS journal_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date DATE NOT NULL UNIQUE,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Create relapse_records table
    CREATE TABLE IF NOT EXISTS relapse_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date DATE NOT NULL,
        day_count INTEGER NOT NULL,
        note TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_recovery_data_created_at ON recovery_data(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(date DESC);
    CREATE INDEX IF NOT EXISTS idx_relapse_records_date ON relapse_records(date DESC);
  `

  db.exec(initSQL)
}

export { getDatabase }
