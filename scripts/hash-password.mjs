// Usage: npm run hash -- "YourPassword"
// Prints a value for ADMIN_PASSWORD_HASH in .env.local
import { randomBytes, scryptSync } from 'node:crypto'

const pw = process.argv[2]
if (!pw) {
  console.error('Usage: npm run hash -- "YourPassword"')
  process.exit(1)
}
const salt = randomBytes(16).toString('hex')
const hash = scryptSync(pw, salt, 64).toString('hex')
console.log(`ADMIN_PASSWORD_HASH=${salt}:${hash}`)
