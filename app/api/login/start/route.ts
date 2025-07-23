import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    const response = await fetch(
      'https://iamtechiepartneruae.vtexcommercestable.com.br/api/vtexid/pub/authentication/start',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
           login: email,
          authenticator: 'accesskey', 
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      //return NextResponse.json({ error: 'Failed to start login', data }, { status: response.status })


console.error("❌ Failed to get token from /start", response)
      return NextResponse.json({ error: 'Failed to get token', details: response }, { status: 400 })

    }

    return NextResponse.json({ token: data.authenticationToken }) // ✅ Return this token
  } catch (err) {
    console.error('Start error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
