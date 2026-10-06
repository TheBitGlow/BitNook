'use client'

import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { Search, Copy, Check, Clock, Server, Globe } from 'lucide-react'

interface DnsRecord {
  type: string
  name: string
  data: string
  TTL: number
  provider: string
  timestamp: string
}

type ProviderKey = 'cloudflare' | 'google' | 'alidns'

interface ProviderInfo {
  name: string
  url: string
  docUrl: string
}

const PROVIDERS: Record<ProviderKey, ProviderInfo> = {
  cloudflare: {
    name: 'Cloudflare (1.1.1.1)',
    url: 'https://cloudflare-dns.com/dns-query',
    docUrl: 'https://developers.cloudflare.com/1.1.1.1/encryption/dns-over-https/',
  },
  google: {
    name: 'Google Public DNS (8.8.8.8)',
    url: 'https://dns.google/resolve',
    docUrl: 'https://developers.google.com/speed/public-dns/docs/doh',
  },
  alidns: {
    name: 'AliDNS 阿里公共DNS (223.5.5.5)',
    url: 'https://dns.alidns.com/resolve',
    docUrl: 'https://www.alidns.com/',
  },
}

const RECORD_TYPES = ['ALL', 'A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS']

const TYPE_MAP: Record<number, string> = {
  1: 'A',
  28: 'AAAA',
  5: 'CNAME',
  15: 'MX',
  16: 'TXT',
  2: 'NS',
  6: 'SOA',
}

