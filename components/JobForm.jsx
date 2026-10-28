'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DEPARTMENTS, JOB_TYPES } from '@/lib/jobs'

const lines = (arr) => (arr || []).join('\n')

export default function JobForm({ job }) {
  const router = useRouter()
  const editing = !!job
  const [f, setF] = useState({
    title: job?.title || '',
    dept: job?.dept || DEPARTMENTS[0],
    location: job?.location || 'Remote',
    type: job?.type || JOB_TYPES[0],
    about_us: job?.about_us || '',
    responsibilities: lines(job?.responsibilities),
    requirements: lines(job?.requirements),
    nice_to_have: lines(job?.nice_to_have),
    benefits: lines(job?.benefits),
    is_active: job?.is_active ?? true,
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const res = await fetch(editing ? `/api/admin/jobs/${job.id}` : '/api/admin/jobs', {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(f),
    })
    if (res.ok) {
      router.push('/admin')
      router.refresh()
    } else {
      const body = await res.json().catch(() => ({}))
      setError(body.error || 'Could not save the job.')
      setBusy(false)
    }
  }

  const listField = (key, label, placeholder) => (
    <div className="field">
      <label>{label} <span className="hint">— one item per line</span></label>
      <textarea rows={6} value={f[key]} onChange={set(key)} placeholder={placeholder} />
    </div>
  )

  return (
    <form className="wrap" onSubmit={submit}>
      <div className="topbar">
        <h1>{editing ? 'Edit job' : 'Add job'}</h1>
        <Link href="/admin" className="btn">← Back</Link>
      </div>

      <div className="card">
        {error && <p className="error">{error}</p>}

        <div className="field">
          <label>Job title</label>
          <input value={f.title} onChange={set('title')} placeholder="e.g. Senior Backend Engineer" required />
        </div>

        <div className="grid3">
          <div className="field">
            <label>Department</label>
            <select value={f.dept} onChange={set('dept')}>
              {[...new Set([...DEPARTMENTS, f.dept])].map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Location</label>
            <input value={f.location} onChange={set('location')} placeholder="Remote" />
          </div>
          <div className="field">
            <label>Type</label>
            <select value={f.type} onChange={set('type')}>
              {[...new Set([...JOB_TYPES, f.type])].map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="field">
          <label>About us</label>
          <textarea rows={4} value={f.about_us} onChange={set('about_us')} placeholder="A short intro about the company and this role." />
        </div>

        {listField('responsibilities', "What you'll do", 'Own the growth product roadmap\nRun A/B experiments')}
        {listField('requirements', "What we're looking for", '3+ years of experience\nStrong communication skills')}
        {listField('nice_to_have', 'Nice to have', 'Experience at a startup')}
        {listField('benefits', 'What we offer', 'Remote-first\nCompetitive salary')}

        <div className="field togglerow">
          <button
            type="button"
            className={`switch ${f.is_active ? 'on' : ''}`}
            onClick={() => setF((s) => ({ ...s, is_active: !s.is_active }))}
            aria-label="Toggle live"
          />
          <span>{f.is_active ? 'Live — shown on the career page' : 'Disabled — hidden from the career page'}</span>
        </div>

        <div className="row">
          <button className="btn primary" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Create job'}</button>
          <Link href="/admin" className="btn">Cancel</Link>
        </div>
      </div>
    </form>
  )
}
