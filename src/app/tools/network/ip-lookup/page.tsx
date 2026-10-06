'use client'

import { useState } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { Search, MapPin, Globe, ShieldCheck, Copy, Check, Navigation, AlertCircle } from 'lucide-react'

interface IpResult {
  ip: string
  country: string
  countryCode?: string
  region: string
  city: string
  asn: string
  org: string
  timezone: string
  coordinates?: string
  provider: string
}

type ProviderKey = 'ipwhois' | 'ipapico'

interface ProviderMeta {
  name: string
  url: string
  privacyNote: string
}

const PROVIDERS: Record<ProviderKey, ProviderMeta> = {
  ipwhois: {
    name: 'ipwho.is (高精度全球节点)',
    url: 'https://ipwho.is/',
    privacyNote: '数据由 ipwho.is 提供，支持详细 ASN 及中英文地理位置解析',
  },
  ipapico: {
    name: 'ipapi.co (国际公用接口)',
    url: 'https://ipapi.co/',
    privacyNote: '国际常用公共 IP 库，覆盖主流骨干网运营商',
  },
}

export default function IPLookupPage() {
  const [ipInput, setIpInput] = useState('')
  const [selectedProvider, setSelectedProvider] = useState<ProviderKey>('ipwhois')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<IpResult | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [copiedKey, setCopiedKey] = useState('')

  const handleLookup = async (targetIp?: string) => {
    const queryIp = (targetIp !== undefined ? targetIp : ipInput).trim()
    setLoading(true)
    setErrorMsg('')

    try {
      if (selectedProvider === 'ipwhois') {
        const endpoint = queryIp ? `https://ipwho.is/${encodeURIComponent(queryIp)}` : 'https://ipwho.is/'
        const res = await fetch(endpoint)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()

        if (data.success === false) {
          setErrorMsg(data.message || '查询失败，请输入有效的 IPv4 或 IPv6 地址')
          setResult(null)
          return
        }

        setResult({
          ip: data.ip,
          country: data.country || '-',
          countryCode: data.country_code,
          region: data.region || '-',
          city: data.city || '-',
          asn: data.connection?.asn ? `AS${data.connection.asn}` : '-',
          org: data.connection?.org || data.connection?.isp || '-',
          timezone: data.timezone?.id ? `${data.timezone.id} (${data.timezone.utc})` : '-',
          coordinates: data.latitude && data.longitude ? `${data.latitude}, ${data.longitude}` : undefined,
          provider: PROVIDERS.ipwhois.name,
        })
      } else {
        const endpoint = queryIp ? `https://ipapi.co/${encodeURIComponent(queryIp)}/json/` : 'https://ipapi.co/json/'
        const res = await fetch(endpoint)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()

        if (data.error) {
          setErrorMsg(data.reason || '查询失败，请输入有效的 IP 地址')
          setResult(null)
          return
        }

        setResult({
          ip: data.ip,
          country: data.country_name || '-',
          countryCode: data.country_code,
          region: data.region || '-',
          city: data.city || '-',
          asn: data.asn || '-',
          org: data.org || '-',
          timezone: data.timezone ? `${data.timezone} (UTC${data.utc_offset || ''})` : '-',
          coordinates: data.latitude && data.longitude ? `${data.latitude}, ${data.longitude}` : undefined,
          provider: PROVIDERS.ipapico.name,
        })
      }
    } catch {
      setErrorMsg('网络请求失败或超出查询频次，请尝试切换 Provider 或检查网络')
      setResult(null)
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
      toolSlug="ip-lookup"
      principlesTitle="BGP 自治系统 (ASN) 与 IP 地理数据库查询技术原理"
      principles={
        <>
          <p>
            <strong>1. BGP 路由与自治系统 (ASN)：</strong>
            全球互联网由数以万计的自治系统网络互联构成。每个公共 IP 前缀块均广播自特定 ASN（例如 AS13335 Cloudflare）。
          </p>
          <p>
            <strong>2. GeoIP 地理位置映射数据库：</strong>
            IP 地理位置由各大区域互联网注册管理机构（RIPE、APNIC、ARIN）分配记录与电信运营商网络拓扑汇总推导而来，通常可精确至城市级别。
          </p>
        </>
      }
      howToSteps={[
        '在输入框中输入待查询的 IPv4 或 IPv6 地址，留空直接点击“检测本机 IP”。',
        '可选切换高精度数据服务源（ipwho.is 或 ipapi.co）。',
        '点击“查询 IP 详情”，获取国家、城市、所属运营商、ASN、时区及经纬度。',
        '一键复制 IP 地址或相关网络元数据。',
      ]}
      faq={[
        {
          question: '为什么手机流量检测出的城市有时与实际所在城市不同？',
          answer:
            '移动蜂窝网络（4G/5G）的数据流量通常通过基站汇聚至省内核心网网关（PGW/UPF）出口，对外呈现的公网 IP 属于归属地或核心网出口局机房，属于正常电信拓扑现象。',
        },
      ]}
      disclaimer="本工具用于网络运维排障与位置归属诊断。所展示经纬度为基站或城域机房中心参考坐标，非用户个人物理GPS定位。"
    >
      <div className="space-y-6">
        {/* Search Box */}
        <div className="card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <label className="text-xs font-semibold text-text-secondary">输入 IPv4 / IPv6 地址或一键检测本机公网 IP</label>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-text-muted">数据服务源:</span>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value as ProviderKey)}
                className="px-2.5 py-1 bg-canvas border border-border rounded-lg text-text-primary text-xs focus:outline-none"
              >
                {Object.entries(PROVIDERS).map(([k, p]) => (
                  <option key={k} value={k}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={ipInput}
                onChange={(e) => setIpInput(e.target.value)}
                placeholder="留空即检测本机当前公网 IP，或输入如 1.1.1.1, 8.8.8.8"
                onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                className="w-full px-4 py-3 bg-canvas border border-border rounded-xl text-text-primary font-mono text-sm focus:outline-none focus:border-accent-primary transition-colors"
              />
            </div>
            <button
              onClick={() => handleLookup()}
              disabled={loading}
              className="btn-primary px-6 py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? '正在查询...' : '查询 IP 详情'}</span>
            </button>
            <button
              onClick={() => {
                setIpInput('')
                handleLookup('')
              }}
              disabled={loading}
              className="btn-secondary px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Navigation className="w-3.5 h-3.5 text-accent-primary" />
              <span>检测本机 IP</span>
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-danger/10 border border-danger/30 text-danger text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-danger" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Privacy Note */}
          <div className="flex items-center gap-2 text-[11px] text-text-muted pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>隐私保护说明：{PROVIDERS[selectedProvider].privacyNote}。输入默认不会上传或用于产品分析。</span>
          </div>
        </div>

        {/* Results Card */}
        {result && (
          <div className="card p-6 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-2 pb-2 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-lg font-mono font-bold text-text-primary flex items-center gap-2">
                    <span>{result.ip}</span>
                    <button
                      onClick={() => copyToClipboard(result.ip, 'ip')}
                      className="text-text-muted hover:text-text-primary"
                      title="复制 IP"
                    >
                      {copiedKey === 'ip' ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <span className="text-xs text-text-muted">数据来源: {result.provider}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-canvas border border-border">
                <span className="text-xs text-text-muted block mb-1">国家 / 地区</span>
                <span className="text-sm font-semibold text-text-primary flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  {result.country} {result.countryCode && `(${result.countryCode})`}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-canvas border border-border">
                <span className="text-xs text-text-muted block mb-1">省份 / 城市</span>
                <span className="text-sm font-semibold text-text-primary">
                  {result.region} · {result.city}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-canvas border border-border">
                <span className="text-xs text-text-muted block mb-1">自治系统 (ASN)</span>
                <span className="text-sm font-mono font-semibold text-accent-primary">{result.asn}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-canvas border border-border">
                <span className="text-xs text-text-muted block mb-1">运营商 / 所属机构</span>
                <span className="text-sm font-medium text-text-secondary truncate block" title={result.org}>
                  {result.org}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-canvas border border-border">
                <span className="text-xs text-text-muted block mb-1">时区 (Timezone)</span>
                <span className="text-sm font-mono text-text-secondary">{result.timezone}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-canvas border border-border">
                <span className="text-xs text-text-muted block mb-1">经纬度坐标 (经度, 纬度)</span>
                <span className="text-sm font-mono text-text-muted">{result.coordinates || '-'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
