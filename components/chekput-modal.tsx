"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ExternalLink, AlertCircle, Loader2 } from "lucide-react"

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  orderFormId: string
  onProceed: (url: string) => void
}

export function CheckoutModal({ isOpen, onClose, orderFormId, onProceed }: CheckoutModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checkoutUrls, setCheckoutUrls] = useState<{
    checkoutUrl: string
    alternativeCheckoutUrl: string
    gatewayUrl: string
  } | null>(null)

  const prepareCheckout = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/vtex/checkout/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderFormId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 404 || response.status === 400) {
          throw new Error("Cart session expired. Please refresh the page and try again.")
        }
        throw new Error(errorData.error || "Failed to prepare checkout")
      }

      const data = await response.json()
      setCheckoutUrls({
        checkoutUrl: data.checkoutUrl,
        alternativeCheckoutUrl: data.alternativeCheckoutUrl,
        gatewayUrl: data.gatewayUrl,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to prepare checkout")
      console.error("Checkout preparation error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleProceed = (url: string) => {
    onProceed(url)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Proceed to Checkout</DialogTitle>
          <DialogDescription>
            You will be redirected to VTEX's secure checkout page to complete your purchase.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!checkoutUrls && !error && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-600 mb-4">Click the button below to prepare your checkout.</p>
              <Button onClick={prepareCheckout} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Preparing...
                  </>
                ) : (
                  "Prepare Checkout"
                )}
              </Button>
            </div>
          )}

          {checkoutUrls && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">Ready to complete your purchase!</p>

              <Button
                onClick={() => handleProceed(checkoutUrls.checkoutUrl)}
                className="w-full justify-between"
                variant="default"
                size="lg"
              >
                <span>Proceed to Checkout</span>
                <ExternalLink className="h-4 w-4" />
              </Button>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  You will be redirected to VTEX's secure checkout page to complete your purchase.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
