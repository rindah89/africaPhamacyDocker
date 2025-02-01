import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Handle manifest requests
  if (request.nextUrl.pathname === '/site.webmanifest') {
    const manifest = require('./public/site.webmanifest')
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://kpbojongo.com' 
      : request.nextUrl.origin

    // Replace all %PUBLIC_URL% with the actual base URL
    const processedManifest = JSON.stringify(manifest, null, 2)
      .replace(/%PUBLIC_URL%/g, baseUrl)

    return new NextResponse(processedManifest, {
      headers: {
        'Content-Type': 'application/manifest+json',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/site.webmanifest',
} 