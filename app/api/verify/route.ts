import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, code } = body

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 })
    }

    // Step 1: Validate OTP via VTEX Auth API
    const loginRes = await fetch(
      `https://iamtechiepartneruae.vtexcommercestable.com.br/api/vtexid/pub/authentication/start?locale=en`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          login: email,
          authToken: code,
          authType: 'email',
        }),
      }
    )

    if (!loginRes.ok) {
      const text = await loginRes.text()
      return NextResponse.json({ error: 'Invalid OTP or email', raw: text }, { status: 401 })
    }

    // Step 2: Extract VTEX auth cookie
    const setCookie = loginRes.headers.get('set-cookie')
    if (!setCookie) {
      return NextResponse.json({ error: 'No authentication cookie received' }, { status: 500 })
    }

    // Step 3: Get session from Audience API
    const audienceRes = await fetch(
      'https://iamtechiepartneruae.vtexcommercestable.com.br/api/audience-manager/pvt/audience',
      {
        method: 'GET',
        headers: {
          Cookie: setCookie,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    )

    if (!audienceRes.ok) {
      const text = await audienceRes.text()
      return NextResponse.json({ error: 'Failed to get VTEX session', raw: text }, { status: 401 })
    }

    const audienceData = await audienceRes.json()
    const userId = audienceData?.userId

    if (!userId) {
      return NextResponse.json({ error: 'userId not found in audience response' }, { status: 500 })
    }

    // Step 4: Fetch user data from Master Data
    const masterDataRes = await fetch(
      `https://iamtechiepartneruae.vtexcommercestable.com.br/api/dataentities/CL/search?_fields=id,firstName,lastName,email,userId&_where=userId=${userId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-VTEX-API-AppKey': process.env.VTEX_APP_KEY || '',
          'X-VTEX-API-AppToken': process.env.VTEX_APP_TOKEN || '',
        },
      }
    )

    if (!masterDataRes.ok) {
      const text = await masterDataRes.text()
      return NextResponse.json({ error: 'Failed to fetch customer data', raw: text }, { status: 500 })
    }

    const customerData = await masterDataRes.json()

    // Step 5: Final response with cookie
    const responseBody = {
      success: true,
      message: 'OTP verified successfully',
      user: customerData?.[0] || {},
    }

    return new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': setCookie, // Important to keep user logged in
      },
    })
  } catch (error: any) {
    console.error('OTP Verify Error:', error)
    return NextResponse.json(
      { error: error?.message || 'Something went wrong during OTP verification' },
      { status: 500 }
    )
  }
}
