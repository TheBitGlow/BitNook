import { describe, it, expect } from 'vitest'
import {
  isRestrictedIpv4,
  isRestrictedIpv6,
  validateHostSafe,
  checkRateLimit,
  ALLOWED_WEB_PORTS,
  POST,
} from '../app/api/network/http-check/route'
import { NextRequest } from 'next/server'

describe('SSRF Protection & Red Team Security Engine', () => {
  it('should block all Section 4 restricted IPv4 ranges and boundaries', () => {
    // 127.0.0.1 / Loopback
    expect(isRestrictedIpv4('127.0.0.1')).toBe(true)
    expect(isRestrictedIpv4('127.255.255.254')).toBe(true)

    // 0.0.0.0
    expect(isRestrictedIpv4('0.0.0.0')).toBe(true)

    // 10.0.0.0/8 boundaries (10.0.0.1 to 10.255.255.255)
    expect(isRestrictedIpv4('10.0.0.1')).toBe(true)
    expect(isRestrictedIpv4('10.255.255.255')).toBe(true)

    // 172.16.0.0/12 boundaries (172.16.0.1 to 172.31.255.254)
    expect(isRestrictedIpv4('172.16.0.1')).toBe(true)
    expect(isRestrictedIpv4('172.31.255.254')).toBe(true)
    expect(isRestrictedIpv4('172.31.255.255')).toBe(true)

    // 192.168.0.0/16
    expect(isRestrictedIpv4('192.168.0.1')).toBe(true)
    expect(isRestrictedIpv4('192.168.1.1')).toBe(true)

    // 169.254.0.0/16 (Link-local & AWS/GCP/Azure Cloud Metadata)
    expect(isRestrictedIpv4('169.254.169.254')).toBe(true)
    expect(isRestrictedIpv4('169.254.0.1')).toBe(true)

    // 100.64.0.0/10 (CGNAT / Shared Address Space)
    expect(isRestrictedIpv4('100.64.0.1')).toBe(true)
    expect(isRestrictedIpv4('100.127.255.255')).toBe(true)

    // Multicast & Reserved
    expect(isRestrictedIpv4('224.0.0.1')).toBe(true)
    expect(isRestrictedIpv4('255.255.255.255')).toBe(true)

    // Public IPs must be permitted
    expect(isRestrictedIpv4('1.1.1.1')).toBe(false)
    expect(isRestrictedIpv4('8.8.8.8')).toBe(false)
    expect(isRestrictedIpv4('104.16.132.229')).toBe(false)
  })

  it('should block all Section 4 IPv6 loopback, link-local, and IPv4-mapped formats', () => {
    // ::1 and bracketed [::1]
    expect(isRestrictedIpv6('::1')).toBe(true)
    expect(isRestrictedIpv6('[::1]')).toBe(true)
    expect(isRestrictedIpv6('::')).toBe(true)
    expect(isRestrictedIpv6('[::]')).toBe(true)

    // fe80::1 link-local
    expect(isRestrictedIpv6('fe80::1')).toBe(true)
    expect(isRestrictedIpv6('[fe80::1]')).toBe(true)

    // Unique local fc00::/7
    expect(isRestrictedIpv6('fc00::1')).toBe(true)
    expect(isRestrictedIpv6('fd12:3456:789a::1')).toBe(true)

    // IPv4-mapped private (dotted and hex normalized)
    expect(isRestrictedIpv6('::ffff:127.0.0.1')).toBe(true)
    expect(isRestrictedIpv6('::ffff:169.254.169.254')).toBe(true)
    expect(isRestrictedIpv6('::ffff:10.0.0.1')).toBe(true)
    expect(isRestrictedIpv6('::ffff:7f00:1')).toBe(true) // 127.0.0.1 in hex

    // IPv4-mapped public (allowed)
    expect(isRestrictedIpv6('::ffff:1.1.1.1')).toBe(false)
    expect(isRestrictedIpv6('::ffff:101:101')).toBe(false)

    // Public IPv6
    expect(isRestrictedIpv6('2606:4700:4700::1111')).toBe(false)
    expect(isRestrictedIpv6('[2606:4700:4700::1111]')).toBe(false)
  })

  it('should strictly block all Section 4 dangerous service ports', async () => {
    const dangerousPorts = [
      '22', // SSH
      '23', // Telnet
      '25', // SMTP
      '53', // DNS
      '110', // POP3
      '143', // IMAP
      '445', // SMB
      '3306', // MySQL
      '5432', // PostgreSQL
      '6379', // Redis
      '27017', // MongoDB
      '11211', // Memcached
      '0', // Invalid
      '65536', // Out of range
    ]

    for (const port of dangerousPorts) {
      const res = await validateHostSafe('1.1.1.1', port)
      expect(res.safe).toBe(false)
      expect(res.reason).toContain('受限服务端口')
    }

    // Standard web ports MUST be allowed
    for (const port of ALLOWED_WEB_PORTS) {
      const res = await validateHostSafe('1.1.1.1', String(port))
      expect(res.safe).toBe(true)
    }
  })

  it('should handle case-insensitivity, trailing dots, and internal suffixes', async () => {
    // Mixed case
    expect((await validateHostSafe('LoCaLhOsT')).safe).toBe(false)
    expect((await validateHostSafe('127.0.0.1')).safe).toBe(false)

    // Trailing dots
    expect((await validateHostSafe('localhost.')).safe).toBe(false)
    expect((await validateHostSafe('internal.service.local.')).safe).toBe(false)

    // Normal domain with trailing dot
    expect((await validateHostSafe('1.1.1.1.')).safe).toBe(true)
  })

  it('should enforce rate limiting and resource exhaustion boundaries', () => {
    const testIp = '198.51.100.42'
    // Consume up to limit (30)
    for (let i = 0; i < 30; i++) {
      const check = checkRateLimit(testIp, 30, 60000)
      expect(check.allowed).toBe(true)
    }

    // 31st request must be rejected
    const blockedCheck = checkRateLimit(testIp, 30, 60000)
    expect(blockedCheck.allowed).toBe(false)
    expect(blockedCheck.remaining).toBe(0)
    expect(blockedCheck.resetInSec).toBeGreaterThan(0)
  })

  it('should reject malformed requests, oversized payloads, and SSRF attacks in POST', async () => {
    // 1. Missing URL
    const res1 = await POST(
      new NextRequest('http://localhost/api/network/http-check', {
        method: 'POST',
        body: JSON.stringify({ url: '' }),
      })
    )
    expect(res1.status).toBe(400)
    expect((await res1.json()).error).toContain('URL 不能为空')

    // 2. URL Length > 2048
    const longUrl = 'https://example.com/' + 'a'.repeat(2100)
    const res2 = await POST(
      new NextRequest('http://localhost/api/network/http-check', {
        method: 'POST',
        body: JSON.stringify({ url: longUrl }),
      })
    )
    expect(res2.status).toBe(400)
    expect((await res2.json()).error).toContain('URL 长度超出限制')

    // 3. Request Body > 4096 bytes
    const res3 = await POST(
      new NextRequest('http://localhost/api/network/http-check', {
        method: 'POST',
        headers: { 'content-length': '5000' },
        body: JSON.stringify({ url: 'https://example.com' }),
      })
    )
    expect(res3.status).toBe(413)

    // 4. Userinfo credentials
    const res4 = await POST(
      new NextRequest('http://localhost/api/network/http-check', {
        method: 'POST',
        body: JSON.stringify({ url: 'http://admin:secret@1.1.1.1' }),
      })
    )
    expect(res4.status).toBe(400)
    expect((await res4.json()).error).toContain('凭据信息 (userinfo)')

    // 5. Dangerous port 22
    const res5 = await POST(
      new NextRequest('http://localhost/api/network/http-check', {
        method: 'POST',
        body: JSON.stringify({ url: 'http://1.1.1.1:22' }),
      })
    )
    expect(res5.status).toBe(403)

    // 6. Direct loopback 127.0.0.1
    const res6 = await POST(
      new NextRequest('http://localhost/api/network/http-check', {
        method: 'POST',
        body: JSON.stringify({ url: 'http://127.0.0.1' }),
      })
    )
    expect(res6.status).toBe(403)

    // 7. Cloud metadata 169.254.169.254
    const res7 = await POST(
      new NextRequest('http://localhost/api/network/http-check', {
        method: 'POST',
        body: JSON.stringify({ url: 'http://169.254.169.254/latest/meta-data' }),
      })
    )
    expect(res7.status).toBe(403)

    // 8. IPv6 Loopback [::1]
    const res8 = await POST(
      new NextRequest('http://localhost/api/network/http-check', {
        method: 'POST',
        body: JSON.stringify({ url: 'http://[::1]/' }),
      })
    )
    expect(res8.status).toBe(403)
  })
})
