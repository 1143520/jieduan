"use client"

import { useEffect, useState } from "react"
import { Sparkles } from "lucide-react"

export function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 gradient-bg z-50 flex items-center justify-center">
      <div className="text-center space-y-8">
        <div className="relative">
          <div className="w-20 h-20 mx-auto glass-card rounded-full flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
          <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-primary animate-pulse" />
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-bold gradient-text">自律之路</h2>
          <div className="w-48 h-3 bg-muted/20 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full loading-shimmer"></div>
          </div>
          <p className="text-muted-foreground">正在加载您的成长记录...</p>
        </div>
      </div>
    </div>
  )
}
