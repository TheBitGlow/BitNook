const BASE = 'http://localhost:3000'

async function checkRoute(path: string) {
  const url = `${BASE}${path}`
  try {
    const start = Date.now()
    const res = await fetch(url, { redirect: 'manual' })
    const duration = Date.now() - start
    const text = await res.text()
    
    // Extract title if HTML
    let title = ''
    const titleMatch = text.match(/<title>([^<]+)<\/title>/)
    if (titleMatch) title = titleMatch[1]

    const location = res.headers.get('location') || undefined

    return {
      path,
      status: res.status,
      ok: res.status >= 200 && res.status < 400,
      durationMs: duration,
      title,
      location,
      sizeBytes: text.length,
    }
  } catch (err: any) {
    return {
      path,
      status: 0,
      ok: false,
      error: err.message,
    }
  }
}

async function runSmokeTests() {
  console.log('=================== 1. Smoke Testing Public Routes ===================')
  const routes = [
    '/',
    '/tools',
    '/tools/convert/color',
    '/tools/convert/hash',
    '/tools/finance/mortgage',
    '/tools/finance/exchange',
    '/tools/finance/deposit',
    '/tools/finance/retirement',
    '/tools/finance/salary',
    '/tools/health/bmi',
    '/tools/health/calories',
    '/tools/health/heart-rate',
    '/tools/games',
    '/games/tetris',
    '/games/minesweeper',
    '/games/snake',
    '/games/gomoku',
    '/games/match3',
    '/games/freecell',
    '/games/chess-international',
    '/games/chess-chinese',
    '/privacy',
    '/terms',
    '/about',
    '/contact',
    '/robots.txt',
    '/sitemap.xml',
  ]

  let allOk = true
  for (const r of routes) {
    const result = await checkRoute(r)
    console.log(`[${result.status}] ${r} (${result.durationMs}ms) - Title: "${result.title}"`)
    if (!result.ok || result.status >= 400) allOk = false
  }
  console.log('Smoke routes test passed:', allOk)

  console.log('\n=================== 2. Redirect Routes Verification ===================')
  const redirects = [
    '/tools/network/port-scan',
    '/tools/network/speed-test',
    '/tools/network/ssl-check',
    '/tools/health/heart-age',
  ]

  for (const r of redirects) {
    const result = await checkRoute(r)
    console.log(`[${result.status}] ${r} -> Location: ${result.location}`)
  }

  console.log('\n=================== 3. Robots.txt Blackbox ===================')
  const robotsRes = await checkRoute('/robots.txt')
  const robotsText = await (await fetch(`${BASE}/robots.txt`)).text()
  console.log('Robots content:\n' + robotsText.trim())

  console.log('\n=================== 4. Sitemap.xml Blackbox ===================')
  const sitemapRes = await fetch(`${BASE}/sitemap.xml`)
  const sitemapText = await sitemapRes.text()
  const urlMatches = sitemapText.match(/<loc>([^<]+)<\/loc>/g) || []
  console.log(`Total URLs in sitemap: ${urlMatches.length}`)
  console.log('Sample sitemap URLs:')
  urlMatches.slice(0, 5).forEach((u) => console.log('  ' + u))
  console.log('Contains bitnook.com host:', sitemapText.includes('https://bitnook.com'))
  console.log('Contains redirect URLs (heart-age / port-scan):', sitemapText.includes('heart-age') || sitemapText.includes('port-scan'))
  console.log('Contains new Date() pattern (dynamic UTC seconds):', /:\d{2}\.\d{3}Z/.test(sitemapText))

  console.log('\n=================== 5. HTTP Check SSRF Red Team Real Blackbox ===================')
  const testPayloads = [
    // IPv4 Loopback & Private
    'http://127.0.0.1',
    'http://localhost',
    'http://0.0.0.0',
    'http://10.0.0.1',
    'http://10.255.255.255',
    'http://172.16.0.1',
    'http://172.31.255.254',
    'http://192.168.0.1',
    'http://169.254.169.254',
    'http://100.64.0.1',
    // IPv6
    'http://[::1]',
    'http://[fe80::1]',
    'http://[::ffff:127.0.0.1]',
    'http://[::ffff:169.254.169.254]',
    // Userinfo
    'http://admin:pass@1.1.1.1',
    // Restricted Ports
    'http://1.1.1.1:22',
    'http://1.1.1.1:23',
    'http://1.1.1.1:25',
    'http://1.1.1.1:53',
    'http://1.1.1.1:110',
    'http://1.1.1.1:143',
    'http://1.1.1.1:445',
    'http://1.1.1.1:3306',
    'http://1.1.1.1:5432',
    'http://1.1.1.1:6379',
    'http://1.1.1.1:27017',
    'http://1.1.1.1:11211',
  ]

  let ssrfPassCount = 0
  for (const target of testPayloads) {
    const res = await fetch(`${BASE}/api/network/http-check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: target }),
    })
    const data = await res.json()
    const isBlocked = res.status === 403 || res.status === 400
    if (isBlocked) ssrfPassCount++
    console.log(`[${res.status}] Target: ${target} -> Blocked: ${isBlocked} (${data.error || 'OK'})`)
  }
  console.log(`SSRF Attacks Blocked: ${ssrfPassCount} / ${testPayloads.length}`)

  console.log('\n=================== 6. Valid HTTP Check Real Request ===================')
  const validRes = await fetch(`${BASE}/api/network/http-check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'https://example.com' }),
  })
  const validData = await validRes.json()
  console.log('Real Public Target check result:', validRes.status, validData)
}

runSmokeTests()
