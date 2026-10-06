import React from 'react'

interface LogoProps {
  size?: number
  className?: string
  showText?: boolean
  subText?: string
}

/**
 * BitNook Signature Brand Mark:
 * Represents "The Digital Nook" (方寸角落):
 * Architectural corner bracket enclosing a docked precision bit.
 */
export function LogoMark({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      {/* Precision Nook Corner (Top-Left Bracket) */}
      <path
        d="M3.5 17.5V5.5C3.5 4.39543 4.39543 3.5 5.5 3.5H17.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {/* Lower Recessed Boundary (Hairline Corner) */}
      <path
        d="M20.5 6.5V18.5C20.5 19.6046 19.6046 20.5 18.5 20.5H6.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.3"
      />
      {/* Docked Central Bit (方寸数核) */}
      <rect
        x="8.5"
        y="8.5"
        width="7"
        height="7"
        rx="1.5"
        fill="currentColor"
      />
    </svg>
  )
}

export function Logo({
  size = 19,
  className = '',
  showText = true,
  subText,
}: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 group ${className}`}>
      <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-accent group-hover:border-accent/50 group-hover:bg-accent-subtle/50 transition-colors shadow-subtle shrink-0">
        <LogoMark size={size} className="text-accent" />
      </div>
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="text-[15px] font-semibold tracking-tight text-text-primary group-hover:text-accent transition-colors">
              BitNook
            </span>
            <span className="text-[10px] font-mono uppercase px-1 py-0.2 rounded bg-surface-secondary text-text-muted border border-border/60">
              v1.1
            </span>
          </div>
          <span className="text-[11px] text-text-muted font-normal mt-1 leading-none">
            {subText || '比特角落 · 方寸万象'}
          </span>
        </div>
      )}
    </div>
  )
}

export default Logo
