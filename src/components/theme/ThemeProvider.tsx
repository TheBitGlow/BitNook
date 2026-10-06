'use client'

import React, { createContext, useContext, useCallback, useSyncExternalStore } from 'react'

export type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
})

const STORAGE_KEY = 'bitnook-theme'

function getThemeSnapshot(): Theme {
  if (typeof window === 'undefined') return 'light'
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null
    if (saved === 'light' || saved === 'dark') return saved
    const docTheme = document.documentElement.getAttribute('data-theme') as Theme | null
    if (docTheme === 'light' || docTheme === 'dark') return docTheme
  } catch {
    // Ignore storage errors
  }
  return 'light'
}

function getServerSnapshot(): Theme {
  return 'light'
}

function subscribe(callback: () => void) {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener('storage', callback)
  window.addEventListener('bitnook-theme-change', callback)
  return () => {
    window.removeEventListener('storage', callback)
    window.removeEventListener('bitnook-theme-change', callback)
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getThemeSnapshot, getServerSnapshot)

  const setTheme = useCallback((nextTheme: Theme) => {
    try {
      localStorage.setItem(STORAGE_KEY, nextTheme)
      document.documentElement.setAttribute('data-theme', nextTheme)
      window.dispatchEvent(new Event('bitnook-theme-change'))
    } catch {
      // Ignore storage errors
    }
  }, [])

  const toggleTheme = useCallback(() => {
    const current = getThemeSnapshot()
    setTheme(current === 'light' ? 'dark' : 'light')
  }, [setTheme])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
