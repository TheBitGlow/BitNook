import React, { forwardRef } from 'react'
import { X } from 'lucide-react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  onClear?: () => void
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      onClear,
      value,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-text-secondary mb-1">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 text-text-muted pointer-events-none shrink-0">
              {leftIcon}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            value={value}
            className={`w-full bg-surface text-text-primary placeholder:text-text-muted text-xs sm:text-sm rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent h-9 ${
              leftIcon ? 'pl-8' : 'pl-3'
            } ${rightIcon || onClear ? 'pr-8' : 'pr-3'} ${
              error
                ? 'border-danger focus:border-danger focus:ring-danger/15'
                : 'border-border hover:border-border-hover'
            } ${className}`}
            {...props}
          />
          {onClear && value && (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-2.5 p-0.5 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              aria-label="清空输入"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          {!onClear && rightIcon && (
            <span className="absolute right-2.5 text-text-muted pointer-events-none shrink-0">
              {rightIcon}
            </span>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-danger font-medium">{error}</p>}
        {!error && helperText && <p className="mt-1 text-xs text-text-muted">{helperText}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
