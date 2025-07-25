"use client"

import Image from "next/image"
import { Minus, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCart } from "@/contexts/cart-context"
import type { VtexProduct } from "@/lib/vtex-api"

interface CartItemProps {
  item: VtexProduct
  index: number
}
export function CartItem({ item, index }: CartItemProps) {
  console.log("product details",item)
  const { updateQuantity, removeFromCart, loading } = useCart()

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return
    // Use productId and itemId for updateQuantity
    await updateQuantity(item.productId, item.id || item.productId, newQuantity)
    
  }

  const handleRemove = async () => {
    await removeFromCart(index)
  }

  const formatPrice = (price: number) => {
    console.log("cartItem price",price)
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price / 100)
  }

  const itemName = item.name || item.productName
  const itemPrice = item.price || 0
  const itemQuantity = item.quantity || 1
  const itemImageUrl = item.imageUrl || "/images/women-banner.jpg"

  return (
    <div className="flex items-center space-x-4 py-4 border-b">
      <div className="flex-shrink-0">
        <Image
          src={itemImageUrl}
          alt={itemName}
          width={80}
          height={80}
          className="rounded-md object-cover"
        />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 truncate">{itemName}</h3>
        <p className="text-sm text-gray-500">Product ID: {item.productId}</p>
        <p className="text-lg font-semibold text-gray-900">{formatPrice(itemPrice)}</p>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleQuantityChange(itemQuantity - 1)}
          disabled={loading || itemQuantity <= 1}
          className="h-8 w-8"
        >
          <Minus className="h-4 w-4" />
        </Button>

        <Input
          type="number"
          value={itemQuantity}
          onChange={(e) => handleQuantityChange(Number.parseInt(e.target.value) || 1)}
          className="w-16 text-center"
          min="1"
          disabled={loading}
        />

        <Button
          variant="outline"
          size="icon"
          onClick={() => handleQuantityChange(itemQuantity + 1)}
          disabled={loading}
          className="h-8 w-8"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={handleRemove}
        disabled={loading}
        className="h-8 w-8 text-red-600 hover:text-red-700 bg-transparent"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
