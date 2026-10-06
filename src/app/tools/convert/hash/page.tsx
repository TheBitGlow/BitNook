'use client'

import { useState, useTransition } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { trackEvent } from '@/lib/analytics'
import { FileText, Upload, Copy, Check, AlertTriangle, ShieldCheck, HardDrive } from 'lucide-react'

type SupportedAlgorithm = 'SHA-256' | 'SHA-384' | 'SHA-512' | 'SHA-1'

interface AlgoMeta {
  id: SupportedAlgorithm
  name: string
  bits: number
  deprecated?: boolean
  description: string
}

const ALGORITHMS: AlgoMeta[] = [
  {
    id: 'SHA-256',
    name: 'SHA-256',
    bits: 256,
    description: '工业级通用安全标准（NIST FIPS 180-4），适用于证书、数字签名及完整性校验',
  },
  {
    id: 'SHA-512',
    name: 'SHA-512',
    bits: 512,
    description: '超高安全度哈希，在 64 位硬件架构上具备卓越处理速度',
  },
  {
    id: 'SHA-384',
    name: 'SHA-384',
    bits: 384,
    description: '截断版 SHA-512，有效抵御长度扩展攻击',
  },
  {
    id: 'SHA-1',
    name: 'SHA-1',
    bits: 160,
    deprecated: true,
    description: '已证明存在碰撞攻击弱点，NIST 已弃用，严禁用于安全签名，仅供旧系统校验',
  },
]

