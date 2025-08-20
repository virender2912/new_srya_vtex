import { type NextRequest, NextResponse } from "next/server";

const VTEX_ACCOUNT = process.env.NEXT_PUBLIC_VTEX_ACCOUNT || "your-account";
const VTEX_ENVIRONMENT =
  process.env.NEXT_PUBLIC_VTEX_ENVIRONMENT || "vtexcommercestable";
const VTEX_APP_KEY = process.env.VTEX_API_APP_KEY;
const VTEX_APP_TOKEN = process.env.VTEX_API_APP_TOKEN;

const BASE_URL = `https://${VTEX_ACCOUNT}.${VTEX_ENVIRONMENT}.com.br`;

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();

    if (!VTEX_APP_KEY || !VTEX_APP_TOKEN || VTEX_ACCOUNT === "your-account") {
      console.warn("⚠️ Missing VTEX credentials. Returning mock order.");
      const mockOrder = {
        orderId: `${Date.now()}`,
        status: "order-created",
        value: orderData.paymentData?.payments?.[0]?.value || 0,
        items: orderData.items,
        clientProfileData: orderData.clientProfileData,
        shippingData: orderData.shippingData,
        paymentData: orderData.paymentData,
        creationDate: new Date().toISOString(),
      };
      console.log("Transactions:", mockOrder.paymentData?.transactions || []);
      console.log("Mock order created:", mockOrder);
      return NextResponse.json(mockOrder);
    }

    const { items, clientProfileData, shippingData, paymentData } = orderData;
    const payload = { items, clientProfileData, shippingData, paymentData };

    // Step 1: Create orderForm
    const orderFormRes = await fetch(`${BASE_URL}/api/checkout/pub/orderForm`, {
      method: "POST", 
      headers: {
        "Content-Type": "application/json",
        "X-VTEX-API-AppKey": VTEX_APP_KEY,
        "X-VTEX-API-AppToken": VTEX_APP_TOKEN,
      },
    });

    const orderForm = await orderFormRes.json();


    // Step 2: Add items
    console.log("🔄 Step 2: Adding items...");
    const itemsRes = await fetch(
      `${BASE_URL}/api/checkout/pub/orderForm/${orderForm.orderFormId}/items`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-VTEX-API-AppKey": VTEX_APP_KEY,
          "X-VTEX-API-AppToken": VTEX_APP_TOKEN,
        },
        body: JSON.stringify({ orderItems: orderData.items }),
      }
    );
    const itemsData = await itemsRes.json();

    // Step 3: Attach client profile
    console.log("🔄 Step 3: Adding client profile...");
    const profileRes = await fetch(
      `${BASE_URL}/api/checkout/pub/orderForm/${orderForm.orderFormId}/attachments/clientProfileData`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-VTEX-API-AppKey": VTEX_APP_KEY,
          "X-VTEX-API-AppToken": VTEX_APP_TOKEN,
        },
        body: JSON.stringify(orderData.clientProfileData),
      }
    );
    const profileResData = await profileRes.json();

    // Step 4: Shipping
    const shippingRes = await fetch(
      `${BASE_URL}/api/checkout/pub/orderForm/${orderForm.orderFormId}/attachments/shippingData`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-VTEX-API-AppKey": VTEX_APP_KEY,
          "X-VTEX-API-AppToken": VTEX_APP_TOKEN,
        },
        body: JSON.stringify(orderData.shippingData),
      }
    );
  

    // Step 5: Refresh orderForm
    const refreshedOrderFormRes = await fetch(
      `${BASE_URL}/api/checkout/pub/orderForm/${orderForm.orderFormId}`,
      {
        method: "GET",
        headers: {
          "X-VTEX-API-AppKey": VTEX_APP_KEY,
          "X-VTEX-API-AppToken": VTEX_APP_TOKEN,
        },
      }
    );
    const refreshedOrderForm = await refreshedOrderFormRes.json();
 

    const totalValue = refreshedOrderForm.value;
    const paymentSystems =
      refreshedOrderForm?.paymentData?.paymentSystems || [];

    const codSystem = paymentSystems.find(
      (p: any) =>
        p.name?.toLowerCase().includes("cash") ||
        p.name?.toLowerCase().includes("cod")
    );

    if (!codSystem) {
      console.error("Available payment systems:", paymentSystems);
      throw new Error("COD payment system not found in orderForm");
    }

    const paymentPayload = {
      payments: [
        {
          paymentSystem: codSystem.id.toString(),
          value: totalValue,
          installments: 1,
          referenceValue: totalValue,
          installmentsValue: totalValue,
          installmentsInterestRate: 0,
          paymentSystemName: "cash",
        },
      ],
    };
   

    // Step 6: Place order
    console.log("🔄 Step 6: Placing order...");
    const placeOrderRes = await fetch(`${BASE_URL}/api/checkout/pub/orders`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-VTEX-API-AppKey": VTEX_APP_KEY,
        "X-VTEX-API-AppToken": VTEX_APP_TOKEN,
      },
      body: JSON.stringify(payload),
    });
    const placedOrder = await placeOrderRes.json();
    console.log("placeorder", placedOrder);

   
    // Step 7: Register payment 
