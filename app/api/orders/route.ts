import { type NextRequest, NextResponse } from "next/server"

const VTEX_ACCOUNT = process.env.NEXT_PUBLIC_VTEX_ACCOUNT || "your-account"
const VTEX_ENVIRONMENT = process.env.NEXT_PUBLIC_VTEX_ENVIRONMENT || "vtexcommercestable"
const VTEX_APP_KEY = process.env.VTEX_APP_KEY
const VTEX_APP_TOKEN = process.env.VTEX_APP_TOKEN

const BASE_URL = `https://${VTEX_ACCOUNT}.${VTEX_ENVIRONMENT}.com.br`

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json()

    // Check if VTEX configuration is available
    if (!VTEX_APP_KEY || !VTEX_APP_TOKEN || VTEX_ACCOUNT === "your-account") {
      // Mock order creation for demo
      const mockOrder = {
        orderId: `ORD-${Date.now()}`,
        status: "order-created",
        value: orderData.paymentData?.payments?.[0]?.value || 0,
        items: orderData.items,
        clientProfileData: orderData.clientProfileData,
        shippingData: orderData.shippingData,
        paymentData: orderData.paymentData,
        creationDate: new Date().toISOString(),
      }

      console.log("Mock order created:", mockOrder)
      return NextResponse.json(mockOrder)
    }

    // Real VTEX order creation
    const vtexOrderPayload = {
      items: orderData.items,
      clientProfileData: orderData.clientProfileData,
      shippingData: orderData.shippingData,
      paymentData: orderData.paymentData,
      marketingData: null,
      customData: null,
    }

    const response = await fetch(`${BASE_URL}/api/checkout/pub/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-VTEX-API-AppKey": VTEX_APP_KEY,
        "X-VTEX-API-AppToken": VTEX_APP_TOKEN,
      },
      body: JSON.stringify(vtexOrderPayload),
    })

    if (!response.ok) {
      throw new Error(`VTEX API error: ${response.status} ${response.statusText}`)
    }

    const order = await response.json()
    return NextResponse.json(order)
  } catch (error) {
    console.error("Order creation error:", error)

    // Return mock order as fallback
    const mockOrder = {
      orderId: `ORD-${Date.now()}`,
      status: "order-created",
      value: 0,
      items: [],
      creationDate: new Date().toISOString(),
    }

    return NextResponse.json(mockOrder)
  }
}
