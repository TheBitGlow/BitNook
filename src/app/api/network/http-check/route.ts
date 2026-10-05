import { NextRequest, NextResponse } from 'next/server'
import dns from 'dns/promises'
import http from 'http'
import https from 'https'
import tls from 'tls'

// ==================== Rate Limiting (In-Memory Sliding Window) ====================
interface RateLimitEntry {
  count: number
  resetAt: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()

export function checkRateLimit(
  clientIp: string,
  limit = 30,
  windowMs = 60000
): { allowed: boolean; remaining: number; resetInSec: number } {
  const now = Date.now()
  const entry = rateLimitMap.get(clientIp)

  // Periodic pruning if cache grows
  if (rateLimitMap.size > 5000) {
    for (const [k, v] of rateLimitMap.entries()) {
      if (v.resetAt < now) rateLimitMap.delete(k)
    }
  }

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(clientIp, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, resetInSec: Math.ceil(windowMs / 1000) }
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetInSec: Math.ceil((entry.resetAt - now) / 1000) }
  }

  entry.count++
  return { allowed: true, remaining: limit - entry.count, resetInSec: Math.ceil((entry.resetAt - now) / 1000) }
}

// ==================== IP and Hostname Restriction Engine ====================

// Check if IPv4 address is in a private, loopback, link-local, multicast, or reserved range
export function isRestrictedIpv4(ip: string): boolean {
  const parts = ip.split('.').map(Number)
  if (parts.length !== 4 || parts.some((n) => isNaN(n) || n < 0 || n > 255)) return true

  const [a, b] = parts

  // 0.0.0.0/8 (Current network)
  if (a === 0) return true
  // 10.0.0.0/8 (Private Class A: 10.0.0.0 - 10.255.255.255)
  if (a === 10) return true
  // 127.0.0.0/8 (Loopback: 127.0.0.0 - 127.255.255.255)
  if (a === 127) return true
  // 169.254.0.0/16 (Link-local & Cloud Metadata 169.254.169.254: 169.254.0.0 - 169.254.255.255)
  if (a === 169 && b === 254) return true
  // 172.16.0.0/12 (Private Class B: 172.16.0.0 - 172.31.255.255)
  if (a === 172 && b >= 16 && b <= 31) return true
  // 192.168.0.0/16 (Private Class C: 192.168.0.0 - 192.168.255.255)
  if (a === 192 && b === 168) return true
  // 100.64.0.0/10 (Shared address space / CGNAT: 100.64.0.0 - 100.127.255.255)
  if (a === 100 && b >= 64 && b <= 127) return true
  // 224.0.0.0/4 (Multicast & Future Reserved >= 224)
  if (a >= 224) return true

  return false
}

// Check if IPv6 address is in a private, loopback, link-local, or unique local range
export function isRestrictedIpv6(rawIp: string): boolean {
  // Strip brackets if bracketed like [::1]
  const lower = rawIp.toLowerCase().replace(/^\[|\]$/g, '').trim()
  if (lower === '::1' || lower === '::') return true

  // Link-local fe80::/10 (fe80: to febf:)
  if (/^fe[89ab][0-9a-f]/i.test(lower) || lower.startsWith('fe80:')) return true

  // Unique local fc00::/7 (fc00: to fdff:)
  if (lower.startsWith('fc') || lower.startsWith('fd')) return true

  // IPv4 mapped ::ffff:x.x.x.x or hex form ::ffff:xxxx:xxxx (normalized by WHATWG URL)
  if (lower.startsWith('::ffff:')) {
    const rest = lower.slice(7)
    if (rest.includes('.')) {
      return isRestrictedIpv4(rest)
    }
    const hexParts = rest.split(':')
    if (hexParts.length === 2) {
      const high = parseInt(hexParts[0], 16)
      const low = parseInt(hexParts[1], 16)
      if (!isNaN(high) && !isNaN(low)) {
        const decoded = [
          (high >> 8) & 255,
          high & 255,
          (low >> 8) & 255,
          low & 255,
        ].join('.')
        return isRestrictedIpv4(decoded)
      }
    }
    return true
  }

  // IPv4 compatible ::x.x.x.x or hex form ::xxxx:xxxx
  if (lower.startsWith('::') && !lower.slice(2).includes('::')) {
    const rest = lower.slice(2)
    if (rest.includes('.')) {
      return isRestrictedIpv4(rest)
    }
    const hexParts = rest.split(':')
    if (hexParts.length === 2) {
      const high = parseInt(hexParts[0], 16)
      const low = parseInt(hexParts[1], 16)
      if (!isNaN(high) && !isNaN(low)) {
        const decoded = [
          (high >> 8) & 255,
          high & 255,
          (low >> 8) & 255,
          low & 255,
        ].join('.')
        return isRestrictedIpv4(decoded)
      }
    }
  }

  return false
}

