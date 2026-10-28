import { NextResponse } from 'next/server'
import { getJob, updateJob, deleteJob } from '@/lib/db'
import { parseJob } from '@/lib/jobs'

export const dynamic = 'force-dynamic'
const fail = (e) => NextResponse.json({ error: e.message }, { status: 500 })
const notFound = () => NextResponse.json({ error: 'Not found' }, { status: 404 })

export async function GET(_req, { params }) {
  const { id } = await params
  try {
    const job = await getJob(id)
    return job ? NextResponse.json({ job }) : notFound()
  } catch (e) {
    return fail(e)
  }
}

// Full edit
export async function PUT(req, { params }) {
  const { id } = await params
  const { data, error } = parseJob(await req.json().catch(() => ({})))
  if (error) return NextResponse.json({ error }, { status: 400 })
  try {
    const job = await updateJob(id, data)
    return job ? NextResponse.json({ job }) : notFound()
  } catch (e) {
    return fail(e)
  }
}

// Enable / disable
export async function PATCH(req, { params }) {
  const { id } = await params
  const { is_active } = await req.json().catch(() => ({}))
  if (typeof is_active !== 'boolean') {
    return NextResponse.json({ error: 'is_active must be boolean' }, { status: 400 })
  }
  try {
    const job = await updateJob(id, { is_active })
    return job ? NextResponse.json({ job }) : notFound()
  } catch (e) {
    return fail(e)
  }
}

export async function DELETE(_req, { params }) {
  const { id } = await params
  try {
    await deleteJob(id)
    return NextResponse.json({ ok: true })
  } catch (e) {
    return fail(e)
  }
}
