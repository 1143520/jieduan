import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/database"

// 时区工具函数
function getCurrentUTC8Date() {
  const now = new Date()
  const utc8Date = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Shanghai" }))
  return utc8Date
}

function formatUTC8DateString(date: Date) {
  const utc8Date = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Shanghai" }))
  const year = utc8Date.getFullYear()
  const month = String(utc8Date.getMonth() + 1).padStart(2, "0")
  const day = String(utc8Date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export async function GET() {
  try {
    const db = getDatabase()

    // Get recovery start date
    const recoveryStmt = db.prepare(`
      SELECT start_date FROM recovery_data 
      ORDER BY created_at DESC 
      LIMIT 1
    `)
    const recoveryResult = recoveryStmt.get() as { start_date: string } | undefined

    if (!recoveryResult) {
      return NextResponse.json({})
    }

    const startDate = recoveryResult.start_date

    // Get relapse dates
    const relapseStmt = db.prepare("SELECT date FROM relapse_records")
    const relapseResult = relapseStmt.all() as { date: string }[]

    const calendarData: { [key: string]: "success" | "relapse" | "neutral" } = {}

    // Mark relapse dates
    relapseResult.forEach((relapse) => {
      calendarData[relapse.date] = "relapse"
    })

    // Mark success dates (from start date to today, excluding relapse dates)
    const start = new Date(startDate + "T00:00:00")
    const today = getCurrentUTC8Date()
    const current = new Date(start)

    while (current <= today) {
      const dateStr = formatUTC8DateString(current)
      if (!calendarData[dateStr]) {
        calendarData[dateStr] = "success"
      }
      current.setDate(current.getDate() + 1)
    }

    return NextResponse.json(calendarData)
  } catch (error) {
    console.error("Error fetching calendar data:", error)
    return NextResponse.json({ error: "Failed to fetch calendar data" }, { status: 500 })
  }
}
