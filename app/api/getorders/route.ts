// app/api/orders/route.ts
import { NextResponse } from "next/server"

const VTEX_ACCOUNT = process.env.NEXT_PUBLIC_VTEX_ACCOUNT
const VTEX_ENVIRONMENT = process.env.NEXT_PUBLIC_VTEX_ENVIRONMENT
const VTEX_APP_KEY = process.env.VTEX_API_APP_KEY
const VTEX_APP_TOKEN = process.env.VTEX_API_APP_TOKEN

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 })
    }

    const res = await fetch(
      `https://${VTEX_ACCOUNT}.${VTEX_ENVIRONMENT}.com.br/api/oms/pvt/orders?q=${encodeURIComponent(email)}`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-VTEX-API-AppKey": VTEX_APP_KEY!,
          "X-VTEX-API-AppToken": VTEX_APP_TOKEN!,
        },
      }
    )

    if (!res.ok) {
      const error = await res.text()
      return NextResponse.json({ error }, { status: res.status })
    }

    const data = await res.json()
    // console.log('data',data)
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
