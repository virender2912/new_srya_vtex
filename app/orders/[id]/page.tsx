"use client";

import { Button } from "@/components/ui/button";

import { use, useEffect, useState } from "react";
import Link from "next/link";

// Define TypeScript interfaces for better type safety
interface OrderItem {
  id: string;
  name: string;
  refId: string;
  quantity: number;
  sellingPrice: number;
  imageUrl: string;
}

interface Total {
  id: string;
  value: number;
}

interface ClientProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

interface Address {
  receiverName?: string;
  street?: string;
  number?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

interface ShippingData {
  address?: Address;
}

interface StorePreferencesData {
  currencyCode?: string;
}

interface Payment {
  paymentSystemName?: string;
  value?: number;
}

interface Transaction {
  payments?: Payment[];
}

interface PaymentData {
  transactions?: Transaction[];
}

interface Order {
  orderId?: string;
  status?: string;
  statusDescription?: string;
  creationDate?: string;
  value?: number;
  clientProfileData?: ClientProfileData;
  shippingData?: ShippingData;
  items?: OrderItem[];
  totals?: Total[];
  storePreferencesData?: StorePreferencesData;
  paymentData?: PaymentData;
}

export default function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${id}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to fetch order");
        }
        const data: Order = await res.json();
        setOrder(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id]);

  if (loading) return <p className="text-center mt-10">⏳ Loading order...</p>;
  if (error)
    return <p className="text-center text-red-500 mt-10">❌ {error}</p>;
  if (!order) return <p className="text-center mt-10">Order not found</p>;

  // Helper function to safely format currency
  const formatCurrency = (
    amount: number | undefined,
    currencyCode: string | undefined = "USD"
  ) => {
    if (amount === undefined) return "0.00";
    return (amount / 100).toFixed(2) + " " + (currencyCode || "USD");
  };

  // Helper function to find total by ID
  const findTotal = (id: string) => {
    return order.totals?.find((t: Total) => t.id === id)?.value || 0;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow rounded-lg p-6">
        {/* Order Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-4">
        
          <div>
            <h1 className="text-2xl font-bold mb-1">
              Order #{order.orderId || "N/A"}
            </h1>
           
          </div>
          <p className="text-gray-500 mt-2 sm:mt-0">
            Placed on:{" "}
            {order.creationDate
              ? new Date(order.creationDate).toLocaleString()
              : "Date unknown"}
          </p>
        </div>

        {/* Order Items */}
        {order.items && order.items.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Items</h2>
            <ul className="divide-y">
              {order.items.map((item) => (
                <li key={item.id} className="flex py-4">
                  <div className="flex-shrink-0 w-25 h-25 rounded-md overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-none"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/placeholder-image.png";
                      }}
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      SKU: {item.refId || "N/A"}
                    </p>
                    <p className="text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </p>
                    <div className="mt-2 flex items-baseline">
                      <p className="text-gray-700 text-sm">
                        {formatCurrency(
                          item.sellingPrice,
                          order.storePreferencesData?.currencyCode
                        )}{" "}
                        each
                      </p>
                      <p className="ml-4 font-semibold">
                        {formatCurrency(
                          (item.sellingPrice || 0) * (item.quantity || 0),
                          order.storePreferencesData?.currencyCode
                        )}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Customer Info & Shipping Address  */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Customer Info */}
          {order.clientProfileData && (
            <div className="bg-gray-50 p-4 rounded-md">
              <h2 className="text-lg font-semibold mb-3">
                Customer Information
              </h2>
              <div className="space-y-2">
                <p className="flex items-start">
                  <span className="text-gray-500 w-20 flex-shrink-0">
                    Name:
                  </span>
                  <span>
                    {order.clientProfileData.firstName}{" "}
                    {order.clientProfileData.lastName}
                  </span>
                </p>
                <p className="flex items-start">
                  <span className="text-gray-500 w-20 flex-shrink-0">
                    Email:
                  </span>
                  <span className="break-all">
                    {order.clientProfileData.email || "N/A"}
                  </span>
                </p>
                <p className="flex items-start">
                  <span className="text-gray-500 w-20 flex-shrink-0">
                    Phone:
                  </span>
                  <span>{order.clientProfileData.phone || "N/A"}</span>
                </p>
              </div>
            </div>
          )}

          {/* Shipping Address */}
          {order.shippingData?.address && (
            <div className="bg-gray-50 p-4 rounded-md">
              <h2 className="text-lg font-semibold mb-3">Shipping Address</h2>
              <div className="space-y-2">
                <p>{order.shippingData.address.receiverName || "N/A"}</p>
                <p>
                  {order.shippingData.address.street}{" "}
                  {order.shippingData.address.number}
                </p>
                <p>
                  {order.shippingData.address.city},{" "}
                  {order.shippingData.address.state}
                </p>
               
                <p>
                  Postal Code: {order.shippingData.address.postalCode || "N/A"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Order Totals */}
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <h2 className="text-lg font-semibold mb-3">Order Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Items Total:</span>
              <span>
                {formatCurrency(
                  findTotal("Items"),
                  order.storePreferencesData?.currencyCode
                )}
              </span>
            </div>
            <div className="flex justify-between">
              {/* <span>Shipping:</span> */}
              <span>Tax:</span>
              <span>
                {formatCurrency(
                  findTotal("Shipping"),
                  order.storePreferencesData?.currencyCode
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Discounts:</span>
              <span className="text-red-600">
                -
                {formatCurrency(
                  findTotal("Discounts"),
                  order.storePreferencesData?.currencyCode
                )}
              </span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 pt-3 border-t">
              <span>Total:</span>
              <span>
                {formatCurrency(
                  order.value,
                  order.storePreferencesData?.currencyCode
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-3">Payment Information</h2>
          <p className="font-medium">
            {order.paymentData?.transactions?.[0]?.payments?.[0]
              ?.paymentSystemName || "Payment information not available"}
          </p>
          <p className="mt-1">
            Amount:{" "}
            {formatCurrency(
              order.paymentData?.transactions?.[0]?.payments?.[0]?.value,
              order.storePreferencesData?.currencyCode
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
