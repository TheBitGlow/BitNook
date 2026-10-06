import { describe, it, expect } from 'vitest'
import { ADS_CONFIG, isAdEnabledForPlacement } from '@/config/ads'
import { GET as getAdsTxt } from '@/app/ads.txt/route'
import fs from 'fs'
import path from 'path'

describe('Monetization & AdSense Readiness Architecture', () => {
  it('defaults ADS_CONFIG.enabled to false for safety', () => {
    // Unless NEXT_PUBLIC_ADS_ENABLED is explicitly set to 'true', it must default to false
    expect(ADS_CONFIG.enabled).toBe(false)
    expect(isAdEnabledForPlacement('tool-bottom')).toBe(false)
  })

  it('prohibits ads in core interactive zones and game boards', () => {
    expect(ADS_CONFIG.prohibitedZones).toContain('/games')
    expect(ADS_CONFIG.prohibitedZones).toContain('/games/*')
    expect(ADS_CONFIG.prohibitedZones).toContain('search-input')
    expect(ADS_CONFIG.prohibitedZones).toContain('hero-section')
  })

  it('guarantees non-zero dimensions for all placements to prevent CLS', () => {
    const placements = Object.values(ADS_CONFIG.placements)
    expect(placements.length).toBeGreaterThan(0)

    for (const p of placements) {
      expect(p.minHeight).toBeGreaterThan(0)
      expect(p.maxWidth).toBeGreaterThan(0)
      expect(p.id).toBeDefined()
    }
  })

  it('generates valid ads.txt response conforming to IAB specification', async () => {
    const res = await getAdsTxt()
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toContain('text/plain')
    
    const text = await res.text()
    expect(text).toContain('Authorized Digital Sellers')
    expect(text).toContain('google.com')
    expect(text).toContain('f08c47fec0942fa0')
  })

  it('verifies public/ads.txt exists as a static asset fallback', () => {
    const staticAdsTxtPath = path.join(process.cwd(), 'public', 'ads.txt')
    expect(fs.existsSync(staticAdsTxtPath)).toBe(true)
    const content = fs.readFileSync(staticAdsTxtPath, 'utf8')
    expect(content).toContain('google.com')
    expect(content).toContain('DIRECT')
    expect(content).toContain('f08c47fec0942fa0')
  })

  it('ensures zero prohibited marketing exaggerations in production code', () => {
    const prohibitedKeywords = [
      '实时汇率',
      '硬件随机',
      '绝对隐私',
      '100% 纯前端',
      '100%纯前端',
      '33-bit LCG',
    ]

    function scanDir(dir: string): string[] {
      const results: string[] = []
      const list = fs.readdirSync(dir)
      for (const file of list) {
        const fullPath = path.join(dir, file)
        const stat = fs.statSync(fullPath)
        if (stat.isDirectory()) {
          if (!fullPath.includes('node_modules') && !fullPath.includes('.next') && !fullPath.includes('.cloudflare') && !fullPath.includes('__tests__')) {
            results.push(...scanDir(fullPath))
          }
        } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.json')) {
          results.push(fullPath)
        }
      }
      return results
    }

    const files = scanDir(path.join(process.cwd(), 'src'))
    const violations: { file: string; keyword: string }[] = []

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8')
      for (const kw of prohibitedKeywords) {
        if (content.includes(kw)) {
          violations.push({ file, keyword: kw })
        }
      }
    }

    expect(violations).toEqual([])
  })
})
