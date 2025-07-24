import { type NextRequest, NextResponse } from "next/server"
import { VTEX_ENDPOINTS, vtexHeaders } from "@/lib/vtex-api"

export async function PATCH(request: NextRequest) {
  try {
    const { orderFormId, itemIndex, quantity } = await request.json()

    const response = await fetch(VTEX_ENDPOINTS.updateItems(orderFormId), {
      method: "POST",
      headers: vtexHeaders,
      body: JSON.stringify({
        orderItems: [
          {
            index: itemIndex,
             quantity: quantity,
          },
        ],
      }),
    })

    if (!response.ok) {
      throw new Error(`VTEX API error: ${response.status}`)
    }

    const updatedOrderForm = await response.json()
    return NextResponse.json(updatedOrderForm)
  } catch (error) {
    console.error("Error updating item quantity:", error)
    return NextResponse.json({ error: "Failed to update item quantity" }, { status: 500 })
  }
} 