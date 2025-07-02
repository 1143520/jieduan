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
      SELECT * FROM relapse_records 
      ORDER BY date DESC
    `)

    const result = stmt.all()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching relapse records:", error)
    return NextResponse.json({ error: "Failed to fetch relapse records" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { date, dayCount, note } = await request.json()
    const utc8Timestamp = getCurrentUTC8Timestamp()
    const db = getDatabase()

    const stmt = db.prepare(`
      INSERT INTO relapse_records (date, day_count, note, created_at)
      VALUES (?, ?, ?, ?)
    `)

    const result = stmt.run(date, dayCount, note || null, utc8Timestamp)

    // 获取插入的记录
    const selectStmt = db.prepare("SELECT * FROM relapse_records WHERE id = ?")
    const insertedRecord = selectStmt.get(result.lastInsertRowid)

    return NextResponse.json(insertedRecord)
  } catch (error) {
    console.error("Error creating relapse record:", error)
    return NextResponse.json({ error: "Failed to create relapse record" }, { status: 500 })
  }
}
