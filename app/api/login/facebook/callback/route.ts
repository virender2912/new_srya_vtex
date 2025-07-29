import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID!
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET!

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.json({ error: 'Missing code' }, { status: 400 })
  }

  try {
    // Step 1: Exchange code for access token
    const tokenRes = await axios.get(
      `https://graph.facebook.com/v17.0/oauth/access_token`,
      {
        params: {
          client_id: FACEBOOK_APP_ID,
          client_secret: FACEBOOK_APP_SECRET,
          redirect_uri: 'http://localhost:3000/api/login/facebook/callback',
          code,
        },
      }
    )

    const accessToken = tokenRes.data.access_token

    // Step 2: Fetch user info
    const userRes = await axios.get(
      `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`
    )

    const user = userRes.data

    // Step 3: Save to VTEX Master Data (you implement this below)
    await saveToVtex(user)

    return NextResponse.redirect('http://localhost:3000/account') // or homepage
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to get access token', details: error.response?.data || error.message },
      { status: 500 }
    )
  }
}

// Save Facebook user to VTEX Master Data
async function saveToVtex(user: any) {
  const VTEX_ACCOUNT = process.env.VTEX_ACCOUNT!
  const VTEX_APP_KEY = process.env.VTEX_APP_KEY!
  const VTEX_APP_TOKEN = process.env.VTEX_APP_TOKEN!

  await fetch(`https://${VTEX_ACCOUNT}.vtexcommercestable.com.br/api/dataentities/CL/documents`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-VTEX-API-AppKey': VTEX_APP_KEY,
      'X-VTEX-API-AppToken': VTEX_APP_TOKEN,
    },
    body: JSON.stringify({
      email: user.email,
      firstName: user.name.split(' ')[0],
      lastName: user.name.split(' ')[1] || '',
      facebookId: user.id,
    }),
  })
}
