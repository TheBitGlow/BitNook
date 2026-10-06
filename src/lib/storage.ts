'use client'

import { useSyncExternalStore, useCallback } from 'react'

const STORAGE_KEY_FAVORITES = 'bitnook_favorite_tools'
const STORAGE_KEY_RECENT = 'bitnook_recent_tools'
const STORAGE_KEY_RECENT_GAMES = 'bitnook_recent_games'

const EMPTY_ARRAY: string[] = []
const cacheMap = new Map<string, { raw: string | null; parsed: string[] }>()

function getCachedStorageArray(key: string): string[] {
  if (typeof window === 'undefined') return EMPTY_ARRAY
  try {
    const raw = localStorage.getItem(key)
    const cached = cacheMap.get(key)
    if (cached && cached.raw === raw) {
      return cached.parsed
    }
    const parsed = raw ? JSON.parse(raw) : EMPTY_ARRAY
    const result = Array.isArray(parsed) ? parsed : EMPTY_ARRAY
    cacheMap.set(key, { raw, parsed: result })
    return result
  } catch {
    return EMPTY_ARRAY
  }
}

function safeSetItem(key: string, value: any): void {
  if (typeof window === 'undefined') return
  try {
    const raw = JSON.stringify(value)
    localStorage.setItem(key, raw)
    cacheMap.set(key, { raw, parsed: value })
    window.dispatchEvent(new Event(`storage_${key}`))
  } catch {
    // Ignore storage quota or disabled errors
  }
}

function createSubscriber(key: string) {
  return (callback: () => void) => {
    if (typeof window === 'undefined') return () => {}
    const handleUpdate = () => callback()
    window.addEventListener(`storage_${key}`, handleUpdate)
    window.addEventListener('storage', handleUpdate)
    return () => {
      window.removeEventListener(`storage_${key}`, handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }
}

function getServerSnapshot(): string[] {
  return EMPTY_ARRAY
}

// Module-level subscribers and snapshot getters for permanent reference stability
const subscribeFavorites = createSubscriber(STORAGE_KEY_FAVORITES)
const getFavoritesSnapshot = () => getCachedStorageArray(STORAGE_KEY_FAVORITES)

const subscribeRecentTools = createSubscriber(STORAGE_KEY_RECENT)
const getRecentToolsSnapshot = () => getCachedStorageArray(STORAGE_KEY_RECENT)

const subscribeRecentGames = createSubscriber(STORAGE_KEY_RECENT_GAMES)
const getRecentGamesSnapshot = () => getCachedStorageArray(STORAGE_KEY_RECENT_GAMES)

// Hook for Favorite Tools
export function useFavorites() {
  const favorites = useSyncExternalStore(subscribeFavorites, getFavoritesSnapshot, getServerSnapshot)
  const isLoaded = typeof window !== 'undefined'

  const toggleFavorite = useCallback((slug: string) => {
    const current = getCachedStorageArray(STORAGE_KEY_FAVORITES)
    const next = current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug]
    safeSetItem(STORAGE_KEY_FAVORITES, next)
  }, [])

  const isFavorite = useCallback(
    (slug: string) => favorites.includes(slug),
    [favorites]
  )

  return { favorites, toggleFavorite, isFavorite, isLoaded }
}

const STORAGE_KEY_RECENT_TIMESTAMPS = 'bitnook_recent_tools_timestamps'
const STORAGE_KEY_RECENT_GAMES_TIMESTAMPS = 'bitnook_recent_games_timestamps'

export function getRecentToolTimestamp(slug: string): number | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RECENT_TIMESTAMPS)
    if (!raw) return null
    const map = JSON.parse(raw)
    return map[slug] || null
  } catch {
    return null
  }
}

export function getRecentGameTimestamp(slug: string): number | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RECENT_GAMES_TIMESTAMPS)
    if (!raw) return null
    const map = JSON.parse(raw)
    return map[slug] || null
  } catch {
    return null
  }
}

