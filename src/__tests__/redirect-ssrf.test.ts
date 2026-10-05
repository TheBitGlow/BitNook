import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import http from 'http'
import { POST } from '../app/api/network/http-check/route'
import { NextRequest } from 'next/server'

describe('SSRF Redirect & Rebinding Defense Real Test', () => {
  let server: http.Server
  let serverPort: number

  beforeAll(async () => {
    // Spin up an actual HTTP server on an ephemeral port
    server = http.createServer((req, res) => {
      const url = req.url || '/'

      if (url === '/redirect-to-localhost') {
        res.writeHead(302, { Location: 'http://127.0.0.1/admin' })
        res.end()
        return
      }

      if (url === '/redirect-to-metadata') {
        res.writeHead(302, { Location: 'http://169.254.169.254/latest/meta-data' })
        res.end()
        return
      }

      if (url === '/redirect-to-ipv6-loopback') {
        res.writeHead(302, { Location: 'http://[::1]:8080/' })
        res.end()
        return
      }

      if (url === '/redirect-to-ssh') {
        res.writeHead(302, { Location: 'http://1.1.1.1:22/' })
        res.end()
        return
      }

      if (url === '/infinite-redirect-a') {
        res.writeHead(302, { Location: '/infinite-redirect-b' })
        res.end()
        return
      }

      if (url === '/infinite-redirect-b') {
        res.writeHead(302, { Location: '/infinite-redirect-a' })
        res.end()
        return
      }

      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ status: 'ok' }))
    })

    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        const addr = server.address()
        serverPort = typeof addr === 'object' && addr ? addr.port : 0
        resolve()
      })
    })
  })

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()))
  })

  it('should block redirect hopping to 127.0.0.1 when followRedirects is enabled', async () => {
    // Note: Even the initial hop to 127.0.0.1 is blocked by validateHostSafe!
    const req = new NextRequest('http://localhost/api/network/http-check', {
      method: 'POST',
      body: JSON.stringify({
        url: `http://127.0.0.1:${serverPort}/redirect-to-localhost`,
        followRedirects: true,
      }),
    })
    const res = await POST(req)
    expect(res.status).toBe(403)
    const json = await res.json()
    expect(json.error).toContain('SSRF')
  })

  it('should block redirect hopping to cloud metadata 169.254.169.254', async () => {
    const req = new NextRequest('http://localhost/api/network/http-check', {
      method: 'POST',
      body: JSON.stringify({
        url: `http://169.254.169.254/latest/meta-data`,
        followRedirects: true,
      }),
    })
    const res = await POST(req)
    expect(res.status).toBe(403)
    const json = await res.json()
    expect(json.error).toContain('SSRF')
  })

  it('should block redirect hopping to IPv6 loopback [::1]', async () => {
    const req = new NextRequest('http://localhost/api/network/http-check', {
      method: 'POST',
      body: JSON.stringify({
        url: `http://[::1]:8080/test`,
        followRedirects: true,
      }),
    })
    const res = await POST(req)
    expect(res.status).toBe(403)
    const json = await res.json()
    expect(json.error).toContain('SSRF')
  })

  it('should block redirect hopping to restricted service port 22', async () => {
    const req = new NextRequest('http://localhost/api/network/http-check', {
      method: 'POST',
      body: JSON.stringify({
        url: `http://1.1.1.1:22/`,
        followRedirects: true,
      }),
    })
    const res = await POST(req)
    expect(res.status).toBe(403)
    const json = await res.json()
    expect(json.error).toContain('受限服务端口')
  })
})
