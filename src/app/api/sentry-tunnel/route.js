import { NextResponse } from 'next/server'

const SENTRY_HOST = 'o4511024697966592.ingest.us.sentry.io'
const SENTRY_PROJECT_IDS = ['4511024703012864']

export async function POST(request) {
  try {
    const envelope = await request.text()
    const pieces = envelope.split('\n')
    const header = JSON.parse(pieces[0])

    const dsn = new URL(header.dsn)
    const project_id = dsn.pathname?.replace('/', '')

    if (dsn.hostname !== SENTRY_HOST) {
      throw new Error(`Invalid Sentry host: ${dsn.hostname}`)
    }

    if (!project_id || !SENTRY_PROJECT_IDS.includes(project_id)) {
      throw new Error(`Invalid Project ID: ${project_id}`)
    }

    const upstream_sentry_url = `https://${SENTRY_HOST}/api/${project_id}/envelope/`

    const response = await fetch(upstream_sentry_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-sentry-envelope',
      },
      body: envelope,
    })

    return new NextResponse(null, {
      status: response.status,
    })
  } catch (error) {
    console.error('Sentry tunnel error:', error)
    return new NextResponse('Bad Request', { status: 400 })
  }
}
