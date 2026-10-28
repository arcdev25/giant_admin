import { NextResponse } from 'next/server'
import { getApplication, deleteApplication } from '@/lib/applications'

export const dynamic = 'force-dynamic'

export async function GET(_req, { params }) {
  const { id } = await params
  try {
    const application = await getApplication(id)
    return application
      ? NextResponse.json({ application })
      : NextResponse.json({ error: 'Not found' }, { status: 404 })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(_req, { params }) {
  const { id } = await params
  try {
    const ok = await deleteApplication(id)
    return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'Not found' }, { status: 404 })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
