export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  if (!code) {
    return new Response('No code returned from Facebook', { status: 400 })
  }

  const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID!
  const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET!
  const REDIRECT_URI = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000/api/login/facebook/callback'
    : 'https://new-srya-vtex.vercel.app/api/login/facebook/callback'

  // Exchange code for access token
  const tokenRes = await fetch(`https://graph.facebook.com/v17.0/oauth/access_token?client_id=${FACEBOOK_APP_ID}&redirect_uri=${REDIRECT_URI}&client_secret=${FACEBOOK_APP_SECRET}&code=${code}`)
  const tokenData = await tokenRes.json()

  if (!tokenData.access_token) {
    return new Response('Failed to get access token from Facebook', { status: 400 })
  }

  // Get user info
  const userRes = await fetch(`https://graph.facebook.com/me?fields=id,name,email&access_token=${tokenData.access_token}`)
  const userData = await userRes.json()

  // 🔐 You can now use userData to log into VTEX or create a session
  console.log('Facebook User:', userData)

  // Redirect to homepage or account page
  return Response.redirect('/account')
}
