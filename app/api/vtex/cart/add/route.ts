import { type NextRequest, NextResponse } from "next/server"
import { VTEX_ENDPOINTS, vtexHeaders, VTEX_CONFIG } from "@/lib/vtex-api"

export async function POST(request: NextRequest) {
  try {
    const { orderFormId, items } = await request.json()

    // Restore original POST handler to only use VTEX API for adding items to cart. Remove fallback logic.
    let response: Response

    // First, let's validate the order form exists and is valid
    console.log("Validating order form:", orderFormId)
    const validateResponse = await fetch(VTEX_ENDPOINTS.orderForm(orderFormId), {
      method: "GET",
      headers: vtexHeaders,
    })

    if (!validateResponse.ok) {
      console.log("Order form validation failed, creating new order form")
      // If the order form is invalid, create a new one
      const newOrderFormResponse = await fetch(VTEX_ENDPOINTS.orderForm(), {
        method: "POST",
        headers: vtexHeaders,
        body: JSON.stringify({
          clientPreferencesData: {
            locale: "en-US"
          }
        }),
      })

      if (!newOrderFormResponse.ok) {
        const errorText = await newOrderFormResponse.text()
        throw new Error(`Failed to create new order form: ${newOrderFormResponse.status} - ${errorText}`)
      }

      const newOrderForm = await newOrderFormResponse.json()
      console.log("Created new order form:", newOrderForm.orderFormId)
      
      // Now add items to the new order form
      const addItemsUrl = VTEX_ENDPOINTS.addItems(newOrderForm.orderFormId)
      console.log("Making VTEX API call to:", addItemsUrl)
      console.log("Request body:", JSON.stringify({
        orderItems: items.map((item: any) => ({
          id: item.id,
          quantity: item.quantity,
          seller: item.seller || "1",
        }))
      }, null, 2))

      response = await fetch(addItemsUrl, {
        method: "POST",
        headers: vtexHeaders,
        body: JSON.stringify({
          orderItems: items.map((item: any) => ({
            id: item.id,
            quantity: item.quantity,
            seller: item.seller || "1",
          }))
        }),
      })
    } else {
      console.log("Order form is valid, adding items to existing order form")
      console.log("Making VTEX API call to:", VTEX_ENDPOINTS.addItems(orderFormId))
      console.log("Request body:", JSON.stringify({
        orderItems: items.map((item: any) => ({
          id: item.id,
          quantity: item.quantity,
          seller: item.seller || "1",
        }))
      }, null, 2))

      response = await fetch(VTEX_ENDPOINTS.addItems(orderFormId), {
        method: "POST",
        headers: vtexHeaders,
        body: JSON.stringify({
          orderItems: items.map((item: any) => ({
            id: item.id,
            quantity: item.quantity,
            seller: item.seller || "1",
          }))
        }),
      })
    }

    console.log("VTEX API response status:", response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error("VTEX API error response:", errorText)
      throw new Error(`VTEX API error: ${response.status} - ${errorText}`)
    }

    const updatedOrderForm = await response.json()
    console.log("VTEX API success response:", JSON.stringify(updatedOrderForm, null, 2))
    console.log("OrderForm items after adding:", updatedOrderForm.items?.map((item: any) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity
    })))
    return NextResponse.json(updatedOrderForm)
  } catch (error) {
    console.error("Error adding items to cart:", error)
    return NextResponse.json({ error: "Failed to add items to cart" }, { status: 500 })
  }
} 