'use client'

import { recordGrowthEvent } from './growthMetrics'

/**
 * Privacy-First, Anonymous Analytics for BitNook
 *
 * Compliance Principles:
 * 1. STRICTLY FORBIDDEN: Collecting user input values, passwords, financial amounts,
 *    health readings, file contents, or URL query parameters with sensitive payloads.
 * 2. 本地处理原则：输入默认不会上传，绝不将工具输入内容用于产品分析，无需登录。
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
  | 'related_click'
  | 'related_tool_click'
  | 'game_start'
  | 'game_complete'
  | 'tool_feedback'

export interface SafeEventPayload {
  toolSlug?: string
  tool?: string
  gameSlug?: string
  category?: string
  queryLength?: number // Only the character length, NEVER the query text itself
  status?: 'success' | 'failed'
  rating?: 'helpful' | 'improve'
  feedbackTag?: string
}

/**
 * Dispatches an anonymous, privacy-safe analytics event.
 */
export function trackEvent(name: AnalyticsEventName, payload?: SafeEventPayload): void {
  if (typeof window === 'undefined') return

  // Sanitize payload to guarantee no forbidden data leaks
  const safeData: SafeEventPayload = {}
  const resolvedSlug = payload?.toolSlug || payload?.tool
  if (resolvedSlug) safeData.toolSlug = String(resolvedSlug).slice(0, 50)
  if (payload?.gameSlug) safeData.gameSlug = String(payload.gameSlug).slice(0, 50)
  if (payload?.category) safeData.category = String(payload.category).slice(0, 50)
  if (typeof payload?.queryLength === 'number') safeData.queryLength = payload.queryLength
  if (payload?.status) safeData.status = payload.status
  if (payload?.rating) safeData.rating = payload.rating
  if (payload?.feedbackTag) safeData.feedbackTag = String(payload.feedbackTag).slice(0, 50)

  // 1. Update anonymous growth metrics counters locally
  try {
    recordGrowthEvent(name, {
      toolSlug: safeData.toolSlug,
      gameSlug: safeData.gameSlug,
    })
  } catch {
    // Ignore metrics failure
  }

  // 2. Dispatch custom event on window for debugging or listener adapters
  try {
    const customEvent = new CustomEvent('bitnook_analytics', {
      detail: { event: name, ...safeData, timestamp: Date.now() },
    })
    window.dispatchEvent(customEvent)
  } catch {
    // Ignore environments with restricted CustomEvent
  }

  // 3. Integration with Cloudflare Web Analytics beacon if loaded
  try {
    const cf = (window as unknown as { __cfBeacon?: { record?: (data: unknown) => void } }).__cfBeacon
    if (cf && typeof cf.record === 'function') {
      cf.record({ event: name, ...safeData })
    }
  } catch {
    // Ignore beacon integration errors
  }
}
