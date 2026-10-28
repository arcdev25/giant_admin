'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const router = useRouter()
  const [jobs, setJobs] = useState(null)
  const [storage, setStorage] = useState('')
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  async function load() {
    const res = await fetch('/api/admin/jobs', { cache: 'no-store' })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) return setError(body.error || 'Failed to load jobs.')
    setJobs(body.jobs)
    setStorage(body.storage)
  }
  useEffect(() => { load() }, [])

  async function toggle(job) {
    setBusyId(job.id)
    const res = await fetch(`/api/admin/jobs/${job.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !job.is_active }),
    })
    if (res.ok) setJobs((js) => js.map((j) => (j.id === job.id ? { ...j, is_active: !job.is_active } : j)))
    else setError('Could not update the job.')
    setBusyId(null)
  }

  async function remove(job) {
    if (!confirm(`Delete "${job.title}"? This cannot be undone.`)) return
    setBusyId(job.id)
    const res = await fetch(`/api/admin/jobs/${job.id}`, { method: 'DELETE' })
    if (res.ok) setJobs((js) => js.filter((j) => j.id !== job.id))
    else setError('Could not delete the job.')
    setBusyId(null)
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.replace('/login')
    router.refresh()
  }

  const activeCount = jobs?.filter((j) => j.is_active).length ?? 0

  return (
    <div className="wrap">
      <div className="topbar">
        <div>
          <h1>Job openings</h1>
          {jobs && <div className="meta">{activeCount} live on career page · {jobs.length - activeCount} disabled</div>}
        </div>
        <div className="row">
          <Link href="/admin/applications" className="btn">Applications</Link>
          <Link href="/admin/jobs/new" className="btn primary">+ Add job</Link>
          <button className="btn" onClick={logout}>Log out</button>
        </div>
      </div>

      {storage === 'local-file' && (
        <div className="notice">
          Supabase is not configured — jobs are saved to a local file (development only). Set SUPABASE_URL and
          SUPABASE_SERVICE_ROLE_KEY before deploying. See README.
        </div>
      )}
      {error && <p className="error">{error}</p>}

      <div className="card" style={{ padding: 0 }}>
        {jobs === null ? (
          <div className="empty">Loading…</div>
        ) : jobs.length === 0 ? (
          <div className="empty">No jobs yet. Click “Add job” to create your first opening.</div>
        ) : (
          jobs.map((job) => (
            <div className="job" key={job.id} style={{ opacity: job.is_active ? 1 : 0.6 }}>
              <div>
                <h3>
                  {job.title}
                  <span className={`badge ${job.is_active ? 'on' : 'off'}`}>{job.is_active ? 'Live' : 'Disabled'}</span>
                </h3>
                <div className="meta">{job.dept} · {job.location} · {job.type}</div>
              </div>
              <div className="row">
                <div className="togglerow" title={job.is_active ? 'Click to disable' : 'Click to enable'}>
                  <button
                    className={`switch ${job.is_active ? 'on' : ''}`}
                    onClick={() => toggle(job)}
                    disabled={busyId === job.id}
                    aria-label={job.is_active ? 'Disable job' : 'Enable job'}
                  />
                </div>
                <Link href={`/admin/jobs/${job.id}`} className="btn sm">Edit</Link>
                <button className="btn sm danger" onClick={() => remove(job)} disabled={busyId === job.id}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
