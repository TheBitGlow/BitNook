// ============================================================================
// 1. Color Space Conversions (HEX, RGB, HSL, CMYK)
// ============================================================================

export interface RGBColor {
  r: number
  g: number
  b: number
  a?: number
}

export interface HSLColor {
  h: number
  s: number
  l: number
  a?: number
}

export interface CMYKColor {
  c: number
  m: number
  y: number
  k: number
}

export function hexToRgb(hex: string): RGBColor | null {
  let cleaned = hex.trim().replace(/^#/, '')
  if (cleaned.length === 3) {
    cleaned = cleaned.split('').map(c => c + c).join('')
  }
  if (cleaned.length === 6) {
    const num = parseInt(cleaned, 16)
    if (isNaN(num)) return null
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    }
  }
  if (cleaned.length === 8) {
    const num = parseInt(cleaned, 16)
    if (isNaN(num)) return null
    return {
      r: (num >> 24) & 255,
      g: (num >> 16) & 255,
      b: (num >> 8) & 255,
      a: Math.round(((num & 255) / 255) * 100) / 100,
    }
  }
  return null
}

export function rgbToHex(rgb: RGBColor): string {
  const r = Math.max(0, Math.min(255, Math.round(rgb.r)))
    .toString(16)
    .padStart(2, '0')
  const g = Math.max(0, Math.min(255, Math.round(rgb.g)))
    .toString(16)
    .padStart(2, '0')
  const b = Math.max(0, Math.min(255, Math.round(rgb.b)))
    .toString(16)
    .padStart(2, '0')
  return `#${r}${g}${b}`.toUpperCase()
}

export function rgbToHsl(rgb: RGBColor): HSLColor {
  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
    a: rgb.a,
  }
}

export function hslToRgb(hsl: HSLColor): RGBColor {
  const h = hsl.h / 360
  const s = hsl.s / 100
  const l = hsl.l / 100

  let r: number, g: number, b: number

  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      let tNorm = t
      if (tNorm < 0) tNorm += 1
      if (tNorm > 1) tNorm -= 1
      if (tNorm < 1 / 6) return p + (q - p) * 6 * tNorm
      if (tNorm < 1 / 2) return q
      if (tNorm < 2 / 3) return p + (q - p) * (2 / 3 - tNorm) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
    a: hsl.a,
  }
}

export function rgbToCmyk(rgb: RGBColor): CMYKColor {
  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255

  const k = 1 - Math.max(r, g, b)
  if (k === 1) {
    return { c: 0, m: 0, y: 0, k: 100 }
  }

  const c = (1 - r - k) / (1 - k)
  const m = (1 - g - k) / (1 - k)
  const y = (1 - b - k) / (1 - k)

  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100),
  }
}

// ============================================================================
// 2. Radix Base Conversions (Arbitrary-Precision BigInt)
// ============================================================================

export type RadixBase = 2 | 8 | 10 | 16

const RADIX_VALIDATORS: Record<RadixBase, RegExp> = {
  2: /^[01]+$/,
  8: /^[0-7]+$/,
  10: /^[0-9]+$/,
  16: /^[0-9a-fA-F]+$/,
}

export function validateRadixInput(val: string, base: RadixBase): boolean {
  const trimmed = val.trim()
  if (!trimmed) return false
  return RADIX_VALIDATORS[base].test(trimmed)
}

export function convertRadix(
  val: string,
  fromBase: RadixBase
): { bin: string; oct: string; dec: string; hex: string } | null {
  const trimmed = val.trim()
  if (!validateRadixInput(trimmed, fromBase)) return null

  let big: BigInt
  try {
    if (fromBase === 10) {
      big = BigInt(trimmed)
    } else if (fromBase === 16) {
      big = BigInt(`0x${trimmed}`)
    } else if (fromBase === 2) {
      big = BigInt(`0b${trimmed}`)
    } else if (fromBase === 8) {
      big = BigInt(`0o${trimmed}`)
    } else {
      return null
    }
  } catch {
    return null
  }

  return {
    bin: big.toString(2),
    oct: big.toString(8),
    dec: big.toString(10),
    hex: big.toString(16).toUpperCase(),
  }
}

