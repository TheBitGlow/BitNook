// ============================================================================
// 1. Date Interval & Offset Calculation (Gregorian Calendar & Leap Years)
// ============================================================================

export interface DateDiffResult {
  totalDays: number
  years: number
  months: number
  days: number
  workdays: number
  weeks: number
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

export function calculateDateDifference(date1: Date, date2: Date): DateDiffResult {
  const start = date1 < date2 ? new Date(date1) : new Date(date2)
  const end = date1 < date2 ? new Date(date2) : new Date(date1)

  // Reset time portions for pure date math
  start.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)

  const diffMs = end.getTime() - start.getTime()
  const totalDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
  const weeks = Math.round((totalDays / 7) * 10) / 10

  // Count workdays (Monday=1 .. Friday=5)
  let workdays = 0
  const cur = new Date(start)
  while (cur < end) {
    cur.setDate(cur.getDate() + 1)
    const dayOfWeek = cur.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workdays++
    }
  }

  // Calculate year/month/day components
  let y = end.getFullYear() - start.getFullYear()
  let m = end.getMonth() - start.getMonth()
  let d = end.getDate() - start.getDate()

  if (d < 0) {
    m -= 1
    const prevMonthLastDay = new Date(end.getFullYear(), end.getMonth(), 0).getDate()
    d += prevMonthLastDay
  }
  if (m < 0) {
    y -= 1
    m += 12
  }

  return {
    totalDays,
    years: Math.max(0, y),
    months: Math.max(0, m),
    days: Math.max(0, d),
    workdays,
    weeks,
  }
}

export function calculateDateOffset(baseDate: Date, offsetDays: number): Date {
  const result = new Date(baseDate)
  result.setDate(result.getDate() + offsetDays)
  return result
}

// ============================================================================
// 2. Word Count & Text Analysis (Chinese Characters, English Words, Reading Time)
// ============================================================================

export interface TextAnalysisResult {
  totalChars: number // all chars including whitespace
  charsNoSpaces: number // chars excluding spaces/newlines
  chineseChars: number // CJK unified ideographs
  englishWords: number // Latin words
  numbers: number // digits
  emojis: number // Unicode emojis
  punctuation: number // symbols/punctuation
  lines: number
  paragraphs: number
  estimatedReadingMinutes: number // ~350 chars/min for Chinese, ~200 wpm for English
  estimatedSpeechMinutes: number // ~250 chars/min
}

