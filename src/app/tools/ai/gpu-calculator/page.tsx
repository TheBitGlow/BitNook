'use client'

import { useState, useMemo } from 'react'
import ToolLayout from '@/components/tools/ToolLayout'
import { Cpu, Copy, Check, Sparkles, Layers, HardDrive, Zap, Info } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'

interface ModelArchPreset {
  name: string
  paramsB: number
  layers: number
  kvHeads: number
  headDim: number
  description: string
}

const MODEL_PRESETS: ModelArchPreset[] = [
  { name: 'Llama 3.2 3B', paramsB: 3.2, layers: 28, kvHeads: 8, headDim: 128, description: '轻量端侧高智商模型' },
  { name: 'Qwen 2.5 7B', paramsB: 7.6, layers: 28, kvHeads: 4, headDim: 128, description: '主流消费级全能单卡模型' },
  { name: 'Llama 3.1 8B', paramsB: 8.0, layers: 32, kvHeads: 8, headDim: 128, description: '开源标杆8B基础模型' },
  { name: 'Qwen 2.5 14B', paramsB: 14.7, layers: 48, kvHeads: 8, headDim: 128, description: '16GB/24GB显存甜蜜点模型' },
  { name: 'Qwen 2.5 32B', paramsB: 32.5, layers: 64, kvHeads: 8, headDim: 128, description: '逼近70B性能的高效模型' },
  { name: 'Llama 3.3 70B', paramsB: 70.6, layers: 80, kvHeads: 8, headDim: 128, description: '顶级开源旗舰模型' },
]

interface QuantOption {
  id: string
  name: string
  bytesPerParam: number
  desc: string
}

const QUANT_OPTIONS: QuantOption[] = [
  { id: 'fp16', name: 'FP16 / BF16 (16-bit)', bytesPerParam: 2.0, desc: '原生全精度，无量化损耗' },
  { id: 'fp8', name: 'FP8 / INT8 (8-bit)', bytesPerParam: 1.0, desc: '平衡精度与显存' },
  { id: 'q4', name: '4-bit (AWQ / GPTQ / Q4_K_M)', bytesPerParam: 0.55, desc: '消费级首选，含元数据开销' },
  { id: 'q3', name: '3-bit (GGUF Q3_K_M)', bytesPerParam: 0.42, desc: '极度压缩显存，轻微掉点' },
  { id: 'fp32', name: 'FP32 (32-bit)', bytesPerParam: 4.0, desc: '传统单精度浮点训练' },
]

const GPU_TARGETS = [
  { name: 'RTX 4060 8GB', vram: 8, type: 'consumer' },
  { name: 'RTX 4070 12GB', vram: 12, type: 'consumer' },
  { name: 'RTX 4060 Ti 16GB', vram: 16, type: 'consumer' },
  { name: 'RTX 4070 Ti Super 16GB', vram: 16, type: 'consumer' },
  { name: 'RTX 3090 / 4090 24GB', vram: 24, type: 'consumer' },
  { name: '2× RTX 4090 (48GB 并行)', vram: 48, type: 'workstation' },
  { name: 'Apple Mac Studio (64GB 统一内存)', vram: 51.2, type: 'apple' }, // 80% usable for GPU
  { name: 'Apple Mac Studio (128GB 统一内存)', vram: 102.4, type: 'apple' },
  { name: 'NVIDIA A100 80GB', vram: 80, type: 'datacenter' },
  { name: 'NVIDIA H100 80GB', vram: 80, type: 'datacenter' },
]

