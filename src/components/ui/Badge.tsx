import React from 'react'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'outline'
  size?: 'sm' | 'md'
  icon?: React.ReactNode
}

export function Badge({
  children,
  variant = 'default',
  size = 'sm',
  icon,
  className = '',
  ...props
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center font-medium rounded-full shrink-0 select-none'

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  }

  const variantStyles = {
    default: 'bg-slate-800 text-slate-300 border border-slate-700/60',
    success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25',
    warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/25',
    danger: 'bg-rose-500/10 text-rose-400 border border-rose-500/25',
    info: 'bg-blue-500/10 text-blue-400 border border-blue-500/25',
    purple: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/25',
    outline: 'bg-transparent text-slate-400 border border-slate-700',
  }

  return (
    <span
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  )
}