// Hook for Recent Tools
export function useRecentTools(maxItems = 8) {
  const recentTools = useSyncExternalStore(subscribeRecentTools, getRecentToolsSnapshot, getServerSnapshot)
  const isLoaded = typeof window !== 'undefined'

  const recordRecentTool = useCallback(
    (slug: string) => {
      if (!slug) return
      const current = getCachedStorageArray(STORAGE_KEY_RECENT)
      const filtered = current.filter((s) => s !== slug)
      const next = [slug, ...filtered].slice(0, maxItems)
      safeSetItem(STORAGE_KEY_RECENT, next)

      try {
        const raw = localStorage.getItem(STORAGE_KEY_RECENT_TIMESTAMPS)
        const map = raw ? JSON.parse(raw) : {}
        map[slug] = Date.now()
        localStorage.setItem(STORAGE_KEY_RECENT_TIMESTAMPS, JSON.stringify(map))
      } catch {
        // Ignore storage error
      }
    },
    [maxItems]
  )

  return { recentTools, recordRecentTool, isLoaded }
}

// Hook for Recent Games
export function useRecentGames(maxItems = 4) {
  const recentGames = useSyncExternalStore(subscribeRecentGames, getRecentGamesSnapshot, getServerSnapshot)
  const isLoaded = typeof window !== 'undefined'

  const recordRecentGame = useCallback(
    (slug: string) => {
      if (!slug) return
      const current = getCachedStorageArray(STORAGE_KEY_RECENT_GAMES)
      const filtered = current.filter((s) => s !== slug)
      const next = [slug, ...filtered].slice(0, maxItems)
      safeSetItem(STORAGE_KEY_RECENT_GAMES, next)

      try {
        const raw = localStorage.getItem(STORAGE_KEY_RECENT_GAMES_TIMESTAMPS)
        const map = raw ? JSON.parse(raw) : {}
        map[slug] = Date.now()
        localStorage.setItem(STORAGE_KEY_RECENT_GAMES_TIMESTAMPS, JSON.stringify(map))
      } catch {
        // Ignore storage error
      }
    },
    [maxItems]
  )

  return { recentGames, recordRecentGame, isLoaded }
}

// ==================== Game High Score / Records ====================

const STORAGE_PREFIX_GAME_SCORE = 'bitnook_game_score_'

export function getGameHighScore(slug: string): number {
  if (typeof window === 'undefined') return 0
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX_GAME_SCORE}${slug}`)
    return raw ? Number(raw) || 0 : 0
  } catch {
    return 0
  }
}

export function saveGameHighScore(slug: string, score: number): void {
  if (typeof window === 'undefined') return
  try {
    const current = getGameHighScore(slug)
    if (score > current) {
      localStorage.setItem(`${STORAGE_PREFIX_GAME_SCORE}${slug}`, String(score))
      window.dispatchEvent(new Event(`storage_${STORAGE_PREFIX_GAME_SCORE}${slug}`))
      window.dispatchEvent(new Event('storage'))
    }
  } catch {
    // ignore
  }
}

export function useGameHighScore(slug: string) {
  const subscribe = useCallback(
    (callback: () => void) => {
      if (typeof window === 'undefined') return () => {}
      const handle = () => callback()
      window.addEventListener(`storage_${STORAGE_PREFIX_GAME_SCORE}${slug}`, handle)
      window.addEventListener('storage', handle)
      return () => {
        window.removeEventListener(`storage_${STORAGE_PREFIX_GAME_SCORE}${slug}`, handle)
        window.removeEventListener('storage', handle)
      }
    },
    [slug]
  )

  const getSnapshot = useCallback(() => getGameHighScore(slug), [slug])
  const getServerSnapshot = useCallback(() => 0, [])

  const highScore = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const setScore = useCallback(
    (newScore: number) => {
      saveGameHighScore(slug, newScore)
    },
    [slug]
  )

  return { highScore, setScore }
}
