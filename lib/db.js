// Storage layer. Uses Supabase (Postgres) when SUPABASE_URL is set; otherwise
// falls back to a local JSON file so you can try the app without any setup
// (local dev only — Vercel's filesystem is read-only).
import { createClient } from '@supabase/supabase-js'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'

export const useSupabase = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
let client
export const sb = () =>
  (client ??= createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  }))

const FILE = path.join(process.cwd(), 'data', 'jobs.json')
const readFile = async () => {
  try {
    return JSON.parse(await fs.readFile(FILE, 'utf8'))
  } catch {
    return []
  }
}
const writeFile = async (rows) => {
  await fs.mkdir(path.dirname(FILE), { recursive: true })
  await fs.writeFile(FILE, JSON.stringify(rows, null, 2))
}

const check = ({ data, error }) => {
  if (error) throw new Error(error.message)
  return data
}

export const storageMode = useSupabase ? 'supabase' : 'local-file'

export async function listJobs({ onlyActive = false } = {}) {
  if (useSupabase) {
    let q = sb().from('jobs').select('*').order('created_at', { ascending: false })
    if (onlyActive) q = q.eq('is_active', true)
    return check(await q)
  }
  const rows = (await readFile()).sort((a, b) => b.created_at.localeCompare(a.created_at))
  return onlyActive ? rows.filter((r) => r.is_active) : rows
}

export async function getJob(id) {
  if (useSupabase) return check(await sb().from('jobs').select('*').eq('id', id).maybeSingle())
  return (await readFile()).find((r) => r.id === id) || null
}

export async function createJob(data) {
  if (useSupabase) return check(await sb().from('jobs').insert(data).select().single())
  const rows = await readFile()
  const now = new Date().toISOString()
  const row = { id: randomUUID(), ...data, created_at: now, updated_at: now }
  await writeFile([row, ...rows])
  return row
}

export async function updateJob(id, data) {
  const patch = { ...data, updated_at: new Date().toISOString() }
  if (useSupabase) return check(await sb().from('jobs').update(patch).eq('id', id).select().maybeSingle())
  const rows = await readFile()
  const i = rows.findIndex((r) => r.id === id)
  if (i < 0) return null
  rows[i] = { ...rows[i], ...patch }
  await writeFile(rows)
  return rows[i]
}

export async function deleteJob(id) {
  if (useSupabase) {
    check(await sb().from('jobs').delete().eq('id', id))
    return
  }
  await writeFile((await readFile()).filter((r) => r.id !== id))
}
