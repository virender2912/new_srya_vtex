"use client"

import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2, ShoppingBag, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useCart } from "@/contexts/cart-context"
import { formatPrice } from "@/lib/vtex-api"
import { useTranslation } from "@/hooks/use-translation"
import { useLanguage } from "@/contexts/language-context"
import { useEffect, useState } from "react"

export function CartDrawer() {
  const { state, orderForm, isCartOpen, closeCart, removeItem, updateQuantity, proceedToCheckout, refreshCart } = useCart()
  const { t } = useTranslation()
  const { language } = useLanguage()
  const [quantity, setQuantity] = useState(1)
  const [isOpening, setIsOpening] = useState(false)

  // Track isCartOpen changes
  useEffect(() => {
    if (isCartOpen) {
      setIsOpening(true)
      // Reset the opening flag after a short delay
      setTimeout(() => setIsOpening(false), 100)
    }
  }, [isCartOpen])

  // Handler for Secure Checkout
  const handleSecureCheckout = async () => {
    if (!Array.isArray(state.items) || state.items.length === 0) {
      alert("Your cart is empty!")
      return
    }
    
    // Use the proper checkout flow from cart context
    proceedToCheckout()
  }

  return (
    <Sheet open={isCartOpen} onOpenChange={(open) => {
      if (!open && !isOpening) {
        closeCart()
      }
    }}>
      <SheetContent className="flex flex-col w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between text-xl">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-6 w-6" />
              {t("shopping_cart")} ({state.totalItems})
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={refreshCart}
              className="h-8 w-8"
              title="Refresh cart"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </SheetTitle>
        </SheetHeader>

        {state.items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
              <h3 className="text-xl font-semibold mb-3">{t("cartEmpty")}</h3>
              <p className="text-muted-foreground mb-6">{t("cartdrawer_text")}</p>
              <Button asChild onClick={closeCart} size="lg">
                <Link href="/products">{t("start_shopping")}</Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4">
              <div className="space-y-6">
                {state.items.map((item) => (
                  <div key={`${item.productId}-${item.skuId}`} className="flex gap-4">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border">
                      <Image
                        src={item.imageUrl || "/images/women-banner.jpg"}
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/product/${item.linkText}`}
                        onClick={closeCart}
                        className="block hover:text-primary transition-colors"
                      >
                        <h4 className="font-medium text-sm line-clamp-2 mb-1">
                          {language === "ar"
                            ? item.productName_ar?.trim() || item.productName
                            : item.productName}
                        </h4>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">{item.brand}</p>
                      </Link>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.productId, item.skuId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.productId, item.skuId, item.quantity + 1)}
                            disabled={item.quantity >= item.availableQuantity}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>


                            
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => removeItem(item.productId, item.skuId)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{formatPrice(item.price)} </span>
                          {item.listPrice > item.price && (
                            <span className="text-xs text-muted-foreground line-through"> 
                              {formatPrice(item.listPrice)}
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                ))}
                
              </div>
            </div>

            <div className="border-t pt-6 space-y-4">
              <div className="flex items-center justify-between text-xl font-semibold">
                <span>{t("total")}</span>
                <span>{formatPrice(state.totalPrice)}</span>
              </div>

              <div className="space-y-3">
                <Button className="w-full" size="lg" onClick={handleSecureCheckout}>
                  {t("securecheckout")}
                </Button>
                <Button variant="outline" className="w-full" asChild onClick={closeCart}>
                  <Link href="/cart">{t("full_cart")}</Link>
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">{t("free_shipping")}</p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
