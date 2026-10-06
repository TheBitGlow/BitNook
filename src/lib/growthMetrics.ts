/**
 * Anonymous, Zero-PII Growth & Retention Metrics Aggregator for BitNook
 *
 * Implements client-side and test-compatible measurement for:
 * 1. Search → Click Rate
 * 2. Tool Success Rate
 * 3. Favorite Rate
 * 4. Related Tool Click Rate
 * 5. Repeat Tool Usage Rate
 * 6. Download Rate
 * 7. Game Start / Complete Rate
 */

const STORAGE_KEY = 'bitnook_growth_metrics'

export interface GrowthMetricsCounters {
  searches: number
  searchClicks: number
  toolOpens: number
  toolSuccesses: number
  favorites: number
  relatedClicks: number
  downloads: number
  gameStarts: number
  gameCompletes: number
  toolUsageCounts: Record<string, number>
}

export interface GrowthMetricsReport {
  searches: number
  searchClicks: number
  searchToClickRate: number // e.g. 75.0 (75.0%)
  toolOpens: number
  toolSuccesses: number
  toolSuccessRate: number
  favorites: number
  favoriteRate: number
  relatedClicks: number
  relatedToolClickRate: number
  downloads: number
  downloadRate: number
  gameStarts: number
  gameCompletes: number
  gameCompletionRate: number
  repeatToolRate: number
  topTools: { slug: string; count: number }[]
}

const DEFAULT_COUNTERS: GrowthMetricsCounters = {
  searches: 0,
  searchClicks: 0,
  toolOpens: 0,
  toolSuccesses: 0,
  favorites: 0,
  relatedClicks: 0,
  downloads: 0,
  gameStarts: 0,
  gameCompletes: 0,
  toolUsageCounts: {},
}

// In-memory mirror ensuring SSR & Vitest test runners work seamlessly
let memoryCounters: GrowthMetricsCounters = { ...DEFAULT_COUNTERS }

function getStoredCounters(): GrowthMetricsCounters {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return { ...memoryCounters, toolUsageCounts: { ...memoryCounters.toolUsageCounts } }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_COUNTERS }
    const parsed = JSON.parse(raw)
    return {
      searches: Number(parsed.searches) || 0,
      searchClicks: Number(parsed.searchClicks) || 0,
      toolOpens: Number(parsed.toolOpens) || 0,
      toolSuccesses: Number(parsed.toolSuccesses) || 0,
      favorites: Number(parsed.favorites) || 0,
      relatedClicks: Number(parsed.relatedClicks) || 0,
      downloads: Number(parsed.downloads) || 0,
      gameStarts: Number(parsed.gameStarts) || 0,
      gameCompletes: Number(parsed.gameCompletes) || 0,
      toolUsageCounts: typeof parsed.toolUsageCounts === 'object' && parsed.toolUsageCounts ? parsed.toolUsageCounts : {},
    }
  } catch {
    return { ...memoryCounters, toolUsageCounts: { ...memoryCounters.toolUsageCounts } }
  }
}

function saveStoredCounters(counters: GrowthMetricsCounters): void {
  memoryCounters = { ...counters, toolUsageCounts: { ...counters.toolUsageCounts } }
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(counters))
  } catch {
    // Ignore storage quota or disabled errors
  }
}

/**
 * Record an anonymous growth event into client storage counters.
 */
export function recordGrowthEvent(eventName: string, payload?: { toolSlug?: string; gameSlug?: string }): void {
  const current = getStoredCounters()
  const slug = payload?.toolSlug || payload?.gameSlug

  switch (eventName) {
    case 'search':
      current.searches += 1
      break
    case 'search_click':
      current.searchClicks += 1
      break
    case 'tool_open':
      current.toolOpens += 1
      if (slug) {
        current.toolUsageCounts[slug] = (current.toolUsageCounts[slug] || 0) + 1
      }
      break
    case 'tool_success':
      current.toolSuccesses += 1
      break
    case 'favorite':
      current.favorites += 1
      break
    case 'related_click':
    case 'related_tool_click':
      current.relatedClicks += 1
      break
    case 'download':
      current.downloads += 1
      break
    case 'game_start':
      current.gameStarts += 1
      break
    case 'game_complete':
      current.gameCompletes += 1
      break
  }

  saveStoredCounters(current)
}

/**
 * Computes high-level growth ratios and funnel conversion rates.
 */
export function getGrowthMetrics(): GrowthMetricsReport {
  const c = getStoredCounters()

  const safePct = (numerator: number, denominator: number): number => {
    if (!denominator || denominator <= 0) return 0
    return Math.round((numerator / denominator) * 1000) / 10
  }

  // Calculate repeat tool usage (tools used more than once / total unique tools used)
  const uniqueTools = Object.keys(c.toolUsageCounts)
  const repeatedTools = uniqueTools.filter((slug) => (c.toolUsageCounts[slug] || 0) > 1)
  const repeatToolRate = safePct(repeatedTools.length, uniqueTools.length)

  // Rank top tools
  const topTools = uniqueTools
    .map((slug) => ({ slug, count: c.toolUsageCounts[slug] || 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return {
    searches: c.searches,
    searchClicks: c.searchClicks,
    searchToClickRate: safePct(c.searchClicks, c.searches),
    toolOpens: c.toolOpens,
    toolSuccesses: c.toolSuccesses,
    toolSuccessRate: safePct(c.toolSuccesses, c.toolOpens),
    favorites: c.favorites,
    favoriteRate: safePct(c.favorites, c.toolOpens),
    relatedClicks: c.relatedClicks,
    relatedToolClickRate: safePct(c.relatedClicks, c.toolOpens),
    downloads: c.downloads,
    downloadRate: safePct(c.downloads, c.toolOpens),
    gameStarts: c.gameStarts,
    gameCompletes: c.gameCompletes,
    gameCompletionRate: safePct(c.gameCompletes, c.gameStarts),
    repeatToolRate,
    topTools,
  }
}

/**
 * Reset counters (for test suites or user manual data cleanup).
 */
export function resetGrowthMetrics(): void {
  memoryCounters = {
    searches: 0,
    searchClicks: 0,
    toolOpens: 0,
    toolSuccesses: 0,
    favorites: 0,
    relatedClicks: 0,
    downloads: 0,
    gameStarts: 0,
    gameCompletes: 0,
    toolUsageCounts: {},
  }
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Ignore errors
  }
}
