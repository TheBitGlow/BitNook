'use client'

import React from 'react'
import Script from 'next/script'
import { ADS_CONFIG } from '@/config/ads'
import { useConsentStatus } from '@/lib/useConsent'

export default function AdSenseScript() {
  const consentGranted = useConsentStatus()

  // If ads are not globally enabled, or no publisher ID configured, don't load scripts
  if (!ADS_CONFIG.enabled || !ADS_CONFIG.clientId) {
    return null
  }

  // Under strict privacy mode, require user consent before loading external Google ad scripts
  if (!consentGranted) {
    return null
  }

  return (
    <>
      {ADS_CONFIG.verificationMeta && (
        <meta name="google-adsense-account" content={ADS_CONFIG.verificationMeta} />
      )}
      <Script
        id="google-adsense"
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADS_CONFIG.clientId}`}
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
    </>
  )
}
