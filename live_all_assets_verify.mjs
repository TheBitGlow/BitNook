// Comprehensive All Assets Verifier for BitNook V1.0.1
// Verifies all 35 Active Tools, 4 Deprecated Tools, and 8 Games on the Edge

const BASE_URL = 'https://bitnook.marmalade-thistle.workers.dev'

const activeToolPaths = [
  // Daily (8)
  '/tools/daily/timer',
  '/tools/daily/countdown',
  '/tools/daily/lottery',
  '/tools/daily/password',
  '/tools/daily/word-count',
  '/tools/daily/date-calc',
  '/tools/daily/stopwatch',
  '/tools/daily/world-clock',

  // Finance (8)
  '/tools/finance/mortgage',
  '/tools/finance/exchange',
  '/tools/finance/retirement',
  '/tools/finance/compound',
  '/tools/finance/salary',
  '/tools/finance/deposit',
  '/tools/finance/loan-compare',
  '/tools/finance/roi',

  // Health (7)
  '/tools/health/bmi',
  '/tools/health/calories',
  '/tools/health/heart-rate',
  '/tools/health/blood-pressure',
  '/tools/health/sleep',
  '/tools/health/steps',
  '/tools/health/water-intake',

  // Convert (6)
  '/tools/convert/color',
  '/tools/convert/unit',
  '/tools/convert/radix',
  '/tools/convert/hash',
  '/tools/convert/qrcode',
  '/tools/convert/timestamp',

  // Network (5)
  '/tools/network/dns',
  '/tools/network/ip-lookup',
  '/tools/network/http-check',
  '/tools/network/ping',
  '/tools/network/wifi-info',

  // AI (1)
  '/tools/ai/gpu-calculator',
]

const gamePaths = [
  '/games/tetris',
  '/games/minesweeper',
  '/games/snake',
  '/games/gomoku',
  '/games/chess-chinese',
  '/games/chess-international',
  '/games/freecell',
  '/games/match3',
]

const deprecatedRedirects = [
  { from: '/tools/health/heart-age', to: '/tools/health/heart-rate' },
  { from: '/tools/network/port-scan', to: '/tools/network' },
  { from: '/tools/network/speed-test', to: '/tools/network' },
  { from: '/tools/network/ssl-check', to: '/tools/network' },
]

async function verifyAll() {
  console.log(`Starting comprehensive asset check on ${BASE_URL}...\n`)
  let passed = 0
  let failed = 0

  console.log(`--- Verifying 35 Active Tools ---`)
  for (const path of activeToolPaths) {
    try {
      const res = await fetch(`${BASE_URL}${path}`)
      if (res.status === 200) {
        console.log(`✓ [200 OK] Tool: ${path}`)
        passed++
      } else {
        console.error(`✗ [FAIL ${res.status}] Tool: ${path}`)
        failed++
      }
    } catch (err) {
      console.error(`✗ [ERROR] Tool: ${path}: ${err.message}`)
      failed++
    }
  }

  console.log(`\n--- Verifying 8 Games ---`)
  for (const path of gamePaths) {
    try {
      const res = await fetch(`${BASE_URL}${path}`)
      if (res.status === 200) {
        console.log(`✓ [200 OK] Game: ${path}`)
        passed++
      } else {
        console.error(`✗ [FAIL ${res.status}] Game: ${path}`)
        failed++
      }
    } catch (err) {
      console.error(`✗ [ERROR] Game: ${path}: ${err.message}`)
      failed++
    }
  }

  console.log(`\n--- Verifying 4 Deprecated Tool Redirects ---`)
  for (const item of deprecatedRedirects) {
    try {
      const res = await fetch(`${BASE_URL}${item.from}`, { redirect: 'manual' })
      const loc = res.headers.get('location')
      if ((res.status === 307 || res.status === 308 || res.status === 301 || res.status === 302) && loc && loc.includes(item.to)) {
        console.log(`✓ [${res.status} REDIRECT] ${item.from} -> ${loc}`)
        passed++
      } else {
        console.error(`✗ [FAIL ${res.status}] ${item.from} -> ${loc} (expected ${item.to})`)
        failed++
      }
    } catch (err) {
      console.error(`✗ [ERROR] ${item.from}: ${err.message}`)
      failed++
    }
  }

  console.log(`\n========================================`)
  console.log(`Total Assets Verified: ${activeToolPaths.length} Tools + ${gamePaths.length} Games + ${deprecatedRedirects.length} Redirects = ${activeToolPaths.length + gamePaths.length + deprecatedRedirects.length}`)
  console.log(`Passed: ${passed}, Failed: ${failed}`)
  console.log(`========================================`)

  if (failed > 0) process.exit(1)
}

verifyAll()
