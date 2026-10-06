'use client'

import { useState, useEffect, useMemo } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import QRCode from 'qrcode'
import { trackEvent } from '@/lib/analytics'
import {
  Download,
  Copy,
  Check,
  Type,
  Link2,
  Wifi,
  Contact,
  Mail,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react'

type QrType = 'text' | 'url' | 'wifi' | 'vcard' | 'email'

export default function QRCodeGeneratorPage() {
  const [activeType, setActiveType] = useState<QrType>('text')

  // Text / URL
  const [textContent, setTextContent] = useState('https://bitnook.com')

  // WiFi
  const [wifiSsid, setWifiSsid] = useState('BitNook_Guest')
  const [wifiPassword, setWifiPassword] = useState('')
  const [wifiAuth, setWifiAuth] = useState<'WPA' | 'WEP' | 'nopass'>('WPA')
  const [wifiHidden, setWifiHidden] = useState(false)

  // VCard
  const [vcardName, setVcardName] = useState('张三')
  const [vcardPhone, setVcardPhone] = useState('13800138000')
  const [vcardEmail, setVcardEmail] = useState('zhangsan@example.com')
  const [vcardOrg, setVcardOrg] = useState('比特角落科技有限公司')
  const [vcardTitle, setVcardTitle] = useState('研发工程师')

  // Email
  const [emailTo, setEmailTo] = useState('contact@bitnook.com')
  const [emailSubject, setEmailSubject] = useState('产品咨询')
  const [emailBody, setEmailBody] = useState('您好，我想了解更多关于 BitNook 工具的功能。')

  // Styling
  const [size, setSize] = useState(260)
  const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M')
  const [fgColor, setFgColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#FFFFFF')

  // Result state
  const [dataUrl, setDataUrl] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [copied, setCopied] = useState(false)

  // Assemble formatted QR payload string
  const payload = useMemo((): string => {
    switch (activeType) {
      case 'text':
      case 'url':
        return textContent.trim()
      case 'wifi': {
        const escapedSsid = wifiSsid.replace(/([\\;,:"])/g, '\\$1')
        const escapedPass = wifiPassword.replace(/([\\;,:"])/g, '\\$1')
        return `WIFI:S:${escapedSsid};T:${wifiAuth};P:${escapedPass};H:${wifiHidden ? 'true' : 'false'};;`
      }
      case 'vcard':
        return [
          'BEGIN:VCARD',
          'VERSION:3.0',
          `FN:${vcardName}`,
          `N:;${vcardName};;;`,
          `TEL;TYPE=CELL:${vcardPhone}`,
          `EMAIL:${vcardEmail}`,
          `ORG:${vcardOrg}`,
          `TITLE:${vcardTitle}`,
          'END:VCARD',
        ]
          .filter(Boolean)
          .join('\n')
      case 'email':
        return `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`
      default:
        return ''
    }
  }, [
    activeType,
    textContent,
    wifiSsid,
    wifiPassword,
    wifiAuth,
    wifiHidden,
    vcardName,
    vcardPhone,
    vcardEmail,
    vcardOrg,
    vcardTitle,
    emailTo,
    emailSubject,
    emailBody,
  ])

  // Generate QR locally using 'qrcode'
  useEffect(() => {
    let isCurrent = true
    if (!payload) {
      Promise.resolve().then(() => {
        if (isCurrent) {
          setDataUrl('')
          setErrorMsg('')
        }
      })
      return
    }

    QRCode.toDataURL(payload, {
      width: size,
      margin: 2,
      errorCorrectionLevel: errorLevel,
      color: {
        dark: fgColor,
        light: bgColor,
      },
    })
      .then((url) => {
        if (isCurrent) {
          setDataUrl(url)
          setErrorMsg('')
        }
      })
      .catch((err) => {
        if (isCurrent) {
          console.error('QR code generation error:', err)
          setErrorMsg('二维码生成失败，请检查输入内容长度')
        }
      })

    return () => {
      isCurrent = false
    }
  }, [payload, size, errorLevel, fgColor, bgColor])

  // Download via local Blob URL
  const handleDownload = async () => {
    if (!dataUrl) return
    try {
      const res = await fetch(dataUrl)
      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `bitnook-qrcode-${activeType}-${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)
      trackEvent('download', { toolSlug: 'qrcode' })
    } catch (err) {
      console.error('Download failed', err)
    }
  }

  const handleCopyImage = async () => {
    if (!dataUrl) return
    try {
      const res = await fetch(dataUrl)
      const blob = await res.blob()
      if (typeof ClipboardItem !== 'undefined') {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob,
          }),
        ])
        setCopied(true)
        trackEvent('copy', { toolSlug: 'qrcode' })
        setTimeout(() => setCopied(false), 2000)
      } else {
        await navigator.clipboard.writeText(dataUrl)
        setCopied(true)
        trackEvent('copy', { toolSlug: 'qrcode' })
        setTimeout(() => setCopied(false), 2000)
      }
    } catch {
      // fallback
    }
  }

  return (
    <ToolLayout slug="qrcode">
      <div className="space-y-6">
        {/* Type Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {[
            { id: 'url', label: '网址链接', icon: Link2 },
            { id: 'text', label: '纯文本', icon: Type },
            { id: 'wifi', label: 'WiFi 连接', icon: Wifi },
            { id: 'vcard', label: '电子名片', icon: Contact },
            { id: 'email', label: '邮件直发', icon: Mail },
          ].map((item) => {
            const Icon = item.icon
            const isActive = activeType === item.id
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveType(item.id as QrType)
                  if (item.id === 'text' && textContent.startsWith('http')) {
                    setTextContent('你好，欢迎使用 BitNook 工具箱！')
                  }
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition border ${
                  isActive
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr,360px] gap-6">
          {/* Left: Input Form */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-6 shadow-xl space-y-4">
              {/* URL or Text */}
              {(activeType === 'url' || activeType === 'text') && (
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      {activeType === 'url' ? '目标网址 (URL)' : '文本内容'}
                    </label>
                    <span className="text-[11px] text-slate-400 font-mono">{textContent.length} 字符</span>
                  </div>
                  <textarea
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    placeholder={activeType === 'url' ? 'https://example.com' : '输入任意文本内容...'}
                    rows={4}
                    className="w-full p-3.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              {/* WiFi Form */}
              {activeType === 'wifi' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">网络名称 (SSID)</label>
                    <input
                      type="text"
                      value={wifiSsid}
                      onChange={(e) => setWifiSsid(e.target.value)}
                      placeholder="如: Office-5G"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">WiFi 密码</label>
                      <input
                        type="text"
                        value={wifiPassword}
                        onChange={(e) => setWifiPassword(e.target.value)}
                        placeholder="留空表示无密码"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">加密类型</label>
                      <select
                        value={wifiAuth}
                        onChange={(e) => setWifiAuth(e.target.value as any)}
                        className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                      >
                        <option value="WPA">WPA / WPA2 / WPA3 (主流)</option>
                        <option value="WEP">WEP (老式)</option>
                        <option value="nopass">无加密 (Open)</option>
                      </select>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={wifiHidden}
                      onChange={(e) => setWifiHidden(e.target.checked)}
                      className="rounded accent-indigo-600"
                    />
                    <span>隐藏网络 (Hidden SSID)</span>
                  </label>
                </div>
              )}

              {/* VCard Form */}
              {activeType === 'vcard' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">姓名</label>
                      <input
                        type="text"
                        value={vcardName}
                        onChange={(e) => setVcardName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">手机电话</label>
                      <input
                        type="text"
                        value={vcardPhone}
                        onChange={(e) => setVcardPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">电子邮箱</label>
                    <input
                      type="email"
                      value={vcardEmail}
                      onChange={(e) => setVcardEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">所属组织 / 公司</label>
                      <input
                        type="text"
                        value={vcardOrg}
                        onChange={(e) => setVcardOrg(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">职务职称</label>
                      <input
                        type="text"
                        value={vcardTitle}
                        onChange={(e) => setVcardTitle(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Email Form */}
              {activeType === 'email' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">收件人地址</label>
                    <input
                      type="email"
                      value={emailTo}
                      onChange={(e) => setEmailTo(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">预设邮件主题</label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">预设正文</label>
                    <textarea
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      rows={3}
                      className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Customization Options */}
            <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-6 space-y-4">
              <h4 className="text-xs font-semibold text-slate-300">外观与容错设置</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    尺寸: <span className="font-mono text-white">{size}px</span>
                  </label>
                  <input
                    type="range"
                    min="160"
                    max="400"
                    step="20"
                    value={size}
                    onChange={(e) => setSize(Number(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">纠错等级 (ECC)</label>
                  <select
                    value={errorLevel}
                    onChange={(e) => setErrorLevel(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:outline-none"
                  >
                    <option value="L">L - 7% 容错率</option>
                    <option value="M">M - 15% 容错率 (推荐)</option>
                    <option value="Q">Q - 25% 容错率</option>
                    <option value="H">H - 30% 容错率 (高保真)</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-slate-400 block mb-1">前景色</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-slate-700 p-0.5"
                      />
                      <span className="font-mono text-[11px] text-slate-300">{fgColor}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-slate-400 block mb-1">背景色</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-slate-700 p-0.5"
                      />
                      <span className="font-mono text-[11px] text-slate-300">{bgColor}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Preview & Download Card */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-6 shadow-xl flex flex-col items-center">
              <span className="text-xs font-semibold text-slate-300 mb-4 block self-start">实时二维码预览</span>

              {/* White Box for QR Canvas */}
              <div className="p-4 rounded-2xl bg-white shadow-xl flex items-center justify-center min-h-[220px]">
                {dataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={dataUrl}
                    alt="BitNook QR Code"
                    style={{ width: size > 260 ? 260 : size, height: size > 260 ? 260 : size }}
                    className="object-contain"
                  />
                ) : (
                  <div className="text-slate-400 text-xs flex flex-col items-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-slate-400" />
                    <span>生成中...</span>
                  </div>
                )}
              </div>

              {errorMsg && <div className="mt-3 text-xs text-rose-400 text-center">{errorMsg}</div>}

              {/* Action Buttons */}
              <div className="w-full space-y-2 mt-6">
                <button
                  onClick={handleDownload}
                  disabled={!dataUrl}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-md shadow-indigo-600/20"
                >
                  <Download className="w-4 h-4" />
                  <span>下载高分辨率 PNG (Blob)</span>
                </button>
                <button
                  onClick={handleCopyImage}
                  disabled={!dataUrl}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? '已复制至剪贴板' : '复制二维码图片'}</span>
                </button>
              </div>

              {/* Privacy Badge */}
              <div className="flex items-center gap-1.5 mt-5 text-[11px] text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>100% 浏览器本地生成，严禁外传敏感数据</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
