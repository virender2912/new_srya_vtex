"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, CreditCard, Truck, Shield, Check, ShoppingBag } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Layout } from "@/components/layout"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { formatPrice } from "@/lib/vtex-api"
import { useTranslation } from "@/hooks/use-translation"
import { useLanguage } from "@/contexts/language-context"

interface ShippingAddress {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

interface PaymentMethod {
  type: "credit" | "debit" | "pix" | "boleto"
  cardNumber?: string
  expiryDate?: string
  cvv?: string
  cardName?: string
}

export default function CheckoutPage() {
  const { state: cartState, clearCart } = useCart()
  const { state: authState } = useAuth()
  const { t } = useTranslation()
  const { language } = useLanguage()
  const router = useRouter()

  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderId, setOrderId] = useState("")

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: authState.user?.firstName || "",
    lastName: authState.user?.lastName || "",
    email: authState.user?.email || "",
    phone: authState.user?.phone || "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Brazil",
  })

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>({
    type: "credit",
  })

  const [selectedShipping, setSelectedShipping] = useState("standard")
  const [agreeTerms, setAgreeTerms] = useState(false)

  const shippingOptions = [
    { id: "standard", name: "Standard Shipping", price: 0, days: "5-7 business days" },
    { id: "express", name: "Express Shipping", price: 1500, days: "2-3 business days" },
    { id: "overnight", name: "Overnight Shipping", price: 3000, days: "Next business day" },
  ]

  const selectedShippingOption = shippingOptions.find((option) => option.id === selectedShipping)
  const subtotal = cartState.totalPrice
  const shippingCost = selectedShippingOption?.price || 0
  const tax = Math.round(subtotal * 0.1) // 10% tax
  const total = subtotal + shippingCost + tax

  useEffect(() => {
    if (!authState.isLoading && !authState.isAuthenticated) {
      router.push("/login?redirect=/checkout")
    }
    if (cartState.items.length === 0 && !orderPlaced) {
      router.push("/cart")
    }
  }, [authState, cartState, router, orderPlaced])

  const handleAddressChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress((prev) => ({ ...prev, [field]: value }))
  }

  const handlePaymentChange = (field: keyof PaymentMethod, value: string) => {
    setPaymentMethod((prev) => ({ ...prev, [field]: value }))
  }

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return cartState.items.length > 0
      case 2:
        return (
          shippingAddress.firstName &&
          shippingAddress.lastName &&
          shippingAddress.email &&
          shippingAddress.address &&
          shippingAddress.city &&
          shippingAddress.zipCode
        )
      case 3:
        return selectedShipping
      case 4:
        if (paymentMethod.type === "credit" || paymentMethod.type === "debit") {
          return paymentMethod.cardNumber && paymentMethod.expiryDate && paymentMethod.cvv && paymentMethod.cardName
        }
        return true
      default:
        return true
    }
  }

  const placeOrder = async () => {
    setLoading(true)
    try {
      // Create order payload for VTEX
      const orderPayload = {
        items: cartState.items.map((item) => ({
          id: item.skuId,
          quantity: item.quantity,
          seller: "1",
          price: item.price,
        })),

        
        clientProfileData: {
          email: shippingAddress.email,
          firstName: shippingAddress.firstName,
          lastName: shippingAddress.lastName,
          document: "12345678901", // Should be collected in real implementation
          phone: shippingAddress.phone,
        },
        shippingData: {
          address: {
            addressType: "residential",
            receiverName: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
            street: shippingAddress.address,
            city: shippingAddress.city,
            state: shippingAddress.state,
            country: shippingAddress.country,
            postalCode: shippingAddress.zipCode,
          },
          logisticsInfo: [
            {
              itemIndex: 0,
              selectedSla: selectedShipping,
              price: shippingCost,
            },
          ],
        },
        paymentData: {
          payments: [
            {
              paymentSystem: paymentMethod.type === "credit" ? "1" : paymentMethod.type === "debit" ? "2" : "6",
              value: total,
              installments: 1,
            },
          ],
        },
      }

      // Call VTEX order API
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderPayload),
      })

      if (response.ok) {
        const order = await response.json()
        setOrderId(order.orderId || `ORD-${Date.now()}`)
        setOrderPlaced(true)
        clearCart()
      } else {
        throw new Error("Failed to place order")
      }
    } catch (error) {
      console.error("Order placement failed:", error)
      alert("Failed to place order. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (orderPlaced) {
    return (
      <Layout>
        <div className="container py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Order Confirmed!</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Thank you for your purchase. Your order has been successfully placed.
            </p>
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <p className="text-sm text-muted-foreground mb-2">Order Number</p>
              <p className="text-2xl font-bold">{orderId}</p>
            </div>
            <div className="space-y-4">
              <Button size="lg" asChild>
                <Link href="/account">View Order Details</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/products">Continue Shopping</Link>
              </Button>
              
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (!authState.isAuthenticated || cartState.items.length === 0) {
    return null
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/cart">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('Back to Cart')}
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">{t('Checkout')}</h1>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {step}
              </div>
              {step < 5 && <div className={`w-16 h-1 mx-2 ${step < currentStep ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Step 1: Cart Items Review */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    {t('Review Your Cart Items')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {cartState.items.map((item) => (
                      <div key={`${item.productId}-${item.skuId}`} className="flex gap-4 p-4 border rounded-lg">
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
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-muted-foreground">{t('Quantity')}: {item.quantity}</span>
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
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground">{cartState.totalItems} {t('items')}</p>
                      <p className="font-semibold text-lg">{formatPrice(cartState.totalPrice)}</p>
                    </div>
                    <Button onClick={() => setCurrentStep(2)} className="w-auto">
                      {t('Continue to Shipping')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Shipping Address */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    {t('Shipping Address')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">{t('First Name')} *</Label>
                      <Input
                        id="firstName"
                        value={shippingAddress.firstName}
                        onChange={(e) => handleAddressChange("firstName", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">{t('Last Name')} *</Label>
                      <Input
                        id="lastName"
                        value={shippingAddress.lastName}
                        onChange={(e) => handleAddressChange("lastName", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">{t('Email')} *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={shippingAddress.email}
                        onChange={(e) => handleAddressChange("email", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t('Phone')}</Label>
                      <Input
                        id="phone"
                        value={shippingAddress.phone}
                        onChange={(e) => handleAddressChange("phone", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">{t('Address')} *</Label>
                    <Input
                      id="address"
                      value={shippingAddress.address}
                      onChange={(e) => handleAddressChange("address", e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">{t('City')} *</Label>
                      <Input
                        id="city"
                        value={shippingAddress.city}
                        onChange={(e) => handleAddressChange("city", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">{t('State')}</Label>
                      <Select
                        value={shippingAddress.state}
                        onValueChange={(value) => handleAddressChange("state", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SP">São Paulo</SelectItem>
                          <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                          <SelectItem value="MG">Minas Gerais</SelectItem>
                          <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">{t('ZIP Code')} *</Label>
                      <Input
                        id="zipCode"
                        value={shippingAddress.zipCode}
                        onChange={(e) => handleAddressChange("zipCode", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
                      {t('Back')}
                    </Button>
                    <Button onClick={() => setCurrentStep(3)} disabled={!validateStep(2)} className="flex-1">
                      {t('Continue to Shipping Method')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Shipping Method */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('Shipping Method')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={selectedShipping} onValueChange={setSelectedShipping}>
                    {shippingOptions.map((option) => (
                      <div key={option.id} className="flex items-center space-x-3 p-4 border rounded-lg">
                        <RadioGroupItem value={option.id} id={option.id} />
                        <div className="flex-1">
                          <Label htmlFor={option.id} className="font-medium">
                            {option.name}
                          </Label>
                          <p className="text-sm text-muted-foreground">{option.days}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{option.price === 0 ? "Free" : formatPrice(option.price)}</p>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>

                  <div className="flex gap-4 mt-6">
                    <Button variant="outline" onClick={() => setCurrentStep(2)} className="flex-1">
                      {t('Back')}
                    </Button>
                    <Button onClick={() => setCurrentStep(4)} className="flex-1">
                      {t('Continue to Payment')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Payment */}
            {currentStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    {t('Payment Method')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <RadioGroup value={paymentMethod.type} onValueChange={(value) => handlePaymentChange("type", value)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="credit" id="credit" />
                      <Label htmlFor="credit">Credit Card</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="debit" id="debit" />
                      <Label htmlFor="debit">Debit Card</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pix" id="pix" />
                      <Label htmlFor="pix">PIX</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="boleto" id="boleto" />
                      <Label htmlFor="boleto">Boleto</Label>
                    </div>
                  </RadioGroup>

                  {(paymentMethod.type === "credit" || paymentMethod.type === "debit") && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardName">Cardholder Name *</Label>
                        <Input
                          id="cardName"
                          value={paymentMethod.cardName || ""}
                          onChange={(e) => handlePaymentChange("cardName", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Card Number *</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={paymentMethod.cardNumber || ""}
                          onChange={(e) => handlePaymentChange("cardNumber", e.target.value)}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiryDate">Expiry Date *</Label>
                          <Input
                            id="expiryDate"
                            placeholder="MM/YY"
                            value={paymentMethod.expiryDate || ""}
                            onChange={(e) => handlePaymentChange("expiryDate", e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvv">CVV *</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            value={paymentMethod.cvv || ""}
                            onChange={(e) => handlePaymentChange("cvv", e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => setCurrentStep(3)} className="flex-1">
                      {t('Back')}
                    </Button>
                    <Button onClick={() => setCurrentStep(5)} disabled={!validateStep(4)} className="flex-1">
                      {t('Review Order')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 5: Review */}
            {currentStep === 5 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('Review Your Order')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="terms" 
                      checked={agreeTerms} 
                      onCheckedChange={(checked) => setAgreeTerms(checked === true)} 
                    />
                    <Label htmlFor="terms" className="text-sm">
                      I agree to the{" "}
                      <Link href="/terms" className="text-primary hover:underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-primary hover:underline">
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => setCurrentStep(4)} className="flex-1">
                      {t('Back')}
                    </Button>
                    <Button onClick={placeOrder} disabled={!agreeTerms || loading} className="flex-1">
                      {loading ? "Placing Order..." : `Place Order - ${formatPrice(total)}`}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>{t('Order Summary')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3">
                  {cartState.items.map((item) => (
                    <div key={`${item.productId}-${item.skuId}`} className="flex gap-3">
                      <div className="relative w-16 h-16 rounded border">
                        <Image
                          src={item.imageUrl || "/placeholder.svg"}
                          alt={item.productName}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-2">
                          {language === "ar"
                            ? item.productName_ar?.trim() || item.productName
                            : item.productName}
                        </h4>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        <p className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>{t('Subtotal')}</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('Shipping')}</span>
                    <span>{shippingCost === 0 ? "Free" : formatPrice(shippingCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('Tax')}</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>{t('Total')}</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Security */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>{t('Secure checkout powered by VTEX')}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}
