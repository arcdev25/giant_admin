import { NextResponse } from 'next/server'
import { listApplications } from '@/lib/applications'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    return NextResponse.json({ applications: await listApplications() })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
