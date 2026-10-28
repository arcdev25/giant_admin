// Candidate applications. Requires Supabase (rows in `applications`, files in a private storage bucket).
import { randomUUID } from 'node:crypto'
import { sb, useSupabase } from './db'

const BUCKET = 'applications'
export const MAX_RESUME = 4 * 1024 * 1024 // Vercel functions accept ~4.5 MB request bodies
export const MAX_TOTAL = 4.2 * 1024 * 1024
const RESUME_EXT = ['pdf', 'doc', 'docx']
const PHOTO_EXT = ['jpg', 'jpeg', 'png', 'webp']

const TEXT_FIELDS = [
  'role', 'first_name', 'last_name', 'email', 'phone', 'location', 'linkedin', 'portfolio',
  'experience', 'why_us', 'cover_letter', 'salary', 'start_date', 'referral', 'work_auth', 'job_id',
]

export const requireSupabase = () => {
  if (!useSupabase) throw new Error('Applications need Supabase. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.')
}

let bucketReady = false
async function ensureBucket() {
  if (bucketReady) return
  const { error } = await sb().storage.createBucket(BUCKET, { public: false })
  if (error && !/already exists/i.test(error.message)) throw new Error(error.message)
  bucketReady = true
}

const ext = (name) => String(name || '').split('.').pop().toLowerCase()
const safe = (name) => String(name || 'file').replace(/[^\w.\-]+/g, '_').slice(-80)

async function upload(folder, kind, file) {
  const path = `${folder}/${kind}-${safe(file.name)}`
  const { error } = await sb()
    .storage.from(BUCKET)
    .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type || undefined })
  if (error) throw new Error(error.message)
  return path
}

/** Validate FormData from the public form, store files + row. Returns { error } or { id }. */
export async function createApplication(form) {
  requireSupabase()
  const row = {}
  for (const k of TEXT_FIELDS) row[k] = String(form.get(k) ?? '').trim().slice(0, 5000)
  if (!row.first_name || !row.last_name) return { error: 'Name is required.' }
  if (!/\S+@\S+\.\S+/.test(row.email)) return { error: 'A valid email is required.' }

  const resume = form.get('resume')
  const photo = form.get('photo')
  const hasResume = resume && typeof resume === 'object' && resume.size > 0
  const hasPhoto = photo && typeof photo === 'object' && photo.size > 0

  if (!hasResume) return { error: 'Please attach your resume.' }
  if (!RESUME_EXT.includes(ext(resume.name))) return { error: 'Resume must be a PDF, DOC or DOCX file.' }
  if (resume.size > MAX_RESUME) return { error: 'Resume is too large (max 4 MB).' }

  // The photo is optional: silently skip it if it's the wrong type or would push the upload too large.
  const keepPhoto = hasPhoto && PHOTO_EXT.includes(ext(photo.name)) && resume.size + photo.size <= MAX_TOTAL

  await ensureBucket()
  const folder = randomUUID()
  const resume_path = await upload(folder, 'resume', resume)
  const photo_path = keepPhoto ? await upload(folder, 'photo', photo) : null

  const { data, error } = await sb()
    .from('applications')
    .insert({ ...row, resume_name: resume.name, resume_path, photo_path })
    .select('id')
    .single()
  if (error) {
    await sb().storage.from(BUCKET).remove([resume_path, photo_path].filter(Boolean))
    throw new Error(error.message)
  }
  return { id: data.id }
}

export async function listApplications() {
  requireSupabase()
  const { data, error } = await sb().from('applications').select('*').order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

export async function getApplication(id) {
  requireSupabase()
  const { data, error } = await sb().from('applications').select('*').eq('id', id).maybeSingle()
  if (error) throw new Error(error.message)
  return data
}

export async function deleteApplication(id) {
  requireSupabase()
  const app = await getApplication(id)
  if (!app) return false
  const files = [app.resume_path, app.photo_path].filter(Boolean)
  if (files.length) await sb().storage.from(BUCKET).remove(files)
  const { error } = await sb().from('applications').delete().eq('id', id)
  if (error) throw new Error(error.message)
  return true
}

/** Short-lived download link for a stored file. */
export async function signedUrl(path, downloadName) {
  const { data, error } = await sb().storage.from(BUCKET).createSignedUrl(path, 120, downloadName ? { download: downloadName } : undefined)
  if (error) throw new Error(error.message)
  return data.signedUrl
}
