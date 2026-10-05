import React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean
}

export function Card({ children, className = '', hoverable = false, ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-[#1E293B] bg-[#0F1523] p-5 sm:p-6 transition-all ${
        hoverable ? 'hover:border-slate-700 hover:bg-[#141C2E] cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  children,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`mb-4 flex items-center justify-between gap-4 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({
  children,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={`text-base font-bold text-white tracking-tight ${className}`} {...props}>
      {children}
    </h3>
  )
}

export function CardDescription({
  children,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-xs text-slate-400 leading-relaxed ${className}`} {...props}>
      {children}
    </p>
  )
}
