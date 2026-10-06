'use client'

import { useSyncExternalStore } from 'react'
import { ADS_CONFIG } from '@/config/ads'

function subscribe(callback: () => void) {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener('bitnook-consent-change', callback)
  window.addEventListener('storage', callback)
  return () => {
    window.removeEventListener('bitnook-consent-change', callback)
    window.removeEventListener('storage', callback)
  }
}

function getSnapshot(): boolean {
  try {
    return localStorage.getItem(ADS_CONFIG.consentStorageKey) === 'granted'
  } catch {
    return false
  }
}

function getServerSnapshot(): boolean {
  return false
}

export function useConsentStatus(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
