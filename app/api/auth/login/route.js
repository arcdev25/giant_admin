import { NextResponse } from 'next/server'
import { checkCredentials } from '@/lib/auth'
import { COOKIE, createSession, cookieOptions } from '@/lib/session'

export async function POST(req) {
  const { email, password } = await req.json().catch(() => ({}))
  if (!checkCredentials(email, password)) {
    await new Promise((r) => setTimeout(r, 600)) // slow down guessing
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
  }
  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE, await createSession(), cookieOptions)
  return res
}
