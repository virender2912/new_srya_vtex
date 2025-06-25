"use client"

import type React from "react"

import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, Heart, Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/contexts/cart-context"
import { useWishlist } from "@/contexts/wishlist-context"
import { type VtexProduct, formatPrice, getBestPrice, getListPrice, isProductAvailable } from "@/lib/vtex-api"

interface ProductCardProps {
  product: VtexProduct
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist()
  const firstSku = product.items[0]
  const bestPrice = getBestPrice(firstSku)
  const listPrice = getListPrice(firstSku)
  const isAvailable = isProductAvailable(firstSku)
  const hasDiscount = listPrice > bestPrice
  const discountPercentage = hasDiscount ? Math.round(((listPrice - bestPrice) / listPrice) * 100) : 0
  const inWishlist = isInWishlist(product.productId)
    const cleanLinkText = product.linkText?.replace(/^-+/, '') || ''

  const imageUrl = firstSku?.images[0]?.imageUrl || "/placeholder.svg?height=400&width=300"

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isAvailable) {
      addItem(product, firstSku, 1)
    }
  }

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (inWishlist) {
      removeFromWishlist(product.productId)
    } else {
      addToWishlist(product)
    }
  }

  return (
    <Card className="group overflow-hidden border-0 shadow-none hover:shadow-xl transition-all duration-500 bg-white">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
        <Link href={`/product/${cleanLinkText}`}>
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={product.productName}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {hasDiscount && (
            <Badge className="bg-red-500 hover:bg-red-600 text-white font-medium px-3 py-1">
              -{discountPercentage}%
            </Badge>
          )}
          {!isAvailable && (
            <Badge variant="secondary" className="bg-black/80 text-white">
              Sold Out
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <Button
            variant="secondary"
            size="icon"
            className={`rounded-full shadow-lg backdrop-blur-sm ${
              inWishlist ? "bg-red-500 text-white hover:bg-red-600" : "bg-white/90 text-gray-700 hover:bg-white"
            }`}
            onClick={handleWishlistToggle}
          >
            <Heart className={`h-4 w-4 ${inWishlist ? "fill-current" : ""}`} />
          </Button>

          <Button
            variant="secondary"
            size="icon"
            className="rounded-full shadow-lg bg-white/90 text-gray-700 hover:bg-white backdrop-blur-sm"
            asChild
          >
            <Link href={`/product/${cleanLinkText}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Quick Add to Cart */}
        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <Button
            className="w-full rounded-full bg-black text-white hover:bg-black/90 shadow-lg backdrop-blur-sm"
            disabled={!isAvailable}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {isAvailable ? "Quick Add" : "Sold Out"}
          </Button>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">{product.brand}</p>
            <Link href={`/product/${cleanLinkText}`}>
              <h3 className="font-medium text-lg line-clamp-2 hover:text-primary transition-colors leading-tight">
                {product.productName}
              </h3>
            </Link>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-baseline space-x-2">
              <span className="text-xl font-semibold">{formatPrice(bestPrice)}</span>
              {hasDiscount && (
                <span className="text-sm text-muted-foreground line-through">{formatPrice(listPrice)}</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
