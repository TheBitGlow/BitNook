export interface ModelArchPreset {
  name: string
  paramsB: number
  layers: number
  kvHeads: number
  headDim: number
  description: string
}

export const MODEL_PRESETS: ModelArchPreset[] = [
  { name: 'Llama 3.2 3B', paramsB: 3.2, layers: 28, kvHeads: 8, headDim: 128, description: '轻量端侧高智商模型' },
  { name: 'Qwen 2.5 7B', paramsB: 7.6, layers: 28, kvHeads: 4, headDim: 128, description: '主流消费级全能单卡模型' },
  { name: 'Llama 3.1 8B', paramsB: 8.0, layers: 32, kvHeads: 8, headDim: 128, description: '开源标杆8B基础模型' },
  { name: 'Qwen 2.5 14B', paramsB: 14.7, layers: 48, kvHeads: 8, headDim: 128, description: '16GB/24GB显存甜蜜点模型' },
  { name: 'Qwen 2.5 32B', paramsB: 32.5, layers: 64, kvHeads: 8, headDim: 128, description: '逼近70B性能的高效模型' },
  { name: 'Llama 3.3 70B', paramsB: 70.6, layers: 80, kvHeads: 8, headDim: 128, description: '顶级开源旗舰模型' },
]

export interface QuantOption {
  id: string
  name: string
  bytesPerParam: number
  desc: string
}

export const QUANT_OPTIONS: QuantOption[] = [
  { id: 'fp16', name: 'FP16 / BF16 (16-bit)', bytesPerParam: 2.0, desc: '原生全精度，无量化损耗' },
  { id: 'fp8', name: 'FP8 / INT8 (8-bit)', bytesPerParam: 1.0, desc: '平衡精度与显存' },
  { id: 'q4', name: '4-bit (AWQ / GPTQ / Q4_K_M)', bytesPerParam: 0.55, desc: '消费级首选，含元数据开销' },
  { id: 'q3', name: '3-bit (GGUF Q3_K_M)', bytesPerParam: 0.42, desc: '极度压缩显存，轻微掉点' },
  { id: 'fp32', name: 'FP32 (32-bit)', bytesPerParam: 4.0, desc: '传统单精度浮点训练' },
]

export interface GpuSpec {
  name: string
  vram: number
  type: 'consumer' | 'workstation' | 'apple' | 'datacenter'
}

export const GPU_TARGETS: GpuSpec[] = [
  { name: 'RTX 4060 8GB', vram: 8, type: 'consumer' },
  { name: 'RTX 4070 12GB', vram: 12, type: 'consumer' },
  { name: 'RTX 4060 Ti 16GB', vram: 16, type: 'consumer' },
  { name: 'RTX 4070 Ti Super 16GB', vram: 16, type: 'consumer' },
  { name: 'RTX 3090 / 4090 24GB', vram: 24, type: 'consumer' },
  { name: '2× RTX 4090 (48GB 并行)', vram: 48, type: 'workstation' },
  { name: 'Apple Mac Studio (64GB 统一内存)', vram: 51.2, type: 'apple' },
  { name: 'Apple Mac Studio (128GB 统一内存)', vram: 102.4, type: 'apple' },
  { name: 'NVIDIA A100 80GB', vram: 80, type: 'datacenter' },
  { name: 'NVIDIA H100 80GB', vram: 80, type: 'datacenter' },
]

export interface VRAMCalculationResult {
  weightMemoryGB: number
  kvCacheGB: number
  runtimeMemoryGB: number
  totalVRAMGB: number
  recommendedVRAMGB: number
  compatibleGPUs: GpuSpec[]
}

export function calculateVRAM(params: {
  modelParamsB: number
  quantId?: string
  contextLength?: number
  batchSize?: number
  kvPrecisionBytes?: number // FP16 = 2, FP8 = 1
}): VRAMCalculationResult {
  const {
    modelParamsB,
    quantId = 'q4',
    contextLength = 8192,
    batchSize = 1,
    kvPrecisionBytes = 2,
  } = params

  const matchedArch = MODEL_PRESETS.find(p => Math.abs(p.paramsB - modelParamsB) < 0.2)
  const layers = matchedArch?.layers || Math.min(80, Math.max(16, Math.round(modelParamsB * 1.1 + 20)))
  const kvHeads = matchedArch?.kvHeads || (modelParamsB > 30 ? 8 : 4)
  const headDim = matchedArch?.headDim || 128

  const quant = QUANT_OPTIONS.find(q => q.id === quantId) || QUANT_OPTIONS[2]

  // 1. Model Weights Memory (GB)
  const weightGB = (modelParamsB * 1e9 * quant.bytesPerParam) / (1024 * 1024 * 1024)

  // 2. KV Cache Memory (GB) for GQA Transformer:
  // bytes = 2 (Key + Value) * layers * kv_heads * head_dim * context * batch * bytes_per_kv
  const kvBytes = 2 * layers * kvHeads * headDim * contextLength * batchSize * kvPrecisionBytes
  const kvGB = kvBytes / (1024 * 1024 * 1024)

  // 3. CUDA Context & Activation Overhead
  const cudaBaseGB = 0.6
  const activationGB = Math.max(0.3, weightGB * 0.04 + (contextLength / 8192) * batchSize * 0.25)
  const runtimeGB = cudaBaseGB + activationGB

  // 4. Total and Recommended VRAM
  const totalGB = weightGB + kvGB + runtimeGB
  const recommendedGB = Math.round(totalGB * 1.1 * 10) / 10 // 10% safety margin

  const compatibleGPUs = GPU_TARGETS.filter(g => g.vram >= totalGB)

  return {
    weightMemoryGB: Math.round(weightGB * 100) / 100,
    kvCacheGB: Math.round(kvGB * 100) / 100,
    runtimeMemoryGB: Math.round(runtimeGB * 100) / 100,
    totalVRAMGB: Math.round(totalGB * 100) / 100,
    recommendedVRAMGB: recommendedGB,
    compatibleGPUs,
  }
}
