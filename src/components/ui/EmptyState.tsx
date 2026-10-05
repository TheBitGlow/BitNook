import React from 'react'

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`rounded-2xl border border-dashed border-[#1E293B] bg-[#0F1523]/40 p-10 text-center flex flex-col items-center justify-center ${className}`}
    >
      {icon && (
        <div className="w-12 h-12 rounded-2xl bg-[#141C2E] border border-[#1E293B] flex items-center justify-center text-slate-400 mb-3.5">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-semibold text-white mb-1">{title}</h3>
      {description && <p className="text-xs text-slate-400 max-w-sm mb-4 leading-relaxed">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  )
}
