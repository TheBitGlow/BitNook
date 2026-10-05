'use client'

import { useState, useEffect } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { Wifi, Gauge, Clock, ShieldAlert, CheckCircle2, RefreshCw, Smartphone, Laptop } from 'lucide-react'

interface NetworkInfoState {
  supported: boolean
  isOnline: boolean
  effectiveType: string
  downlink: number | null
  rtt: number | null
  saveData: boolean | null
  connectionType?: string
}

export default function BrowserNetworkInfoPage() {
  const [info, setInfo] = useState<NetworkInfoState>({
    supported: false,
    isOnline: true,
    effectiveType: '未知',
    downlink: null,
    rtt: null,
    saveData: null,
  })

  useEffect(() => {
    const updateNetworkInfo = () => {
      const nav = navigator as any
      const conn = nav.connection || nav.mozConnection || nav.webkitConnection

      if (conn) {
        setInfo({
          supported: true,
          isOnline: navigator.onLine,
          effectiveType: conn.effectiveType || '未知',
          downlink: typeof conn.downlink === 'number' ? conn.downlink : null,
          rtt: typeof conn.rtt === 'number' ? conn.rtt : null,
          saveData: typeof conn.saveData === 'boolean' ? conn.saveData : null,
          connectionType: conn.type || undefined,
        })
      } else {
        setInfo({
          supported: false,
          isOnline: navigator.onLine,
          effectiveType: '浏览器未开放 API',
          downlink: null,
          rtt: null,
          saveData: null,
        })
      }
    }

    updateNetworkInfo()

    const nav = navigator as any
    const conn = nav.connection || nav.mozConnection || nav.webkitConnection

    if (conn && conn.addEventListener) {
      conn.addEventListener('change', updateNetworkInfo)
    }

    window.addEventListener('online', updateNetworkInfo)
    window.addEventListener('offline', updateNetworkInfo)

    return () => {
      if (conn && conn.removeEventListener) {
        conn.removeEventListener('change', updateNetworkInfo)
      }
      window.removeEventListener('online', updateNetworkInfo)
      window.removeEventListener('offline', updateNetworkInfo)
    }
  }, [])

  return (
    <ToolLayout slug="wifi-info">
      <div className="space-y-6">
        {/* Real-time Status Card */}
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-6 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-950/80 border border-indigo-700/50 flex items-center justify-center text-indigo-400">
                <Wifi className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>当前网络连接状态</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      info.isOnline
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    }`}
                  >
                    {info.isOnline ? '正常联网 (Online)' : '网络已断开 (Offline)'}
                  </span>
                </h3>
                <span className="text-xs text-slate-400">
                  基于 W3C Network Information API 规范读取的客户端环境网络参数
                </span>
              </div>
            </div>

            <div className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
              <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
              <span>动态监听网络环境变动</span>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Effective Type */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>等效连接类型 (effectiveType)</span>
                <Laptop className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <div className="text-2xl font-mono font-bold text-indigo-400 uppercase">
                {info.effectiveType}
              </div>
              <p className="text-[11px] text-slate-400">
                {info.effectiveType === '4g'
                  ? '具备高带宽低延迟特性'
                  : info.effectiveType === '3g'
                  ? '中等带宽连接'
                  : '弱网或限制连接'}
              </p>
            </div>

            {/* Downlink Bandwidth */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>估算下行带宽 (downlink)</span>
                <Gauge className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-2xl font-mono font-bold text-emerald-400">
                {info.downlink !== null ? `${info.downlink} Mbps` : '不支持'}
              </div>
              <p className="text-[11px] text-slate-400">浏览器对当前物理信道吞吐量估值</p>
            </div>

            {/* Estimated RTT */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>估算往返时延 (rtt)</span>
                <Clock className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-2xl font-mono font-bold text-amber-400">
                {info.rtt !== null ? `${info.rtt} ms` : '不支持'}
              </div>
              <p className="text-[11px] text-slate-400">应用层传输层估算延迟</p>
            </div>

            {/* Data Saver */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>省流模式 (saveData)</span>
                <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="text-2xl font-mono font-bold text-white">
                {info.saveData !== null ? (info.saveData ? '已开启' : '未开启') : '未上报'}
              </div>
              <p className="text-[11px] text-slate-400">用户系统是否设置了节省流量</p>
            </div>
          </div>
        </div>

        {/* Compatibility Notice */}
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-6 space-y-4 shadow-xl">
          <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>浏览器底层隐私边界与跨平台兼容性说明</span>
          </h4>

          <div className="text-xs text-slate-400 space-y-2 leading-relaxed">
            <p>
              <strong>为什么网页无法读取真实的 WiFi 名称 (SSID) 或路由器 MAC (BSSID)？</strong>
              根据现代浏览器 W3C 安全规范，SSID 与 BSSID 属于精确定位与隐私敏感数据，恶意网页可能借此精确推算出用户的物理居住地址。因此，所有主流浏览器均在底层彻底阻断了 JavaScript 直接访问操作系统底层无线网卡配置的权限。
            </p>
            <p>
              本项目坚持<strong>真实可用、绝不模拟伪造数据</strong>的原则，严格展示浏览器真实暴露的网络状态指标。
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-200 block">Chrome / Edge / 360</span>
                <span className="text-[11px] text-slate-400">Chromium 内核</span>
              </div>
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> 完整支持
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-200 block">Safari / iOS WebKit</span>
                <span className="text-[11px] text-slate-400">Apple 平台</span>
              </div>
              <span className="text-amber-400 font-medium">因防追踪策略受限</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-200 block">Firefox 火狐</span>
                <span className="text-[11px] text-slate-400">Gecko 内核</span>
              </div>
              <span className="text-amber-400 font-medium">需手动开启配置项</span>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
