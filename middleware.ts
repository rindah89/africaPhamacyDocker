import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const manifest = {
  "name": "AP Rail",
  "short_name": "KPB",
  "description": "AP Rail Point of Sale and Inventory Management System",
  "scope": "/",
  "icons": [
    {
      "src": "%PUBLIC_URL%/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "%PUBLIC_URL%/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "%PUBLIC_URL%/fallback-icon.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    }
  ],
  "theme_color": "#ffffff",
  "background_color": "#ffffff",
  "display": "standalone",
  "start_url": "/",
  "orientation": "portrait",
  "categories": ["business", "productivity"],
  "prefer_related_applications": false,
  "shortcuts": [
    {
      "name": "POS",
      "url": "/pos",
      "icons": [{ "src": "%PUBLIC_URL%/fallback-icon.png", "sizes": "192x192" }]
    }
  ]
}

export function middleware(request: NextRequest) {
  // Handle manifest requests
  if (request.nextUrl.pathname === '/site.webmanifest') {
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://africapharmacy.health' 
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