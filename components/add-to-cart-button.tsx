"use client"

import { useState } from "react"
import { ShoppingCart, Plus, Minus, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useCart } from "@/contexts/cart-context"

interface AddToCartButtonProps {
  productId: string
  skuId: string
  seller?: string
  disabled?: boolean
  className?: string
}

export function AddToCartButton({ productId, skuId, seller = "1", disabled = false, className = "" }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1)
  const [localError, setLocalError] = useState<string | null>(null)
  const { addItem, loading, error, toggleCart } = useCart()

  const handleAddToCart = async () => {
    try {
      setLocalError(null)
      await addItem(productId, skuId, quantity, seller)
    } catch (err) {
      console.error("Add to cart button error:", err)
      setLocalError("Failed to add item to cart. Please try again.")
    }
  }

  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1)
  }

  const decrementQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1))
  }

  const displayError = localError || error

  return (
    <div className={`space-y-2 ${className}`}>
      {displayError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{displayError}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center space-x-2">
        <div className="flex items-center border rounded-md">
          <Button
            variant="ghost"
            size="icon"
            onClick={decrementQuantity}
            disabled={quantity <= 1 || loading}
            className="h-8 w-8"
          >
            <Minus className="h-4 w-4" />
          </Button>

          <Input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
            className="w-16 text-center border-0 focus-visible:ring-0"
            min="1"
            disabled={loading}
          />

          <Button variant="ghost" size="icon" onClick={incrementQuantity} disabled={loading} className="h-8 w-8">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <Button onClick={handleAddToCart} disabled={disabled || loading} className="flex-1">
          <ShoppingCart className="h-4 w-4 mr-2" />
          {loading ? "Adding..." : "Add to Cart"}
        </Button>
      </div>
    </div>
  )
}
