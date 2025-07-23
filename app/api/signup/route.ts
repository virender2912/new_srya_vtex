// /app/api/signup/route.ts
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { firstName, lastName, email, password, phone } = body

    console.log("Signup Body:", body)

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const VTEX_ACCOUNT = process.env.NEXT_PUBLIC_VTEX_ACCOUNT
    const VTEX_ENVIRONMENT = process.env.NEXT_PUBLIC_VTEX_ENVIRONMENT
    const APP_KEY = process.env.VTEX_API_APP_KEY!
    const APP_TOKEN = process.env.VTEX_API_APP_TOKEN!

    // VTEX ID customer creation
    const response = await fetch(
      `https://${VTEX_ACCOUNT}.${VTEX_ENVIRONMENT}.com.br/api/vtexid/pub/authentication/start?locale=en`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-VTEX-API-AppKey": APP_KEY,
          "X-VTEX-API-AppToken": APP_TOKEN,
        },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          phone,
          password,
        }),
      }
    )

    const responseText = await response.text()
    console.log("VTEX Response Status:", response.status)
    console.log("VTEX Response Text:", responseText)

    if (!response.ok) {
      return NextResponse.json(
        { error: "VTEX Error", details: responseText },
        { status: response.status }
      )
    }

    // ✅ Step 2: Insert into Master Data (CL)
    const mdRes = await fetch(
      `https://${VTEX_ACCOUNT}.${VTEX_ENVIRONMENT}.com.br/api/dataentities/CL/documents`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-VTEX-API-AppKey": APP_KEY,
          "X-VTEX-API-AppToken": APP_TOKEN,
        },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          phone,
          isNewsletterOptIn: true,
        }),
      }
    )

    const mdData = await mdRes.json()
    if (!mdRes.ok) {
      console.error("Failed to save in Master Data:", mdData)
      return NextResponse.json(
        { error: "Failed to save in Master Data", details: mdData },
        { status: mdRes.status }
      )
    }

    return NextResponse.json(
      { success: true, user: responseText, masterData: mdData },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Signup API Error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}
