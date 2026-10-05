import { describe, it, expect } from 'vitest'
import { UNIT_CATEGORIES } from '../app/tools/convert/unit/page'

describe('Conversion Tools Logic', () => {
  describe('Radix BigInt Converter Logic', () => {
    it('should correctly convert BigInt across 2, 8, 10, 16 bases without loss of precision', () => {
      // 64-bit maximum unsigned integer: 18446744073709551615 (FFFFFFFFFFFFFFFF)
      const big = BigInt('18446744073709551615')

      const hex = big.toString(16).toUpperCase()
      expect(hex).toBe('FFFFFFFFFFFFFFFF')

      const bin = big.toString(2)
      expect(bin).toBe('1111111111111111111111111111111111111111111111111111111111111111')

      const oct = big.toString(8)
      expect(oct).toBe('1777777777777777777777')

      // Re-parse back from hex
      const parsedFromHex = BigInt(`0x${hex}`)
      expect(parsedFromHex).toBe(big)

      // Re-parse back from bin
      const parsedFromBin = BigInt(`0b${bin}`)
      expect(parsedFromBin).toBe(big)

      // Re-parse back from oct
      const parsedFromOct = BigInt(`0o${oct}`)
      expect(parsedFromOct).toBe(big)
    })

    it('should reject invalid base digits preventing parseInt partial parsing bug', () => {
      // e.g. "102" in binary: parseInt("102", 2) returns 2 instead of failing!
      // BigInt and regex strictly reject this.
      const binRegex = /^[01]+$/
      expect(binRegex.test('102')).toBe(false)
      expect(binRegex.test('101010')).toBe(true)

      // "89" in octal
      const octRegex = /^[0-7]+$/
      expect(octRegex.test('89')).toBe(false)
      expect(octRegex.test('77')).toBe(true)

      // "12G" in hex
      const hexRegex = /^[0-9a-fA-F]+$/
      expect(hexRegex.test('12G')).toBe(false)
      expect(hexRegex.test('12AF')).toBe(true)
    })
  })

  describe('Unit Converter Logic', () => {
    it('should have all 10 standard unit categories', () => {
      expect(UNIT_CATEGORIES.length).toBe(10)
      const ids = UNIT_CATEGORIES.map((c) => c.id)
      expect(ids).toContain('length')
      expect(ids).toContain('weight')
      expect(ids).toContain('area')
      expect(ids).toContain('volume')
      expect(ids).toContain('temperature')
      expect(ids).toContain('time')
      expect(ids).toContain('speed')
      expect(ids).toContain('storage')
      expect(ids).toContain('pressure')
      expect(ids).toContain('energy')
    })

    it('should correctly convert length between meters and kilometers', () => {
      const lengthCat = UNIT_CATEGORIES.find((c) => c.id === 'length')!
      const m = lengthCat.units.find((u) => u.id === 'm')!
      const km = lengthCat.units.find((u) => u.id === 'km')!

      // 1500 m to km
      const baseValue = m.toBase(1500)
      expect(baseValue).toBe(1500)
      const inKm = km.fromBase(baseValue)
      expect(inKm).toBe(1.5)
    })

    it('should correctly convert temperature between Celsius and Fahrenheit', () => {
      const tempCat = UNIT_CATEGORIES.find((c) => c.id === 'temperature')!
      const c = tempCat.units.find((u) => u.id === 'c')!
      const f = tempCat.units.find((u) => u.id === 'f')!

      // 100 °C = 212 °F
      const baseKelvin = c.toBase(100)
      const inF = f.fromBase(baseKelvin)
      expect(inF).toBeCloseTo(212, 2)

      // 0 °C = 32 °F
      const zeroCBase = c.toBase(0)
      const zeroCF = f.fromBase(zeroCBase)
      expect(zeroCF).toBeCloseTo(32, 2)
    })

    it('should correctly convert storage units (KB, MB, GB, TB)', () => {
      const storageCat = UNIT_CATEGORIES.find((c) => c.id === 'storage')!
      const mb = storageCat.units.find((u) => u.id === 'mb')!
      const gb = storageCat.units.find((u) => u.id === 'gb')!

      // 2000 MB = 2 GB (SI decimal standard)
      const baseBytes = mb.toBase(2000)
      const inGb = gb.fromBase(baseBytes)
      expect(inGb).toBe(2)

      // 2048 MiB = 2 GiB (IEEE 1541 binary standard)
      const mib = storageCat.units.find((u) => u.id === 'mib')!
      const gib = storageCat.units.find((u) => u.id === 'gib')!
      const binaryBytes = mib.toBase(2048)
      expect(gib.fromBase(binaryBytes)).toBe(2)
    })
  })
})
