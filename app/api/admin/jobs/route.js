import { NextResponse } from 'next/server'
import { listJobs, createJob, storageMode } from '@/lib/db'
import { parseJob } from '@/lib/jobs'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    return NextResponse.json({ jobs: await listJobs(), storage: storageMode })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req) {
  const { data, error } = parseJob(await req.json().catch(() => ({})))
  if (error) return NextResponse.json({ error }, { status: 400 })
  try {
    return NextResponse.json({ job: await createJob(data) }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
