const BASE_URL = 'https://bitnook.marmalade-thistle.workers.dev';

async function fetchUrl(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const start = Date.now();
  try {
    const res = await fetch(url, { redirect: 'manual', ...options });
    const duration = Date.now() - start;
    const text = await res.text();
    return {
      status: res.status,
      headers: Object.fromEntries(res.headers.entries()),
      duration,
      bodyLength: text.length,
      snippet: text.slice(0, 300),
      raw: text,
    };
  } catch (err) {
    return { error: err.message, duration: Date.now() - start };
  }
}

async function run() {
  console.log('=== REAL CLOUDFLARE EDGE PRODUCTION SMOKE TEST ===');
  console.log(`Target: ${BASE_URL}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);

  const results = [];

  function record(test, pass, detail = '') {
    results.push({ test, status: pass ? 'PASS' : 'FAIL', detail });
    console.log(`[${pass ? 'PASS' : 'FAIL'}] ${test} ${detail ? '(' + detail + ')' : ''}`);
  }

  // 1. Home page
  const home = await fetchUrl('/');
  const has35 = home.raw.includes('35');
  const noRealtimeRate = !home.raw.includes('实时汇率');
  const noHwRandom = !home.raw.includes('硬件随机');
  const noAbsPrivacy = !home.raw.includes('绝对隐私') && !home.raw.includes('0 PII');
  record('Home Page: / (Status 200)', home.status === 200, `${home.duration}ms`);
  record('Home Page: Accuracy Copy (35 tools, no fake claims)', has35 && noRealtimeRate && noHwRandom && noAbsPrivacy, 
    `35:${has35}, noRealtime:${noRealtimeRate}, noHw:${noHwRandom}, noAbsPriv:${noAbsPrivacy}`);

  // 2. Tools Directory
  const tools = await fetchUrl('/tools');
  record('Tools Index: /tools (Status 200)', tools.status === 200, `${tools.duration}ms`);

  // 3. Category pages
  const catDaily = await fetchUrl('/tools/daily');
  record('Category Daily: /tools/daily (Status 200)', catDaily.status === 200, `${catDaily.duration}ms`);
  const catFinance = await fetchUrl('/tools/finance');
  record('Category Finance: /tools/finance (Status 200)', catFinance.status === 200, `${catFinance.duration}ms`);

  // 4. Exchange Tool - Reference Rate & Local Mode
  const exchange = await fetchUrl('/tools/finance/exchange');
  const hasRefRate = exchange.raw.includes('参考汇率');
  const noFakeRate = !exchange.raw.includes('实时汇率');
  record('Exchange Tool: Reference rate & Local privacy', exchange.status === 200 && hasRefRate && noFakeRate,
    `hasRefRate:${hasRefRate}, noFakeRate:${noFakeRate}`);

  // 5. Lottery & Password Tools - CSPRNG
  const lottery = await fetchUrl('/tools/daily/lottery');
  const lotteryCSPRNG = lottery.raw.includes('密码学安全随机数') && !lottery.raw.includes('硬件随机');
  record('Lottery Tool: CSPRNG copy verified', lottery.status === 200 && lotteryCSPRNG,
    `status:${lottery.status}, csprng:${lotteryCSPRNG}`);

  const password = await fetchUrl('/tools/daily/password');
  const passwordCSPRNG = password.raw.includes('密码学安全随机数') && !password.raw.includes('硬件随机');
  record('Password Tool: CSPRNG copy verified', password.status === 200 && passwordCSPRNG,
    `status:${password.status}, csprng:${passwordCSPRNG}`);

  // 6. ToolLayout - Related Tools ("你可能还需要")
  const mortgage = await fetchUrl('/tools/finance/mortgage');
  const hasRelated = mortgage.raw.includes('你可能还需要') || mortgage.raw.includes('You May Also Need');
  record('Mortgage Tool: Related tools shelf rendered', mortgage.status === 200 && hasRelated,
    `hasRelated:${hasRelated}`);

  // 7. Games Center & Individual Games
  const games = await fetchUrl('/games');
  record('Games Hub: /games (Status 200)', games.status === 200, `${games.duration}ms`);

  const gomoku = await fetchUrl('/games/gomoku');
  record('Game: Gomoku /games/gomoku (Status 200)', gomoku.status === 200, `${gomoku.duration}ms`);

  const tetris = await fetchUrl('/games/tetris');
  record('Game: Tetris /games/tetris (Status 200)', tetris.status === 200, `${tetris.duration}ms`);

  const minesweeper = await fetchUrl('/games/minesweeper');
  record('Game: Minesweeper /games/minesweeper (Status 200)', minesweeper.status === 200, `${minesweeper.duration}ms`);

  // 8. Deprecated routes 307 redirects
  const portScan = await fetchUrl('/tools/network/port-scan');
  record('Redirect: /tools/network/port-scan -> 307', portScan.status === 307 && portScan.headers.location === '/tools/network',
    `status:${portScan.status}, loc:${portScan.headers.location}`);

  const gamesRedirect = await fetchUrl('/tools/games');
  record('Redirect: /tools/games -> 307 /games', gamesRedirect.status === 307 && gamesRedirect.headers.location === '/games',
    `status:${gamesRedirect.status}, loc:${gamesRedirect.headers.location}`);

  const heartAgeRedirect = await fetchUrl('/tools/health/heart-age');
  record('Redirect: /tools/health/heart-age -> 307', heartAgeRedirect.status === 307 && heartAgeRedirect.headers.location === '/tools/health/heart-rate',
    `status:${heartAgeRedirect.status}, loc:${heartAgeRedirect.headers.location}`);

  // 9. SEO & Static Artifacts
  const robots = await fetchUrl('/robots.txt');
  record('SEO: /robots.txt (Status 200)', robots.status === 200 && robots.raw.includes('User-Agent'), `${robots.duration}ms`);

  const sitemap = await fetchUrl('/sitemap.xml');
  record('SEO: /sitemap.xml (Status 200)', sitemap.status === 200 && sitemap.raw.includes('<urlset'), `${sitemap.duration}ms`);

  // 10. Edge SSRF & Network API Check
  const apiPublic = await fetchUrl('/api/network/http-check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'https://example.com', method: 'GET' }),
  });
  record('Edge API: Public HTTP Check (https://example.com)', apiPublic.status === 200, `${apiPublic.duration}ms`);

  const apiSsrf127 = await fetchUrl('/api/network/http-check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'http://127.0.0.1', method: 'GET' }),
  });
  record('Edge API: SSRF 127.0.0.1 blocked (403)', apiSsrf127.status === 403, `status:${apiSsrf127.status}`);

  const apiSsrfMeta = await fetchUrl('/api/network/http-check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'http://169.254.169.254/latest/meta-data', method: 'GET' }),
  });
  record('Edge API: SSRF 169.254.169.254 blocked (403)', apiSsrfMeta.status === 403, `status:${apiSsrfMeta.status}`);

  console.log('\n=== REAL EDGE TEST SUMMARY ===');
  console.table(results);

  const failed = results.filter(r => r.status === 'FAIL');
  if (failed.length > 0) {
    console.error(`\n❌ ${failed.length} test(s) failed on real Cloudflare Edge!`);
    process.exit(1);
  } else {
    console.log(`\n✅ All ${results.length} Cloudflare Edge tests passed!`);
  }
}

run().catch((err) => {
  console.error('Fatal error during edge tests:', err);
  process.exit(1);
});
