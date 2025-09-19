"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, CreditCard, Truck, Shield, Check, ExternalLink } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Layout } from "@/components/layout";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";
import { formatPrice } from "@/lib/vtex-api";
import { v4 as uuidv4 } from 'uuid';

type VerifyResponse = {
  id: string,
  firstname: string;
  status: string;
  paymentType: string;
  amount: string;
  email: string;
  s: string
};

interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface PaymentMethod {
  type: "credit" | "debit" | "pix" | "boleto" | "cash" | "tab";
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardName?: string;
  tabPhone?: string;
}

// const paymentSystemMap: Record<PaymentMethod["type"], string> = {
//   credit: "1",
//   debit: "2",
//   pix: "201",
//   boleto: "201",
//   cash: "201",
//   tab: "203",
// };


export default function AccountPage() {
  const [data, setData] = useState<VerifyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const { state: cartState, clearCart } = useCart();
  const { state: authState } = useAuth();
  const router = useRouter();

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: authState.user?.firstName || "",
    lastName: authState.user?.lastName || "",
    email: authState.user?.email || "",
    phone: authState.user?.phone || "",
    address: "",
    city: "",
    state: "DU",
    zipCode: "",
    country: "ARE",
  });

  const paymentSystemMap: Record<PaymentMethod["type"], string> = {
  credit: "1",
  debit: "2",
  pix: "201",
  boleto: "201",
  cash: "201",
  tab: "203",
};

  const totalPrice = cartState.items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

 // In AccountPage - useEffect hook
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const tapId = urlParams.get("tap_id");

  if (tapId) {
    // Retrieve stored checkout data
    const storedData = sessionStorage.getItem('tabCheckoutData');
    let checkoutData = null;
    
    if (storedData) {
      checkoutData = JSON.parse(storedData);
    }
 
    fetch(`/api/tab-payment/verify?tap_id=${tapId}`)
      .then((res) => res.json())
      .then(async (json: VerifyResponse) => {
        setData(json);

        if (json.s === "SUCCESS") {
          // Use stored checkout data if available
          const address = checkoutData?.shippingAddress || shippingAddress;
          const items = checkoutData?.cartItems || cartState.items;
          const total = checkoutData?.totalPrice || totalPrice;

          const orderPayload = {
            items: items.map((item:any) => ({
              id: item.skuId,
              quantity: item.quantity,
              seller: "1",
              price: item.price * 100,
            })),
            clientProfileData: {
              email: address.email,
              firstName: address.firstName,
              lastName: address.lastName,
              document: "12345678901",
              phone: address.phone,
            },
            shippingData: {
              address: {
                addressType: "residential",
                receiverName: `${address.firstName} ${address.lastName}`,
                street: address.address,
                city: address.city,
                state: address.state,
                country: address.country,
                postalCode: address.zipCode,
              },
              logisticsInfo: items.map((item:any, index:any) => {
                if (index === 0) {
                  return {
                    itemIndex: index,
                    selectedSla: "Express",
                    price: 500
                  }
                } else {
                  return {
                    itemIndex: index,
                    selectedSla: "Express"
                  }
                }
              })
            },
            paymentData: {
              payments: [
                {
                  paymentSystem: '203',
                  value: total * 100 + 500,
                  referenceValue: total * 100 + 500,
                  installments: 1,
                },
              ],
            },
          };

          const response = await fetch("/api/orders", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(orderPayload),
          });

          if (response.ok) {
            const order = await response.json();
            setOrderId(order.orderId || `${Date.now()}`);
            setOrderPlaced(true);
            clearCart();
            // Clean up sessionStorage
            sessionStorage.removeItem('tabCheckoutData');
          } else {
            throw new Error("Failed to place order");
          }
        } else {
          setError(`Payment not successful. Status: ${json.status}`);
        }
      })
      .catch((error) => {
        console.error("Payment verification error:", error);
        setError(`Error verifying payment: ${error.message}`);
      })
      .finally(() => setLoading(false));
  }
}, []);


  if (loading) return <p className="text-gray-600">Loading payment status...</p>;

  return (
    <div className=" mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl">


  {error && (
    <div className="text-center mb-6">
      <p className="text-red-600">{error}</p>
      <Link
        href="/"
        className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
      >
        Go to Homepage
      </Link>
    </div>
  )}

  {data ? (
    <div className="space-y-2">
      {/* <div className="border-b pb-4">
        <p><span className="font-semibold">Id:</span> {data?.id}</p>
        <p><span className="font-semibold">Name:</span> {data?.firstname}</p>
        <p><span className="font-semibold">Email:</span> {data?.email}</p>
        <p><span className="font-semibold">Payment Type:</span> {data?.paymentType}</p>
        <p>
          <span className="font-semibold">Status:</span>
          <span
            className={
              data?.status === "SUCCESS"
                ? "text-green-600 ml-1 font-medium"
                : "text-red-600 ml-1 font-medium"
            }
          >
            {data?.status}
          </span>
        </p>
        <p><span className="font-semibold">Amount:</span> {data?.amount}</p>
      </div> */}

      {orderPlaced && (
        <div className=" p-4 rounded-lg  border-gray-300">
  <div className="flex items-center justify-center mb-4">
    <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
      <svg
        className="h-6 w-6 text-black"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>
    </div>
  </div>

  <h2 className="text-xl font-bold text-center text-black mb-2">
    Order placed successfully!
  </h2>
  <p className="text-gray-700 text-center mb-4">Order ID: {orderId}</p>

  <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6">
    <Link
      href={`/orders/${orderId}`}
      className="px-4 py-2 bg-black text-white rounded-lg shadow hover:bg-black-300 transition text-center"
    >
      View Order Details
    </Link>
    <Link
      href="/"
      className="px-4 py-2 bg-white text-black border border-black rounded-lg shadow hover:bg-gray-100 transition text-center"
    >
      Continue Shopping
    </Link>
  </div>
</div>

      )}
    </div>
  ) : (
    !error && (
      <div className="text-center py-4">
        <p className="text-gray-500 mb-4">No payment found</p>
        <Link
          href="/"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          Go to Homepage
        </Link>
      </div>
    )
  )}
</div>
  );
}