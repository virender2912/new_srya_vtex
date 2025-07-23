import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { otp, token } = await req.json()

  const response = await fetch('https://iamtechiepartneruae.vtexcommercestable.com.br/api/vtexid/pub/authentication/finish', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      authenticationToken: token,
      authCode: otp,
    }),
  })

  const data = await response.json()

  if (data.authStatus === 'Success') {
    return NextResponse.json({ message: 'Login successful', data })
  } else {
    return NextResponse.json({ error: 'Invalid OTP', details: data }, { status: 400 })
  }
}
