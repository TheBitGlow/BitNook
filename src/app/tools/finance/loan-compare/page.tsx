'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { BarChart3 } from 'lucide-react'

interface LoanPlan {
  name: string
  amount: number
  years: number
  rate: number
  type: 'equal-payment' | 'equal-principal'
}

export default function LoanComparePage() {
  const [plans, setPlans] = useState<LoanPlan[]>([
    { name: '方案A', amount: 1000000, years: 20, rate: 4.9, type: 'equal-payment' },
    { name: '方案B', amount: 1000000, years: 20, rate: 5.4, type: 'equal-payment' },
  ])

  const calculateLoan = (plan: LoanPlan) => {
    const { amount, years, rate, type } = plan
    const monthlyRate = rate / 100 / 12
    const months = years * 12

    if (type === 'equal-payment') {
      const monthlyPayment = amount * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1)
      const totalPayment = monthlyPayment * months
      return { monthlyPayment, totalPayment, totalInterest: totalPayment - amount }
    } else {
      const monthlyPrincipal = amount / months
      let totalInterest = 0
      let balance = amount
      for (let i = 0; i < months; i++) {
        totalInterest += balance * monthlyRate
        balance -= monthlyPrincipal
      }
      const firstPayment = monthlyPrincipal + amount * monthlyRate
      const lastPayment = monthlyPrincipal + (amount % months) * monthlyRate
      return {
        monthlyPayment: firstPayment,
        totalPayment: amount + totalInterest,
        totalInterest,
        monthlyPaymentLast: lastPayment
      }
    }
  }

  const addPlan = () => {
    if (plans.length >= 5) return
    setPlans([...plans, { name: `方案${String.fromCharCode(65 + plans.length)}`, amount: 1000000, years: 20, rate: 5.4, type: 'equal-payment' }])
  }

  const removePlan = (index: number) => {
    if (plans.length <= 1) return
    setPlans(plans.filter((_, i) => i !== index))
  }

  const updatePlan = (index: number, field: keyof LoanPlan, value: number | string) => {
    const newPlans = [...plans]
    newPlans[index] = { ...newPlans[index], [field]: value }
    setPlans(newPlans)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/20 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-[#10B981]" />
              </div>
              <h1 className="text-2xl font-bold text-white">贷款比价</h1>
            </div>
            <p className="text-[#94A3B8]">多方案综合对比</p>
          </div>

          {/* Plans */}
          <div className="space-y-4 mb-6">
            {plans.map((plan, index) => {
              const result = calculateLoan(plan)
              return (
                <div key={index} className="glass-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <input
                      type="text"
                      value={plan.name}
                      onChange={(e) => updatePlan(index, 'name', e.target.value)}
                      className="text-lg font-medium text-white bg-transparent border-b border-transparent hover:border-[rgba(99,102,241,0.3)] focus:border-[#6366F1] outline-none"
                    />
                    {plans.length > 1 && (
                      <button
                        onClick={() => removePlan(index)}
                        className="text-[#475569] hover:text-[#EF4444]"
                      >
                        删除
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs text-[#475569] mb-1">贷款金额</label>
                      <input
                        type="number"
                        value={plan.amount}
                        onChange={(e) => updatePlan(index, 'amount', Number(e.target.value))}
                        className="w-full px-3 py-2 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#475569] mb-1">年限</label>
                      <select
                        value={plan.years}
                        onChange={(e) => updatePlan(index, 'years', Number(e.target.value))}
                        className="w-full px-3 py-2 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded text-white text-sm"
                      >
                        {[5, 10, 15, 20, 25, 30].map(y => (
                          <option key={y} value={y}>{y}年</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-[#475569] mb-1">年利率 (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={plan.rate}
                        onChange={(e) => updatePlan(index, 'rate', Number(e.target.value))}
                        className="w-full px-3 py-2 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#475569] mb-1">还款方式</label>
                      <select
                        value={plan.type}
                        onChange={(e) => updatePlan(index, 'type', e.target.value as 'equal-payment' | 'equal-principal')}
                        className="w-full px-3 py-2 bg-[#080B14] border border-[rgba(99,102,241,0.15)] rounded text-white text-sm"
                      >
                        <option value="equal-payment">等额本息</option>
                        <option value="equal-principal">等额本金</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-[rgba(99,102,241,0.1)]">
                    <div className="text-center">
                      <p className="text-xs text-[#475569]">月供</p>
                      <p className="text-lg font-bold text-white">¥{result.monthlyPayment.toFixed(0)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-[#475569]">总利息</p>
                      <p className="text-lg font-bold text-[#F59E0B]">¥{result.totalInterest.toFixed(0)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-[#475569]">还款总额</p>
                      <p className="text-lg font-bold text-[#10B981]">¥{result.totalPayment.toFixed(0)}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <button
            onClick={addPlan}
            disabled={plans.length >= 5}
            className="w-full py-3 border border-dashed border-[rgba(99,102,241,0.3)] rounded-xl text-[#94A3B8] hover:text-white hover:border-[rgba(99,102,241,0.6)] disabled:opacity-50"
          >
            + 添加方案
          </button>
        </div>
      </main>

      <Footer />
    </div>
  )
}