export function analyzeText(text: string): TextAnalysisResult {
  if (!text) {
    return {
      totalChars: 0,
      charsNoSpaces: 0,
      chineseChars: 0,
      englishWords: 0,
      numbers: 0,
      emojis: 0,
      punctuation: 0,
      lines: 0,
      paragraphs: 0,
      estimatedReadingMinutes: 0,
      estimatedSpeechMinutes: 0,
    }
  }

  const totalChars = text.length
  const charsNoSpaces = text.replace(/\s+/g, '').length

  // 1. Chinese characters (CJK Unified Ideographs: \u4e00-\u9fff)
  const chineseMatches = text.match(/[\u4e00-\u9fff]/g)
  const chineseChars = chineseMatches ? chineseMatches.length : 0

  // 2. English / Alphanumeric words (Latin letters & numbers, e.g. Hello, World, 123)
  const englishMatches = text.match(/\b[a-zA-Z0-9]+(?:'[a-zA-Z0-9]+)?\b/g)
  const englishWords = englishMatches ? englishMatches.length : 0

  // 3. Numbers (digits count)
  const numberMatches = text.match(/\d/g)
  const numbers = numberMatches ? numberMatches.length : 0

  // 4. Unicode Emojis (Extended Pictographic symbols)
  const emojiMatches = text.match(/\p{Extended_Pictographic}/gu)
  const emojis = emojiMatches ? emojiMatches.length : 0

  // 5. Lines and Paragraphs
  const linesArr = text.split('\n')
  const lines = linesArr.length
  const paragraphs = linesArr.filter(line => line.trim().length > 0).length

  // 6. Punctuation (CJK punctuation + ASCII symbols)
  const punctuationMatches = text.match(/[\p{P}\p{S}]/gu)
  // Deduct emojis that may match \p{S}
  const rawPunctuation = punctuationMatches ? punctuationMatches.length : 0
  const punctuation = Math.max(0, rawPunctuation - emojis)

  // Reading time: Chinese ~350 chars/min, English ~200 words/min
  const readingMinutes = (chineseChars / 350) + (englishWords / 200)
  const speechMinutes = (chineseChars / 250) + (englishWords / 150)

  return {
    totalChars,
    charsNoSpaces,
    chineseChars,
    englishWords,
    numbers,
    emojis,
    punctuation,
    lines,
    paragraphs,
    estimatedReadingMinutes: Math.max(0.1, Math.round(readingMinutes * 10) / 10),
    estimatedSpeechMinutes: Math.max(0.1, Math.round(speechMinutes * 10) / 10),
  }
}

// ============================================================================
// 3. Cryptographically Secure Random Password Generator (CSPRNG)
// ============================================================================

export interface PasswordGeneratorOptions {
  length: number
  includeUppercase?: boolean
  includeLowercase?: boolean
  includeNumbers?: boolean
  includeSymbols?: boolean
  excludeAmbiguous?: boolean // e.g. 0, O, o, 1, l, I
}

export interface PasswordResult {
  password: string
  entropyBits: number
  strength: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong'
}

export function generatePassword(options: PasswordGeneratorOptions): PasswordResult {
  const {
    length = 16,
    includeUppercase = true,
    includeLowercase = true,
    includeNumbers = true,
    includeSymbols = true,
    excludeAmbiguous = false,
  } = options

  let upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let lower = 'abcdefghijklmnopqrstuvwxyz'
  let digits = '0123456789'
  let symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'

  if (excludeAmbiguous) {
    upper = upper.replace(/[OI]/g, '')
    lower = lower.replace(/[ol]/g, '')
    digits = digits.replace(/[01]/g, '')
    symbols = symbols.replace(/[|:;]/g, '')
  }

  let charset = ''
  if (includeUppercase) charset += upper
  if (includeLowercase) charset += lower
  if (includeNumbers) charset += digits
  if (includeSymbols) charset += symbols

  if (!charset) {
    charset = lower + digits
  }

  const safeLength = Math.min(128, Math.max(4, length))
  const cryptoObj =
    typeof window !== 'undefined'
      ? window.crypto
      : typeof globalThis !== 'undefined' && globalThis.crypto
      ? globalThis.crypto
      : null

  let password = ''
  const charsetLength = charset.length

  if (cryptoObj && cryptoObj.getRandomValues) {
    const randomBytes = new Uint32Array(safeLength)
    cryptoObj.getRandomValues(randomBytes)
    for (let i = 0; i < safeLength; i++) {
      password += charset[randomBytes[i] % charsetLength]
    }
  } else {
    // Math.random fallback (e.g. edge environments where subtle crypto is restricted)
    for (let i = 0; i < safeLength; i++) {
      const idx = Math.floor(Math.random() * charsetLength)
      password += charset[idx]
    }
  }

  // Calculate Shannon entropy bits: length * log2(charsetLength)
  const entropyBits = Math.round(safeLength * Math.log2(charsetLength) * 10) / 10

  let strength: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong' = 'fair'
  if (entropyBits < 36) strength = 'weak'
  else if (entropyBits < 60) strength = 'fair'
  else if (entropyBits < 80) strength = 'good'
  else if (entropyBits < 100) strength = 'strong'
  else strength = 'very-strong'

  return {
    password,
    entropyBits,
    strength,
  }
}

// ============================================================================
// 4. Fair Random Wheel / Lottery Decision Picker
// ============================================================================

export interface LotteryItem {
  id: string
  text: string
  weight?: number // default 1
}

export function pickRandomLotteryItem(items: LotteryItem[]): LotteryItem | null {
  if (!items.length) return null

  const totalWeight = items.reduce((sum, item) => sum + Math.max(1, item.weight || 1), 0)
  let randomVal = Math.random() * totalWeight

  for (const item of items) {
    const w = Math.max(1, item.weight || 1)
    if (randomVal <= w) {
      return item
    }
    randomVal -= w
  }

  return items[items.length - 1]
}
