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
  const baseStyles = 'inline-flex items-center font-medium rounded shrink-0 select-none'

  const sizeStyles = {
    sm: 'text-[10px] sm:text-[11px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2 py-0.5 gap-1.5',
  }

  const variantStyles = {
    default: 'bg-surface-secondary text-text-secondary border border-border',
    success: 'bg-success-subtle text-success border border-success/20',
    warning: 'bg-warning-subtle text-warning border border-warning/20',
    danger: 'bg-danger-subtle text-danger border border-danger/20',
    info: 'bg-accent-subtle text-accent border border-accent/20',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
    outline: 'bg-transparent text-text-muted border border-border',
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

export default Badge