export const ALLOWED_WEB_PORTS = [80, 443, 8080, 8443]

export async function validateHostSafe(
  hostname: string,
  port?: string
): Promise<{ safe: boolean; resolvedIp?: string; reason?: string }> {
  // Strip brackets from IPv6 hostnames and remove any trailing dots (e.g. "example.com.")
  const cleanHost = hostname.toLowerCase().replace(/^\[|\]$/g, '').replace(/\.+$/, '').trim()

  // Validate allowed ports (only standard web ports)
  if (port) {
    const p = Number(port)
    if (isNaN(p) || p <= 0 || p > 65535 || !ALLOWED_WEB_PORTS.includes(p)) {
      return {
        safe: false,
        reason: `禁止访问非标或受限服务端口 (${port})，仅允许公开 Web 端口: 80, 443, 8080, 8443`,
      }
    }
  }

  // Reject local and internal domain suffixes
  const restrictedSuffixes = [
    'localhost',
    '.localhost',
    '.local',
    '.internal',
    '.lan',
    '.home',
    '.corp',
    '.onion',
    '.invalid',
  ]
  if (restrictedSuffixes.some((s) => cleanHost === s || cleanHost.endsWith(s))) {
    return { safe: false, reason: '禁止请求本地主机或内网域名' }
  }

  // Check IPv4 literal (standard dotted decimal)
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(cleanHost)) {
    if (isRestrictedIpv4(cleanHost)) {
      return { safe: false, reason: `禁止访问私有内网或保留地址 (${cleanHost})` }
    }
    return { safe: true, resolvedIp: cleanHost }
  }

  // Check IPv6 literal
  if (cleanHost.includes(':')) {
    if (isRestrictedIpv6(cleanHost)) {
      return { safe: false, reason: `禁止访问私有或本地 IPv6 地址 (${cleanHost})` }
    }
    return { safe: true, resolvedIp: cleanHost }
  }

  // Resolve hostname via DNS
  try {
    const addresses = await dns.lookup(cleanHost, { all: true })
    if (!addresses || addresses.length === 0) {
      return { safe: false, reason: '域名无法解析' }
    }

    for (const addr of addresses) {
      if (addr.family === 4 && isRestrictedIpv4(addr.address)) {
        return { safe: false, reason: `域名解析目标指向私有内网地址 (${addr.address})` }
      }
      if (addr.family === 6 && isRestrictedIpv6(addr.address)) {
        return { safe: false, reason: `域名解析目标指向私有 IPv6 地址 (${addr.address})` }
      }
    }

    return { safe: true, resolvedIp: addresses[0].address }
  } catch (err: any) {
    return { safe: false, reason: `DNS 解析失败: ${err.message || '未知错误'}` }
  }
}

// Single-hop request executor with Node IP Pinning + Edge fallback
interface SingleHopResult {
  statusCode: number
  statusText: string
  headers: { name: string; value: string }[]
  redirectLocation?: string
  sizeBytes: number
  durationMs: number
  resolvedIp?: string
}

