import { type NextRequest, NextResponse } from "next/server"
import { VTEX_ENDPOINTS, vtexHeaders } from "@/lib/vtex-api"

export async function DELETE(request: NextRequest) {
  try {
    const { orderFormId } = await request.json()

    const response = await fetch(VTEX_ENDPOINTS.removeItems(orderFormId), {
      method: "POST",
      headers: vtexHeaders,
      body: JSON.stringify({
        orderItems: [],
      }),
    })

    if (!response.ok) {
      throw new Error(`VTEX API error: ${response.status}`)
    }

    const updatedOrderForm = await response.json()
    return NextResponse.json(updatedOrderForm)
  } catch (error) {
    console.error("Error clearing cart:", error)
    return NextResponse.json({ error: "Failed to clear cart" }, { status: 500 })
  }
} 