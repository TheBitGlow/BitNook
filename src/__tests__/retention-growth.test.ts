import { describe, it, expect } from 'vitest'
import {
  TOOLS,
  getActiveTools,
  getDeprecatedTools,
  getAllTools,
  getSTierTools,
  getToolsByTier,
  getRelatedTools,
  getToolBySlug,
} from '../config/tools'
import { getAllGames } from '../config/games'
import { matchPinyin, PINYIN_INDEX } from '../config/searchIndex'
import { getGameHighScore, saveGameHighScore } from '../lib/storage'

describe('Retention and Growth Engine Verification', () => {
  it('should have exact tool counts across categories and statuses', () => {
    const active = getActiveTools()
    const deprecated = getDeprecatedTools()
    const total = getAllTools()
    const games = getAllGames()

    // 1. Strict tool count verification
    expect(active.length).toBe(35)
    expect(deprecated.length).toBe(4)
    expect(total.length).toBe(39)
    expect(games.length).toBe(8)

    // 2. Tiers breakdown
    const sTier = getSTierTools()
    const aTier = getToolsByTier('A')
    const bTier = getToolsByTier('B')

    expect(sTier.length).toBe(15) // 15 Flagship tools
    expect(aTier.length).toBe(14)
    expect(bTier.length).toBe(6)
    expect(sTier.length + aTier.length + bTier.length).toBe(35)
  })

  it('should ensure all 14 Flagship S-Tier tools exist and have 3-5 valid related tools', () => {
    const flagshipSlugs = [
      'mortgage',
      'salary',
      'bmi',
      'timestamp',
      'qrcode',
      'password',
      'word-count',
      'unit',
      'exchange',
      'compound',
      'roi',
      'hash',
      'radix',
      'gpu-calculator',
    ]

    const activeSlugs = new Set(getActiveTools().map((t) => t.slug))

    for (const slug of flagshipSlugs) {
      const tool = getToolBySlug(slug)
      expect(tool).toBeDefined()
      expect(tool?.tier).toBe('S')

      const related = getRelatedTools(tool!)
      expect(related.length).toBeGreaterThanOrEqual(3)
      expect(related.length).toBeLessThanOrEqual(5)

      for (const rel of related) {
        expect(activeSlugs.has(rel.slug)).toBe(true)
        // Ensure no self-referential related tool
        expect(rel.slug).not.toBe(slug)
      }
    }
  })

  it('should verify search pinyin and keyword matching works accurately', () => {
    // 1. Pinyin query matching
    expect(matchPinyin('mortgage', 'fangdai')).toBe(true)
    expect(matchPinyin('mortgage', 'yuegong')).toBe(true)
    expect(matchPinyin('bmi', 'tizhi')).toBe(true)
    expect(matchPinyin('exchange', 'huilv')).toBe(true)
    expect(matchPinyin('password', 'mima')).toBe(true)
    expect(matchPinyin('gpu-calculator', 'xiancun')).toBe(true)
    expect(matchPinyin('snake', 'tanchishe')).toBe(true)

    // 2. Negative test
    expect(matchPinyin('mortgage', 'nonexistentterm123')).toBe(false)
  })

  it('should ensure exchange tool is marked as local processing and references benchmark dataset', () => {
    const exchange = getToolBySlug('exchange')
    expect(exchange).toBeDefined()
    expect(exchange?.privacyMode).toBe('local')
    expect(exchange?.name).toBe('参考汇率换算器')
    expect(exchange?.seoTitle).toContain('参考汇率')
  })

  it('should ensure lottery and password avoid hardware random claims and use CSPRNG', () => {
    const lottery = getToolBySlug('lottery')
    expect(lottery).toBeDefined()
    expect(lottery?.seoDescription).not.toContain('硬件随机')

    const password = getToolBySlug('password')
    expect(password).toBeDefined()
    expect(password?.seoTitle).toContain('密码学安全随机数')
  })

  it('should verify game high score storage helper is robust and non-destructive', () => {
    // In node environment without window, should return 0 safely without throwing
    expect(getGameHighScore('tetris')).toBe(0)
    saveGameHighScore('tetris', 1500)
    expect(getGameHighScore('tetris')).toBe(0) // Safe in SSR
  })
})
