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

  // Query by IP or current client IP if empty
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
    } catch (err: any) {
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
    <ToolLayout slug="ip-lookup">
      <div className="space-y-6">
        {/* Search Box */}
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <label className="text-xs font-semibold text-slate-300">输入 IPv4 / IPv6 地址或一键检测本机公网 IP</label>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">数据服务源:</span>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value as ProviderKey)}
                className="px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:outline-none"
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
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              onClick={() => handleLookup()}
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-md shadow-indigo-600/20"
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
              className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Navigation className="w-3.5 h-3.5 text-indigo-400" />
              <span>检测本机 IP</span>
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Privacy Note */}
          <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>隐私保护说明：{PROVIDERS[selectedProvider].privacyNote}。BitNook 不保存任何查询日志。</span>
          </div>
        </div>

        {/* Results Card */}
        {result && (
          <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-6 space-y-4 shadow-xl">
            <div className="flex flex-wrap justify-between items-center gap-2 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-700/50 flex items-center justify-center text-indigo-400">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-lg font-mono font-bold text-white flex items-center gap-2">
                    <span>{result.ip}</span>
                    <button
                      onClick={() => copyToClipboard(result.ip, 'ip')}
                      className="text-slate-400 hover:text-white"
                      title="复制 IP"
                    >
                      {copiedKey === 'ip' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <span className="text-xs text-slate-400">数据来源: {result.provider}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">国家 / 地区</span>
                <span className="text-sm font-semibold text-white flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  {result.country} {result.countryCode && `(${result.countryCode})`}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">省份 / 城市</span>
                <span className="text-sm font-semibold text-white">
                  {result.region} · {result.city}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">自治系统 (ASN)</span>
                <span className="text-sm font-mono font-semibold text-indigo-300">{result.asn}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">运营商 / 所属机构</span>
                <span className="text-sm font-medium text-slate-200 truncate block" title={result.org}>
                  {result.org}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">时区 (Timezone)</span>
                <span className="text-sm font-mono text-slate-200">{result.timezone}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">经纬度坐标 (经度, 纬度)</span>
                <span className="text-sm font-mono text-slate-300">{result.coordinates || '-'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
