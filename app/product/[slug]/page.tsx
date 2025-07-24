"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw, Star, Plus, Minus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Layout } from "@/components/layout"
import { type VtexProduct, formatPrice, getBestPrice, getListPrice, isProductAvailable } from "@/lib/vtex-api"
import { useCart } from "@/contexts/cart-context"
import { useWishlist } from "@/contexts/wishlist-context"
import { useTranslation } from "@/hooks/use-translation"


  type LocalizedProduct = VtexProduct & {
  Arabic_title?: string[]
  Arabic_description?: string[]
}

export default function ProductPage() {
  const params = useParams()
  const slug = params.slug as string

  const [product, setProduct] = useState<VtexProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedSku, setSelectedSku] = useState(0)
  const [quantity, setQuantity] = useState(1)
console.log("Add to Cart ➜", product)
  const { addItem } = useCart()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist()
  const { t, language } = useTranslation()
  const isArabic = language === "ar"

  useEffect(() => {
    const loadProduct = async () => {
      try {
        // First try to get the product by slug from our API
        const response = await fetch(`/api/products/${slug}`)
        if (!response.ok) {
          throw new Error("Failed to fetch product")
        }
        const productData = await response.json()
        setProduct(productData)
      } catch (error) {
        console.error("Failed to load product:", error)

        // If that fails, try to search for the product
        try {
          const searchResponse = await fetch(`/api/products?q=${slug}`)
          if (searchResponse.ok) {
            const searchResult = await searchResponse.json()
            if (searchResult.products && searchResult.products.length > 0) {
              setProduct(searchResult.products[0])
            } else {
              setProduct(null)
            }
          } else {
            setProduct(null)
          }
        } catch (searchError) {
          console.error("Failed to search for product:", searchError)
          setProduct(null)
        }
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      loadProduct()
    }
  }, [slug])

  if (loading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="aspect-square bg-muted rounded-2xl animate-pulse" />
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="aspect-square bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded animate-pulse" />
                <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
                <div className="h-6 bg-muted rounded w-1/4 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (!product) {
    return (
      <Layout>
        <div className="container py-16">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The product you're looking for doesn't exist or may have been removed.
            </p>
            <Button onClick={() => window.history.back()}>Go Back</Button>
          </div>
        </div>
      </Layout>
    )
  }

  const title = isArabic && product.Arabic_title?.[0] ? product.Arabic_title[0] : product.productName
  const description =
    isArabic && product.Arabic_description?.[0]
      ? product.Arabic_description[0]
      : product.description 

  const currentSku = product.items[selectedSku]
  const bestPrice = getBestPrice(currentSku)
  const listPrice = getListPrice(currentSku)
  const isAvailable = isProductAvailable(currentSku)
  const hasDiscount = listPrice > bestPrice
  const discountPercentage = hasDiscount ? Math.round(((listPrice - bestPrice) / listPrice) * 100) : 0
  const inWishlist = isInWishlist(product.productId)
//const { t } = useTranslation()
  const images = currentSku?.images || []
  const currentImage = images[selectedImageIndex]

  // const handleAddToCart = () => {
  //   if (isAvailable && quantity > 0) {
  //     addItem(product, currentSku, quantity)
  //   }
  // }

   const handleAddToCart = () => {
    if (isAvailable && quantity > 0) {
      // Pass product information for better cart display
      const productInfo = {
        name: product.productName,
        brand: product.brand,
        imageUrl: currentImage?.imageUrl,
        price: bestPrice,
        listPrice: listPrice,
        linkText: product.linkText,
      }
      addItem(product.productId, currentSku.itemId, quantity, "1", productInfo)
    }
  }


  const handleWishlistToggle = () => {
    if (inWishlist) {
      removeFromWishlist(product.productId)
    } else {
      addToWishlist(product)
    }
  }

  const availableQuantity = currentSku?.sellers[0]?.commertialOffer?.AvailableQuantity || 0

  return (
    <Layout>
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square relative overflow-hidden rounded-2xl border">
              <Image
                src={currentImage?.imageUrl || "/placeholder.svg?height=600&width=600"}
                alt={product.productName}
                fill
                className="object-cover"
              />
              {hasDiscount && (
                <Badge className="absolute top-4 left-4 bg-red-500 hover:bg-red-600 text-white">
                  -{discountPercentage}% OFF
                </Badge>
              )}
              {!isAvailable && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    Out of Stock
                  </Badge>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.slice(0, 4).map((image, index) => (
                  <button
                    key={image.imageId}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square relative overflow-hidden rounded-lg border-2 transition-all ${
                      selectedImageIndex === index ? "border-primary" : "border-muted hover:border-primary/50"
                    }`}
                  >
                    <Image
                      src={image.imageUrl || "/placeholder.svg"}
                      alt={`${product.productName} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-8 adding-padding">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">{product.brand}</p>
                  <h1 className="text-4xl font-light mb-4 leading-tight">{title}</h1>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleWishlistToggle}
                  className={`${inWishlist ? "text-red-500" : "text-muted-foreground"} hover:text-red-500`}
                >
                  <Heart className={`h-6 w-6 ${inWishlist ? "fill-current" : ""}`} />
                </Button>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">(4.8) 124 reviews</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-baseline space-x-4">
                  <span className="text-4xl font-light">{formatPrice(bestPrice)}</span>
                  {hasDiscount && (
                    <span className="text-xl text-muted-foreground line-through">{formatPrice(listPrice)}</span>
                  )}
                </div>
                {hasDiscount && (
                  <p className="text-green-600 font-medium">
                    You save {formatPrice(listPrice - bestPrice)} ({discountPercentage}% off)
                  </p>
                )}
              </div>
            </div>

            {/* Product Options */}
            <div className="space-y-6">
              {product.items.length > 1 && (
                <div>
                  <Label className="text-base font-medium mb-3 block">{t("variations")}</Label>
                  <div className="flex flex-wrap gap-2">
                    {product.items.map((sku, index) => (
                      <Button className="variantbtns"
                        key={sku.itemId}
                        variant={selectedSku === index ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedSku(index)}
                      >
                        {sku.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <Label className="text-base font-medium mb-3 block">{t("quantity")}</Label>
                <div className="flex items-center gap-3">
                  <Button className="qntybtn"
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button className="qntybtn"
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.min(availableQuantity, quantity + 1))}
                    disabled={quantity >= availableQuantity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {/* <p className="text-sm text-muted-foreground mt-1">{availableQuantity} items available</p> */}
              </div>
            </div>

            {/* Add to Cart */}
            <div className="space-y-4">
              <Button size="lg" className="w-full h-14 text-lg" disabled={!isAvailable} onClick={handleAddToCart}>
                <ShoppingCart className="h-5 w-5 mr-3" />
                {isAvailable ? `${t("addToCart")} - ${formatPrice(bestPrice * quantity)}` : "Out of Stock"}
              </Button>

              <Button variant="outline" size="lg" className="w-full h-12">
                <Share2 className="h-5 w-5 mr-2" />
                {t("share")}
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <Truck className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{t("freshiping")}</p>
                  <p className="text-sm text-muted-foreground">{t("on_order")}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <RotateCcw className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{t("easy_return")}</p>
                  <p className="text-sm text-muted-foreground">{t("returnpolicy")}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <Shield className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{t("securpayment")}</p>
                  <p className="text-sm text-muted-foreground">{t("securcheckout")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-16" />

        {/* Product Details Tabs */}
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="description" className="tabsname text-lg">
              {t("description")}
            </TabsTrigger>
            <TabsTrigger value="specifications" className="tabsname text-lg">
              {t("details")}
            </TabsTrigger>
            <TabsTrigger value="care" className="tabsname text-lg">
              {t("care_guide")}
            </TabsTrigger>
            <TabsTrigger value="reviews" className="tabsname text-lg">
              {t("reviews")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-8">
            <Card>
              <CardContent className="p-8">
                <div
                  className="prose max-w-none text-lg leading-relaxed">
                    {description}
                  </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="specifications" className="mt-8">
            <Card>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold mb-4">{t("product_details")}</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("brand")}</span>
                        <span className="font-medium">{product.brand}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("product_id")}</span>
                        <span className="font-medium">{product.productId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("material")}</span>
                        <span className="font-medium">{t("premium_cotton_blend")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("origin")}</span>
                        <span className="font-medium">{t("made_in_brazil")}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-4">{t("categories")}</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.categories.map((category) => (
                        <Badge key={category} variant="outline">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="care" className="mt-8">
            <Card>
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">{t("care_instructions")}</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• {t("care_instruction_1")}</li>
                      <li>• {t("care_instruction_2")}</li>
                      <li>• {t("care_instruction_3")}</li>
                      <li>• {t("care_instruction_4")}</li>
                      <li>• {t("care_instruction_5")}</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">{t("storage_tips")}</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• {t("storage_tips_1")}</li>
                      <li>• {t("storage_tips_2")}</li>
                      <li>• {t("storage_tips_3")}</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-8">
            <Card>
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-semibold">Customer Reviews</h3>
                    <Button variant="outline">Write a Review</Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center">
                      <div className="text-4xl font-bold mb-2">4.8</div>
                      <div className="flex justify-center mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 fill-current text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-muted-foreground">Based on 124 reviews</p>
                    </div>

                    <div className="md:col-span-2 space-y-4">
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <div key={rating} className="flex items-center gap-3">
                          <span className="text-sm w-8">{rating} ★</span>
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div
                              className="bg-yellow-400 h-2 rounded-full"
                              style={{
                                width: `${rating === 5 ? 70 : rating === 4 ? 20 : rating === 3 ? 5 : rating === 2 ? 3 : 2}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-8">
                            {rating === 5 ? 87 : rating === 4 ? 25 : rating === 3 ? 6 : rating === 2 ? 4 : 2}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    {[
                      {
                        name: "Sarah M.",
                        rating: 5,
                        date: "2 days ago",
                        comment:
                          "Absolutely love this piece! The quality is exceptional and the fit is perfect. Highly recommend!",
                      },
                      {
                        name: "Mike R.",
                        rating: 4,
                        date: "1 week ago",
                        comment: "Great quality and fast shipping. The color is exactly as shown in the photos.",
                      },
                      {
                        name: "Emma L.",
                        rating: 5,
                        date: "2 weeks ago",
                        comment: "This has become my favorite piece in my wardrobe. So comfortable and stylish!",
                      },
                    ].map((review, index) => (
                      <div key={index} className="border-b pb-6 last:border-b-0">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="font-medium">{review.name}</span>
                            <div className="flex">
                              {[...Array(review.rating)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-current text-yellow-400" />
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground">{review.date}</span>
                        </div>
                        <p className="text-muted-foreground">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}
