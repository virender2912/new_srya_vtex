// app/api/order/[id]/route.ts
import { type NextRequest, NextResponse } from "next/server";

const VTEX_ACCOUNT = process.env.NEXT_PUBLIC_VTEX_ACCOUNT;
const VTEX_ENVIRONMENT = process.env.NEXT_PUBLIC_VTEX_ENVIRONMENT;
const VTEX_APP_KEY = process.env.VTEX_API_APP_KEY;
const VTEX_APP_TOKEN = process.env.VTEX_API_APP_TOKEN;

if (!VTEX_ACCOUNT || !VTEX_ENVIRONMENT || !VTEX_APP_KEY || !VTEX_APP_TOKEN) {
  throw new Error("❌ Missing required VTEX environment variables");
}

const BASE_URL = `https://${VTEX_ACCOUNT}.${VTEX_ENVIRONMENT}.com.br`;

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id: orderId } = params;

  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
  }

  try {
    const response = await fetch(`${BASE_URL}/api/oms/pvt/orders/${orderId}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-VTEX-API-AppKey": VTEX_APP_KEY!,
        "X-VTEX-API-AppToken": VTEX_APP_TOKEN!,
      },
      cache: "no-store", // ✅ ensures always fresh data
    });

    if (!response.ok) {
      const errorText = await response.text(); // capture VTEX error payload
      console.error(`❌ VTEX API Error: ${response.status} ${response.statusText}`, errorText);

      return NextResponse.json(
        { error: `Failed to fetch order: ${response.status} ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }

    const orderData = await response.json();
    console.log("orderData", orderData)
    return NextResponse.json(orderData, { status: 200 });
  } catch (err: any) {
    console.error("❌ Order fetch exception:", err);
    return NextResponse.json(
      { error: "Failed to fetch order", details: err.message },
      { status: 500 }
    );
  }
}
