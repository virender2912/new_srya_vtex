"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { VTEXOrderForm } from "@/lib/vtex-api"
import { CheckoutModal } from "@/components/chekput-modal"
import { getProductInfo } from "@/lib/vtex-api"
const VTEX_ACCOUNT = process.env.NEXT_PUBLIC_VTEX_ACCOUNT || "iamtechiepartneruae"
const VTEX_ENVIRONMENT = process.env.NEXT_PUBLIC_VTEX_ENVIRONMENT || "vtexcommercestable"


interface CartItem {
  productId: string
  skuId: string
  productName: string
  productName_ar?: string
  skuName: string
  brand: string
  price: number
  listPrice: number
  quantity: number
  availableQuantity: number
  imageUrl: string
  linkText: string
}

interface CartState {
  items: CartItem[]
  totalItems: number
  totalPrice: number
}

interface CartContextType {
  state: CartState
  orderForm: VTEXOrderForm | null
  loading: boolean
  error: string | null
  isCartOpen: boolean
  addItem: (productId: string, skuId: string, quantity: number, seller?: string) => Promise<void>
  addToCart: (productId: string, quantity: number, seller?: string) => Promise<void>
  updateQuantity: (productId: string, skuId: string, quantity: number) => Promise<void>
  removeItem: (productId: string, skuId: string) => Promise<void>
  removeFromCart: (itemIndex: number) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
  proceedToCheckout: () => void
  showCheckoutModal: boolean
  setShowCheckoutModal: (show: boolean) => void
  toggleCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [orderForm, setOrderForm] = useState<VTEXOrderForm | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)


  // Initialize or get existing orderForm
  useEffect(() => {
    initializeOrderForm()
  }, [])

  // Refresh cart when page becomes visible (user returns from checkout)


  // useEffect(() => {
  //   const handleVisibilityChange = () => {
  //     if (!document.hidden && orderForm) {
  //      refreshCart()
  //     }
  //   }


