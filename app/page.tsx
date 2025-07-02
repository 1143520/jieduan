"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Calendar, BookOpen, RotateCcw, Target, CalendarDays, ChevronLeft, ChevronRight, Sparkles } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { LoadingScreen } from "@/components/loading-screen"
import { getCurrentDateInUTC8, formatDateToUTC8String, calculateDaysDifference, debugTimeInfo } from "@/utils/timezone"

interface JournalEntry {
  id?: number
  date: string
  content: string
}

interface RelapseRecord {
  id?: number
  date: string
  dayCount: number
  note?: string
}

interface RecoveryData {
  id?: number
  startDate: string
  currentStreak: number
}

export default function RecoveryTracker() {
  const [recoveryData, setRecoveryData] = useState<RecoveryData | null>(null)
  const [dayCount, setDayCount] = useState<number>(0)
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([])
  const [relapseRecords, setRelapseRecords] = useState<RelapseRecord[]>([])
  const [todayJournal, setTodayJournal] = useState<string>("")
  const [activeTab, setActiveTab] = useState<string>("dashboard")
  const [calendarData, setCalendarData] = useState<{ [key: string]: "success" | "relapse" | "neutral" }>({})
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(() => getCurrentDateInUTC8())
  const [currentQuote, setCurrentQuote] = useState<string>("")

  const motivationalQuotes = [
    "每一天都是新的开始，每一刻都是重新选择的机会。",
    "真正的力量来自于内心的平静与自制。",
    "专注于成长，而不是完美。进步胜过完美。",
    "你比你想象的更强大，比你感受到的更勇敢。",
    "今天的选择决定明天的你。",
    "自律是通往自由的桥梁。",
    "每一次抵制诱惑，都是对内心力量的证明。",
    "坚持不是因为容易，而是因为值得。",
  ]

  useEffect(() => {
    debugTimeInfo()
    loadData()
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]
    setCurrentQuote(randomQuote)
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      const recoveryRes = await fetch("/api/recovery")
      if (recoveryRes.ok) {
        const recovery = await recoveryRes.json()
        setRecoveryData(recovery)
        if (recovery) {
          calculateDayCount(recovery.startDate)
        }
      }

      const journalRes = await fetch("/api/journal")
      if (journalRes.ok) {
        const entries = await journalRes.json()
        setJournalEntries(entries)

        const today = formatDateToUTC8String()
        const todayEntry = entries.find((entry: JournalEntry) => entry.date === today)
        if (todayEntry) {
          setTodayJournal(todayEntry.content)
        }
      }

      const relapseRes = await fetch("/api/relapse")
      if (relapseRes.ok) {
        const relapses = await relapseRes.json()
        setRelapseRecords(relapses)
      }

      await loadCalendarData()
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadCalendarData = async () => {
    try {
      const res = await fetch("/api/calendar")
      if (res.ok) {
        const data = await res.json()
        setCalendarData(data)
      }
    } catch (error) {
      console.error("Error loading calendar data:", error)
    }
  }

  const calculateDayCount = (start: string) => {
    const daysDiff = calculateDaysDifference(start)
    setDayCount(daysDiff)
  }

  const startJourney = async () => {
    try {
      const today = formatDateToUTC8String()
      const res = await fetch("/api/recovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate: today }),
      })

      if (res.ok) {
        const newRecovery = await res.json()
        setRecoveryData(newRecovery)
        setDayCount(0)
        await loadCalendarData()
      }
    } catch (error) {
      console.error("Error starting journey:", error)
    }
  }

  const resetJourney = async () => {
    try {
      if (recoveryData) {
        await fetch("/api/relapse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: formatDateToUTC8String(),
            dayCount: dayCount,
          }),
        })
      }

      const today = formatDateToUTC8String()
      const res = await fetch("/api/recovery", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate: today }),
      })

      if (res.ok) {
        const updatedRecovery = await res.json()
        setRecoveryData(updatedRecovery)
        setDayCount(0)
        await loadData()
      }
    } catch (error) {
      console.error("Error resetting journey:", error)
    }
  }

  const saveJournal = async () => {
    try {
      const today = formatDateToUTC8String()
      const existingEntry = journalEntries.find((entry) => entry.date === today)

      if (existingEntry) {
        const res = await fetch("/api/journal", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: existingEntry.id,
            content: todayJournal,
          }),
        })
        if (res.ok) {
          await loadData()
        }
      } else {
        const res = await fetch("/api/journal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: today,
            content: todayJournal,
          }),
        })
        if (res.ok) {
          await loadData()
        }
      }
    } catch (error) {
      console.error("Error saving journal:", error)
    }
  }

  const renderCalendar = () => {
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()
    const today = getCurrentDateInUTC8()

    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days = []
    const current = new Date(startDate)

    while (current <= lastDay || current.getDay() !== 0) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }

    const monthNames = [
      "一月",
      "二月",
      "三月",
      "四月",
      "五月",
      "六月",
      "七月",
      "八月",
      "九月",
      "十月",
      "十一月",
      "十二月",
    ]

    const dayNames = ["日", "一", "二", "三", "四", "五", "六"]

    const goToPreviousMonth = () => {
      setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
    }

    const goToNextMonth = () => {
      setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
    }

    const goToToday = () => {
      setCurrentDate(getCurrentDateInUTC8())
    }

    return (
      <div className="space-y-8">
        <Card className="glass-card rounded-3xl border-0 overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPreviousMonth}
                className="rounded-full w-10 h-10 p-0 hover:bg-primary/10"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <CardTitle className="text-foreground flex items-center gap-3 text-xl">
                <CalendarDays className="h-6 w-6 text-primary" />
                <span className="gradient-text font-bold">
                  {monthNames[currentMonth]} {currentYear}
                </span>
              </CardTitle>

              <Button
                variant="ghost"
                size="sm"
                onClick={goToNextMonth}
                className="rounded-full w-10 h-10 p-0 hover:bg-primary/10"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="text-sm text-muted-foreground bg-muted/30 px-4 py-2 rounded-full">
                今天是 {formatDateToUTC8String(today)}
              </div>
              {(currentMonth !== today.getMonth() || currentYear !== today.getFullYear()) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToToday}
                  className="modern-button text-sm px-6 py-2 rounded-full border-0 bg-transparent"
                >
                  回到今天
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="px-6 pb-6">
            <div className="grid grid-cols-7 gap-2 mb-4">
              {dayNames.map((day) => (
                <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-3">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {days.map((day, index) => {
                const dateStr = formatDateToUTC8String(day)
                const isCurrentMonth = day.getMonth() === currentMonth
                const isToday = dateStr === formatDateToUTC8String(today)
                const status = calendarData[dateStr] || "neutral"

                let bgColor = "bg-transparent hover:bg-muted/20"
                let borderColor = "border-transparent"

                if (status === "success") {
                  bgColor = "bg-gradient-to-br from-green-500/20 to-green-600/10"
                  borderColor = "border-green-500/30"
                } else if (status === "relapse") {
                  bgColor = "bg-gradient-to-br from-red-500/20 to-red-600/10"
                  borderColor = "border-red-500/30"
                }

                return (
                  <div
                    key={index}
                    className={`
                      aspect-square flex items-center justify-center text-sm border-2 rounded-2xl
                      transition-all duration-300 cursor-pointer
                      ${isCurrentMonth ? "text-foreground" : "text-muted-foreground/50"}
                      ${isToday ? "ring-2 ring-primary ring-offset-2 ring-offset-background font-bold scale-110" : ""}
                      ${bgColor} ${borderColor}
                      hover:scale-105 hover:shadow-lg
                    `}
                  >
                    {day.getDate()}
                  </div>
                )
              })}
            </div>

            <div className="flex justify-center gap-6 mt-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-br from-green-500/30 to-green-600/20 border-2 border-green-500/40 rounded-lg"></div>
                <span className="text-muted-foreground">成功日</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-br from-red-500/30 to-red-600/20 border-2 border-red-500/40 rounded-lg"></div>
                <span className="text-muted-foreground">复发日</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* 主要统计卡片 */}
      <Card className="glass-card rounded-3xl border-0 overflow-hidden float-animation">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl text-foreground mb-2">戒断天数</CardTitle>
        </CardHeader>
        <CardContent className="text-center pb-8">
          <div className="relative">
            <div className="text-8xl font-bold gradient-text mb-4 pulse-glow">{dayCount}</div>
            <div className="absolute -top-2 -right-2">
              <Sparkles className="h-8 w-8 text-primary animate-pulse" />
            </div>
          </div>
          <p className="text-muted-foreground text-lg mb-4">天</p>
          <div className="text-sm text-muted-foreground bg-muted/20 px-4 py-2 rounded-full inline-block mb-6">
            今天是 {formatDateToUTC8String()}
          </div>
          {!recoveryData && (
            <Button
              onClick={startJourney}
              className="modern-button px-8 py-3 rounded-full text-lg font-semibold"
              disabled={loading}
            >
              <Sparkles className="h-5 w-5 mr-2" />
              开始旅程
            </Button>
          )}
        </CardContent>
      </Card>

      {/* 激励卡片 */}
      <Card className="glass-card rounded-3xl border-0 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-3 text-xl">
            <Target className="h-6 w-6 text-primary" />
            <span className="gradient-text">今日激励</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-2xl">
            <p className="text-foreground text-center text-lg leading-relaxed font-medium">"{currentQuote}"</p>
          </div>
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      {recoveryData && (
        <Card className="glass-card rounded-3xl border-0 overflow-hidden">
          <CardContent className="pt-6">
            <Button
              onClick={resetJourney}
              variant="outline"
              className="w-full py-4 rounded-2xl border-2 border-muted/30 hover:border-primary/30 bg-transparent hover:bg-primary/5 transition-all duration-300"
              disabled={loading}
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              重新开始
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderJournal = () => (
    <div className="space-y-8">
      {/* 今日日志 */}
      <Card className="glass-card rounded-3xl border-0 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-3 text-xl">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="gradient-text">今日日志</span>
          </CardTitle>
          <div className="text-sm text-muted-foreground bg-muted/20 px-3 py-1 rounded-full inline-block w-fit">
            {formatDateToUTC8String()}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative">
            <Textarea
              placeholder="记录今天的想法、感受或挑战..."
              value={todayJournal}
              onChange={(e) => setTodayJournal(e.target.value)}
              className="min-h-40 rounded-2xl border-2 border-muted/30 bg-muted/10 backdrop-blur-sm resize-none text-base leading-relaxed"
              disabled={loading}
            />
          </div>
          <Button
            onClick={saveJournal}
            className="modern-button w-full py-3 rounded-2xl font-semibold"
            disabled={loading}
          >
            <BookOpen className="h-5 w-5 mr-2" />
            保存日志
          </Button>
        </CardContent>
      </Card>

      {/* 历史记录 */}
      <Card className="glass-card rounded-3xl border-0 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-3 text-xl">
            <Calendar className="h-6 w-6 text-primary" />
            <span className="gradient-text">历史记录</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {journalEntries.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">暂无日志记录</p>
              </div>
            ) : (
              journalEntries
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((entry, index) => (
                  <div key={entry.id || index} className="bg-muted/10 p-4 rounded-2xl border-l-4 border-primary/50">
                    <div className="text-sm text-primary font-semibold mb-2">{entry.date}</div>
                    <p className="text-foreground leading-relaxed">{entry.content}</p>
                  </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderRelapses = () => (
    <Card className="glass-card rounded-3xl border-0 overflow-hidden">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-3 text-xl">
          <RotateCcw className="h-6 w-6 text-primary" />
          <span className="gradient-text">复发记录</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-80 overflow-y-auto">
          {relapseRecords.length === 0 ? (
            <div className="text-center py-12">
              <Target className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">暂无复发记录</p>
              <p className="text-sm text-muted-foreground/70 mt-2">保持这个状态！</p>
            </div>
          ) : (
            relapseRecords
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((record, index) => (
                <div
                  key={record.id || index}
                  className="flex justify-between items-center p-4 bg-muted/10 rounded-2xl border border-muted/20"
                >
                  <div>
                    <div className="text-foreground font-semibold">{record.date}</div>
                    <div className="text-sm text-muted-foreground">坚持了 {record.dayCount} 天</div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary border-primary/20 px-3 py-1 rounded-full"
                  >
                    第 {relapseRecords.length - index} 次
                  </Badge>
                </div>
              ))
          )}
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen gradient-bg">
      <div className="container mx-auto px-6 py-8 max-w-md relative z-10">
        {/* 头部 */}
        <header className="flex justify-between items-center mb-12">
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold gradient-text mb-3">自律之路</h1>
            <p className="text-muted-foreground">每一天都是新的开始</p>
          </div>
          <ThemeToggle />
        </header>

        {/* 导航 */}
        <nav className="flex justify-center mb-8">
          <div className="glass-card rounded-2xl p-2 flex gap-1">
            {[
              { id: "dashboard", icon: Calendar, label: "主页" },
              { id: "calendar", icon: CalendarDays, label: "日历" },
              { id: "journal", icon: BookOpen, label: "日志" },
              { id: "relapses", icon: RotateCcw, label: "记录" },
            ].map(({ id, icon: Icon, label }) => (
              <Button
                key={id}
                variant={activeTab === id ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(id)}
                className={`
                  rounded-xl px-4 py-2 transition-all duration-300
                  ${
                    activeTab === id
                      ? "modern-button text-primary-foreground shadow-lg"
                      : "hover:bg-primary/10 text-muted-foreground hover:text-foreground"
                  }
                `}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </Button>
            ))}
          </div>
        </nav>

        {/* 主要内容 */}
        <main className="pb-8">
          {activeTab === "dashboard" && renderDashboard()}
          {activeTab === "calendar" && renderCalendar()}
          {activeTab === "journal" && renderJournal()}
          {activeTab === "relapses" && renderRelapses()}
        </main>

        {/* 底部 */}
        <footer className="text-center text-muted-foreground text-sm">
          <div className="bg-muted/10 backdrop-blur-sm px-4 py-2 rounded-full inline-block">
            数据安全存储，支持备份和同步
          </div>
        </footer>
      </div>
    </div>
  )
}
