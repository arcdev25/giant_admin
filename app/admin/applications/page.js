'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const fmt = (d) => new Date(d).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })

export default function Applications() {
  const [apps, setApps] = useState(null)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  useEffect(() => {
    fetch('/api/admin/applications', { cache: 'no-store' })
      .then(async (r) => {
        const b = await r.json().catch(() => ({}))
        if (!r.ok) throw new Error(b.error || 'Failed to load applications.')
        setApps(b.applications)
      })
      .catch((e) => setError(e.message))
  }, [])

  async function remove(a) {
    if (!confirm(`Delete the application from ${a.first_name} ${a.last_name}? Their resume file is deleted too. This cannot be undone.`)) return
    setBusyId(a.id)
    const res = await fetch(`/api/admin/applications/${a.id}`, { method: 'DELETE' })
    if (res.ok) setApps((l) => l.filter((x) => x.id !== a.id))
    else setError('Could not delete the application.')
    setBusyId(null)
  }

  return (
    <div className="wrap">
      <div className="topbar">
        <div>
          <h1>Applications</h1>
          {apps && <div className="meta">{apps.length} received</div>}
        </div>
        <div className="row">
          <Link href="/admin" className="btn">← Jobs</Link>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="card" style={{ padding: 0 }}>
        {apps === null && !error ? (
          <div className="empty">Loading…</div>
        ) : apps && apps.length === 0 ? (
          <div className="empty">No applications yet.</div>
        ) : (
          apps?.map((a) => (
            <div className="job" key={a.id}>
              <Link href={`/admin/applications/${a.id}`} style={{ flex: 1, minWidth: 220 }}>
                <h3>{a.first_name} {a.last_name}</h3>
                <div className="meta">{a.role || 'No role'} · {a.email} · {fmt(a.created_at)}</div>
              </Link>
              <div className="row">
                <Link href={`/admin/applications/${a.id}`} className="btn sm">View</Link>
                <button className="btn sm danger" onClick={() => remove(a)} disabled={busyId === a.id}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