useEffect(() => {
  const handleVisibilityChange = async () => {
    if (!document.hidden && orderForm) {
      try {
        await refreshCart()
      } catch (err) {
        console.error("Failed to refresh cart on tab visibility:", err)
      }
    }
  }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [orderForm])

  // Auto-refresh cart periodically to keep it fresh
  useEffect(() => {
    if (!orderForm) return

    const interval = setInterval(async () => {
      try {
      
        const response = await fetch(`/api/vtex/orderform/${orderForm.orderFormId}`)
        if (!response.ok && response.status === 404) {
         await refreshCart()
        }
      } catch (err) {
        console.warn("Auto-refresh failed:", err)
      }
    }, 5 * 60 * 1000) // Check every 5 minutes

    return () => clearInterval(interval)
  }, [orderForm?.orderFormId])

  const initializeOrderForm = async () => {
    try {
      setLoading(true)
      setError(null)

      // Check if we have a stored orderForm and validate it
      const storedOrderFormId = localStorage.getItem("vtex-orderform-id")
      
      if (storedOrderFormId) {
        try {
          console.log("Checking stored orderForm:", storedOrderFormId)
          const response = await fetch(`/api/vtex/orderform/${storedOrderFormId}`)
          if (response.ok) {
            const data = await response.json()
            console.log("Using existing orderForm:", {
              orderFormId: data.orderFormId,
              itemsCount: data.items?.length || 0
            })
            setOrderForm(data)
            return
          } else {
            console.log("Stored orderForm is invalid, creating new one")
            localStorage.removeItem("vtex-orderform-id")
          }
        } catch (err) {
          console.log("Failed to retrieve stored orderForm, creating new one:", err)
          localStorage.removeItem("vtex-orderform-id")
        }
      }

      console.log("Creating new orderForm")
      const response = await fetch("/api/vtex/orderform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientPreferencesData: { locale: "en-US" }
        })
      })

      if (response.ok) {
        const data = await response.json()
        setOrderForm(data)
        localStorage.setItem("vtex-orderform-id", data.orderFormId)
      } else {
        const errorData = await response.json()
        console.error("OrderForm creation failed:", errorData)
        
        if (errorData.details?.includes("authentication failed")) {
          throw new Error("VTEX API authentication failed. Please check your API credentials.")
        } else if (errorData.details?.includes("endpoint not found")) {
          throw new Error("VTEX API endpoint not found. Please check your account configuration.")
        } else if (errorData.config && !errorData.config.hasCredentials) {
          throw new Error("VTEX API credentials are missing. Please set VTEX_APP_KEY and VTEX_APP_TOKEN environment variables. See VTEX_SETUP.md for instructions.")
        } else if (errorData.details?.includes("credentials are required")) {
          throw new Error("VTEX API credentials are required for cart functionality. Please set VTEX_APP_KEY and VTEX_APP_TOKEN environment variables.")
        } else {
          throw new Error(errorData.details || "Failed to create orderForm")
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to initialize cart"
      setError(errorMessage)
      console.error("Cart initialization error:", err)
    } finally {
      setLoading(false)
    }
  }

  const addItem = async (productId: string, skuId: string, quantity: number, seller = "1") => {
    // Initialize orderForm if it doesn't exist
    if (!orderForm) {
      await initializeOrderForm()
      if (!orderForm) {
        setError("Failed to initialize cart")
        return
      }
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/vtex/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderFormId: orderForm.orderFormId,
          items: [
            {
              id: skuId, // Use the actual SKU ID (string)
              quantity,
              seller
            },
          ],
        }),
      })

      if (response.ok) {
        const updatedOrderForm = await response.json()
        setOrderForm(updatedOrderForm)
        setIsCartOpen(true)
        setError(null) // Clear any previous errors
      } else if (response.status === 404 || response.status === 400) {
        console.log("Order form invalid, recreating...")
        await handleOrderFormInvalidation()
        // Try again with the new order form
        await addItem(productId, skuId, quantity, seller)
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error("Add to cart failed:", errorData)
        throw new Error(`Failed to add item to cart: ${response.status}`)
      }
    } catch (err) {
      setError("Failed to add item to cart")
      console.error("Add to cart error:", err)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (productId: string, quantity: number, seller = "1") => {
    if (!orderForm) {
      await initializeOrderForm()
      if (!orderForm) {
        setError("Failed to initialize cart")
        return
      }
    }

    try {
      setLoading(true)
      setError(null)

      // Get product to find the first available SKU
      const { getProductById } = await import("@/lib/vtex-api")
      const product = await getProductById(productId)
      const firstSku = product.items[0]
      
      if (!firstSku) {
        throw new Error("No SKU found for product")
      }
      
      const response = await fetch("/api/vtex/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderFormId: orderForm.orderFormId,
          items: [
            {
              id: firstSku.itemId, // Use the actual SKU ID
              quantity,
              seller,
            },
          ],
           
        }),
      })

      if (response.ok) {
        const updatedOrderForm = await response.json()
        setOrderForm(updatedOrderForm)
        setIsCartOpen(true)
        setError(null) // Clear any previous errors
      } else if (response.status === 404 || response.status === 400) {
        await handleOrderFormInvalidation()
        if (orderForm) {
          await addToCart(productId, quantity, seller)
        }
      } else {
        throw new Error("Failed to add item to cart")
      }
    } catch (err) {
      setError("Failed to add item to cart")
      console.error("Add to cart error:", err)
      throw err // Re-throw the error so the calling function knows it failed
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (productId: string, skuId: string, quantity: number) => {
    if (!orderForm) return

    try {
      setLoading(true)
      setError(null)

      // Find the item index in the orderForm
      const itemIndex = orderForm.items.findIndex(item => 
        item.id === skuId || item.productId === productId
      )
       

      if (itemIndex === -1) {
        throw new Error("Item not found in cart")
      }

      const response = await fetch("/api/vtex/cart/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderFormId: orderForm.orderFormId,
          itemIndex,
          quantity,
        }),
      })

      if (response.ok) {
        const updatedOrderForm = await response.json()
        setOrderForm(updatedOrderForm)
        console.log(updatedOrderForm)
      } else {
        throw new Error("Failed to update item quantity")
      }
    } catch (err) {
      setError("Failed to update item quantity")
      console.error("Update quantity error:", err)
    } finally {
      setLoading(false)
    }
  }

  const removeItem = async (productId: string, skuId: string) => {
    if (!orderForm) return

    try {
      setLoading(true)
      setError(null)

      // Find the item index in the orderForm
      const itemIndex = orderForm.items.findIndex(item => 
        item.id === skuId || item.productId === productId
      )

      if (itemIndex === -1) {
        throw new Error("Item not found in cart")
      }

      const response = await fetch("/api/vtex/cart/remove", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderFormId: orderForm.orderFormId,
          itemIndex,
        }),
      })

      if (response.ok) {
        const updatedOrderForm = await response.json()
        setOrderForm(updatedOrderForm)
        // setLastModified(Date.now())
      } else {
        throw new Error("Failed to remove item from cart")
      }
    } catch (err) {
      setError("Failed to remove item from cart")
      console.error("Remove from cart error:", err)
    } finally {
      setLoading(false)
    }
  }

  const removeFromCart = async (itemIndex: number) => {
    if (!orderForm) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/vtex/cart/remove", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderFormId: orderForm.orderFormId,
          itemIndex,
        }),
      })

      if (response.ok) {
        const updatedOrderForm = await response.json()
        setOrderForm(updatedOrderForm)
        // setLastModified(Date.now())
      } else {
        throw new Error("Failed to remove item from cart")
      }
    } catch (err) {
      setError("Failed to remove item from cart")
      console.error("Remove from cart error:", err)
    } finally {
      setLoading(false)
    }
  }

  const clearCart = async () => {
    if (!orderForm) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/vtex/cart/clear", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderFormId: orderForm.orderFormId,
        }),
      })

      if (response.ok) {
        const updatedOrderForm = await response.json()
        setOrderForm(updatedOrderForm)
        // setLastModified(Date.now())
      } else {
        throw new Error("Failed to clear cart")
      }
    } catch (err) {
      setError("Failed to clear cart")
      console.error("Clear cart error:", err)
    } finally {
      setLoading(false)
    }
  }

  const refreshCart = async () => {
    console.log("Refreshing cart...")
    
    if (!orderForm) {
      await initializeOrderForm()
      return
    }



    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/vtex/orderform/${orderForm.orderFormId}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log("Cart refreshed successfully:", {
          orderFormId: data.orderFormId,
          itemsCount: data.items?.length || 0,
          items: data.items?.map((item: any) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity
          }))
        })
        setOrderForm(data)
      } else if (response.status === 404) {
        console.warn("OrderForm not found, recreating...")
        localStorage.removeItem("vtex-orderform-id")
        setOrderForm(null)
        await initializeOrderForm()
      } else {
        throw new Error("Failed to refresh cart")
      }
    } catch (err) {
      setError("Failed to refresh cart")
      console.error("Refresh cart error:", err)
      // Try to reinitialize if refresh fails
      try {
        localStorage.removeItem("vtex-orderform-id")
        setOrderForm(null)
        await initializeOrderForm()
      } catch (reinitErr) {
        console.error("Failed to reinitialize cart:", reinitErr)
      }
    } finally {
      setLoading(false)
    }
  }

  const proceedToCheckout = async () => {
    if (!orderForm) {
      setError("Cart is not initialized")
      return
    }

    console.log("Proceeding to checkout with orderForm:", {
      orderFormId: orderForm.orderFormId,
      itemsCount: orderForm.items.length,
      items: orderForm.items.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity
      }))
    })

    // Ensure we have the latest orderForm data
    try {
      const response = await fetch(`/api/vtex/orderform/${orderForm.orderFormId}`)
      if (response.ok) {
        const latestOrderForm = await response.json()
        console.log("Latest orderForm from server:", {
          orderFormId: latestOrderForm.orderFormId,
          itemsCount: latestOrderForm.items?.length || 0,
          items: latestOrderForm.items?.map((item: any) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity
          }))
        })
        setOrderForm(latestOrderForm)
      }
    } catch (err) {
      console.warn("Failed to get latest orderForm:", err)
    }

    // Validate orderForm before checkout
    const isValid = await validateOrderForm()
    if (!isValid) {
      console.log("OrderForm validation failed, recreating...")
      await handleOrderFormInvalidation()
      if (!orderForm) {
        setError("Failed to initialize cart")
        return
      }
    }

    if (orderForm && orderForm.items.length > 0) {
      try {
        setLoading(true)
        setError(null)

        // Prepare checkout
        const response = await fetch("/api/vtex/checkout/prepare", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderFormId: orderForm.orderFormId }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to prepare checkout")
        }

        const data = await response.json()
        console.log("Checkout prepared successfully:", data)
        
        // Ensure the checkout URL includes the correct orderFormId
        const checkoutUrl = data.checkoutUrl.includes('orderFormId=') 
          ? data.checkoutUrl 
          : `${data.checkoutUrl}?orderFormId=${orderForm.orderFormId}`
        
        console.log("Final checkout URL:", checkoutUrl)
        console.log("Using orderFormId for checkout:", orderForm.orderFormId)
        console.log("OrderForm items for checkout:", orderForm.items?.map((item: any) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity
        })))
        
        // Go directly to checkout
        handleCheckoutProceed(checkoutUrl)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to proceed to checkout")
        console.error("Checkout error:", err)
      } finally {
        setLoading(false)
      }
    } else {
      setError("Cart is empty")
    }
  }

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen)
  }

  const closeCart = () => {
    setIsCartOpen(false)
  }

  const handleCheckoutProceed = (url: string) => {
    // Open in new tab first, then redirect current page as fallback
    const newWindow = window.open(url, "_blank")

    // If popup was blocked, redirect current page
    setTimeout(() => {
      if (!newWindow || newWindow.closed) {
        window.location.href = url
      }
    }, 1000)
  }

  const validateOrderForm = async (): Promise<boolean> => {
    if (!orderForm) return false

    try {
      const response = await fetch(`/api/vtex/orderform/${orderForm.orderFormId}`)
      return response.ok
    } catch (err) {
      console.warn("OrderForm validation failed:", err)
      return false
    }
  }

  const handleOrderFormInvalidation = async () => {
    console.warn("OrderForm is invalid, recreating...")
    localStorage.removeItem("vtex-orderform-id")
    setOrderForm(null)
    await initializeOrderForm()
  }

  const clearCartAndStartFresh = async () => {
    console.log("Clearing cart and starting fresh...")
    localStorage.removeItem("vtex-orderform-id")
    setOrderForm(null)
    await initializeOrderForm()
  }

  // Transform orderForm to cart state
  const transformOrderFormToCartState = (): CartState => {
    if (!orderForm) {
      return { items: [], totalItems: 0, totalPrice: 0 }
    }

    const items: CartItem[] = []
    let totalPrice = 0

    orderForm.items.forEach(item => {
      items.push({
        productId: item.productId,
        skuId: item.id,
        productName: item.name,
        productName_ar: item.name,
        skuName: item.name,
        brand: item.name,
        price: item.price,
        listPrice: item.price,
        quantity: item.quantity,
        availableQuantity: item.availableQuantity || 50,
        imageUrl: item.imageUrl,
        linkText: item.name,
      })
    
      totalPrice += item.price * item.quantity
    })

    return {
      items,
      totalItems: items.length,
      totalPrice,
    }
  }

  const cartState = transformOrderFormToCartState()

  return (
    <CartContext.Provider
      value={{
        state: cartState,
        orderForm,
        loading,
        error,
        isCartOpen,
        addItem,
        addToCart,
        updateQuantity,
        removeItem,
        removeFromCart,
        clearCart,
        refreshCart,
        proceedToCheckout,
        showCheckoutModal,
        setShowCheckoutModal,
        toggleCart,
        closeCart,
      }}
    >
      {children}
      {orderForm && (
        <CheckoutModal
          isOpen={showCheckoutModal}
          onClose={() => setShowCheckoutModal(false)}
          orderFormId={orderForm.orderFormId}
          onProceed={handleCheckoutProceed}
        />
      )}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
