'use client'
import { useEffect, useState } from "react";

type Order = {
  orderId: string;
  status: string;
  creationDate: string;
  value: number;
  items: {
    id: string;
    name: string;
    imageUrl: string;
    sellingPrice: number;
    quantity: number;
  }[];
};

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      try {
        setLoading(true);
        const res = await fetch(`/api/order/${id}`, { cache: "no-store" });
        if (!res.ok) {
          throw new Error(`Failed: ${res.status}`);
        }
        const data = await res.json();
        setOrder(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchOrder();
  }, [id]);

  if (loading) return <p>Loading order...</p>;
  if (error) return <p className="text-red-500">❌ {error}</p>;
  if (!order) return <p>No order found</p>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Order Details</h1>
      <p>Order ID: {order.orderId}</p>
      <p>Status: {order.status}</p>
      <p>Created: {new Date(order.creationDate).toLocaleString()}</p>
      <p>Total: AED {(order.value / 100).toFixed(2)}</p>

      <h2 className="mt-4 font-semibold">Items:</h2>
      <ul className="space-y-3">
        {order.items.map((item) => (
          <li key={item.id} className="flex gap-4 items-center border-b pb-2">
            <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded" />
            <div>
              <p>{item.name}</p>
              <p>
                AED {(item.sellingPrice / 100).toFixed(2)} × {item.quantity}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
