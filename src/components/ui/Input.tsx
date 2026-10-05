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
          <label htmlFor={inputId} className="block text-xs font-medium text-slate-300 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 text-slate-400 pointer-events-none shrink-0">
              {leftIcon}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            value={value}
            className={`w-full bg-[#141C2E] text-slate-100 placeholder-slate-500 text-sm rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 h-10 ${
              leftIcon ? 'pl-9' : 'pl-3.5'
            } ${rightIcon || onClear ? 'pr-9' : 'pr-3.5'} ${
              error
                ? 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/20'
                : 'border-[#1E293B] hover:border-slate-700'
            } ${className}`}
            {...props}
          />
          {onClear && value && (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-3 p-0.5 text-slate-400 hover:text-white transition-colors"
              aria-label="Clear input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {!onClear && rightIcon && (
            <span className="absolute right-3 text-slate-400 pointer-events-none shrink-0">
              {rightIcon}
            </span>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-rose-400 font-medium">{error}</p>}
        {!error && helperText && <p className="mt-1 text-xs text-slate-400">{helperText}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
