export const DEPARTMENTS = ['Engineering', 'Product', 'Design', 'Marketing', 'Operations']
export const JOB_TYPES = ['Full-time', 'Part-time', 'Full-time / Part-time', 'Contract', 'Internship']

const list = (v) =>
  (Array.isArray(v) ? v : String(v || '').split('\n'))
    .map((s) => String(s).trim())
    .filter(Boolean)

/** Validate + normalise a job payload coming from the admin form. */
export function parseJob(body) {
  const title = String(body.title || '').trim()
  if (!title) return { error: 'Job title is required.' }
  return {
    data: {
      title,
      dept: String(body.dept || 'Engineering').trim(),
      location: String(body.location || 'Remote').trim(),
      type: String(body.type || 'Full-time').trim(),
      about_us: String(body.about_us || '').trim(),
      about_role: String(body.about_role || '').trim(),
      responsibilities: list(body.responsibilities),
      requirements: list(body.requirements),
      nice_to_have: list(body.nice_to_have),
      benefits: list(body.benefits),
      is_active: body.is_active !== false,
    },
  }
}

/** Shape the company website already understands (`summary` = About us). */
export function toPublic(j) {
  return {
    id: j.id,
    title: j.title,
    dept: j.dept,
    location: j.location,
    type: j.type,
    is_active: true,
    summary: j.about_us,
    about_role: j.about_role || '',
    responsibilities: j.responsibilities,
    requirements: j.requirements,
    nice_to_have: j.nice_to_have,
    benefits: j.benefits,
    created_at: j.created_at,
    updated_at: j.updated_at,
  }
}

// ALLOWED_ORIGIN may be "*" or a comma-separated list, e.g. "https://devitech.us,https://www.devitech.us"
export function corsHeaders(req, methods = 'GET, OPTIONS') {
  const allowed = (process.env.ALLOWED_ORIGIN || '*').split(',').map((s) => s.trim()).filter(Boolean)
  const origin = req?.headers?.get('origin') || ''
  const allow = allowed.includes('*') ? '*' : allowed.includes(origin) ? origin : allowed[0]
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': methods,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-store',
    Vary: 'Origin',
  }
}
