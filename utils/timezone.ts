// 时区工具函数 - 统一使用UTC+8
export const TIMEZONE_OFFSET = 8 // UTC+8 的小时偏移量

// 获取当前UTC+8时间
export function getCurrentDateInUTC8(): Date {
  const now = new Date()
  // 创建一个新的Date对象，表示UTC+8时间
  const utc8Date = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Shanghai" }))
  return utc8Date
}

// 将日期转换为UTC+8的日期字符串 (YYYY-MM-DD)
export function formatDateToUTC8String(date?: Date): string {
  const targetDate = date || getCurrentDateInUTC8()
  const utc8Date = new Date(targetDate.toLocaleString("en-US", { timeZone: "Asia/Shanghai" }))

  const year = utc8Date.getFullYear()
  const month = String(utc8Date.getMonth() + 1).padStart(2, "0")
  const day = String(utc8Date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

// 从UTC+8日期字符串创建Date对象
export function createDateFromUTC8String(dateString: string): Date {
  // 直接使用日期字符串创建Date对象，然后转换为UTC+8
  const date = new Date(dateString + "T00:00:00+08:00")
  return date
}

// 计算两个UTC+8日期之间的天数差
export function calculateDaysDifference(startDateString: string, endDate?: Date): number {
  const startDate = createDateFromUTC8String(startDateString)
  const currentDate = endDate || getCurrentDateInUTC8()

  // 将两个日期都转换为UTC+8的午夜时间进行比较
  const startUTC8 = new Date(startDate.toLocaleString("en-US", { timeZone: "Asia/Shanghai" }))
  const endUTC8 = new Date(currentDate.toLocaleString("en-US", { timeZone: "Asia/Shanghai" }))

  startUTC8.setHours(0, 0, 0, 0)
  endUTC8.setHours(0, 0, 0, 0)

  const diffTime = endUTC8.getTime() - startUTC8.getTime()
  return Math.floor(diffTime / (1000 * 60 * 60 * 24))
}

// 获取UTC+8时间的年月日信息
export function getUTC8DateInfo(date?: Date) {
  const targetDate = date || getCurrentDateInUTC8()
  const utc8Date = new Date(targetDate.toLocaleString("en-US", { timeZone: "Asia/Shanghai" }))

  return {
    year: utc8Date.getFullYear(),
    month: utc8Date.getMonth(),
    date: utc8Date.getDate(),
    day: utc8Date.getDay(),
  }
}

// 格式化UTC+8时间为显示字符串
export function formatUTC8DateForDisplay(date?: Date): string {
  const targetDate = date || getCurrentDateInUTC8()
  const utc8Date = new Date(targetDate.toLocaleString("en-US", { timeZone: "Asia/Shanghai" }))

  const year = utc8Date.getFullYear()
  const month = String(utc8Date.getMonth() + 1).padStart(2, "0")
  const day = String(utc8Date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

// 获取当前UTC+8时间戳（用于数据库）
export function getCurrentUTC8Timestamp(): string {
  const utc8Date = getCurrentDateInUTC8()
  // 返回ISO格式的时间戳，但确保是UTC+8时间
  return new Date(utc8Date.getTime() - utc8Date.getTimezoneOffset() * 60000 + 8 * 60 * 60000).toISOString()
}

// 调试函数：显示当前时间信息
export function debugTimeInfo() {
  const now = new Date()
  const utc8 = getCurrentDateInUTC8()

  console.log("=== 时间调试信息 ===")
  console.log("本地时间:", now.toString())
  console.log("本地时区:", Intl.DateTimeFormat().resolvedOptions().timeZone)
  console.log("UTC+8时间:", utc8.toString())
  console.log("UTC+8日期字符串:", formatDateToUTC8String())
  console.log("==================")
}
