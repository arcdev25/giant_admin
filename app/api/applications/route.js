import { NextResponse } from 'next/server'
import { createApplication } from '@/lib/applications'

export const dynamic = 'force-dynamic'

import { corsHeaders } from '@/lib/jobs'

export const OPTIONS = (req) => new NextResponse(null, { status: 204, headers: corsHeaders(req, 'POST, OPTIONS') })

// Public: the company site's apply form posts multipart/form-data here.
export async function POST(req) {
  const cors = corsHeaders(req, 'POST, OPTIONS')
  let form
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data.' }, { status: 400, headers: cors })
  }
  // honeypot: real users never fill this hidden field
  if (String(form.get('website') || '').trim()) return NextResponse.json({ ok: true }, { headers: cors })

  try {
    const result = await createApplication(form)
    if (result.error) return NextResponse.json({ error: result.error }, { status: 400, headers: cors })
    return NextResponse.json({ ok: true, id: result.id }, { status: 201, headers: cors })
  } catch (e) {
    console.error('application error:', e.message)
    return NextResponse.json({ error: 'Could not save your application. Please try again.' }, { status: 500, headers: cors })
  }
}
