'use client'

import { useState, useMemo } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Landmark } from 'lucide-react'
import Decimal from 'decimal.js'

type PaymentType = 'equal-principal' | 'equal-payment'
type PriceInputMode = 'total' | 'downPayment'

export default function MortgagePage() {
  const [housePrice, setHousePrice] = useState(2000000)
  const [downPaymentPercent, setDownPaymentPercent] = useState(30)
  const [years, setYears] = useState(30)
  const [rate, setRate] = useState(4.9)
  const [paymentType, setPaymentType] = useState<PaymentType>('equal-payment')
  const [priceInputMode, setPriceInputMode] = useState<PriceInputMode>('total')

  const loanAmount = useMemo(() => {
    if (priceInputMode === 'downPayment') {
      const downPayment = new Decimal(housePrice).times(100 - downPaymentPercent).dividedBy(100)
      return downPayment.toNumber()
    }
    const downPayment = new Decimal(housePrice).times(downPaymentPercent).dividedBy(100)
    return new Decimal(housePrice).minus(downPayment).toNumber()
  }, [housePrice, downPaymentPercent, priceInputMode])

  const actualDownPayment = useMemo(() => {
    return new Decimal(housePrice).times(downPaymentPercent).dividedBy(100).toNumber()
  }, [housePrice, downPaymentPercent])

  const results = useMemo(() => {
    const principal = new Decimal(loanAmount)
    const monthlyRate = new Decimal(rate).dividedBy(100).dividedBy(12)
    const totalMonths = new Decimal(years).times(12)

    if (paymentType === 'equal-payment') {
      // 等额本息
      const monthlyPayment = principal
        .times(monthlyRate)
        .times(monthlyRate.plus(1).pow(totalMonths))
        .dividedBy(monthlyRate.plus(1).pow(totalMonths).minus(1))

      const totalPayment = monthlyPayment.times(totalMonths)
      const totalInterest = totalPayment.minus(principal)

      // 计算每月本金利息明细
      const schedule: { month: number; principal: number; interest: number; balance: number }[] = []
      let balance = principal.toNumber()

      for (let m = 1; m <= totalMonths.toNumber(); m++) {
        const interest = balance * monthlyRate.toNumber()
        const p = monthlyPayment.toNumber() - interest
        balance -= p
        schedule.push({
          month: m,
          principal: p,
          interest,
          balance: Math.max(0, balance)
        })
      }

      return {
        monthlyPayment: monthlyPayment.toNumber(),
        totalPayment: totalPayment.toNumber(),
        totalInterest: totalInterest.toNumber(),
        schedule
      }
    } else {
      // 等额本金
      const monthlyPrincipal = principal.dividedBy(totalMonths)
      const schedule: { month: number; principal: number; interest: number; balance: number }[] = []
      let balance = principal.toNumber()

      for (let m = 1; m <= totalMonths.toNumber(); m++) {
        const interest = balance * monthlyRate.toNumber()
        balance -= monthlyPrincipal.toNumber()
        schedule.push({
          month: m,
          principal: monthlyPrincipal.toNumber(),
          interest,
          balance: Math.max(0, balance)
        })
      }

      const firstPayment = monthlyPrincipal.toNumber() + schedule[0].interest
      const totalPayment = schedule.reduce((sum, m) => sum + m.principal + m.interest, 0)

      return {
        monthlyPayment: firstPayment,
        totalPayment,
        totalInterest: totalPayment - principal.toNumber(),
        schedule,
        isEqualPrincipal: true
      }
    }
  }, [loanAmount, years, rate, paymentType])

  const formatMoney = (n: number) => n.toLocaleString('zh-CN', { maximumFractionDigits: 2 })

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/20 flex items-center justify-center">
                <Landmark className="w-5 h-5 text-[#10B981]" />
              </div>
              <h1 className="text-2xl font-bold text-white">房贷计算器</h1>
            </div>
            <p className="text-[#94A3B8]">支持自定义首付比例，等额本息 vs 等额本金对比分析</p>
          </div>

          {/* Input Form */}
          <div className="glass-card p-6 mb-6">
            {/* Price Input Mode Toggle */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setPriceInputMode('total')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  priceInputMode === 'total'
                    ? 'bg-[#6366F1] text-white'
                    : 'bg-[#080B14] text-[#94A3B8] hover:text-white'
                }`}
              >
                按房屋总价
              </button>
              <button
                onClick={() => setPriceInputMode('downPayment')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  priceInputMode === 'downPayment'
                    ? 'bg-[#6366F1] text-white'
                    : 'bg-[#080B14] text-[#94A3B8] hover:text-white'
                }`}
              >
                按贷款金额
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {priceInputMode === 'total' ? (
                <div>
                  <label className="block text-sm text-[#94A3B8] mb-2">房屋总价（元）</label>
                  <input
                    type="number"
                    value={housePrice}
                    onChange={(e) => setHousePrice(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white focus:outline-none focus:border-[rgba(99,102,241,0.4)]"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm text-[#94A3B8] mb-2">贷款金额（元）</label>
                  <input
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setHousePrice(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white focus:outline-none focus:border-[rgba(99,102,241,0.4)]"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm text-[#94A3B8] mb-2">首付比例</label>
                <select
                  value={downPaymentPercent}
                  onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white focus:outline-none focus:border-[rgba(99,102,241,0.4)]"
                >
                  {[10, 20, 25, 30, 40, 50, 60, 70, 80].map(p => (
                    <option key={p} value={p}>{p}%</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-[#94A3B8] mb-2">贷款年限（年）</label>
                <select
                  value={years}
                  onChange={(e) => setYears(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white focus:outline-none focus:border-[rgba(99,102,241,0.4)]"
                >
                  {[5, 10, 15, 20, 25, 30].map(y => (
                    <option key={y} value={y}>{y}年</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-[#94A3B8] mb-2">年利率（%）</label>
                <input
                  type="number"
                  step="0.01"
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded-xl text-white focus:outline-none focus:border-[rgba(99,102,241,0.4)]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-[#94A3B8] mb-2">还款方式</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPaymentType('equal-payment')}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium ${
                      paymentType === 'equal-payment'
                        ? 'bg-[#10B981] text-white'
                        : 'bg-[#080B14] text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    等额本息（每月月供相同）
                  </button>
                  <button
                    onClick={() => setPaymentType('equal-principal')}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium ${
                      paymentType === 'equal-principal'
                        ? 'bg-[#10B981] text-white'
                        : 'bg-[#080B14] text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    等额本金（前期还款多）
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="glass-card p-4 text-center">
              <p className="text-sm text-[#94A3B8] mb-1">房屋总价</p>
              <p className="text-lg font-bold text-white">¥{formatMoney(housePrice)}</p>
            </div>
            <div className="glass-card p-4 text-center">
              <p className="text-sm text-[#94A3B8] mb-1">首付（{downPaymentPercent}%）</p>
              <p className="text-lg font-bold text-[#EF4444]">¥{formatMoney(actualDownPayment)}</p>
            </div>
            <div className="glass-card p-4 text-center">
              <p className="text-sm text-[#94A3B8] mb-1">贷款金额</p>
              <p className="text-lg font-bold text-[#3B82F6]">¥{formatMoney(loanAmount)}</p>
            </div>
            <div className="glass-card p-4 text-center">
              <p className="text-sm text-[#94A3B8] mb-1">贷款比例</p>
              <p className="text-lg font-bold text-white">{100 - downPaymentPercent}%</p>
            </div>
          </div>

          {/* Results */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="glass-card p-4 text-center">
              <p className="text-sm text-[#94A3B8] mb-1">{paymentType === 'equal-payment' ? '每月月供' : '首月月供'}</p>
              <p className="text-2xl font-bold text-white">¥{formatMoney(results.monthlyPayment)}</p>
            </div>
            <div className="glass-card p-4 text-center">
              <p className="text-sm text-[#94A3B8] mb-1">还款总额</p>
              <p className="text-2xl font-bold text-[#10B981]">¥{formatMoney(results.totalPayment)}</p>
            </div>
            <div className="glass-card p-4 text-center">
              <p className="text-sm text-[#94A3B8] mb-1">利息总额</p>
              <p className="text-2xl font-bold text-[#F59E0B]">¥{formatMoney(results.totalInterest)}</p>
            </div>
          </div>

          {/* Schedule Preview */}
          <div className="glass-card p-6">
            <h3 className="text-white font-medium mb-4">还款计划（前12个月）</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[#475569] border-b border-[rgba(99,102,241,0.1)]">
                    <th className="py-2 text-left">月份</th>
                    <th className="py-2 text-right">月供</th>
                    <th className="py-2 text-right">本金</th>
                    <th className="py-2 text-right">利息</th>
                    <th className="py-2 text-right">剩余</th>
                  </tr>
                </thead>
                <tbody>
                  {results.schedule.slice(0, 12).map(row => (
                    <tr key={row.month} className="border-b border-[rgba(99,102,241,0.05)] text-[#94A3B8]">
                      <td className="py-2">第{row.month}月</td>
                      <td className="py-2 text-right">¥{formatMoney(row.principal + row.interest)}</td>
                      <td className="py-2 text-right text-[#10B981]">¥{formatMoney(row.principal)}</td>
                      <td className="py-2 text-right text-[#F59E0B]">¥{formatMoney(row.interest)}</td>
                      <td className="py-2 text-right">¥{formatMoney(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {results.schedule.length > 12 && (
              <p className="text-center text-[#475569] text-sm mt-4">
                ... 共 {results.schedule.length} 个月
              </p>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
