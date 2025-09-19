// app/api/tab-payment/create-charge/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Read payload from frontend
    const payload = await req.json();

    const TAP_SECRET_KEY = process.env.TAP_SECRET_KEY as string;

    const response = await fetch("https://api.tap.company/v2/charges", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TAP_SECRET_KEY}`,
      },
      body: JSON.stringify(payload),
    }); 

    const data = await response.json();
    console.log("Tap Response:", data);
    console.log("Tab-Response-id:", data.id);
    

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("Error creating Tap charge:", error);
    return NextResponse.json(
      { error: "Failed to create charge", details: error.message },
      { status: 500 }
    );
  }
}
