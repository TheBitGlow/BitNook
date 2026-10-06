import React, { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = '',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-md transition-all duration-120 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-canvas disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none cursor-pointer'

    const sizeStyles = {
      sm: 'text-xs px-2.5 py-1 gap-1.5 h-8',
      md: 'text-xs sm:text-sm px-3.5 py-1.5 gap-2 h-9',
      lg: 'text-sm sm:text-base px-4 py-2 gap-2 h-10 font-semibold',
    }

    const variantStyles = {
      primary:
        'bg-accent hover:bg-accent-hover text-white shadow-subtle border border-transparent',
      secondary:
        'bg-surface hover:bg-surface-secondary text-text-primary border border-border hover:border-border-hover shadow-subtle',
      outline:
        'bg-transparent hover:bg-surface-secondary text-text-secondary hover:text-text-primary border border-border hover:border-border-hover',
      ghost:
        'bg-transparent hover:bg-surface-secondary text-text-secondary hover:text-text-primary',
      danger:
        'bg-danger hover:bg-danger/90 text-white shadow-subtle border border-transparent',
    }

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-current" />}
        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
