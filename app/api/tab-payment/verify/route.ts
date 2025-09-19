import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tapId = searchParams.get("tap_id");
 

  if (!tapId) {
    return NextResponse.json({ error: "Missing tap_id" }, { status: 400 });
  }

  try {
    const TAP_SECRET_KEY = process.env.TAP_SECRET_KEY as string;

    const response = await fetch(`https://api.tap.company/v2/charges/${tapId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${TAP_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    // console.log("retrieve-charge-data", data);
    console.log('Payemnt-method-selected', data.source.payment_method)
 
    return NextResponse.json({
      id: data.id,
      s:data.redirect.status,
      status: data.status,
      amount: data.amount,
      currency: data.currency,
      customer: data.customer,
      firstname:data.customer.first_name,
      lastnamr:data.customer.first_name,
      paymentType:data.card.brand,
      email:data.customer.email,
      paymentMethod:data.source.payment_method
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to verify payment", details: error.message },
      { status: 500 }
    );
  }
}
