// Comprehensive Live Edge Smoke Test for BitNook V1.0
// Target: https://bitnook.marmalade-thistle.workers.dev

const BASE_URL = 'https://bitnook.marmalade-thistle.workers.dev'

async function runTests() {
  console.log(`Starting live edge smoke tests against: ${BASE_URL}\n`)
  let passed = 0
  let failed = 0

  async function test(name, fn) {
    try {
      await fn()
      console.log(`✓ [PASS] ${name}`)
      passed++
    } catch (err) {
      console.error(`✗ [FAIL] ${name}:`, err.message)
      failed++
    }
  }

  // 1. Root Homepage
  await test('Homepage HTTP 200 with title and meta', async () => {
    const res = await fetch(`${BASE_URL}/`)
    if (res.status !== 200) throw new Error(`Status ${res.status}`)
    const text = await res.text()
    if (!text.includes('BitNook') && !text.includes('比特角落')) {
      throw new Error('Missing brand name in response')
    }
  })

  // 2. Tools Hub
  await test('Tools Hub /tools HTTP 200', async () => {
    const res = await fetch(`${BASE_URL}/tools`)
    if (res.status !== 200) throw new Error(`Status ${res.status}`)
    const text = await res.text()
    if (!text.includes('tools') && !text.includes('工具')) {
      throw new Error('Missing tools content')
    }
  })

  // 3. Category Hubs (6 Categories)
  const categories = ['finance', 'health', 'convert', 'daily', 'network', 'ai']
  for (const cat of categories) {
    await test(`Category /tools/${cat} HTTP 200`, async () => {
      const res = await fetch(`${BASE_URL}/tools/${cat}`)
      if (res.status !== 200) throw new Error(`Status ${res.status}`)
    })
  }

  // 4. Games Hub and all 8 Games
  await test('Games Hub /games HTTP 200', async () => {
    const res = await fetch(`${BASE_URL}/games`)
    if (res.status !== 200) throw new Error(`Status ${res.status}`)
  })

  const games = [
    'chess-chinese',
    'chess-international',
    'freecell',
    'gomoku',
    'match3',
    'minesweeper',
    'snake',
    'tetris',
  ]
  for (const game of games) {
    await test(`Game /games/${game} HTTP 200`, async () => {
      const res = await fetch(`${BASE_URL}/games/${game}`)
      if (res.status !== 200) throw new Error(`Status ${res.status}`)
    })
  }

  // 5. Flagship Tool Pages
  const tools = [
    '/tools/finance/mortgage',
    '/tools/finance/salary',
    '/tools/finance/compound',
    '/tools/finance/exchange',
    '/tools/health/bmi',
    '/tools/health/blood-pressure',
    '/tools/convert/color',
    '/tools/convert/hash',
    '/tools/convert/unit',
    '/tools/daily/password',
    '/tools/daily/word-count',
    '/tools/ai/gpu-calculator',
  ]
  for (const path of tools) {
    await test(`Tool ${path} HTTP 200`, async () => {
      const res = await fetch(`${BASE_URL}${path}`)
      if (res.status !== 200) throw new Error(`Status ${res.status}`)
    })
  }

  // 6. Deprecated Tools 307 Redirects (Authentic Registry: 4 Deprecated Tools)
  const deprecated = [
    { from: '/tools/health/heart-age', to: '/tools/health/heart-rate' },
    { from: '/tools/network/port-scan', to: '/tools/network' },
    { from: '/tools/network/speed-test', to: '/tools/network' },
    { from: '/tools/network/ssl-check', to: '/tools/network' },
  ]
  for (const { from, to } of deprecated) {
    await test(`Redirect ${from} -> ${to} HTTP 307/308`, async () => {
      const res = await fetch(`${BASE_URL}${from}`, { redirect: 'manual' })
      if (res.status !== 307 && res.status !== 308 && res.status !== 301 && res.status !== 302) {
        throw new Error(`Expected redirect status, got ${res.status}`)
      }
      const loc = res.headers.get('location')
      if (!loc || !loc.includes(to)) {
        throw new Error(`Expected location containing ${to}, got ${loc}`)
      }
    })
  }

  // 7. Security: SSRF Protection on /api/network/http-check
  const ssrfPayloads = [
    'http://127.0.0.1:8080',
    'http://localhost',
    'http://169.254.169.254/latest/meta-data',
    'http://10.0.0.1',
    'http://192.168.1.1',
    'http://[::1]',
    'http://0177.0.0.1',
    'http://2130706433',
  ]
  for (const payload of ssrfPayloads) {
    await test(`SSRF block ${payload}`, async () => {
      const res = await fetch(`${BASE_URL}/api/network/http-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: payload }),
      })
      if (res.status !== 400 && res.status !== 403) {
        throw new Error(`Expected 400/403 block, got ${res.status}`)
      }
      const data = await res.json()
      if (!data.error && !data.message) {
        throw new Error('Expected error message in JSON response')
      }
    })
  }

  // 8. Sitemap and Robots
  await test('Sitemap /sitemap.xml HTTP 200 XML', async () => {
    const res = await fetch(`${BASE_URL}/sitemap.xml`)
    if (res.status !== 200) throw new Error(`Status ${res.status}`)
    const text = await res.text()
    if (!text.includes('<urlset') && !text.includes('urlset')) {
      throw new Error('Invalid sitemap xml')
    }
  })

  await test('Robots /robots.txt HTTP 200', async () => {
    const res = await fetch(`${BASE_URL}/robots.txt`)
    if (res.status !== 200) throw new Error(`Status ${res.status}`)
    const text = await res.text()
    if (!text.toLowerCase().includes('user-agent')) {
      throw new Error('Invalid robots.txt')
    }
  })

  console.log(`\n========================================`)
  console.log(`Smoke Tests Finished: ${passed} Passed, ${failed} Failed.`)
  console.log(`========================================\n`)

  if (failed > 0) process.exit(1)
}

runTests().catch(err => {
  console.error('Fatal test runner error:', err)
  process.exit(1)
})