async function executeSingleHop(
  parsedUrl: URL,
  pinnedIp: string,
  timeoutMs = 5000
): Promise<SingleHopResult> {
  const isHttps = parsedUrl.protocol === 'https:'
  const port = parsedUrl.port || (isHttps ? '443' : '80')
  const targetPort = Number(port)
  const startTime = Date.now()

  // Check if running in Cloudflare Workers / workerd edge environment
  const isCloudflare =
    typeof (globalThis as any).WebSocketPair !== 'undefined' ||
    typeof (globalThis as any).EdgeRuntime !== 'undefined' ||
    (typeof navigator !== 'undefined' && Boolean((navigator as any).userAgent?.includes('Cloudflare')))

  if (isCloudflare) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const edgeRes = await fetch(parsedUrl.href, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 BitNook/1.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        redirect: 'manual', // Never auto-follow redirects on edge
        signal: controller.signal,
      })
      clearTimeout(timer)
      const durationMs = Date.now() - startTime

      const safeHeaders: { name: string; value: string }[] = []
      const headersToExtract = [
        'content-type',
        'server',
        'date',
        'content-length',
        'location',
        'cache-control',
        'strict-transport-security',
        'x-frame-options',
        'content-encoding',
      ]
      headersToExtract.forEach((h) => {
        const val = edgeRes.headers.get(h)
        if (val) safeHeaders.push({ name: h, value: val })
      })

      return {
        statusCode: edgeRes.status,
        statusText: edgeRes.statusText || 'OK',
        headers: safeHeaders,
        redirectLocation: edgeRes.headers.get('location') || undefined,
        sizeBytes: Number(edgeRes.headers.get('content-length')) || 0,
        durationMs,
        resolvedIp: pinnedIp,
      }
    } finally {
      clearTimeout(timer)
    }
  }

  // Primary: Attempt Node.js https.request with IP Pinning (defeats DNS Rebinding in Node runtimes)
  try {
    const requestModule = isHttps ? https : http
    return await new Promise<SingleHopResult>((resolve, reject) => {
      let isSettled = false
      const clientReq = requestModule.request(
        {
          host: pinnedIp, // Pinned to the validated IP
          port: targetPort,
          path: parsedUrl.pathname + parsedUrl.search,
          method: 'GET',
          servername: parsedUrl.hostname, // TLS SNI
          headers: {
            Host: parsedUrl.hostname,
            'User-Agent': 'BitNook-HttpChecker/1.0 (+https://bitnook.com)',
            Accept: '*/*',
            Connection: 'close',
          },
          checkServerIdentity: isHttps
            ? (h, cert) => tls.checkServerIdentity(parsedUrl.hostname, cert)
            : undefined,
          timeout: timeoutMs,
        },
        (res) => {
          const durationMs = Date.now() - startTime
          const safeHeaders: { name: string; value: string }[] = []
          const headersToExtract = [
            'content-type',
            'server',
            'date',
            'content-length',
            'location',
            'cache-control',
            'strict-transport-security',
            'x-frame-options',
            'content-encoding',
          ]

          headersToExtract.forEach((h) => {
            const val = res.headers[h]
            if (val) {
              safeHeaders.push({
                name: h,
                value: Array.isArray(val) ? val.join(', ') : val,
              })
            }
          })

          let bytesCount = 0
          const MAX_BYTES = 64 * 1024 // 64KB max reading
          res.on('data', (chunk: Buffer) => {
            bytesCount += chunk.length
            if (bytesCount >= MAX_BYTES) {
              res.destroy()
            }
          })

          res.on('end', () => {
            if (isSettled) return
            isSettled = true
            const contentLength = res.headers['content-length']
              ? Number(res.headers['content-length'])
              : bytesCount

            resolve({
              statusCode: res.statusCode || 200,
              statusText: res.statusMessage || 'OK',
              headers: safeHeaders,
              redirectLocation: res.headers.location || undefined,
              sizeBytes: contentLength,
              durationMs,
              resolvedIp: pinnedIp,
            })
          })

          res.on('error', (err) => {
            if (isSettled) return
            isSettled = true
            reject(err)
          })
        }
      )

      clientReq.on('timeout', () => {
        clientReq.destroy()
        if (isSettled) return
        isSettled = true
        reject(new Error('请求超时（超过 5 秒无响应）'))
      })

      clientReq.on('error', (err: any) => {
        if (isSettled) return
        isSettled = true
        reject(err)
      })

      clientReq.end()
    })
  } catch (nodeErr: any) {
    // If running in Cloudflare Workers / workerd, https.request throws unenv NotImplementedError
    // In that case, fall back to native edge fetch with redirect: 'manual'
    const isUnenvError =
      nodeErr.message?.includes('not implemented') ||
      nodeErr.message?.includes('unenv') ||
      typeof https.request !== 'function'

    if (!isUnenvError) {
      throw nodeErr
    }

    // Edge Runtime Fetch Fallback
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const edgeRes = await fetch(parsedUrl.href, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 BitNook/1.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        redirect: 'manual', // Never auto-follow redirects on edge
        signal: controller.signal,
      })
      clearTimeout(timer)
      const durationMs = Date.now() - startTime

      const safeHeaders: { name: string; value: string }[] = []
      const headersToExtract = [
        'content-type',
        'server',
        'date',
        'content-length',
        'location',
        'cache-control',
        'strict-transport-security',
        'x-frame-options',
        'content-encoding',
      ]
      headersToExtract.forEach((h) => {
        const val = edgeRes.headers.get(h)
        if (val) safeHeaders.push({ name: h, value: val })
      })

      return {
        statusCode: edgeRes.status,
        statusText: edgeRes.statusText || 'OK',
        headers: safeHeaders,
        redirectLocation: edgeRes.headers.get('location') || undefined,
        sizeBytes: Number(edgeRes.headers.get('content-length')) || 0,
        durationMs,
        resolvedIp: pinnedIp,
      }
    } finally {
      clearTimeout(timer)
    }
  }
}

