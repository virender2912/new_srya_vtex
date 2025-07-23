// app/api/login/route.ts
import { NextRequest, NextResponse } from 'next/server'

const VTEX_ACCOUNT = 'iamtechiepartneruae'
const VTEX_ENVIRONMENT = 'vtexcommercestable'
const BASE_URL = `https://${VTEX_ACCOUNT}.${VTEX_ENVIRONMENT}.com.br`
const APP_KEY = process.env.VTEX_APP_KEY!
const APP_TOKEN = process.env.VTEX_APP_TOKEN!

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { step, email, token, code } = body

    // STEP 1: START
    if (step === 'start') {
      const res = await fetch(`${BASE_URL}/api/vtexid/pub/authentication/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          login: email,
          scope: 'myvtex',
        }),
      })

      const data = await res.json()
      return NextResponse.json({ token: data.authenticationToken })
    }

    // STEP 2: SEND OTP
    if (step === 'send') {
      const res = await fetch(`${BASE_URL}/api/vtexid/pub/authentication/accesskey/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Proxy-Authorization': `Basic ${Buffer.from(`${APP_KEY}:${APP_TOKEN}`).toString('base64')}`,
          'X-VTEX-API-AppKey': APP_KEY,
          'X-VTEX-API-AppToken': APP_TOKEN,
        },
        body: JSON.stringify({
          authenticationToken: token,
        }),
      })

      const data = await res.json()
      if (data?.authStatus === 'InvalidToken') {
        return NextResponse.json({ error: 'Invalid token', data }, { status: 400 })
      }

      return NextResponse.json({ message: 'OTP sent successfully', data })
    }

    // STEP 3: VALIDATE OTP
    if (step === 'validate') {
      const res = await fetch(`${BASE_URL}/api/vtexid/pub/authentication/accesskey/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          login: email,
          authenticationToken: token,
          accessKey: code,
        }),
      })

      const data = await res.json()
      if (data?.authStatus !== 'Success') {
        return NextResponse.json({ error: 'Invalid OTP', data }, { status: 401 })
      }

      return NextResponse.json({ message: 'OTP validated successfully', data })
    }

    return NextResponse.json({ error: 'Invalid step' }, { status: 400 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
