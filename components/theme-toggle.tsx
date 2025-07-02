"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Sun, Moon, Palette } from "lucide-react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="rounded-full w-12 h-12 glass-card border-0">
        <Palette className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="rounded-full w-12 h-12 glass-card border-0 hover:scale-110 transition-all duration-300"
      aria-label={`切换到${theme === "dark" ? "浅色" : "深色"}模式`}
    >
      <div className="relative">
        {theme === "dark" ? (
          <Sun className="h-5 w-5 text-primary transition-transform duration-300 hover:rotate-12" />
        ) : (
          <Moon className="h-5 w-5 text-primary transition-transform duration-300 hover:rotate-12" />
        )}
      </div>
    </Button>
  )
}
