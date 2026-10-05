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
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#090D16] disabled:opacity-50 disabled:pointer-events-none active:scale-[0.99] select-none'

    const sizeStyles = {
      sm: 'text-xs px-3 py-1.5 gap-1.5 h-8',
      md: 'text-sm px-4 py-2 gap-2 h-10',
      lg: 'text-base px-5 py-2.5 gap-2.5 h-12 font-semibold',
    }

    const variantStyles = {
      primary: 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm border border-blue-500/30',
      secondary:
        'bg-[#141C2E] hover:bg-[#1A243B] text-slate-200 hover:text-white border border-[#1E293B]',
      outline:
        'bg-transparent hover:bg-[#141C2E] text-slate-300 hover:text-white border border-[#1E293B] hover:border-slate-700',
      ghost: 'bg-transparent hover:bg-[#141C2E] text-slate-400 hover:text-white',
      danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm border border-rose-500/30',
    }

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    )
  }
)

Button.displayName = 'Button'