function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export default function HashCalculatorPage() {
  const [mode, setMode] = useState<'text' | 'file'>('text')
  const [selectedAlgo, setSelectedAlgo] = useState<SupportedAlgorithm>('SHA-256')
  const [textInput, setTextInput] = useState<string>('')
  const [isUppercase, setIsUppercase] = useState<boolean>(false)
  const [copiedKey, setCopiedKey] = useState<string>('')

  // Text Hash State
  const [textResultHex, setTextResultHex] = useState<string>('')
  const [textResultBase64, setTextResultBase64] = useState<string>('')
  const [isTextHashing, setIsTextHashing] = useState<boolean>(false)

  // File Hash State
  const [file, setFile] = useState<File | null>(null)
  const [fileHashes, setFileHashes] = useState<{ [key in SupportedAlgorithm]?: string }>({})
  const [isFileHashing, setIsFileHashing] = useState<boolean>(false)
  const [fileError, setFileError] = useState<string | null>(null)

  const [, startTransition] = useTransition()

  // Calculate Text Hash
  const handleCalculateText = async () => {
    if (!textInput) {
      setTextResultHex('')
      setTextResultBase64('')
      return
    }

    setIsTextHashing(true)
    try {
      const encoder = new TextEncoder()
      const data = encoder.encode(textInput)
      const digestBuffer = await crypto.subtle.digest(selectedAlgo, data)
      const hex = bufferToHex(digestBuffer)
      const b64 = bufferToBase64(digestBuffer)
      startTransition(() => {
        setTextResultHex(hex)
        setTextResultBase64(b64)
      })
    } catch (err) {
      console.error('Hash calculation error:', err)
    } finally {
      setIsTextHashing(false)
    }
  }

  // Calculate File Hash
  const handleProcessFile = async (selectedFile: File) => {
    setFile(selectedFile)
    setFileError(null)
    setIsFileHashing(true)
    setFileHashes({})

    try {
      if (selectedFile.size > 100 * 1024 * 1024) {
        setFileError('为保证低内存设备与浏览器稳定性，单文件哈希计算限制在 100MB 以内（浏览器原生 Web Crypto 采用内存缓冲校验，绝不上传云端）')
        setIsFileHashing(false)
        return
      }

      const buffer = await selectedFile.arrayBuffer()
      const results: { [key in SupportedAlgorithm]?: string } = {}

      for (const algo of ALGORITHMS) {
        const digest = await crypto.subtle.digest(algo.id, buffer)
        results[algo.id] = bufferToHex(digest)
      }

      startTransition(() => {
        setFileHashes(results)
      })
    } catch (err) {
      setFileError('文件读取或哈希计算失败')
      console.error(err)
    } finally {
      setIsFileHashing(false)
    }
  }

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedKey(key)
      trackEvent('copy', { toolSlug: 'hash' })
      setTimeout(() => setCopiedKey(''), 2000)
    } catch {
      // ignore
    }
  }

  const activeAlgoMeta = ALGORITHMS.find((a) => a.id === selectedAlgo) || ALGORITHMS[0]

  return (
    <ToolLayout
      toolSlug="hash"
      principlesTitle="密码学散列函数 (Cryptographic Hash) 计算原理"
      principles={
        <>
          <p>
            <strong>1. 单向散列函数特性：</strong>
            密码学散列函数（如 SHA-256、SHA-512）具备确定性、雪崩效应（输入微小变化导致输出剧烈变动）与不可逆单向性，常用于数据指纹与数字签名。
          </p>
          <p>
            <strong>2. Web Crypto API 本地内存缓冲：</strong>
            本工具直接使用浏览器原生硬件加速的 `crypto.subtle.digest()` API，文件与文本直接在本地内存完成缓冲运算，绝不上传任何云端服务器，保障商业私密性。
          </p>
        </>
      }
      howToSteps={[
        '选择“文本哈希”或“本地文件哈希”模式。',
        '在文本模式下输入字符串并选择目标算法（推荐 SHA-256 或 SHA-512），点击计算。',
        '在文件模式下拖拽小于 100MB 的文件，系统自动并发计算全套算法指纹。',
        '支持一键复制 HEX 十六进制或 Base64 编码格式摘要。',
      ]}
      faq={[
        {
          question: '为什么文件限制在 100MB 以内？',
          answer:
            '由于浏览器纯前端运行于用户内存沙箱中，将整个大文件读入 ArrayBuffer 可能会导致移动设备或低内存标签页崩溃。100MB 限制兼顾了常用安装包/文档校验与极端环境稳定性。',
        },
      ]}
      disclaimer="本工具使用浏览器本地 Web Crypto API 计算，仅供数据完整性校验。SHA-1 算法已证明存在弱点，仅用于兼容性验证，不推荐用于关键安全场景。"
    >
      <div className="space-y-6">
        {/* Mode Selector */}
        <div className="flex rounded-xl bg-canvas p-1 border border-border max-w-md">
          <button
            onClick={() => setMode('text')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition ${
              mode === 'text' ? 'bg-accent-primary text-white shadow-sm' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>文本哈希 (Text)</span>
          </button>
          <button
            onClick={() => setMode('file')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition ${
              mode === 'file' ? 'bg-accent-primary text-white shadow-sm' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>本地文件哈希 (File)</span>
          </button>
        </div>

        {/* Text Mode */}
        {mode === 'text' && (
          <div className="space-y-6">
            <div className="card p-6 space-y-4">
              {/* Algorithm Grid */}
              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-2">选择哈希算法</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {ALGORITHMS.map((algo) => {
                    const isSelected = selectedAlgo === algo.id
                    return (
                      <button
                        key={algo.id}
                        onClick={() => setSelectedAlgo(algo.id)}
                        className={`p-3 rounded-xl border text-left transition ${
                          isSelected
                            ? 'bg-accent-primary/10 border-accent-primary text-text-primary font-bold shadow-sm'
                            : 'bg-canvas border-border text-text-muted hover:text-text-primary hover:border-accent-primary/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-text-primary">{algo.name}</span>
                          {algo.deprecated ? (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-danger/10 text-danger border border-danger/30">
                              弱
                            </span>
                          ) : (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-elevated text-text-muted border border-border">
                              {algo.bits}b
                            </span>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Warning for Deprecated */}
              {activeAlgoMeta.deprecated && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                  <span>
                    <strong>安全警示：</strong>
                    SHA-1 存在理论碰撞风险，已被各大密码学组织废弃，请勿用于高价值数字签名或密码认证。
                  </span>
                </div>
              )}

              {/* Input Area */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-text-secondary">输入需要计算的文本字符串</label>
                  <span className="text-[11px] text-text-muted font-mono">{textInput.length} 字符</span>
                </div>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="在此输入或粘贴文本..."
                  rows={4}
                  className="w-full p-3.5 bg-canvas border border-border rounded-xl text-text-primary font-mono text-xs focus:outline-none focus:border-accent-primary transition-colors"
                />
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCalculateText}
                    disabled={isTextHashing || !textInput}
                    className="btn-primary px-5 py-2.5 rounded-xl text-xs font-semibold shadow-sm disabled:opacity-50"
                  >
                    {isTextHashing ? '计算中...' : '计算哈希摘要'}
                  </button>
                  <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isUppercase}
                      onChange={(e) => setIsUppercase(e.target.checked)}
                      className="rounded accent-accent-primary"
                    />
                    <span>大写输出 (HEX)</span>
                  </label>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>浏览器本地 Web Crypto 计算，零数据上传</span>
                </div>
              </div>
            </div>

            {/* Results Display */}
            {textResultHex && (
              <div className="card p-6 space-y-4">
                <h3 className="text-sm font-semibold text-text-primary">
                  {selectedAlgo} 计算结果 ({activeAlgoMeta.bits} bit)
                </h3>

                {/* Hex format */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs text-text-muted">
                    <span>十六进制 (Hex) 摘要</span>
                    <button
                      onClick={() =>
                        copyToClipboard(isUppercase ? textResultHex.toUpperCase() : textResultHex, 'hex')
                      }
                      className="text-xs text-accent-primary hover:underline flex items-center gap-1 transition"
                    >
                      {copiedKey === 'hex' ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'hex' ? '已复制' : '复制'}</span>
                    </button>
                  </div>
                  <div className="p-3 bg-canvas border border-border rounded-xl font-mono text-xs text-text-primary break-all select-all font-semibold">
                    {isUppercase ? textResultHex.toUpperCase() : textResultHex}
                  </div>
                </div>

                {/* Base64 format */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs text-text-muted">
                    <span>Base64 编码摘要</span>
                    <button
                      onClick={() => copyToClipboard(textResultBase64, 'base64')}
                      className="text-xs text-accent-primary hover:underline flex items-center gap-1 transition"
                    >
                      {copiedKey === 'base64' ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'base64' ? '已复制' : '复制'}</span>
                    </button>
                  </div>
                  <div className="p-3 bg-canvas border border-border rounded-xl font-mono text-xs text-accent-primary break-all select-all">
                    {textResultBase64}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* File Mode */}
        {mode === 'file' && (
          <div className="space-y-6">
            <div className="card p-6 space-y-4">
              {/* Dropzone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  if (e.dataTransfer.files?.[0]) {
                    handleProcessFile(e.dataTransfer.files[0])
                  }
                }}
                className="border-2 border-dashed border-border hover:border-accent-primary rounded-2xl p-8 text-center transition bg-canvas flex flex-col items-center justify-center cursor-pointer relative"
              >
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleProcessFile(e.target.files[0])
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="w-12 h-12 rounded-2xl bg-accent-primary/10 flex items-center justify-center text-accent-primary mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-text-primary mb-1">点击选择文件或直接拖拽至此处</h4>
                <p className="text-xs text-text-muted max-w-sm">
                  100% 浏览器客户端离线计算，文件不会上传至任何服务器，保护私密性（内存缓冲限制 100MB）
                </p>
              </div>

              {file && (
                <div className="p-3 rounded-xl bg-canvas border border-border flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-text-primary block">{file.name}</span>
                    <span className="text-text-muted font-mono">{formatFileSize(file.size)}</span>
                  </div>
                  {isFileHashing && <span className="text-accent-primary animate-pulse font-semibold">正在计算所有算法哈希...</span>}
                </div>
              )}

              {fileError && (
                <div className="p-3 rounded-xl bg-danger/10 border border-danger/30 text-danger text-xs">
                  {fileError}
                </div>
              )}
            </div>

            {/* File Results */}
            {Object.keys(fileHashes).length > 0 && (
              <div className="card p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-text-primary">文件完整性校验哈希值</h3>
                  <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isUppercase}
                      onChange={(e) => setIsUppercase(e.target.checked)}
                      className="rounded accent-accent-primary"
                    />
                    <span>大写 (HEX)</span>
                  </label>
                </div>

                <div className="space-y-3">
                  {ALGORITHMS.map((algo) => {
                    const hashVal = fileHashes[algo.id]
                    if (!hashVal) return null
                    const displayHash = isUppercase ? hashVal.toUpperCase() : hashVal
                    const isCopied = copiedKey === `file-${algo.id}`

                    return (
                      <div key={algo.id} className="p-3.5 rounded-xl bg-canvas border border-border space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-text-primary">{algo.name}</span>
                            {algo.deprecated && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-danger/10 text-danger border border-danger/30">
                                不推荐安全用途
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => copyToClipboard(displayHash, `file-${algo.id}`)}
                            className="text-xs text-accent-primary hover:underline flex items-center gap-1 transition"
                          >
                            {isCopied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                            <span>{isCopied ? '已复制' : '复制'}</span>
                          </button>
                        </div>
                        <div className="font-mono text-xs text-text-secondary break-all select-all font-medium pt-1">
                          {displayHash}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