// ==================== Next.js POST Handler ====================

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting Check
    const clientIp =
      req.headers.get('cf-connecting-ip') ||
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1'

    const rateLimit = checkRateLimit(clientIp, 30, 60000)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: '请求过于频繁，已触发限流保护，请稍后再试 (429 Too Many Requests)' },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.resetInSec),
            'X-RateLimit-Limit': '30',
            'X-RateLimit-Remaining': '0',
          },
        }
      )
    }

    // 2. Request Payload & Size Limits (max 4KB payload)
    const contentLength = Number(req.headers.get('content-length') || 0)
    if (contentLength > 4096) {
      return NextResponse.json(
        { error: '请求体超出限制（最大允许 4KB）' },
        { status: 413 }
      )
    }

    const body = await req.json()
    let rawUrl = (body.url || '').trim()
    const followRedirects = Boolean(body.followRedirects)

    if (!rawUrl) {
      return NextResponse.json({ error: 'URL 不能为空' }, { status: 400 })
    }

    // URL length limit
    if (rawUrl.length > 2048) {
      return NextResponse.json({ error: 'URL 长度超出限制（最大允许 2048 字符）' }, { status: 400 })
    }

    if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
      rawUrl = `https://${rawUrl}`
    }

    // ==================== Redirect SSRF Loop Engine ====================
    const MAX_REDIRECTS = 5
    const visitedUrls = new Set<string>()
    let currentUrlStr = rawUrl
    let lastResult: SingleHopResult | null = null
    const redirectChain: { from: string; to: string; status: number }[] = []

    for (let hop = 0; hop <= (followRedirects ? MAX_REDIRECTS : 0); hop++) {
      if (visitedUrls.has(currentUrlStr)) {
        return NextResponse.json(
          { error: '检测到无限循环重定向 (Infinite Redirect Loop)' },
          { status: 400 }
        )
      }
      visitedUrls.add(currentUrlStr)

      let parsed: URL
      try {
        parsed = new URL(currentUrlStr)
      } catch {
        return NextResponse.json({ error: '无效的 URL 格式' }, { status: 400 })
      }

      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return NextResponse.json({ error: '仅支持 HTTP 或 HTTPS 协议' }, { status: 400 })
      }

      // Reject userinfo (e.g. http://user:pass@host)
      if (parsed.username || parsed.password) {
        return NextResponse.json(
          { error: '禁止在 URL 中包含凭据信息 (userinfo)' },
          { status: 400 }
        )
      }

      // Re-run SSRF and port validation on EVERY hop!
      const port = parsed.port || (parsed.protocol === 'https:' ? '443' : '80')
      const safetyCheck = await validateHostSafe(parsed.hostname, port)
      if (!safetyCheck.safe || !safetyCheck.resolvedIp) {
        return NextResponse.json(
          {
            error:
              hop === 0
                ? `SSRF 安全拦截：${safetyCheck.reason || '禁止访问目标地址'}`
                : `SSRF 重定向拦截：第 ${hop} 跳重定向目标受限 (${safetyCheck.reason || parsed.hostname})`,
          },
          { status: 403 }
        )
      }

      try {
        lastResult = await executeSingleHop(parsed, safetyCheck.resolvedIp, 5000)
      } catch (err: any) {
        return NextResponse.json(
          { error: `连接失败: ${err.message || '网络连接被重置'}` },
          { status: 502 }
        )
      }

      // Check if this step is a redirect
      const isRedirectStatus = [301, 302, 303, 307, 308].includes(lastResult.statusCode)
      if (!isRedirectStatus || !lastResult.redirectLocation || !followRedirects) {
        break // Done!
      }

      // Next hop URL resolution
      const nextUrl = new URL(lastResult.redirectLocation, currentUrlStr).href
      redirectChain.push({
        from: currentUrlStr,
        to: nextUrl,
        status: lastResult.statusCode,
      })

      if (hop === MAX_REDIRECTS) {
        return NextResponse.json(
          { error: '重定向次数超过上限（最多 5 次）' },
          { status: 400 }
        )
      }

      currentUrlStr = nextUrl
    }

    if (!lastResult) {
      return NextResponse.json({ error: '未获取到有效响应' }, { status: 502 })
    }

    return NextResponse.json({
      success: true,
      status: lastResult.statusCode,
      statusText: lastResult.statusText,
      durationMs: lastResult.durationMs,
      resolvedIp: lastResult.resolvedIp,
      sizeBytes: lastResult.sizeBytes,
      headers: lastResult.headers,
      redirectLocation: lastResult.redirectLocation,
      redirectChain: redirectChain.length > 0 ? redirectChain : undefined,
    })
  } catch (err: any) {
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}
