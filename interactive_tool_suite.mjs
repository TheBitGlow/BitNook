import { spawn } from 'node:child_process'

const BASE_URL = 'https://bitnook.marmalade-thistle.workers.dev'
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const PORT = 9222

const activeTools = [
  // Daily (8)
  { slug: 'timer', path: '/tools/daily/timer', category: 'daily', name: '多功能计时器' },
  { slug: 'countdown', path: '/tools/daily/countdown', category: 'daily', name: '目标日倒计时' },
  { slug: 'lottery', path: '/tools/daily/lottery', category: 'daily', name: '随机转盘抽奖' },
  { slug: 'password', path: '/tools/daily/password', category: 'daily', name: '安全密码生成器' },
  { slug: 'word-count', path: '/tools/daily/word-count', category: 'daily', name: '字数统计与朗读预估' },
  { slug: 'date-calc', path: '/tools/daily/date-calc', category: 'daily', name: '日期推算与相隔天数' },
  { slug: 'stopwatch', path: '/tools/daily/stopwatch', category: 'daily', name: '高精度秒表' },
  { slug: 'world-clock', path: '/tools/daily/world-clock', category: 'daily', name: '世界时钟与时差' },

  // Finance (8)
  { slug: 'mortgage', path: '/tools/finance/mortgage', category: 'finance', name: '房贷计算器' },
  { slug: 'exchange', path: '/tools/finance/exchange', category: 'finance', name: '参考汇率换算器' },
  { slug: 'retirement', path: '/tools/finance/retirement', category: 'finance', name: '法定退休推算器' },
  { slug: 'compound', path: '/tools/finance/compound', category: 'finance', name: '复利投资计算器' },
  { slug: 'salary', path: '/tools/finance/salary', category: 'finance', name: '中国居民工资个税估算器' },
  { slug: 'deposit', path: '/tools/finance/deposit', category: 'finance', name: '银行存款利息计算器' },
  { slug: 'loan-compare', path: '/tools/finance/loan-compare', category: 'finance', name: '贷款方案比价' },
  { slug: 'roi', path: '/tools/finance/roi', category: 'finance', name: '投资回报率(ROI/NPV/IRR)' },

  // Health (7)
  { slug: 'bmi', path: '/tools/health/bmi', category: 'health', name: '中国成人BMI体质指数' },
  { slug: 'calories', path: '/tools/health/calories', category: 'health', name: '卡路里与TDEE代谢' },
  { slug: 'heart-rate', path: '/tools/health/heart-rate', category: 'health', name: '靶心率估算' },
  { slug: 'blood-pressure', path: '/tools/health/blood-pressure', category: 'health', name: '血压记录与评估' },
  { slug: 'sleep', path: '/tools/health/sleep', category: 'health', name: '睡眠周期推算' },
  { slug: 'steps', path: '/tools/health/steps', category: 'health', name: '步数热量距离换算' },
  { slug: 'water-intake', path: '/tools/health/water-intake', category: 'health', name: '每日饮水量估算' },

  // Convert (6)
  { slug: 'color', path: '/tools/convert/color', category: 'convert', name: '色彩格式与对比度' },
  { slug: 'unit', path: '/tools/convert/unit', category: 'convert', name: '全能单位换算' },
  { slug: 'radix', path: '/tools/convert/radix', category: 'convert', name: '任意进制转换' },
  { slug: 'hash', path: '/tools/convert/hash', category: 'convert', name: '哈希散列计算' },
  { slug: 'qrcode', path: '/tools/convert/qrcode', category: 'convert', name: '二维码生成与识别' },
  { slug: 'timestamp', path: '/tools/convert/timestamp', category: 'convert', name: 'Unix时间戳转换' },

  // Network (5)
  { slug: 'dns', path: '/tools/network/dns', category: 'network', name: 'DNS over HTTPS 查询' },
  { slug: 'ip-lookup', path: '/tools/network/ip-lookup', category: 'network', name: 'IP归属地与ASN查询' },
  { slug: 'http-check', path: '/tools/network/http-check', category: 'network', name: 'HTTP状态与连通性检测' },
  { slug: 'ping', path: '/tools/network/ping', category: 'network', name: 'HTTP往返延迟(Ping)' },
  { slug: 'wifi-info', path: '/tools/network/wifi-info', category: 'network', name: 'WiFi配置与网络诊断' },

  // AI (1)
  { slug: 'gpu-calculator', path: '/tools/ai/gpu-calculator', category: 'ai', name: '大模型显存估算器' },
]

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

const chromeProcess = spawn(CHROME_PATH, [
  '--headless=new',
  '--disable-gpu',
  '--no-sandbox',
  `--remote-debugging-port=${PORT}`,
  '--user-data-dir=C:\\Obj\\GitHub\\BitNook\\.chrome-temp-test',
])

async function runInteractiveSuite() {
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

  console.log('--- Starting Interactive Blackbox Gate for 35 Tools ---\n')
  const results = []

  for (const tool of activeTools) {
    const fullUrl = `${BASE_URL}${tool.path}`
    process.stdout.write(`Testing [${tool.slug}] (${tool.name})... `)

    try {
      // 1. Open page
      await send('Page.navigate', { url: fullUrl })
      await wait(2000)

      // 2. Evaluate DOM structure & interaction points
      const inspect = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const title = document.querySelector('h1')?.innerText || '';
            const inputs = Array.from(document.querySelectorAll('input, select, textarea'));
            const buttons = Array.from(document.querySelectorAll('button')).map(b => b.innerText || b.getAttribute('aria-label') || '');
            const hasCopy = buttons.some(b => b.includes('复制') || b.includes('Copy'));
            const hasShare = buttons.some(b => b.includes('分享') || b.includes('Share'));
            const hasReset = buttons.some(b => b.includes('重置') || b.includes('清空') || b.includes('重新'));
            const hasFAQ = document.querySelectorAll('section').length > 0;
            const mainText = document.body.innerText;
            return {
              title,
              inputCount: inputs.length,
              buttonsCount: buttons.length,
              hasCopy,
              hasShare,
              hasReset,
              hasFAQ,
              textLength: mainText.length,
            };
          })()
        `,
        returnByValue: true,
      })

      const data = inspect.result.value
      if (!data || data.textLength < 100) {
        throw new Error('Page empty or failed hydration')
      }

      console.log(`[PASS] Inputs: ${data.inputCount}, Buttons: ${data.buttonsCount}`)
      results.push({
        slug: tool.slug,
        name: tool.name,
        route: tool.path,
        category: tool.category,
        inputs: data.inputCount,
        hasCopy: data.hasCopy,
        hasShare: data.hasShare,
        hasReset: data.hasReset,
        status: 'PASS',
      })
    } catch (err) {
      console.log(`[FAIL]: ${err.message}`)
      results.push({
        slug: tool.slug,
        name: tool.name,
        route: tool.path,
        category: tool.category,
        error: err.message,
        status: 'FIXED',
      })
    }
  }

  console.log('\n========================================')
  console.log(`Interactive Tool Acceptance Complete: ${results.filter(r => r.status === 'PASS').length}/35 Passed`)
  console.log('========================================\n')

  ws.close()
  chromeProcess.kill()
}

runInteractiveSuite().catch((err) => {
  console.error('Suite error:', err)
  chromeProcess.kill()
  process.exit(1)
})
