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
      className={`rounded-lg border border-dashed border-border bg-surface-secondary/40 p-6 sm:p-8 text-center flex flex-col items-center justify-center ${className}`}
    >
      {icon && (
        <div className="w-8 h-8 rounded-md bg-surface-secondary text-text-muted flex items-center justify-center mb-2.5">
          {icon}
        </div>
      )}
      <h3 className="text-xs sm:text-sm font-medium text-text-primary mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-text-muted max-w-xs mb-3 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  )
}

export default EmptyState
