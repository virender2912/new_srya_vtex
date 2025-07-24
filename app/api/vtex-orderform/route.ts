
import { NextRequest, NextResponse } from "next/server"
const VTEX_ACCOUNT = process.env.VTEX_ACCOUNT!
const VTEX_ENVIRONMENT = process.env.VTEX_ENVIRONMENT!
const VTEX_API_KEY = process.env.VTEX_API_KEY!
const VTEX_API_TOKEN = process.env.VTEX_API_TOKEN!

export async function POST(req: Request) {
  const body = await req.json()
  const { items } = body

  // console.log('[VTEX-ORDERFORM] Incoming items:', items)

  if (!Array.isArray(items) || items.length === 0) {
    return new Response(JSON.stringify({ error: "No items provided" }), { status: 400 })
  }

  try {
    // Step 1: Create OrderForm
    const orderFormRes = await fetch(
      `https://${VTEX_ACCOUNT}.${VTEX_ENVIRONMENT}.com.br/api/checkout/pub/orderForm`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-VTEX-API-AppKey": VTEX_API_KEY,
          "X-VTEX-API-AppToken": VTEX_API_TOKEN,
           "locale": "en-US",
        },
      }
    )

    const orderForm = await orderFormRes.json()
    console.log('[VTEX-ORDERFORM] Create OrderForm response:', orderForm)

    if (!orderForm?.orderFormId) {
      return new Response(JSON.stringify({ error: "Failed to create OrderForm", vtexResponse: orderForm }), { status: 500 })
    }

    await fetch(
  `https://${VTEX_ACCOUNT}.${VTEX_ENVIRONMENT}.com.br/api/checkout/pub/orderForm/${orderForm.orderFormId}/clientPreferencesData`,
  {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "X-VTEX-API-AppKey": VTEX_API_KEY,
      "X-VTEX-API-AppToken": VTEX_API_TOKEN,
       "locale": "en-US",
         
    },
    body: JSON.stringify({ locale: "en-US" }), 
  }
)

    // Step 2: Add items to OrderForm
    const addItemsRes = await fetch(
      `https://${VTEX_ACCOUNT}.${VTEX_ENVIRONMENT}.com.br/api/checkout/pub/orderForm/orderForm/orderFormId/items`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-VTEX-API-AppKey": VTEX_API_KEY,
          "X-VTEX-API-AppToken": VTEX_API_TOKEN,
        },
        body: JSON.stringify({
          items: items.map((item: any) => ({
            id: item.id?.toString(), 
            quantity: item.quantity,
            seller: item.seller,
          })),
        }),
      }
    )
    
    const updatedOrderForm = await addItemsRes.json()
 

    if (!updatedOrderForm?.orderFormId) {
      return new Response(JSON.stringify({ error: "Failed to add items", vtexResponse: updatedOrderForm }), { status: 500 })
    }

    return new Response(JSON.stringify({ orderFormId: updatedOrderForm.orderFormId, items: updatedOrderForm.items }), { status: 200 })
  } catch (err) {
    console.error("[VTEX-ORDERFORM] VTEX Checkout Error", err)
    return new Response(JSON.stringify({ error: "VTEX Checkout Error", details: err?.toString?.() || err }), { status: 500 })
  }
}
