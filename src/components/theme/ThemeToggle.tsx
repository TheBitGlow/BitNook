'use client'

import React, { useSyncExternalStore } from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from './ThemeProvider'

function subscribe(callback: () => void) {
  // Empty subscription because mounting state does not change after client initial render
  return () => {
    void callback
  }
}

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()
  const mounted = useSyncExternalStore(subscribe, () => true, () => false)

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="切换浅色与深色模式"
        className={`inline-flex items-center justify-center w-8 h-8 rounded-md border border-border bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors ${className}`}
      >
        <span className="w-4 h-4 opacity-0" />
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === 'light' ? '切换为深色模式' : '切换为浅色模式'}
      title={theme === 'light' ? '切换为深色模式' : '切换为浅色模式'}
      className={`inline-flex items-center justify-center w-8 h-8 rounded-md border border-border bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors active:scale-95 ${className}`}
    >
      {theme === 'light' ? (
        <Moon className="w-4 h-4 text-text-secondary transition-transform duration-200" />
      ) : (
        <Sun className="w-4 h-4 text-amber-400 transition-transform duration-200" />
      )}
    </button>
  )
}