if (placedOrder?.transactionData?.merchantTransactions.length) {
  const transactionId = placedOrder.transactionData.merchantTransactions[0].transactionId;
  const orderId = placedOrder?.orders[0].orderId;
  const orderGroup = placedOrder?.orders[0].orderGroup;


  if (!orderData.paymentData?.payments?.length) {
    console.error("No payment data found in orderData");
    throw new Error("Missing payment data");
  }

  const { paymentSystem, value, referenceValue, installments } = orderData.paymentData.payments[0];
  
  const registerPaymentPayload = [
    {
      paymentSystem: paymentSystem.toString(),
      paymentSystemName: "cash",
      group: orderGroup,
      installments: installments,
      value: value,
      currencyCode: "AED",
      installmentsInterestRate: 0,
      installmentsValue: referenceValue,
      referenceValue: referenceValue,
      deviceFingerprint: "",
      fields: {},
      transaction: {
        id: transactionId,
        merchantName: "IAMTECHIEPARTNERUAE"
      }
    }
  ];

  console.log("🔄 Registering payment:", registerPaymentPayload);
  
  try {
    const transactionRes = await fetch(
      `${BASE_URL}/api/payments/pub/transactions/${transactionId}/payments`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-VTEX-API-AppKey": VTEX_APP_KEY,
          "X-VTEX-API-AppToken": VTEX_APP_TOKEN,
        },
        body: JSON.stringify(registerPaymentPayload)
      }
    );


    if (transactionRes.status === 204) {
 
      return NextResponse.json({
        orderId,
        orderGroup,
        transactionId,
        status: "order-created",
        creationDate: new Date().toISOString(),
      });
    }

  
    if (!transactionRes.ok) {
      const errorText = await transactionRes.text();
      console.error("Payment registration failed:", {
        status: transactionRes.status,
        statusText: transactionRes.statusText,
        responseText: errorText
      });
      throw new Error(`Payment registration failed: ${transactionRes.status} ${transactionRes.statusText}`);
    }

    const contentLength = transactionRes.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 0) {
      const transactionData = await transactionRes.json();
   
    } else {
      console.log("✅ Payment registered successfully (empty response)");
    }

  } catch (error) {
    console.error("Payment registration error:", error);
    return NextResponse.json({
      orderId,
      orderGroup,
      transactionId,
      status: "order-created",
      creationDate: new Date().toISOString(),
    });
  }
}

    // Step 8: Trigger gateway callback
    if (placedOrder?.orders[0].orderGroup) {
      console.log("🔄 Triggering gateway callback...");
      const gatewayRes = await fetch(
        `${BASE_URL}/api/checkout/pub/gatewayCallback/${placedOrder?.orders[0].orderGroup}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-VTEX-API-AppKey": VTEX_APP_KEY,
            "X-VTEX-API-AppToken": VTEX_APP_TOKEN,
          },
        }
      );

      const gatewayResponse = NextResponse.json(gatewayRes);
      console.log("gatewayResponse:-", gatewayResponse);
    } else {
      console.warn("⚠️ No orderGroup found to trigger gateway callback.");
    }

    return NextResponse.json({
      orderId: placedOrder.orders[0]?.orderId,
      status: "order-created",
      creationDate: new Date().toISOString(),
    });
  } catch (error) {
    console.error("💥 Order creation error:", error);
    const mockOrder = {
      orderId: `ORD-${Date.now()}`,
      status: "order-created",
      value: 0,
      items: [],
      creationDate: new Date().toISOString(),
    };
    return NextResponse.json(mockOrder, { status: 500 });
  }
}
