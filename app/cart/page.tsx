"use client"

import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Layout } from "@/components/layout"
import { useCart } from "@/contexts/cart-context"
import { formatPrice } from "@/lib/vtex-api"
  import { useTranslation } from "@/hooks/use-translation"
  import { useLanguage } from "@/contexts/language-context"
export default function CartPage() {
  const { state, removeItem, updateQuantity, clearCart } = useCart()
  console.log("Cart items ➜", state.items)
const { t } = useTranslation()
const { language } = useLanguage()
  if (state.items.length === 0) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="max-w-2xl mx-auto text-center">
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
            <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-muted-foreground mb-8">
              Looks like you haven't added any products to your cart yet. Start shopping to fill it up!
            </p>
            <Button asChild size="lg">
              <Link href="/products">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("continue_shopping")}
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
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("continue_shopping")}
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{t("shopping_cart")}</h1>
            <p className="text-muted-foreground">{state.totalItems} {t("cart_items")}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {state.items.map((item) => (
              <Card key={`${item.productId}-${item.skuId}`}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border">
                      <Image
                        src={item.imageUrl || "/placeholder.svg?height=96&width=96"}
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <Link
                            href={`/product/${item.linkText}`}
                            className="block hover:text-primary transition-colors"
                          >
                            <h3 className="font-semibold text-lg line-clamp-2">
  {language === "ar"
    ? item.productName_ar?.trim() || item.productName
    : item.productName}
</h3>
                            {item.skuName !== item.productName && (
                               <p className="text-sm text-muted-foreground mt-1">
                                {/* {item.skuName} */}
                                </p>
                            )}
                          </Link>
                          <p className="text-sm text-muted-foreground mt-1">{t(item.brand)}</p>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeItem(item.productId, item.skuId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.productId, item.skuId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="font-medium w-12 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.productId, item.skuId, item.quantity + 1)}
                            disabled={item.quantity >= item.availableQuantity}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-lg">{formatPrice(item.price)}</span>
                            {item.listPrice > item.price && (
                              <span className="text-sm text-muted-foreground line-through">
                                {formatPrice(item.listPrice)}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {t("total")}: {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="flex justify-end">
              <Button variant="outline" onClick={clearCart} className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                {t('Clear Cart')}
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>{t("order_summry")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>{t("subtotal")} ({state.totalItems} {t("items")})</span>
                    <span>{formatPrice(state.totalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("shipping")}</span>
                    <span className="text-green-600">{t("free")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("tax")}</span>
                    <span>{t("calculate_checkout")}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-semibold">
                  <span>{t("total")}</span>
                  <span>{formatPrice(state.totalPrice)}</span>
                </div>

                <div className="space-y-2">
                 <Button variant="outline" className="w-full" asChild>
                    <Link href="/checkout">{t("proceed_checkout")}</Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/products">{t("continue_shopping")}</Link>
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground text-center">
                  <p>{t("secure")}</p>
                  <p>{t("free_shipping")}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}
