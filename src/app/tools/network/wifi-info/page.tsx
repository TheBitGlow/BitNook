'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Wifi, AlertCircle } from 'lucide-react'

export default function WiFiInfoPage() {
  const [manualInfo, setManualInfo] = useState({
    ssid: '',
    bssid: '',
    signal: 75,
    frequency: 2400,
    security: 'WPA2-PSK'
  })
  const [showManual, setShowManual] = useState(false)

  const getSignalQuality = (signal: number) => {
    if (signal >= 80) return { text: '优秀', color: '#10B981' }
    if (signal >= 60) return { text: '良好', color: '#3B82F6' }
    if (signal >= 40) return { text: '一般', color: '#F59E0B' }
    return { text: '较差', color: '#EF4444' }
  }

  const signalQuality = getSignalQuality(manualInfo.signal)

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center">
                <Wifi className="w-5 h-5 text-[#3B82F6]" />
              </div>
              <h1 className="text-2xl font-bold text-white">WiFi信息</h1>
            </div>
            <p className="text-[#94A3B8]">查看当前WiFi连接信息</p>
          </div>

          {/* Notice */}
          <div className="glass-card p-6 mb-6 border border-[#F59E0B]/30">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-white font-medium mb-1">浏览器权限限制</h3>
                <p className="text-sm text-[#94A3B8]">
                  由于浏览器安全策略限制，无法直接获取当前WiFi信息。建议您使用系统设置查看真实WiFi数据，
                  或使用下方手动输入功能进行演示。
                </p>
              </div>
            </div>
          </div>

          {/* Manual Input Toggle */}
          <button
            onClick={() => setShowManual(!showManual)}
            className="w-full py-3 mb-6 bg-[#111827] border border-[rgba(99,102,241,0.3)] rounded-xl text-[#94A3B8] hover:text-white transition-colors"
          >
            {showManual ? '关闭手动输入' : '手动输入WiFi信息（演示用）'}
          </button>

          {/* Manual Input Form */}
          {showManual && (
            <div className="glass-card p-6 mb-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[#94A3B8] mb-2">SSID (WiFi名称)</label>
                  <input
                    type="text"
                    value={manualInfo.ssid}
                    onChange={(e) => setManualInfo({ ...manualInfo, ssid: e.target.value })}
                    placeholder="例如：MyHomeWiFi"
                    className="w-full px-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white placeholder:text-[#475569]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#94A3B8] mb-2">BSSID (MAC地址)</label>
                  <input
                    type="text"
                    value={manualInfo.bssid}
                    onChange={(e) => setManualInfo({ ...manualInfo, bssid: e.target.value })}
                    placeholder="例如：AA:BB:CC:DD:EE:FF"
                    className="w-full px-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white placeholder:text-[#475569]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#94A3B8] mb-2">信号强度 (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={manualInfo.signal}
                    onChange={(e) => setManualInfo({ ...manualInfo, signal: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#94A3B8] mb-2">频率 (MHz)</label>
                  <select
                    value={manualInfo.frequency}
                    onChange={(e) => setManualInfo({ ...manualInfo, frequency: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white"
                  >
                    <option value={2400}>2400 MHz (2.4GHz)</option>
                    <option value={5180}>5180 MHz (5GHz)</option>
                    <option value={5925}>5925 MHz (6GHz)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#94A3B8] mb-2">加密方式</label>
                  <select
                    value={manualInfo.security}
                    onChange={(e) => setManualInfo({ ...manualInfo, security: e.target.value })}
                    className="w-full px-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white"
                  >
                    <option value="开放">开放 (无密码)</option>
                    <option value="WEP">WEP</option>
                    <option value="WPA-PSK">WPA-PSK</option>
                    <option value="WPA2-PSK">WPA2-PSK</option>
                    <option value="WPA3-PSK">WPA3-PSK</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* WiFi Card - Only show if user entered data */}
          {manualInfo.ssid && (
            <div className="glass-card p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center">
                    <Wifi className="w-6 h-6 text-[#3B82F6]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{manualInfo.ssid}</h3>
                    <p className="text-sm text-[#94A3B8]">{manualInfo.bssid || '未填写MAC地址'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold" style={{ color: signalQuality.color }}>
                    {manualInfo.signal}%
                  </p>
                  <p className="text-sm" style={{ color: signalQuality.color }}>
                    {signalQuality.text}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-[#080B14] rounded">
                  <span className="text-[#94A3B8]">信号强度</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-[#1E293B] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${manualInfo.signal}%`,
                          backgroundColor: signalQuality.color
                        }}
                      ></div>
                    </div>
                    <span className="text-white text-sm">{manualInfo.signal}%</span>
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 bg-[#080B14] rounded">
                  <span className="text-[#94A3B8]">频率</span>
                  <span className="text-white">{manualInfo.frequency} MHz ({manualInfo.frequency >= 5000 ? '5GHz' : '2.4GHz'})</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-[#080B14] rounded">
                  <span className="text-[#94A3B8]">加密方式</span>
                  <span className="text-white">{manualInfo.security}</span>
                </div>
              </div>
            </div>
          )}

          <p className="text-xs text-[#475569] text-center">
            提示：真实WiFi信息请在系统设置或路由器管理页面查看
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
