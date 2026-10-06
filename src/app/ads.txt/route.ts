import { NextResponse } from 'next/server'
import { ADS_CONFIG } from '@/config/ads'

export const dynamic = 'force-static'

export async function GET() {
  // Normalize publisher ID (Google AdSense format in ads.txt strips the 'ca-' prefix if present)
  let pubId = ADS_CONFIG.clientId || process.env.NEXT_PUBLIC_ADSENSE_CLIENT || ''
  if (pubId.startsWith('ca-')) {
    pubId = pubId.replace(/^ca-/, '')
  }

  const content = pubId
    ? `# BitNook Authorized Digital Sellers (ads.txt)
# Google AdSense Publisher
google.com, ${pubId}, DIRECT, f08c47fec0942fa0
`
    : `# BitNook Authorized Digital Sellers (ads.txt)
# Once your Google AdSense account is approved, set NEXT_PUBLIC_ADSENSE_CLIENT="ca-pub-XXXXXXXXXXXXXXXX"
# Format:
# google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
`

  return new NextResponse(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  })
}
