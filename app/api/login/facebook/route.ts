export async function GET() {
  const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID!
  const REDIRECT_URI = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000/api/login/facebook/callback'
    : 'https://new-srya-vtex.vercel.app/api/login/facebook/callback'

  const url = new URL('https://www.facebook.com/v17.0/dialog/oauth')
  url.searchParams.set('client_id', FACEBOOK_APP_ID)
  url.searchParams.set('redirect_uri', REDIRECT_URI)
  url.searchParams.set('state', 'secureRandomTokenHere') // Replace with real state if needed
  url.searchParams.set('scope', 'email,public_profile')

  return Response.redirect(url.toString())
}
