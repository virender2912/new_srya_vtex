import { type NextRequest, NextResponse } from "next/server"
import { VTEX_ENDPOINTS, vtexHeaders } from "@/lib/vtex-api"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderFormId: string }> }
) {
  try {
    const { orderFormId } = await params

    const response = await fetch(VTEX_ENDPOINTS.orderForm(orderFormId), {
      method: "GET",
      headers: vtexHeaders,
    })

    if (!response.ok) {
      throw new Error(`VTEX API error: ${response.status}`)
    }

    const orderForm = await response.json()
    return NextResponse.json(orderForm)
  } catch (error) {
    console.error("Error fetching orderForm:", error)
    return NextResponse.json({ error: "Failed to fetch orderForm" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderFormId: string }> }
) {
  try {
    const { orderFormId } = await params
    const body = await request.json()
    const locale = body.locale || "en-US"

    const response = await fetch(
      `${VTEX_ENDPOINTS.orderForm(orderFormId)}/clientPreferencesData`,
      {
        method: "PUT",
        headers: vtexHeaders,
        body: JSON.stringify({ locale }),
      }
    )

    if (!response.ok) {
      throw new Error(`VTEX API error: ${response.status}`)
    }

    const updatedOrderForm = await response.json()
    return NextResponse.json(updatedOrderForm)
  } catch (error) {
    console.error("Error updating orderForm locale:", error)
    return NextResponse.json({ error: "Failed to update orderForm locale" }, { status: 500 })
  }
} 