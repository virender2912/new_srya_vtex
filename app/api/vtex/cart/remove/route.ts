import { type NextRequest, NextResponse } from "next/server"
import { VTEX_ENDPOINTS, vtexHeaders } from "@/lib/vtex-api"

export async function DELETE(request: NextRequest) {
  try {
    const { orderFormId, itemIndex } = await request.json()

    // First, get the current orderForm to find the item details
    const orderFormResponse = await fetch(VTEX_ENDPOINTS.orderForm(orderFormId), {
      method: "GET",
      headers: vtexHeaders,
    })

    if (!orderFormResponse.ok) {
      throw new Error(`Failed to get orderForm: ${orderFormResponse.status}`)
    }

    const orderForm = await orderFormResponse.json()
    const itemToRemove = orderForm.items[itemIndex]

    if (!itemToRemove) {
      throw new Error("Item not found in cart")
    }

    // Remove the item by setting its quantity to 0
    const response = await fetch(VTEX_ENDPOINTS.removeItems(orderFormId), {
      method: "POST",
      headers: vtexHeaders,
      body: JSON.stringify({
        orderItems: [
          {
            index: itemIndex,
            quantity: 0,
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
    console.error("Error removing item from cart:", error)
    return NextResponse.json({ error: "Failed to remove item from cart" }, { status: 500 })
  }
} 