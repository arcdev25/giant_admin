// Edge-safe (used by middleware): only depends on `jose`.
import { SignJWT, jwtVerify } from 'jose'

export const COOKIE = 'job_admin_session'
const MAX_AGE = 60 * 60 * 24 * 7 // 7 days

const secret = () => new TextEncoder().encode(process.env.SESSION_SECRET || '')

export async function createSession() {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret())
}

export async function verifySession(token) {
  if (!token || !process.env.SESSION_SECRET) return false
  try {
    await jwtVerify(token, secret())
    return true
  } catch {
    return false
  }
}

export const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: MAX_AGE,
}
