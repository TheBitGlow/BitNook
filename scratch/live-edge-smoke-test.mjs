import https from 'node:https';

const BASE_URL = 'https://bitnook.marmalade-thistle.workers.dev';

async function fetchUrl(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const start = Date.now();
  try {
    const res = await fetch(url, options);
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

  // Test 1: Home page
  console.log('\n[1] Testing Home Page: /');
  const home = await fetchUrl('/');
  console.log(`Status: ${home.status}, Duration: ${home.duration}ms, Server: ${home.headers.server}, cf-ray: ${home.headers['cf-ray']}`);
  results.push({ test: 'Home /', status: home.status, pass: home.status === 200 });

  // Test 2: Tools Center
  console.log('\n[2] Testing Tools Directory: /tools');
  const tools = await fetchUrl('/tools');
  console.log(`Status: ${tools.status}, Duration: ${tools.duration}ms, snippet: ${tools.snippet.slice(0, 100)}...`);
  results.push({ test: 'Tools /tools', status: tools.status, pass: tools.status === 200 });

  // Test 3: API HTTP Check on Edge - Valid public URL
  console.log('\n[3] Testing /api/network/http-check on Cloudflare Edge with public target https://example.com');
  const apiPublic = await fetchUrl('/api/network/http-check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'https://example.com', method: 'GET' }),
  });
  console.log(`Status: ${apiPublic.status}, Duration: ${apiPublic.duration}ms, Body: ${apiPublic.snippet}`);
  results.push({ test: 'API Public Check', status: apiPublic.status, pass: apiPublic.status === 200 });

  // Test 4: API HTTP Check on Edge - SSRF 127.0.0.1
  console.log('\n[4] Testing /api/network/http-check on Cloudflare Edge with SSRF payload http://127.0.0.1');
  const apiSsrf1 = await fetchUrl('/api/network/http-check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'http://127.0.0.1', method: 'GET' }),
  });
  console.log(`Status: ${apiSsrf1.status}, Duration: ${apiSsrf1.duration}ms, Body: ${apiSsrf1.snippet}`);
  results.push({ test: 'API SSRF 127.0.0.1 Blocked', status: apiSsrf1.status, pass: apiSsrf1.status === 403 });

  // Test 5: API HTTP Check on Edge - SSRF 169.254.169.254
  console.log('\n[5] Testing /api/network/http-check on Cloudflare Edge with metadata payload http://169.254.169.254');
  const apiSsrf2 = await fetchUrl('/api/network/http-check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'http://169.254.169.254/latest/meta-data', method: 'GET' }),
  });
  console.log(`Status: ${apiSsrf2.status}, Duration: ${apiSsrf2.duration}ms, Body: ${apiSsrf2.snippet}`);
  results.push({ test: 'API SSRF Metadata Blocked', status: apiSsrf2.status, pass: apiSsrf2.status === 403 });

  // Test 6: Robots.txt
  console.log('\n[6] Testing /robots.txt');
  const robots = await fetchUrl('/robots.txt');
  console.log(`Status: ${robots.status}, Duration: ${robots.duration}ms, Content: ${robots.snippet}`);
  results.push({ test: 'robots.txt', status: robots.status, pass: robots.status === 200 && robots.raw.includes('User-Agent') });

  // Test 7: Sitemap.xml
  console.log('\n[7] Testing /sitemap.xml');
  const sitemap = await fetchUrl('/sitemap.xml');
  console.log(`Status: ${sitemap.status}, Duration: ${sitemap.duration}ms, Content: ${sitemap.snippet.slice(0, 150)}`);
  results.push({ test: 'sitemap.xml', status: sitemap.status, pass: sitemap.status === 200 && sitemap.raw.includes('<urlset') });

  // Test 8: Finance tool /tools/finance/mortgage
  console.log('\n[8] Testing Finance Mortgage: /tools/finance/mortgage');
  const mortgage = await fetchUrl('/tools/finance/mortgage');
  console.log(`Status: ${mortgage.status}, Duration: ${mortgage.duration}ms`);
  results.push({ test: 'Mortgage Tool', status: mortgage.status, pass: mortgage.status === 200 });

  // Test 9: Health BMI tool /tools/health/bmi
  console.log('\n[9] Testing Health BMI: /tools/health/bmi');
  const bmi = await fetchUrl('/tools/health/bmi');
  console.log(`Status: ${bmi.status}, Duration: ${bmi.duration}ms`);
  results.push({ test: 'BMI Tool', status: bmi.status, pass: bmi.status === 200 });

  // Test 10: Convert Hash tool /tools/convert/hash
  console.log('\n[10] Testing Convert Hash: /tools/convert/hash');
  const hash = await fetchUrl('/tools/convert/hash');
  console.log(`Status: ${hash.status}, Duration: ${hash.duration}ms`);
  results.push({ test: 'Hash Tool', status: hash.status, pass: hash.status === 200 });

  // Test 11: Games Center /games
  console.log('\n[11] Testing Games: /games');
  const games = await fetchUrl('/games');
  console.log(`Status: ${games.status}, Duration: ${games.duration}ms`);
  results.push({ test: 'Games /games', status: games.status, pass: games.status === 200 });

  console.log('\n=== EDGE TEST SUMMARY ===');
  console.table(results);
}

run().catch(console.error);
