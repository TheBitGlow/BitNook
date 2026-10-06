import { spawn } from 'node:child_process'
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const BASE_URL = 'https://bitnook.marmalade-thistle.workers.dev'
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const PORT = 9222
const OUT_DIR = 'C:\\Users\\udolf\\.gemini\\antigravity\\brain\\65a38134-e263-4718-bf2d-fa817bebc461\\screenshots'

mkdirSync(OUT_DIR, { recursive: true })

const TARGETS = [
  { name: 'home', path: '/' },
  { name: 'tools', path: '/tools' },
  { name: 'mortgage', path: '/tools/finance/mortgage' },
  { name: 'password', path: '/tools/daily/password' },
  { name: 'gpu', path: '/tools/ai/gpu-calculator' },
  { name: 'games', path: '/games' },
  { name: 'chess-chinese', path: '/games/chess-chinese' },
  { name: 'freecell', path: '/games/freecell' },
]

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

const chromeProcess = spawn(CHROME_PATH, [
  '--headless=new',
  '--disable-gpu',
  '--no-sandbox',
  `--remote-debugging-port=${PORT}`,
  '--user-data-dir=C:\\Obj\\GitHub\\BitNook\\.chrome-temp',
])

async function run() {
  console.log('Connecting to Chrome CDP on port', PORT)
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`)
      await res.json()
      break
    } catch {
      await wait(300)
    }
  }

  // Create page
  const targetRes = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' })
  const target = await targetRes.json()
  const ws = new WebSocket(target.webSocketDebuggerUrl)

  let id = 1
  const pending = new Map()

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data)
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id)
      pending.delete(msg.id)
      if (msg.error) reject(new Error(msg.error.message))
      else resolve(msg.result)
    }
  }

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const reqId = id++
      pending.set(reqId, { resolve, reject })
      ws.send(JSON.stringify({ id: reqId, method, params }))
    })
  }

  await new Promise((resolve) => ws.onopen = resolve)
  await send('Page.enable')
  await send('DOM.enable')
  await send('Runtime.enable')

  console.log(`Starting capture of ${TARGETS.length} targets (32 screenshots total)...\n`)

  for (const t of TARGETS) {
    const fullUrl = `${BASE_URL}${t.path}`
    console.log(`\n>>> Processing [${t.name}] at ${fullUrl}`)

    // 1. Desktop Light (1440x900)
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    })
    await send('Page.navigate', { url: fullUrl })
    await wait(3000)

    // Ensure light theme
    await send('Runtime.evaluate', {
      expression: `
        localStorage.setItem('bitnook-theme', 'light');
        document.documentElement.setAttribute('data-theme', 'light');
        window.dispatchEvent(new Event('bitnook-theme-change'));
      `,
    })
    await wait(600)

    let shot = await send('Page.captureScreenshot', { format: 'png' })
    let file = join(OUT_DIR, `${t.name}_desktop_light.png`)
    writeFileSync(file, Buffer.from(shot.data, 'base64'))
    console.log(`  ✓ Saved: ${t.name}_desktop_light.png`)

    // 2. Desktop Dark (1440x900)
    await send('Runtime.evaluate', {
      expression: `
        localStorage.setItem('bitnook-theme', 'dark');
        document.documentElement.setAttribute('data-theme', 'dark');
        window.dispatchEvent(new Event('bitnook-theme-change'));
      `,
    })
    await wait(600)

    shot = await send('Page.captureScreenshot', { format: 'png' })
    file = join(OUT_DIR, `${t.name}_desktop_dark.png`)
    writeFileSync(file, Buffer.from(shot.data, 'base64'))
    console.log(`  ✓ Saved: ${t.name}_desktop_dark.png`)

    // 3. Mobile Dark (390x844)
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
    })
    await wait(600)

    shot = await send('Page.captureScreenshot', { format: 'png' })
    file = join(OUT_DIR, `${t.name}_mobile_dark.png`)
    writeFileSync(file, Buffer.from(shot.data, 'base64'))
    console.log(`  ✓ Saved: ${t.name}_mobile_dark.png`)

    // 4. Mobile Light (390x844)
    await send('Runtime.evaluate', {
      expression: `
        localStorage.setItem('bitnook-theme', 'light');
        document.documentElement.setAttribute('data-theme', 'light');
        window.dispatchEvent(new Event('bitnook-theme-change'));
      `,
    })
    await wait(600)

    shot = await send('Page.captureScreenshot', { format: 'png' })
    file = join(OUT_DIR, `${t.name}_mobile_light.png`)
    writeFileSync(file, Buffer.from(shot.data, 'base64'))
    console.log(`  ✓ Saved: ${t.name}_mobile_light.png`)
  }

  console.log('\n========================================')
  console.log('All 32 screenshots captured successfully!')
  console.log(`Output Directory: ${OUT_DIR}`)
  console.log('========================================\n')

  ws.close()
  chromeProcess.kill()
}

run().catch((err) => {
  console.error('Screenshot capture failed:', err)
  chromeProcess.kill()
  process.exit(1)
})