// ============================================================================
// 3. Cryptographic Hash Calculations (Web Crypto API)
// ============================================================================

export type HashAlgorithm = 'SHA-256' | 'SHA-512' | 'SHA-384' | 'SHA-1'

export async function computeHash(
  data: string | ArrayBuffer,
  algorithm: HashAlgorithm = 'SHA-256'
): Promise<string> {
  const cryptoObj =
    typeof window !== 'undefined'
      ? window.crypto
      : typeof globalThis !== 'undefined' && globalThis.crypto
      ? globalThis.crypto
      : null

  if (!cryptoObj || !cryptoObj.subtle) {
    throw new Error('Web Crypto API is not supported in this runtime')
  }

  const buffer =
    typeof data === 'string' ? new TextEncoder().encode(data).buffer : data

  const hashBuffer = await cryptoObj.subtle.digest(algorithm, buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// ============================================================================
// 4. Unix Timestamp Conversions
// ============================================================================

export interface TimestampResult {
  seconds: number
  milliseconds: number
  iso: string
  utcString: string
  localString: string
}

export function parseTimestamp(input: number | string): TimestampResult | null {
  let ms: number

  if (typeof input === 'number') {
    // If input looks like seconds (< 100 billion, year 5138)
    ms = input < 100000000000 ? input * 1000 : input
  } else {
    const trimmed = input.trim()
    if (/^\d+$/.test(trimmed)) {
      const num = parseInt(trimmed, 10)
      ms = trimmed.length <= 10 ? num * 1000 : num
    } else {
      const parsedDate = new Date(trimmed)
      if (isNaN(parsedDate.getTime())) return null
      ms = parsedDate.getTime()
    }
  }

  const date = new Date(ms)
  if (isNaN(date.getTime())) return null

  return {
    seconds: Math.floor(ms / 1000),
    milliseconds: ms,
    iso: date.toISOString(),
    utcString: date.toUTCString(),
    localString: date.toLocaleString('zh-CN', { hour12: false }),
  }
}

// ============================================================================
// 5. Unit Conversion Categories & Engine
// ============================================================================

export interface UnitDef {
  id: string
  name: string
  symbol: string
  toBase: (v: number) => number
  fromBase: (baseV: number) => number
}

export interface UnitCategory {
  id: string
  name: string
  iconText: string
  units: UnitDef[]
}

export const UNIT_CATEGORIES: UnitCategory[] = [
  {
    id: 'length',
    name: '长度',
    iconText: '📏',
    units: [
      { id: 'mm', name: '毫米', symbol: 'mm', toBase: (v) => v * 0.001, fromBase: (b) => b / 0.001 },
      { id: 'cm', name: '厘米', symbol: 'cm', toBase: (v) => v * 0.01, fromBase: (b) => b / 0.01 },
      { id: 'dm', name: '分米', symbol: 'dm', toBase: (v) => v * 0.1, fromBase: (b) => b / 0.1 },
      { id: 'm', name: '米', symbol: 'm', toBase: (v) => v, fromBase: (b) => b },
      { id: 'km', name: '千米 (公里)', symbol: 'km', toBase: (v) => v * 1000, fromBase: (b) => b / 1000 },
      { id: 'in', name: '英寸', symbol: 'in', toBase: (v) => v * 0.0254, fromBase: (b) => b / 0.0254 },
      { id: 'ft', name: '英尺', symbol: 'ft', toBase: (v) => v * 0.3048, fromBase: (b) => b / 0.3048 },
      { id: 'yd', name: '码', symbol: 'yd', toBase: (v) => v * 0.9144, fromBase: (b) => b / 0.9144 },
      { id: 'mi', name: '英里', symbol: 'mi', toBase: (v) => v * 1609.344, fromBase: (b) => b / 1609.344 },
      { id: 'nmi', name: '海里', symbol: 'nmi', toBase: (v) => v * 1852, fromBase: (b) => b / 1852 },
      { id: 'chi', name: '市尺', symbol: '尺', toBase: (v) => v / 3, fromBase: (b) => b * 3 },
      { id: 'cun', name: '市寸', symbol: '寸', toBase: (v) => v / 30, fromBase: (b) => b * 30 },
    ],
  },
  {
    id: 'weight',
    name: '重量',
    iconText: '⚖️',
    units: [
      { id: 'mg', name: '毫克', symbol: 'mg', toBase: (v) => v * 1e-6, fromBase: (b) => b / 1e-6 },
      { id: 'g', name: '克', symbol: 'g', toBase: (v) => v * 0.001, fromBase: (b) => b / 0.001 },
      { id: 'kg', name: '千克 (公斤)', symbol: 'kg', toBase: (v) => v, fromBase: (b) => b },
      { id: 't', name: '公吨', symbol: 't', toBase: (v) => v * 1000, fromBase: (b) => b / 1000 },
      { id: 'jin', name: '市斤', symbol: '斤', toBase: (v) => v * 0.5, fromBase: (b) => b / 0.5 },
      { id: 'liang', name: '市两', symbol: '两', toBase: (v) => v * 0.05, fromBase: (b) => b / 0.05 },
      { id: 'lb', name: '磅', symbol: 'lb', toBase: (v) => v * 0.45359237, fromBase: (b) => b / 0.45359237 },
      { id: 'oz', name: '盎司', symbol: 'oz', toBase: (v) => v * 0.028349523125, fromBase: (b) => b / 0.028349523125 },
      { id: 'ct', name: '克拉', symbol: 'ct', toBase: (v) => v * 0.0002, fromBase: (b) => b / 0.0002 },
    ],
  },
  {
    id: 'area',
    name: '面积',
    iconText: '📐',
    units: [
      { id: 'sq_mm', name: '平方毫米', symbol: 'mm²', toBase: (v) => v * 1e-6, fromBase: (b) => b / 1e-6 },
      { id: 'sq_cm', name: '平方厘米', symbol: 'cm²', toBase: (v) => v * 1e-4, fromBase: (b) => b / 1e-4 },
      { id: 'sq_m', name: '平方米', symbol: 'm²', toBase: (v) => v, fromBase: (b) => b },
      { id: 'ha', name: '公顷', symbol: 'ha', toBase: (v) => v * 10000, fromBase: (b) => b / 10000 },
      { id: 'sq_km', name: '平方千米', symbol: 'km²', toBase: (v) => v * 1e6, fromBase: (b) => b / 1e6 },
      { id: 'mu', name: '亩 (中国)', symbol: '亩', toBase: (v) => v * (2000 / 3), fromBase: (b) => b / (2000 / 3) },
      { id: 'sq_ft', name: '平方英尺', symbol: 'ft²', toBase: (v) => v * 0.09290304, fromBase: (b) => b / 0.09290304 },
      { id: 'acre', name: '英亩', symbol: 'acre', toBase: (v) => v * 4046.8564224, fromBase: (b) => b / 4046.8564224 },
      { id: 'sq_mi', name: '平方英里', symbol: 'mi²', toBase: (v) => v * 2589988.11, fromBase: (b) => b / 2589988.11 },
    ],
  },
  {
    id: 'volume',
    name: '体积',
    iconText: '🧊',
    units: [
      { id: 'ml', name: '毫升', symbol: 'mL', toBase: (v) => v * 1e-6, fromBase: (b) => b / 1e-6 },
      { id: 'l', name: '升', symbol: 'L', toBase: (v) => v * 0.001, fromBase: (b) => b / 0.001 },
      { id: 'cu_m', name: '立方米', symbol: 'm³', toBase: (v) => v, fromBase: (b) => b },
      { id: 'cu_cm', name: '立方厘米', symbol: 'cm³', toBase: (v) => v * 1e-6, fromBase: (b) => b / 1e-6 },
      { id: 'cu_in', name: '立方英寸', symbol: 'in³', toBase: (v) => v * 1.6387064e-5, fromBase: (b) => b / 1.6387064e-5 },
      { id: 'cu_ft', name: '立方英尺', symbol: 'ft³', toBase: (v) => v * 0.028316846, fromBase: (b) => b / 0.028316846 },
      { id: 'gal_us', name: '美制加仑', symbol: 'gal (US)', toBase: (v) => v * 0.00378541, fromBase: (b) => b / 0.00378541 },
      { id: 'gal_uk', name: '英制加仑', symbol: 'gal (UK)', toBase: (v) => v * 0.00454609, fromBase: (b) => b / 0.00454609 },
      { id: 'floz_us', name: '美制液体盎司', symbol: 'fl oz', toBase: (v) => v * 2.95735e-5, fromBase: (b) => b / 2.95735e-5 },
    ],
  },
  {
    id: 'temperature',
    name: '温度',
    iconText: '🌡️',
    units: [
      { id: 'c', name: '摄氏度', symbol: '°C', toBase: (v) => v, fromBase: (b) => b },
      { id: 'f', name: '华氏度', symbol: '°F', toBase: (v) => ((v - 32) * 5) / 9, fromBase: (b) => (b * 9) / 5 + 32 },
      { id: 'k', name: '开尔文', symbol: 'K', toBase: (v) => v - 273.15, fromBase: (b) => b + 273.15 },
      { id: 'r', name: '兰氏度', symbol: '°R', toBase: (v) => ((v - 491.67) * 5) / 9, fromBase: (b) => ((b + 273.15) * 9) / 5 },
    ],
  },
  {
    id: 'time',
    name: '时间',
    iconText: '⏱️',
    units: [
      { id: 'ms', name: '毫秒', symbol: 'ms', toBase: (v) => v * 0.001, fromBase: (b) => b / 0.001 },
      { id: 's', name: '秒', symbol: 's', toBase: (v) => v, fromBase: (b) => b },
      { id: 'min', name: '分钟', symbol: 'min', toBase: (v) => v * 60, fromBase: (b) => b / 60 },
      { id: 'h', name: '小时', symbol: 'h', toBase: (v) => v * 3600, fromBase: (b) => b / 3600 },
      { id: 'd', name: '天 (日)', symbol: 'd', toBase: (v) => v * 86400, fromBase: (b) => b / 86400 },
      { id: 'wk', name: '周', symbol: 'wk', toBase: (v) => v * 604800, fromBase: (b) => b / 604800 },
      { id: 'mo', name: '月 (30天)', symbol: 'mo', toBase: (v) => v * 2592000, fromBase: (b) => b / 2592000 },
      { id: 'yr', name: '年 (365天)', symbol: 'yr', toBase: (v) => v * 31536000, fromBase: (b) => b / 31536000 },
    ],
  },
  {
    id: 'speed',
    name: '速度',
    iconText: '🚀',
    units: [
      { id: 'mps', name: '米/秒', symbol: 'm/s', toBase: (v) => v, fromBase: (b) => b },
      { id: 'kmh', name: '千米/小时', symbol: 'km/h', toBase: (v) => v / 3.6, fromBase: (b) => b * 3.6 },
      { id: 'mph', name: '英里/小时', symbol: 'mph', toBase: (v) => v * 0.44704, fromBase: (b) => b / 0.44704 },
      { id: 'knot', name: '节 (海里/小时)', symbol: 'kn', toBase: (v) => (v * 1852) / 3600, fromBase: (b) => (b * 3600) / 1852 },
      { id: 'fps', name: '英尺/秒', symbol: 'ft/s', toBase: (v) => v * 0.3048, fromBase: (b) => b / 0.3048 },
      { id: 'mach', name: '马赫 (声速)', symbol: 'Mach', toBase: (v) => v * 340.29, fromBase: (b) => b / 340.29 },
    ],
  },
  {
    id: 'storage',
    name: '数据容量',
    iconText: '💾',
    units: [
      { id: 'b', name: '比特 (Bit)', symbol: 'b', toBase: (v) => v * 0.125, fromBase: (b) => b * 8 },
      { id: 'byte', name: '字节 (Byte)', symbol: 'B', toBase: (v) => v, fromBase: (b) => b },
      { id: 'kb', name: '千字节 (KB)', symbol: 'KB', toBase: (v) => v * 1000, fromBase: (b) => b / 1000 },
      { id: 'mb', name: '兆字节 (MB)', symbol: 'MB', toBase: (v) => v * 1e6, fromBase: (b) => b / 1e6 },
      { id: 'gb', name: '吉字节 (GB)', symbol: 'GB', toBase: (v) => v * 1e9, fromBase: (b) => b / 1e9 },
      { id: 'tb', name: '太字节 (TB)', symbol: 'TB', toBase: (v) => v * 1e12, fromBase: (b) => b / 1e12 },
      { id: 'pb', name: '拍字节 (PB)', symbol: 'PB', toBase: (v) => v * 1e15, fromBase: (b) => b / 1e15 },
      { id: 'kib', name: 'Kibibyte (1024B)', symbol: 'KiB', toBase: (v) => v * 1024, fromBase: (b) => b / 1024 },
      { id: 'mib', name: 'Mebibyte (1024²B)', symbol: 'MiB', toBase: (v) => v * 1048576, fromBase: (b) => b / 1048576 },
      { id: 'gib', name: 'Gibibyte (1024³B)', symbol: 'GiB', toBase: (v) => v * 1073741824, fromBase: (b) => b / 1073741824 },
      { id: 'tib', name: 'Tebibyte (1024⁴B)', symbol: 'TiB', toBase: (v) => v * 1099511627776, fromBase: (b) => b / 1099511627776 },
    ],
  },
  {
    id: 'pressure',
    name: '压力',
    iconText: '🌪️',
    units: [
      { id: 'pa', name: '帕斯卡', symbol: 'Pa', toBase: (v) => v, fromBase: (b) => b },
      { id: 'hpa', name: '百帕', symbol: 'hPa', toBase: (v) => v * 100, fromBase: (b) => b / 100 },
      { id: 'kpa', name: '千帕', symbol: 'kPa', toBase: (v) => v * 1000, fromBase: (b) => b / 1000 },
      { id: 'mpa', name: '兆帕', symbol: 'MPa', toBase: (v) => v * 1e6, fromBase: (b) => b / 1e6 },
      { id: 'atm', name: '标准大气压', symbol: 'atm', toBase: (v) => v * 101325, fromBase: (b) => b / 101325 },
      { id: 'bar', name: '巴', symbol: 'bar', toBase: (v) => v * 100000, fromBase: (b) => b / 100000 },
      { id: 'mmhg', name: '毫米汞柱', symbol: 'mmHg', toBase: (v) => v * 133.322368, fromBase: (b) => b / 133.322368 },
      { id: 'psi', name: '磅力/平方英寸', symbol: 'psi', toBase: (v) => v * 6894.757, fromBase: (b) => b / 6894.757 },
    ],
  },
  {
    id: 'energy',
    name: '能量',
    iconText: '⚡',
    units: [
      { id: 'j', name: '焦耳', symbol: 'J', toBase: (v) => v, fromBase: (b) => b },
      { id: 'kj', name: '千焦', symbol: 'kJ', toBase: (v) => v * 1000, fromBase: (b) => b / 1000 },
      { id: 'cal', name: '卡路里', symbol: 'cal', toBase: (v) => v * 4.184, fromBase: (b) => b / 4.184 },
      { id: 'kcal', name: '千卡 (大卡)', symbol: 'kcal', toBase: (v) => v * 4184, fromBase: (b) => b / 4184 },
      { id: 'wh', name: '瓦时', symbol: 'Wh', toBase: (v) => v * 3600, fromBase: (b) => b / 3600 },
      { id: 'kwh', name: '千瓦时 (度)', symbol: 'kWh', toBase: (v) => v * 3.6e6, fromBase: (b) => b / 3.6e6 },
      { id: 'btu', name: '英热单位', symbol: 'BTU', toBase: (v) => v * 1055.056, fromBase: (b) => b / 1055.056 },
      { id: 'ev', name: '电子伏特', symbol: 'eV', toBase: (v) => v * 1.602176634e-19, fromBase: (b) => b / 1.602176634e-19 },
    ],
  },
]

export function convertUnit(
  val: number,
  fromUnitId: string,
  toUnitId: string,
  categoryId: string
): number | null {
  const cat = UNIT_CATEGORIES.find(c => c.id === categoryId)
  if (!cat) return null
  const fromUnit = cat.units.find(u => u.id === fromUnitId)
  const toUnit = cat.units.find(u => u.id === toUnitId)
  if (!fromUnit || !toUnit) return null

  const baseVal = fromUnit.toBase(val)
  return toUnit.fromBase(baseVal)
}
