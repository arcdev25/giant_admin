import { NextResponse } from 'next/server'
import { COOKIE, verifySession } from '@/lib/session'

export async function middleware(req) {
  const { pathname } = req.nextUrl
  const ok = await verifySession(req.cookies.get(COOKIE)?.value)

  if (pathname.startsWith('/api/admin')) {
    return ok ? NextResponse.next() : NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (pathname.startsWith('/admin') && !ok) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  if (pathname === '/login' && ok) {
    return NextResponse.redirect(new URL('/admin', req.url))
  }
  return NextResponse.next()
}

export const config = { matcher: ['/admin/:path*', '/api/admin/:path*', '/login'] }
