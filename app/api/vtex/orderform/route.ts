import { type NextRequest, NextResponse } from "next/server"
import { VTEX_ENDPOINTS, vtexHeaders, VTEX_CONFIG, hasVTEXCredentials } from "@/lib/vtex-api"

// Restore original POST handler to only use VTEX API for orderform creation. Remove fallback logic.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items } = body

    console.log("Creating order form with items:", items)
    console.log("VTEX Config:", {
      account: VTEX_CONFIG.accountName,
      environment: VTEX_CONFIG.environment,
      hasAppKey: !!VTEX_CONFIG.appKey,
      hasAppToken: !!VTEX_CONFIG.appToken,
      hasCredentials: hasVTEXCredentials,
    })

    if (!hasVTEXCredentials) {
      console.warn("VTEX API credentials not configured. Order form creation will fail.")
      return NextResponse.json({ 
        error: "VTEX API credentials are required for order form creation",
        details: "Please set VTEX_APP_KEY and VTEX_APP_TOKEN environment variables",
        config: {
          account: VTEX_CONFIG.accountName,
          environment: VTEX_CONFIG.environment,
          hasCredentials: false
        }
      }, { status: 500 })
    }

    const orderFormUrl = VTEX_ENDPOINTS.orderForm()
    console.log("Order form URL:", orderFormUrl)

    const orderFormResponse = await fetch(orderFormUrl, {
      method: "POST",
      headers: vtexHeaders,
      body: JSON.stringify({
        clientPreferencesData: {
          locale: "en-US"
        }
      }),
    })

    console.log("Order form creation status:", orderFormResponse.status)
    console.log("Response headers:", Object.fromEntries(orderFormResponse.headers.entries()))

    if (!orderFormResponse.ok) {
      const errorText = await orderFormResponse.text()
      console.error("Order form creation error:", errorText)
      console.error("Response status:", orderFormResponse.status)
      console.error("Response headers:", Object.fromEntries(orderFormResponse.headers.entries()))
      
      if (orderFormResponse.status === 401 || orderFormResponse.status === 403) {
        throw new Error("VTEX API authentication failed. Please check your API credentials.")
      } else if (orderFormResponse.status === 404) {
        throw new Error("VTEX API endpoint not found. Please check your account and environment configuration.")
      } else {
        throw new Error(`VTEX API error: ${orderFormResponse.status} - ${errorText}`)
      }
    }

    const orderForm = await orderFormResponse.json()
    console.log("Order form created:", orderForm.orderFormId)
    console.log("Order form items:", orderForm.items?.map((item: any) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity
    })))

    if (items && Array.isArray(items) && items.length > 0) {
      console.log("Adding items to order form:", items)
      
      const addItemsResponse = await fetch(VTEX_ENDPOINTS.addItems(orderForm.orderFormId), {
        method: "POST",
        headers: vtexHeaders,
        body: JSON.stringify({
          orderItems: items,
        }),
      })

      console.log("Add items status:", addItemsResponse.status)

      if (addItemsResponse.ok) {
        const updatedOrderForm = await addItemsResponse.json()
        console.log("Order form updated with items:", updatedOrderForm)
        return NextResponse.json(updatedOrderForm)
      } else {
        const errorText = await addItemsResponse.text()
        console.error("Failed to add items to order form:", errorText)
        throw new Error("Failed to add items to order form")
      }
    }

    return NextResponse.json(orderForm)
  } catch (error) {
    console.error("Error creating orderForm:", error)
    return NextResponse.json({ 
      error: "Failed to create orderForm", 
      details: error instanceof Error ? error.message : "Unknown error",
      config: {
        account: VTEX_CONFIG.accountName,
        environment: VTEX_CONFIG.environment,
        hasCredentials: hasVTEXCredentials
      }
    }, { status: 500 })
  }
} 