export default function GPUCalculatorPage() {
  const [modelParamsB, setModelParamsB] = useState<number>(7.6)
  const [quantId, setQuantId] = useState<string>('q4')
  const [contextLength, setContextLength] = useState<number>(8192)
  const [batchSize, setBatchSize] = useState<number>(1)
  const [kvPrecisionBytes, setKvPrecisionBytes] = useState<number>(2) // FP16 KV cache default
  const [copied, setCopied] = useState(false)

  // Find active preset or estimate architecture parameters
  const currentArch = useMemo(() => {
    const matched = MODEL_PRESETS.find((p) => Math.abs(p.paramsB - modelParamsB) < 0.2)
    if (matched) return matched
    // Smooth architecture scaling for arbitrary parameter counts
    const layers = Math.min(80, Math.max(16, Math.round(modelParamsB * 1.1 + 20)))
    const kvHeads = modelParamsB > 30 ? 8 : 4
    return {
      name: `${modelParamsB}B 自定义模型`,
      paramsB: modelParamsB,
      layers,
      kvHeads,
      headDim: 128,
      description: '通用 Transformer GQA 架构推算',
    }
  }, [modelParamsB])

  const currentQuant = useMemo(() => {
    return QUANT_OPTIONS.find((q) => q.id === quantId) || QUANT_OPTIONS[2]
  }, [quantId])

  // Calculation Breakdown
  const { weightMemoryGB, kvCacheGB, runtimeMemoryGB, totalVRAMGB } = useMemo(() => {
    // 1. Model Weights Memory (GB)
    const weightGB = (modelParamsB * 1e9 * currentQuant.bytesPerParam) / (1024 * 1024 * 1024)

    // 2. KV Cache Memory (GB) for GQA Transformer:
    // bytes = 2 (Key + Value) * layers * kv_heads * head_dim * context * batch * bytes_per_kv
    const kvBytes = 2 * currentArch.layers * currentArch.kvHeads * currentArch.headDim * contextLength * batchSize * kvPrecisionBytes
    const kvGB = kvBytes / (1024 * 1024 * 1024)

    // 3. CUDA Context & Activation Overhead
    const cudaBaseGB = 0.6
    const activationGB = Math.max(0.3, weightGB * 0.04 + (contextLength / 8192) * batchSize * 0.25)
    const runtimeGB = cudaBaseGB + activationGB

    // 4. Total Recommended VRAM
    const total = weightGB + kvGB + runtimeGB

    return {
      weightMemoryGB: Math.round(weightGB * 10) / 10,
      kvCacheGB: Math.round(kvGB * 10) / 10,
      runtimeMemoryGB: Math.round(runtimeGB * 10) / 10,
      totalVRAMGB: Math.round(total * 10) / 10,
    }
  }, [modelParamsB, currentQuant, currentArch, contextLength, batchSize, kvPrecisionBytes])

  const copyEstimate = () => {
    const text = `【AI GPU 显存需求精算报告 · BitNook】\n模型规模: ${modelParamsB} B (${currentArch.name})\n量化精度: ${currentQuant.name}\n上下文长度: ${contextLength} tokens (Batch Size: ${batchSize})\n-------------------------------------\n1. 模型权重显存: ${weightMemoryGB} GB\n2. KV Cache 缓存: ${kvCacheGB} GB (KV精度: ${kvPrecisionBytes * 8}-bit)\n3. 运行时与激活显存: ${runtimeMemoryGB} GB\n=====================================\n总推荐显存: ${totalVRAMGB} GB\n测算工具: BitNook AI GPU Memory Calculator (https://bitnook.marmalade-thistle.workers.dev/tools/ai/gpu-calculator)`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      trackEvent('copy', { toolSlug: 'gpu-calculator' })
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const getHardwareBadge = (vram: number) => {
    if (vram >= totalVRAMGB * 1.25) {
      return { text: '充裕流畅', cls: 'bg-success-subtle text-success border-success/30' }
    }
    if (vram >= totalVRAMGB) {
      return { text: '刚好容纳', cls: 'bg-warning-subtle text-warning border-warning/30' }
    }
    return { text: '显存不足', cls: 'bg-danger-subtle text-danger border-danger/30' }
  }

  const faq = [
    {
      question: '为什么模型权重只有 4GB，却需要 8GB 甚至更多显存？',
      answer:
        '大模型推理显存由三部分组成：① 模型权重本身；② 上下文注意力缓存（KV Cache），其大小随输入文本 Token 长度与并发批次（Batch Size）线性递增；③ 深度学习框架（PyTorch/vLLM/Ollama）的 CUDA 运行时上下文与激活值（Activation Memory）。本工具采用精确架构公式逐项累加。',
    },
    {
      question: '什么是 GQA（Grouped-Query Attention）分组查询注意力？',
      answer:
        '早期的 MHA 架构每个注意力头都维护一套独立的 Key/Value 缓存，显存开销极大。Llama 3、Qwen 2.5 等现代大模型广泛采用 GQA 机制，将多个 Query 头共享一个 KV 头（如 8 个 Query 共享 1 个 KV），使 KV Cache 显存占用直接降低为原本的 1/4 到 1/8。',
    },
    {
      question: 'Apple Silicon 统一内存（Unified Memory）如何算作显存？',
      answer:
        'Mac Studio 与 MacBook Pro 采用 CPU/GPU 统一内存架构。macOS 默认允许 GPU 调用系统总内存的约 75%~80%（在 macOS Sequoia 中还可通过 sysctl 配置提升）。例如 64GB 统一内存的 Mac 实际可安全供给大模型推理使用的显存上限约在 50~51GB。',
    },
    {
      question: '为什么常见量化方案首选 4-bit（AWQ / GPTQ / Q4_K_M）？',
      answer:
        '大量的量化基准测试证明，4-bit 量化能够在将显存消耗缩减至原本 FP16 的 1/4（约 0.55 字节/参数）的同时，保留高达 98% 以上的原始模型精度与推理能力，是当前消费级单卡运行高参数大模型性价比最高的技术方案。',
    },
  ]

  const howToSteps = [
    '选择或直接拖动设定开源大模型的参数规模（如 7B、14B、32B、70B）。',
    '选择量化精度等级（原生 FP16、INT8、4-bit AWQ 或 3-bit 极限压缩）。',
    '设定实际业务的预期上下文长度（2k ~ 128k tokens）及并发 Batch 批次。',
    '查阅权重、KV Cache、激活值分项显存构成，并对照主流消费级与数据中心 GPU 选型矩阵。',
  ]

  const exampleContent = (
    <div className="space-y-3">
      <div className="p-4 rounded-xl bg-surface border border-border">
        <h4 className="font-semibold text-text-primary text-xs sm:text-sm mb-1 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span>热门开源模型显存与硬件部署对照示例</span>
        </h4>
        <div className="mt-3 grid sm:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg bg-surface-secondary border border-border">
            <p className="font-semibold text-text-primary mb-1">Qwen 2.5 7B (4-bit)</p>
            <p className="text-text-secondary">8k 上下文 · Batch 1</p>
            <p className="text-accent mt-1 font-medium">总显存需求: ~5.6 GB</p>
            <p className="text-success text-[11px] mt-0.5">推荐: RTX 4060 8GB / 4070</p>
          </div>
          <div className="p-3 rounded-lg bg-surface-secondary border border-border">
            <p className="font-semibold text-text-primary mb-1">Qwen 2.5 14B (4-bit)</p>
            <p className="text-text-secondary">16k 上下文 · Batch 1</p>
            <p className="text-accent mt-1 font-medium">总显存需求: ~11.5 GB</p>
            <p className="text-success text-[11px] mt-0.5">推荐: RTX 4070 12GB / 4060Ti 16G</p>
          </div>
          <div className="p-3 rounded-lg bg-surface-secondary border border-border">
            <p className="font-semibold text-text-primary mb-1">Llama 3.3 70B (4-bit)</p>
            <p className="text-text-secondary">8k 上下文 · Batch 1</p>
            <p className="text-accent mt-1 font-medium">总显存需求: ~42.3 GB</p>
            <p className="text-success text-[11px] mt-0.5">推荐: 2×4090 (48G) / Mac 64G</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <ToolLayout
      toolSlug="gpu-calculator"
      principlesTitle="Transformer 架构权重、KV Cache 与运行时显存精算原理"
      principles={
        <>
          <p>
            <strong>1. 模型权重存储公式：</strong>
            <code>Weight Memory (GB) = (Parameters × BytesPerParam) ÷ (1024³)</code>
            <br />
            FP16 为 2 字节；INT8/FP8 为 1 字节；4-bit 量化约 0.55 字节（包含量化 Block 比例缩放因子与偏置元数据）。
          </p>
          <p>
            <strong>2. Grouped-Query Attention (GQA) KV Cache 精算公式：</strong>
            <code>KV Cache (GB) = (2 × NumLayers × NumKVHeads × HeadDim × Context × Batch × KVBytes) ÷ (1024³)</code>
            。随着上下文窗口扩展至 32k 或 128k，KV Cache 的显存占比会急剧上升，成为制约长文本推理的核心瓶颈。
          </p>
          <p>
            <strong>3. 框架运行时与激活显存：</strong>
            深度学习框架需要为 CUDA Context 预留约 0.6 GB 基础显存，并为前向计算中的中间激活张量（Activation Tensors）预留随上下文扩展的动态内存空间。
          </p>
        </>
      }
      howToSteps={howToSteps}
      example={exampleContent}
      faq={faq}
      dataSources={[
        {
          name: 'Hugging Face Transformers / vLLM 架构源码',
          description: 'Attention 权重大小与 PagedAttention KV Cache 显存工程计算规范',
        },
        {
          name: 'NVIDIA CUDA 显卡技术白皮书',
          description: 'Ada Lovelace / Ampere / Hopper 架构显存带宽与显存规格标准',
        },
      ]}
      disclaimer="【硬件选型提示】本工具基于开源大模型标准单卡与张量并行（TP）推理进行工程精算。若使用 LoRA 微调或全参数训练，显存需求将扩大 3~6 倍以上（需额外分配梯度与 Adam 优化器状态）。"
    >
      <div className="space-y-6">
        {/* Model Presets Quick Bar */}
        <div className="p-4 rounded-xl border border-border bg-surface space-y-3 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-accent" />
              <span>热门开源大模型预设架构：</span>
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {MODEL_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => setModelParamsB(preset.paramsB)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition active:scale-[0.98] ${
                  Math.abs(modelParamsB - preset.paramsB) < 0.2
                    ? 'bg-accent text-white shadow-subtle'
                    : 'bg-surface-secondary border border-border text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Input Parameters Config Panel */}
        <div className="rounded-xl border border-border bg-surface p-5 sm:p-6 shadow-subtle space-y-6">
          {/* Model Parameters Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-text-secondary">
                模型参数量 (Model Parameters)
              </label>
              <span className="text-accent font-mono text-base font-bold tabular-nums">
                {modelParamsB} B (十亿参数)
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="72"
              step="0.5"
              value={modelParamsB}
              onChange={(e) => setModelParamsB(Number(e.target.value))}
              className="w-full h-1.5 bg-surface-secondary rounded-full appearance-none cursor-pointer accent-accent"
            />
            <div className="flex justify-between text-[11px] text-text-muted mt-1 font-mono tabular-nums">
              <span>0.5B</span>
              <span>7B</span>
              <span>14B</span>
              <span>32B</span>
              <span>72B</span>
            </div>
          </div>

          {/* Quantization Mode Selector */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-2">
              量化精度等级 (Precision & Quantization)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {QUANT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setQuantId(opt.id)}
                  className={`p-3 rounded-md border text-left transition-all ${
                    quantId === opt.id
                      ? 'border-accent bg-accent-subtle text-accent font-semibold'
                      : 'border-border bg-surface text-text-secondary hover:text-text-primary hover:border-border-hover'
                  }`}
                >
                  <p className="text-xs font-semibold">{opt.name}</p>
                  <p className="text-[11px] opacity-75 mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Context Length & Batch Size Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                上下文窗口长度 (Context)
              </label>
              <select
                value={contextLength}
                onChange={(e) => setContextLength(Number(e.target.value))}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-xs text-text-primary focus:border-accent focus:outline-none transition"
              >
                {[2048, 4096, 8192, 16384, 32768, 65536, 128000].map((len) => (
                  <option key={len} value={len}>
                    {len >= 1000 ? `${len / 1024}k tokens` : `${len} tokens`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                并发批次 (Batch Size)
              </label>
              <select
                value={batchSize}
                onChange={(e) => setBatchSize(Number(e.target.value))}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-xs text-text-primary focus:border-accent focus:outline-none transition"
              >
                {[1, 2, 4, 8, 16].map((b) => (
                  <option key={b} value={b}>
                    {b} (单并发 / 多并发)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                KV Cache 存储精度
              </label>
              <select
                value={kvPrecisionBytes}
                onChange={(e) => setKvPrecisionBytes(Number(e.target.value))}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-xs text-text-primary focus:border-accent focus:outline-none transition"
              >
                <option value={2}>FP16 (标准精度 2 Bytes)</option>
                <option value={1}>FP8 (量化加速 1 Byte)</option>
                <option value={0.5}>INT4 (极限缓存 0.5 Byte)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Overview Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-xl border border-border bg-surface p-4 text-center shadow-subtle">
            <p className="text-xs text-text-secondary mb-1">模型权重显存</p>
            <p className="text-xl sm:text-2xl font-bold text-accent font-mono tabular-nums">
              {weightMemoryGB} <span className="text-xs font-normal text-text-muted">GB</span>
            </p>
            <p className="text-[10px] text-text-muted mt-1 tabular-nums">占比 {Math.round((weightMemoryGB / totalVRAMGB) * 100)}%</p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4 text-center shadow-subtle">
            <p className="text-xs text-text-secondary mb-1">KV Cache 缓存</p>
            <p className="text-xl sm:text-2xl font-bold text-warning font-mono tabular-nums">
              {kvCacheGB} <span className="text-xs font-normal text-text-muted">GB</span>
            </p>
            <p className="text-[10px] text-text-muted mt-1 tabular-nums">{contextLength} tokens × {batchSize}</p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4 text-center shadow-subtle">
            <p className="text-xs text-text-secondary mb-1">运行时与激活</p>
            <p className="text-xl sm:text-2xl font-bold text-text-primary font-mono tabular-nums">
              {runtimeMemoryGB} <span className="text-xs font-normal text-text-muted">GB</span>
            </p>
            <p className="text-[10px] text-text-muted mt-1">CUDA 上下文冗余</p>
          </div>

          <div className="rounded-xl border border-accent/30 bg-accent-subtle p-4 text-center shadow-subtle">
            <p className="text-xs text-accent font-medium mb-1">推荐总显存 (VRAM)</p>
            <p className="text-2xl sm:text-3xl font-bold text-accent font-mono tabular-nums">
              {totalVRAMGB} <span className="text-xs font-normal text-accent/80">GB</span>
            </p>
            <p className="text-[10px] text-accent/80 mt-1">工程安全运行阈值</p>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={copyEstimate}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-surface hover:bg-surface-hover border border-border text-xs font-medium text-text-primary transition shadow-subtle active:scale-[0.98]"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? '已复制选型测算报告' : '复制选型精算报告'}</span>
          </button>
        </div>

        {/* Hardware Recommendations Matrix */}
        <div className="rounded-xl border border-border bg-surface p-5 sm:p-6 space-y-4 shadow-subtle">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-accent" />
              <h3 className="font-semibold text-text-primary text-xs sm:text-sm">
                主流显卡与计算设备兼容性对照
              </h3>
            </div>
            <span className="text-[11px] text-text-muted">
              当前所需显存：<strong className="text-text-primary font-mono tabular-nums">{totalVRAMGB} GB</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {GPU_TARGETS.map((gpu) => {
              const badge = getHardwareBadge(gpu.vram)
              return (
                <div
                  key={gpu.name}
                  className="p-3 rounded-md border border-border bg-surface-secondary/50 flex items-center justify-between gap-3 hover:border-border-hover transition"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-text-primary truncate">{gpu.name}</p>
                    <p className="text-[11px] text-text-muted font-mono tabular-nums">
                      有效显存: {gpu.vram} GB
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-sm text-[10px] font-medium border shrink-0 ${badge.cls}`}
                  >
                    {badge.text}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </ToolLayout>
  )
}
