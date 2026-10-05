import { describe, it, expect } from 'vitest'
import { TOOLS, getAllTools, getActiveTools, getToolBySlug, getToolsByCategory, getFeaturedTools } from '../config/tools'
import { CATEGORIES, getAllCategories, getCategoryBySlug } from '../config/categories'
import { GAMES, getAllGames, getGameBySlug } from '../config/games'

describe('Registry Integrity', () => {
  it('should have all 6 standardized categories', () => {
    const categories = getAllCategories()
    expect(categories.length).toBe(6)
    const slugs = categories.map((c) => c.slug)
    expect(slugs).toEqual(['daily', 'finance', 'health', 'convert', 'network', 'ai'])
  })

  it('should correctly look up categories by slug', () => {
    expect(getCategoryBySlug('finance')).toBeDefined()
    expect(getCategoryBySlug('finance')?.name).toBe('财务工具')
    expect(getCategoryBySlug('invalid_slug')).toBeUndefined()
  })

  it('should contain valid active tools', () => {
    const activeTools = getActiveTools()
    expect(activeTools.length).toBeGreaterThan(30)

    // Check uniqueness of slugs and hrefs
    const slugs = new Set<string>()
    const hrefs = new Set<string>()

    for (const tool of activeTools) {
      expect(slugs.has(tool.slug)).toBe(false)
      expect(hrefs.has(tool.href)).toBe(false)
      slugs.add(tool.slug)
      hrefs.add(tool.href)

      // Ensure valid category
      expect(CATEGORIES[tool.category]).toBeDefined()

      // Ensure SEO fields exist
      expect(tool.seoTitle.length).toBeGreaterThan(5)
      expect(tool.seoDescription.length).toBeGreaterThan(10)
      expect(tool.keywords.length).toBeGreaterThan(0)
    }
  })

  it('must NOT contain any of the purged non-existent AI tools', () => {
    const fakeAIRoutes = ['resume', 'summarize', 'translate', 'video-script', 'email', 'naming']
    const allTools = getAllTools()
    const activeSlugs = allTools.map((t) => t.slug)

    for (const fake of fakeAIRoutes) {
      expect(activeSlugs).not.toContain(fake)
      expect(getToolBySlug(fake)).toBeUndefined()
    }

    // In AI category, only GPU calculator exists
    const aiTools = getToolsByCategory('ai')
    expect(aiTools.length).toBe(1)
    expect(aiTools[0].slug).toBe('gpu-calculator')
  })

  it('should correctly filter tools by category', () => {
    const dailyTools = getToolsByCategory('daily')
    expect(dailyTools.length).toBeGreaterThan(0)
    expect(dailyTools.every((t) => t.category === 'daily')).toBe(true)

    const financeTools = getToolsByCategory('finance')
    expect(financeTools.length).toBeGreaterThan(0)
    expect(financeTools.every((t) => t.category === 'finance')).toBe(true)
  })

  it('should return featured tools with valid entries', () => {
    const featured = getFeaturedTools()
    expect(featured.length).toBeGreaterThan(4)
    expect(featured.map((t) => t.slug)).toContain('mortgage')
    expect(featured.map((t) => t.slug)).toContain('salary')
  })

  it('should register all 8 genuine games', () => {
    const games = getAllGames()
    expect(games.length).toBe(8)
    const slugs = games.map((g) => g.slug)
    expect(slugs).toContain('tetris')
    expect(slugs).toContain('minesweeper')
    expect(slugs).toContain('snake')
    expect(slugs).toContain('gomoku')
    expect(slugs).toContain('match3')
    expect(slugs).toContain('chess-international')
    expect(slugs).toContain('chess-chinese')
    expect(slugs).toContain('freecell')
  })
})
