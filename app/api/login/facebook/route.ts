// Initiates the login by redirecting to Facebook OAuth
import { NextResponse } from 'next/server'

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID!

export async function GET() {
  const redirectUri = 'http://localhost:3000/api/login/facebook/callback'
  const state = 'secureRandomToken'

  const facebookAuthUrl = `https://www.facebook.com/v17.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${redirectUri}&state=${state}&scope=email,public_profile`

  return NextResponse.redirect(facebookAuthUrl)
}
