import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  }

  const vtexAccount = 'iamtechiepartneruae'
  const vtexEnv = 'vtexcommercestable'
  const appKey = process.env.VTEX_APP_KEY!
  const appToken = process.env.VTEX_APP_TOKEN!

  const url = `https://${vtexAccount}.${vtexEnv}.com.br/api/dataentities/CL/search?_fields=id,firstName,lastName,email,userId&_where=userId=${userId}`

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'X-VTEX-API-AppKey': appKey,
        'X-VTEX-API-AppToken': appToken,
      },
    })

    const data = await response.json()
    return NextResponse.json(data[0] || {}, { status: 200 })
  } catch (error) {
    console.error('❌ Failed to fetch customer:', error)
    return NextResponse.json({ error: 'Failed to fetch customer' }, { status: 500 })
  }
}
