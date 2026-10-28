import { NextResponse } from 'next/server'
import { listJobs } from '@/lib/db'
import { toPublic, corsHeaders } from '@/lib/jobs'

export const dynamic = 'force-dynamic'

export const OPTIONS = (req) => new NextResponse(null, { status: 204, headers: corsHeaders(req) })

// Public: ACTIVE jobs only, as { jobs: [...] } — what the company site's useJobs() reads.
// (An `admin_name` query param sent by the site is accepted and ignored.)
export async function GET(req) {
  try {
    const jobs = (await listJobs({ onlyActive: true })).map(toPublic)
    return NextResponse.json({ jobs }, { headers: corsHeaders(req) })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500, headers: corsHeaders(req) })
  }
}
