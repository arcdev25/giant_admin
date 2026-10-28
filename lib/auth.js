// Node-only: password check for the login route.
import { scryptSync, timingSafeEqual } from 'node:crypto'

export function checkCredentials(email, password) {
  const [salt, hash] = (process.env.ADMIN_PASSWORD_HASH || '').split(':')
  if (!salt || !hash || !process.env.ADMIN_EMAIL) return false
  const emailOk = String(email || '').trim().toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase()
  const expected = Buffer.from(hash, 'hex')
  const actual = scryptSync(String(password || ''), salt, expected.length)
  // always run the hash compare so timing doesn't reveal whether the email matched
  return timingSafeEqual(actual, expected) && emailOk
}
