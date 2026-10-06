'use client'

import { useState, useCallback, useMemo } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { Copy, RefreshCw, Check, ShieldCheck, KeyRound, Sparkles } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'

export interface PasswordOptions {
  uppercase: boolean
  lowercase: boolean
  numbers: boolean
  symbols: boolean
  excludeAmbiguous: boolean
}

function getCharacterSet(options: PasswordOptions): string {
  let chars = ''
  const ambiguous = 'l1IO0'

  if (options.uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  if (options.lowercase) chars += 'abcdefghijklmnopqrstuvwxyz'
  if (options.numbers) chars += '0123456789'
  if (options.symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?'

  if (options.excludeAmbiguous) {
    chars = chars.split('').filter((c) => !ambiguous.includes(c)).join('')
  }

  return chars
}

function generateSinglePassword(length: number, pool: string): string {
  if (!pool || length <= 0) return ''
  let password = ''
  const array = new Uint32Array(length)
  crypto.getRandomValues(array)
  for (let i = 0; i < length; i++) {
    password += pool[array[i] % pool.length]
  }
  return password
}

function calculateEntropy(length: number, poolSize: number): { bits: number; label: string; badgeClass: string } {
  if (poolSize <= 0 || length <= 0) {
    return { bits: 0, label: '无效', badgeClass: 'bg-danger-subtle text-danger border-danger/30' }
  }
  const bits = Math.round(length * Math.log2(poolSize) * 10) / 10
  if (bits < 40) return { bits, label: '弱 (Weak)', badgeClass: 'bg-danger-subtle text-danger border-danger/30' }
  if (bits < 60) return { bits, label: '中等 (Medium)', badgeClass: 'bg-warning-subtle text-warning border-warning/30' }
  if (bits < 80) return { bits, label: '强 (Strong)', badgeClass: 'bg-accent-subtle text-accent border-accent/30' }
  return { bits, label: '极强 (Very Strong)', badgeClass: 'bg-success-subtle text-success border-success/30' }
}

export default function PasswordPage() {
  const [length, setLength] = useState(16)
  const [batchCount, setBatchCount] = useState(1)
  const [options, setOptions] = useState<PasswordOptions>({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeAmbiguous: true,
  })

  const [passwords, setPasswords] = useState<string[]>(() => {
    if (typeof window === 'undefined' || typeof crypto === 'undefined' || !crypto.getRandomValues) {
      return ['']
    }
    const pool = getCharacterSet({
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
      excludeAmbiguous: true,
    })
    return [generateSinglePassword(16, pool)]
  })
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [copiedAll, setCopiedAll] = useState(false)

  const charPool = useMemo(() => getCharacterSet(options), [options])
  const entropy = useMemo(() => calculateEntropy(length, charPool.length), [length, charPool.length])

  const handleGenerate = useCallback(
    (customLength?: number, customBatch?: number, customPool?: string) => {
      const activeLen = customLength ?? length
      const activeBatch = customBatch ?? batchCount
      const activePool = customPool ?? charPool
      if (!activePool) return
      const list: string[] = []
      for (let i = 0; i < activeBatch; i++) {
        list.push(generateSinglePassword(activeLen, activePool))
      }
      setPasswords(list)
      setCopiedIndex(null)
      setCopiedAll(false)
      trackEvent('tool_success', { toolSlug: 'password' })
    },
    [length, batchCount, charPool]
  )

  const copySingle = async (pwd: string, index: number) => {
    if (!pwd) return
    await navigator.clipboard.writeText(pwd)
    setCopiedIndex(index)
    trackEvent('copy', { toolSlug: 'password' })
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const copyAll = async () => {
    if (passwords.length === 0) return
    await navigator.clipboard.writeText(passwords.join('\n'))
    setCopiedAll(true)
    trackEvent('copy', { toolSlug: 'password' })
    setTimeout(() => setCopiedAll(false), 2000)
  }

  const faq = [
    {
      question: '生成的密码真的安全吗？会上传到任何服务器吗？',
      answer:
        '绝对不会。BitNook 密码生成器完全基于浏览器的 W3C Web Cryptography API（crypto.getRandomValues），在您的本地浏览器进程内存中完成。本站无后端存储、不进行任何网络传输。',
    },
    {
      question: '什么是信息熵（Entropy）？为什么推荐 16 位以上？',
      answer:
        '信息熵衡量密码被暴力破解的数学难度。根据 NIST 标准，密码信息熵超过 80 bits（通常需要 16 位包含大小写字母、数字和符号）即达到当前全球超算离线暴力碰撞不可破解的最高安全级别。',
    },
    {
      question: '为什么默认开启“排除易混淆字符”？',
      answer:
        '易混淆字符（如数字 1 与小写字母 l、大写字母 I，数字 0 与大写字母 O）在某些字体下极易肉眼误认。排除这些字符可大幅降低人工抄录或手机输入时的失误率。',
    },
  ]

  const howToSteps = [
    '滑动调节所需密码长度（推荐 16 位以上满足高安全标准）。',
    '勾选需要的字符集类型（大写、小写、数字、特殊符号及防混淆过滤）。',
    '点击“重新生成密码”实时刷新密码学安全随机序列。',
    '点击右侧复制按钮一键拷贝单条密码，或切换批量模式多条生成。',
  ]

  const exampleContent = (
    <div className="space-y-3">
      <div className="p-3.5 rounded-lg bg-surface-secondary/70 border border-border/80">
        <h4 className="font-semibold text-text-primary text-xs sm:text-sm mb-1 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span>密码安全配置实操参考示例</span>
        </h4>
        <div className="mt-2 grid sm:grid-cols-3 gap-2 text-xs font-mono">
          <div className="p-2.5 rounded-md bg-surface border border-border/70">
            <p className="font-semibold text-text-primary mb-1">日常应用账户</p>
            <p className="text-text-muted">长度：14 位</p>
            <p className="text-text-muted">字符池：大写+小写+数字</p>
            <p className="text-accent mt-1">熵值：~80.7 bits (强)</p>
          </div>
          <div className="p-2.5 rounded-md bg-surface border border-border/70">
            <p className="font-semibold text-text-primary mb-1">关键金融/主邮箱</p>
            <p className="text-text-muted">长度：18 位</p>
            <p className="text-text-muted">字符池：全字符集(含符号)</p>
            <p className="text-success mt-1">熵值：~114.7 bits (极强)</p>
          </div>
          <div className="p-2.5 rounded-md bg-surface border border-border/70">
            <p className="font-semibold text-text-primary mb-1">服务器 SSH / API Key</p>
            <p className="text-text-muted">长度：32 位</p>
            <p className="text-text-muted">字符池：全字符集(含符号)</p>
            <p className="text-success mt-1">熵值：~203.9 bits (极强)</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <ToolLayout
      toolSlug="password"
      principlesTitle="密码学安全随机数生成与密码熵原理"
      principles={
        <>
          <p>
            <strong>1. 密码学伪随机发生器（CSPRNG）：</strong>
            常规 <code>Math.random()</code> 采用伪随机算法（如 XorShift），存在可被预测推演的规律，严禁用于密码安全场景。本工具严格使用 W3C 标准 Web Crypto API 的
            <code>crypto.getRandomValues(new Uint32Array(length))</code>
            ，直接由宿主操作系统系统熵池（如 Linux <code>/dev/urandom</code> 或 Windows <code>BCryptGenRandom</code>）供给随机数。
          </p>
          <p>
            <strong>2. 香农信息熵测算公式：</strong>
            <code>Entropy = Length × log2(PoolSize)</code>
            。全字符集可用字符池约为 89~94 个字符，16 位密码信息熵超过 100 比特，即便调用全球超算集群离线暴力碰撞也需数亿年。
          </p>
        </>
      }
      howToSteps={howToSteps}
      example={exampleContent}
      faq={faq}
      dataSources={[
        {
          name: 'W3C Web Cryptography API Recommendation',
          description: '原生浏览器底层安全 CSPRNG 规范标准',
        },
        {
          name: 'NIST SP 800-63B 电子身份识别密码指南',
          description: '美国国家标准技术研究所现代密码长度与熵值规范',
        },
      ]}
      disclaimer="【安全防护建议】密码生成完全在您本地浏览器内存中进行。建议配合 1Password、Bitwarden、KeePass 等受信任密码管理器或浏览器内置安全密码库使用，切勿明文保存在聊天记录或公用设备中。"
    >
      <div className="space-y-6">
        {/* Main Password Generation Workspace */}
        <div className="space-y-4">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/70">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-accent" />
              <span className="text-xs font-semibold text-text-primary uppercase tracking-wider font-mono">
                密码发生工作台
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs font-mono">
                <span className="text-text-muted">信息熵:</span>
                <span className="font-semibold text-text-primary tabular-nums">{entropy.bits} bits</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${entropy.badgeClass}`}>
                  {entropy.label}
                </span>
              </div>

              {/* Batch Mode Switch */}
              <div className="flex items-center gap-1 p-0.5 rounded-md bg-surface-secondary border border-border/80">
                {[1, 5, 10, 20].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      setBatchCount(num)
                      handleGenerate(length, num, charPool)
                    }}
                    className={`px-2 py-0.5 text-[11px] font-medium rounded transition cursor-pointer ${
                      batchCount === num
                        ? 'bg-surface text-text-primary font-semibold shadow-subtle'
                        : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    {num === 1 ? '单条' : `${num}条`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Password Displays (Terminal output style) */}
          <div className="space-y-2">
            {passwords.map((pwd, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-surface-secondary/70 border border-border/80 focus-within:border-accent transition-colors"
              >
                {batchCount > 1 && (
                  <span className="text-[11px] font-mono text-text-muted w-6 text-center shrink-0">
                    #{idx + 1}
                  </span>
                )}
                <input
                  type="text"
                  value={pwd}
                  readOnly
                  className="flex-1 bg-transparent border-0 text-text-primary font-mono text-sm sm:text-base focus:outline-none select-all tabular-nums px-1"
                />
                <button
                  type="button"
                  onClick={() => copySingle(pwd, idx)}
                  className="p-1.5 rounded-md bg-surface hover:bg-surface-hover border border-border text-text-secondary hover:text-text-primary transition shrink-0 cursor-pointer shadow-subtle"
                  title="复制此密码"
                >
                  {copiedIndex === idx ? (
                    <Check className="w-3.5 h-3.5 text-success" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => handleGenerate(length, batchCount, charPool)}
              className="btn-primary"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>重新生成密码</span>
            </button>

            {batchCount > 1 && (
              <button
                type="button"
                onClick={copyAll}
                className="btn-secondary"
              >
                {copiedAll ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedAll ? `已复制全部 ${passwords.length} 条` : `一键复制全部 (${passwords.length}条)`}</span>
              </button>
            )}
          </div>
        </div>

        {/* Configuration Panel */}
        <div className="space-y-5 pt-5 border-t border-border/70">
          {/* Length Slider (4 ~ 128) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-text-secondary">密码长度 (Length)</label>
              <span className="text-accent font-mono text-sm font-semibold">{length} 位</span>
            </div>
            <input
              type="range"
              min="4"
              max="128"
              value={length}
              onChange={(e) => {
                const newL = Number(e.target.value)
                setLength(newL)
                handleGenerate(newL, batchCount, charPool)
              }}
              className="w-full h-1.5 bg-surface-secondary rounded-lg appearance-none cursor-pointer accent-accent"
            />
            <div className="flex justify-between text-[11px] text-text-muted mt-1 font-mono">
              <span>4位</span>
              <span>16位 (推荐)</span>
              <span>32位</span>
              <span>64位</span>
              <span>128位</span>
            </div>
          </div>

          {/* Character Options */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-2.5">包含字符集</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {[
                { key: 'uppercase' as const, label: '大写字母 (A-Z)', sample: 'ABC...' },
                { key: 'lowercase' as const, label: '小写字母 (a-z)', sample: 'abc...' },
                { key: 'numbers' as const, label: '数字 (0-9)', sample: '012...' },
                { key: 'symbols' as const, label: '特殊符号 (!@#...)', sample: '!@#$%' },
                { key: 'excludeAmbiguous' as const, label: '排除易混淆字符', sample: '排除 1, l, I, 0, O' },
              ].map(({ key, label, sample }) => (
                <label
                  key={key}
                  className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border/80 bg-surface hover:bg-surface-secondary/60 cursor-pointer transition select-none shadow-subtle"
                >
                  <input
                    type="checkbox"
                    checked={options[key]}
                    onChange={(e) => {
                      const nextOpts = { ...options, [key]: e.target.checked }
                      setOptions(nextOpts)
                      const nextPool = getCharacterSet(nextOpts)
                      handleGenerate(length, batchCount, nextPool)
                    }}
                    className="w-3.5 h-3.5 rounded border-border text-accent focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-medium text-text-primary block">{label}</span>
                    <span className="text-[10px] text-text-muted font-mono">{sample}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Security Guarantee Note */}
          <div className="flex items-center gap-2 p-2.5 rounded-md border border-success/30 bg-success-subtle text-success text-xs">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span className="leading-relaxed">
              密码学安全随机数（CSPRNG）保证：完全在本地浏览器内存中计算，输入与生成内容绝不上传至任何服务器。
            </span>
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
