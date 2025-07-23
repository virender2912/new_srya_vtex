// POST /api/login/send
export async function POST(req: Request) {
  const { token } = await req.json()

  const response = await fetch(`https://iamtechiepartneruae.vtexcommercestable.com.br/api/vtexid/pub/authentication/accesskey/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Proxy-Authorization': token,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    return Response.json({ error: 'Failed to send OTP', data }, { status: 400 })
  }

  return Response.json({ success: true })
}
