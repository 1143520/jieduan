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
      SELECT * FROM recovery_data 
      ORDER BY created_at DESC 
      LIMIT 1
    `)

    const result = stmt.get()

    if (!result) {
      return NextResponse.json(null)
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching recovery data:", error)
    return NextResponse.json({ error: "Failed to fetch recovery data" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { startDate } = await request.json()
    const utc8Timestamp = getCurrentUTC8Timestamp()
    const db = getDatabase()

    const stmt = db.prepare(`
      INSERT INTO recovery_data (start_date, current_streak, created_at, updated_at)
      VALUES (?, 0, ?, ?)
    `)

    const result = stmt.run(startDate, utc8Timestamp, utc8Timestamp)

    // 获取插入的记录
    const selectStmt = db.prepare("SELECT * FROM recovery_data WHERE id = ?")
    const insertedRecord = selectStmt.get(result.lastInsertRowid)

    return NextResponse.json(insertedRecord)
  } catch (error) {
    console.error("Error creating recovery data:", error)
    return NextResponse.json({ error: "Failed to create recovery data" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { startDate } = await request.json()
    const utc8Timestamp = getCurrentUTC8Timestamp()
    const db = getDatabase()

    // 获取最新记录的ID
    const getLatestStmt = db.prepare(`
      SELECT id FROM recovery_data 
      ORDER BY created_at DESC 
      LIMIT 1
    `)
    const latestRecord = getLatestStmt.get() as { id: number } | undefined

    if (!latestRecord) {
      return NextResponse.json({ error: "No recovery data found" }, { status: 404 })
    }

    const updateStmt = db.prepare(`
      UPDATE recovery_data 
      SET start_date = ?, current_streak = 0, updated_at = ?
      WHERE id = ?
    `)

    updateStmt.run(startDate, utc8Timestamp, latestRecord.id)

    // 获取更新后的记录
    const selectStmt = db.prepare("SELECT * FROM recovery_data WHERE id = ?")
    const updatedRecord = selectStmt.get(latestRecord.id)

    return NextResponse.json(updatedRecord)
  } catch (error) {
    console.error("Error updating recovery data:", error)
    return NextResponse.json({ error: "Failed to update recovery data" }, { status: 500 })
  }
}
