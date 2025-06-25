"use client"

import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingCart, Trash2, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Layout } from "@/components/layout"
import { useWishlist } from "@/contexts/wishlist-context"
import { useCart } from "@/contexts/cart-context"
import { formatPrice } from "@/lib/vtex-api"

export default function WishlistPage() {
  const { state, removeItem, clearWishlist } = useWishlist()
  const { addItem } = useCart()

  const handleAddToCart = async (item: any) => {
    try {
      // Fetch full product data to add to cart
      const response = await fetch(`/api/products/${item.linkText}`)
      if (response.ok) {
        const product = await response.json()
        const firstSku = product.items[0]
        addItem(product, firstSku, 1)
      }
    } catch (error) {
      console.error("Failed to add to cart:", error)
    }
  }

  if (state.items.length === 0) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="max-w-2xl mx-auto text-center">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
            <h1 className="text-3xl font-bold mb-4">Your Wishlist is Empty</h1>
            <p className="text-muted-foreground mb-8">
              Save items you love to your wishlist. They'll be waiting for you here when you're ready to shop.
            </p>
            <Button asChild size="lg">
              <Link href="/products">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Wishlist</h1>
            <p className="text-muted-foreground">{state.totalItems} items saved</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={clearWishlist}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/products">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {state.items.map((item) => (
            <Card key={item.productId} className="group overflow-hidden">
              <div className="relative aspect-square overflow-hidden">
                <Link href={`/product/${item.linkText}`}>
                  <Image
                    src={item.imageUrl || "/placeholder.svg?height=300&width=300"}
                    alt={item.productName}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </Link>
                {item.listPrice > item.price && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                    -{Math.round(((item.listPrice - item.price) / item.listPrice) * 100)}%
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-3 right-3 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeItem(item.productId)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>

              <CardContent className="p-4">
                <div className="space-y-3">
                  <Link href={`/product/${item.linkText}`}>
                    <h3 className="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors">
                      {item.productName}
                    </h3>
                  </Link>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">{item.brand}</p>

                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-lg">{formatPrice(item.price)}</span>
                    {item.listPrice > item.price && (
                      <span className="text-sm text-muted-foreground line-through">{formatPrice(item.listPrice)}</span>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" className="flex-1" onClick={() => handleAddToCart(item)}>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => removeItem(item.productId)}>
                      <Heart className="h-4 w-4 fill-current text-red-500" />
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground">Added {new Date(item.addedAt).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  )
}