export default function DNSLookupPage() {
  const [domainInput, setDomainInput] = useState('example.com')
  const [selectedProvider, setSelectedProvider] = useState<ProviderKey>('cloudflare')
  const [selectedType, setSelectedType] = useState('ALL')
  const [loading, setLoading] = useState(false)
  const [records, setRecords] = useState<DnsRecord[]>([])
  const [errorMsg, setErrorMsg] = useState('')
  const [copiedKey, setCopiedKey] = useState('')

  const handleQuery = async () => {
    let clean = domainInput.trim().toLowerCase()
    clean = clean.replace(/^https?:\/\//, '').replace(/\/.*$/, '')

    if (!clean || !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(clean)) {
      setErrorMsg('请输入有效的域名格式，例如: example.com 或 github.com')
      return
    }

    setLoading(true)
    setErrorMsg('')
    setRecords([])

    const typesToQuery = selectedType === 'ALL' ? ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS'] : [selectedType]
    const providerMeta = PROVIDERS[selectedProvider]
    const queryTime = new Date().toLocaleString('zh-CN', { hour12: false })

    try {
      const promises = typesToQuery.map(async (type) => {
        try {
          let reqUrl = ''
          const headers: HeadersInit = {}

          if (selectedProvider === 'cloudflare') {
            reqUrl = `${providerMeta.url}?name=${encodeURIComponent(clean)}&type=${type}`
            headers['Accept'] = 'application/dns-json'
          } else {
            reqUrl = `${providerMeta.url}?name=${encodeURIComponent(clean)}&type=${type}`
          }

          const res = await fetch(reqUrl, { headers })
          if (!res.ok) return []
          const data = await res.json()

          const ansList = data.Answer || []
          return ansList.map((ans: any) => {
            const resolvedType = TYPE_MAP[ans.type] || (typeof ans.type === 'string' ? ans.type : String(ans.type))
            return {
              type: resolvedType,
              name: ans.name,
              data: ans.data,
              TTL: ans.TTL || 0,
              provider: providerMeta.name,
              timestamp: queryTime,
            }
          })
        } catch {
          return []
        }
      })

      const settled = await Promise.allSettled(promises)
      const allResults: DnsRecord[] = []
      settled.forEach((s) => {
        if (s.status === 'fulfilled') {
          allResults.push(...s.value)
        }
      })

      if (allResults.length === 0) {
        setErrorMsg('未查询到相关 DNS 记录，或该域名未配置此类型记录')
      } else {
        setRecords(allResults)
      }
    } catch {
      setErrorMsg('DNS over HTTPS 查询请求失败，请检查网络连接')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(''), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <ToolLayout
      toolSlug="dns"
      principlesTitle="DNS-over-HTTPS (DoH) 加密查询技术原理"
      principles={
        <>
          <p>
            <strong>1. DoH (RFC 8484) 加密通信机制：</strong>
            传统的 53 端口明文 UDP DNS 查询极易遭受局域网劫持、中间人监听与 DNS 污染。本工具基于行业标准 DNS-over-HTTPS (DoH) 协议，通过安全的 HTTPS/TLS 加密通道直接向权威递归解析器获取可信解析数据。
          </p>
          <p>
            <strong>2. 客户端端到端直连解析：</strong>
            查询由浏览器前端直接向 Cloudflare / Google / AliDNS 公开 JSON DoH 接口发起，无第三方中继截获，保证权威准确。
          </p>
        </>
      }
      howToSteps={[
        '输入待解析的目标域名（如 example.com 或 github.com）。',
        '选择所需的权威 DoH 节点（Cloudflare 1.1.1.1、Google 8.8.8.8 或 AliDNS 223.5.5.5）。',
        '选择记录类型（A、AAAA、CNAME、MX、TXT、NS 或 ALL 全量）。',
        '查看返回的真实应答记录、TTL 缓存时效，并可一键复制解析值。',
      ]}
      faq={[
        {
          question: '什么是 DNS 记录的 TTL？',
          answer: 'TTL (Time to Live) 即生存时间，以秒为单位。它指示全球各地递归 DNS 服务器与本地操作系统缓存该条记录的最长有效时间，TTL 归零前解析节点通常不会重复向权威服务器发起重新拉取。',
        },
      ]}
      disclaimer="本工具通过公共权威 DoH 服务进行域名解析诊断，查询结果反映对应公共解析服务器的全球权威视图。"
    >
      <div className="space-y-6">
        {/* Search Header */}
        <div className="card p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">DoH 加密解析节点</label>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value as ProviderKey)}
                className="w-full px-3 py-2.5 bg-canvas border border-border rounded-xl text-text-primary text-xs font-medium focus:outline-none focus:border-accent-primary transition-colors"
              >
                {Object.entries(PROVIDERS).map(([key, info]) => (
                  <option key={key} value={key}>
                    {info.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">解析记录类型</label>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {RECORD_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedType(t)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                      selectedType === t
                        ? 'bg-accent-primary text-white shadow-sm'
                        : 'bg-canvas text-text-muted hover:text-text-primary border border-border'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                placeholder="输入目标域名，如 cloudflare.com 或 baidu.com"
                onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
                className="w-full px-4 py-3 bg-canvas border border-border rounded-xl text-text-primary font-mono text-sm focus:outline-none focus:border-accent-primary transition-colors"
              />
            </div>
            <button
              onClick={handleQuery}
              disabled={loading}
              className="btn-primary px-6 py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? '正在通过 DoH 查询...' : '执行真实 DNS 查询'}</span>
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-danger/10 border border-danger/30 text-danger text-xs">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Results List */}
        {records.length > 0 && (
          <div className="card p-6 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-2 pb-2 border-b border-border">
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <Globe className="w-4 h-4 text-accent-primary" />
                <span>DNS 解析应答记录 ({records.length} 条)</span>
              </h3>
              <div className="flex items-center gap-4 text-xs text-text-muted">
                <span className="flex items-center gap-1">
                  <Server className="w-3.5 h-3.5 text-accent-primary" />
                  {records[0]?.provider}
                </span>
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5 text-text-muted" />
                  {records[0]?.timestamp}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-text-muted">
                    <th className="py-2.5 px-3">记录类型</th>
                    <th className="py-2.5 px-3">查询主机名</th>
                    <th className="py-2.5 px-3">解析值 (Data)</th>
                    <th className="py-2.5 px-3 text-right">TTL 缓存时长</th>
                    <th className="py-2.5 px-3 text-center">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {records.map((r, i) => {
                    const isCopied = copiedKey === `rec-${i}`
                    return (
                      <tr key={i} className="hover:bg-surface-elevated transition">
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-accent-primary/10 text-accent-primary border border-accent-primary/20">
                            {r.type}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-text-secondary">{r.name}</td>
                        <td className="py-2.5 px-3 font-mono text-text-primary break-all max-w-md font-medium">{r.data}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-text-muted">{r.TTL}s</td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => copyToClipboard(r.data, `rec-${i}`)}
                            className="p-1.5 text-text-muted hover:text-text-primary rounded hover:bg-surface-elevated transition"
                            title="复制解析值"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
