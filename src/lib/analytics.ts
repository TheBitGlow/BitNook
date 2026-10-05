'use client'

/**
 * Privacy-First, Anonymous Analytics for BitNook
 *
 * Compliance Principles:
 * 1. STRICTLY FORBIDDEN: Collecting user input values, passwords, financial amounts,
 *    health readings, file contents, or URL query parameters with sensitive payloads.
 * 2. Zero PII, zero third-party cross-site cookies, zero user account requirement.
 * 3. Minimal anonymous event telemetry supporting Cloudflare Web Analytics beacons.
 */

export type AnalyticsEventName =
  | 'page_view'
  | 'tool_open'
  | 'tool_success'
  | 'copy'
  | 'download'
  | 'favorite'
  | 'search'
  | 'search_click'
  | 'game_start'
  | 'game_complete'

export interface SafeEventPayload {
  toolSlug?: string
  gameSlug?: string
  category?: string
  queryLength?: number // Only the character length, NEVER the query text itself
  status?: 'success' | 'failed'
}

/**
 * Dispatches an anonymous, privacy-safe analytics event.
 */
export function trackEvent(name: AnalyticsEventName, payload?: SafeEventPayload): void {
  if (typeof window === 'undefined') return

  // Sanitize payload to guarantee no forbidden data leaks
  const safeData: SafeEventPayload = {}
  if (payload?.toolSlug) safeData.toolSlug = String(payload.toolSlug).slice(0, 50)
  if (payload?.gameSlug) safeData.gameSlug = String(payload.gameSlug).slice(0, 50)
  if (payload?.category) safeData.category = String(payload.category).slice(0, 50)
  if (typeof payload?.queryLength === 'number') safeData.queryLength = payload.queryLength
  if (payload?.status) safeData.status = payload.status

  // 1. Dispatch custom event on window for debugging or listener adapters
  try {
    const customEvent = new CustomEvent('bitnook_analytics', {
      detail: { event: name, ...safeData, timestamp: Date.now() },
    })
    window.dispatchEvent(customEvent)
  } catch {
    // Ignore environments with restricted CustomEvent
  }

  // 2. Integration with Cloudflare Web Analytics beacon if loaded
  try {
    const cf = (window as unknown as { __cfBeacon?: { record?: (data: unknown) => void } }).__cfBeacon
    if (cf && typeof cf.record === 'function') {
      cf.record({ event: name, ...safeData })
    }
  } catch {
    // Ignore beacon integration errors
  }
}
