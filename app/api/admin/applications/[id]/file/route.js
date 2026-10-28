import { NextResponse } from 'next/server'
import { getApplication, signedUrl } from '@/lib/applications'

export const dynamic = 'force-dynamic'

// /api/admin/applications/:id/file?type=resume|photo  ->  redirect to a short-lived private link
export async function GET(req, { params }) {
  const { id } = await params
  const type = new URL(req.url).searchParams.get('type') === 'photo' ? 'photo' : 'resume'
  try {
    const app = await getApplication(id)
    const path = app && (type === 'photo' ? app.photo_path : app.resume_path)
    if (!path) return NextResponse.json({ error: 'File not found' }, { status: 404 })
    const name = type === 'resume' ? app.resume_name : undefined
    return NextResponse.redirect(await signedUrl(path, name))
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
