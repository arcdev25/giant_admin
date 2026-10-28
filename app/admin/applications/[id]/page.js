'use client'
import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const fmt = (d) => new Date(d).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })

function Row({ label, value, link }) {
  if (!value) return null
  return (
    <div className="field">
      <label>{label}</label>
      <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: 14, wordBreak: 'break-word' }}>
        {link ? <a href={value} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--blue)' }}>{value}</a> : value}
      </div>
    </div>
  )
}

export default function ApplicationDetail({ params }) {
  const { id } = use(params)
  const router = useRouter()
  const [a, setA] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/applications/${id}`, { cache: 'no-store' })
      .then(async (r) => {
        const b = await r.json().catch(() => ({}))
        if (!r.ok) throw new Error(b.error || 'Failed to load.')
        setA(b.application)
      })
      .catch((e) => setError(e.message))
  }, [id])

  async function remove() {
    if (!confirm('Delete this application and its files? This cannot be undone.')) return
    setBusy(true)
    const res = await fetch(`/api/admin/applications/${id}`, { method: 'DELETE' })
    if (res.ok) {
      router.push('/admin/applications')
      router.refresh()
    } else {
      setError('Could not delete the application.')
      setBusy(false)
    }
  }

  return (
    <div className="wrap">
      <div className="topbar">
        <h1>{a ? `${a.first_name} ${a.last_name}` : 'Application'}</h1>
        <div className="row">
          <Link href="/admin/applications" className="btn">← Applications</Link>
          <button className="btn danger" onClick={remove} disabled={busy || !a}>Delete</button>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      {a && (
        <div className="card">
          <div className="meta" style={{ marginBottom: 18 }}>
            Applied for <strong style={{ color: 'var(--text)' }}>{a.role || '—'}</strong> · {fmt(a.created_at)}
          </div>

          <div className="row" style={{ marginBottom: 22 }}>
            {a.resume_path && (
              <a className="btn primary" href={`/api/admin/applications/${a.id}/file?type=resume`}>
                Download resume{a.resume_name ? ` (${a.resume_name})` : ''}
              </a>
            )}
            {a.photo_path && (
              <a className="btn" href={`/api/admin/applications/${a.id}/file?type=photo`} target="_blank" rel="noopener noreferrer">View photo</a>
            )}
          </div>

          <div className="grid2">
            <Row label="Email" value={a.email} />
            <Row label="Phone" value={a.phone} />
            <Row label="Location" value={a.location} />
            <Row label="LinkedIn" value={a.linkedin} link />
            <Row label="Portfolio" value={a.portfolio} link />
            <Row label="Expected salary" value={a.salary} />
            <Row label="Available from" value={a.start_date} />
            <Row label="Work authorization" value={a.work_auth} />
            <Row label="How they found us" value={a.referral} />
          </div>
          <Row label="Experience" value={a.experience} />
          <Row label="Why Devitech" value={a.why_us} />
          <Row label="Cover letter" value={a.cover_letter} />
        </div>
      )}
    </div>
  )
}
