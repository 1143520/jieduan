import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/database"

// 时区工具函数
function getCurrentUTC8Timestamp() {
  const now = new Date()
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  const utc8 = new Date(utc + 8 * 60 * 60000) // UTC+8
  return utc8.toISOString()
}

export async function GET() {
  try {
    const db = getDatabase()
    const stmt = db.prepare(`
      SELECT * FROM journal_entries 
      ORDER BY date DESC
    `)

    const result = stmt.all()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching journal entries:", error)
    return NextResponse.json({ error: "Failed to fetch journal entries" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { date, content } = await request.json()
    const utc8Timestamp = getCurrentUTC8Timestamp()
    const db = getDatabase()

    const stmt = db.prepare(`
      INSERT INTO journal_entries (date, content, created_at, updated_at)
      VALUES (?, ?, ?, ?)
    `)

    const result = stmt.run(date, content, utc8Timestamp, utc8Timestamp)

    // 获取插入的记录
    const selectStmt = db.prepare("SELECT * FROM journal_entries WHERE id = ?")
    const insertedRecord = selectStmt.get(result.lastInsertRowid)

    return NextResponse.json(insertedRecord)
  } catch (error) {
    console.error("Error creating journal entry:", error)
    return NextResponse.json({ error: "Failed to create journal entry" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, content } = await request.json()
    const utc8Timestamp = getCurrentUTC8Timestamp()
    const db = getDatabase()

    const stmt = db.prepare(`
      UPDATE journal_entries 
      SET content = ?, updated_at = ?
      WHERE id = ?
    `)

    stmt.run(content, utc8Timestamp, id)

    // 获取更新后的记录
    const selectStmt = db.prepare("SELECT * FROM journal_entries WHERE id = ?")
    const updatedRecord = selectStmt.get(id)

    return NextResponse.json(updatedRecord)
  } catch (error) {
    console.error("Error updating journal entry:", error)
    return NextResponse.json({ error: "Failed to update journal entry" }, { status: 500 })
  }
}
