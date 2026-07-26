"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <div className="w-9 h-9" />

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-9 h-9 rounded-full premium-glass-secondary hover:premium-glass-hover text-foreground flex items-center justify-center transition-all duration-300"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.8)]" />
      ) : (
        <Moon className="h-4 w-4 text-indigo-600 drop-shadow-[0_0_8px_rgba(79,70,229,0.4)]" />
      )}
    </button>
  )
}
