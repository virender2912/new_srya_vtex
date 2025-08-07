"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"
import type { VtexProduct, VtexSku } from "@/lib/vtex-api"

export interface CartItem {
  productId: string
  skuId: string
  productName: string
  skuName: string
  brand: string
  price: number
  listPrice: number
  imageUrl: string
  quantity: number
  linkText: string
  availableQuantity: number
  productName_ar?: string
  skuName_ar?: string
brand_ar?: string
}

interface CartState {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  isOpen: boolean
}

type CartAction =
  | { type: "ADD_ITEM"; payload: { product: VtexProduct; sku: VtexSku; quantity: number } }
  | { type: "REMOVE_ITEM"; payload: { productId: string; skuId: string } }
  | { type: "UPDATE_QUANTITY"; payload: { productId: string; skuId: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "TOGGLE_CART" }
  | { type: "OPEN_CART" }
  | { type: "CLOSE_CART" }
  | { type: "LOAD_CART"; payload: CartItem[] }

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  isOpen: false,
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const { product, sku, quantity } = action.payload
      const existingItemIndex = state.items.findIndex(
        (item) => item.productId === product.productId && item.skuId === sku.itemId,
      )

const seller = sku?.sellers?.find((s) => s.sellerDefault) || sku?.sellers?.[0] || null;

const price = seller?.commertialOffer?.Price || 0;
const listPrice = seller?.commertialOffer?.ListPrice || 0;
const availableQuantity = seller?.commertialOffer?.AvailableQuantity || 0;

      let newItems: CartItem[]

      if (existingItemIndex >= 0) {
        // Update existing item
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: Math.min(item.quantity + quantity, availableQuantity) }
            : item,
        )
      } else {
        // Add new item
        const newItem: CartItem = {
        productId: product.productId,
  skuId: sku.itemId,
  productName: product.productName,
  productName_ar: product.Arabic_title?.[0] || product.productName,
  skuName: sku.name,
  brand: product.brand,
  price,
  listPrice,
  imageUrl: sku?.images?.[0]?.imageUrl || "",
  quantity: Math.min(quantity, availableQuantity),
  linkText: product.linkText,
  availableQuantity,
        }
        newItems = [...state.items, newItem]
      }

      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0)
      const totalPrice = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

      return {
        ...state,
        items: newItems,
        totalItems,
        totalPrice,
        isOpen: true,
      }
    }

    case "REMOVE_ITEM": {
      const newItems = state.items.filter(
        (item) => !(item.productId === action.payload.productId && item.skuId === action.payload.skuId),
      )
      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0)
      const totalPrice = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

      return {
        ...state,
        items: newItems,
        totalItems,
        totalPrice,
      }
    }

    case "UPDATE_QUANTITY": {
      const { productId, skuId, quantity } = action.payload
      const newItems = state.items
        .map((item) =>
          item.productId === productId && item.skuId === skuId
            ? { ...item, quantity: Math.min(Math.max(0, quantity), item.availableQuantity) }
            : item,
        )
        .filter((item) => item.quantity > 0)

      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0)
      const totalPrice = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

      return {
        ...state,
        items: newItems,
        totalItems,
        totalPrice,
      }
    }

    case "CLEAR_CART":
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalPrice: 0,
      }

    case "TOGGLE_CART":
      return {
        ...state,
        isOpen: !state.isOpen,
      }

    case "OPEN_CART":
      return {
        ...state,
        isOpen: true,
      }

    case "CLOSE_CART":
      return {
        ...state,
        isOpen: false,
      }

    case "LOAD_CART": {
      const items = action.payload
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
      const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

      return {
        ...state,
        items,
        totalItems,
        totalPrice,
      }
    }

    default:
      return state
  }
}

const CartContext = createContext<{
  state: CartState
  dispatch: React.Dispatch<CartAction>
  addItem: (product: VtexProduct, sku: VtexSku, quantity?: number) => void
  removeItem: (productId: string, skuId: string) => void
  updateQuantity: (productId: string, skuId: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
} | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("vtex-cart")
    if (savedCart) {
      try {
        const cartItems = JSON.parse(savedCart)
        dispatch({ type: "LOAD_CART", payload: cartItems })
      } catch (error) {
        console.error("Failed to load cart from localStorage:", error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("vtex-cart", JSON.stringify(state.items))
  }, [state.items])

  const addItem = (product: VtexProduct, sku: VtexSku, quantity = 1) => {
    dispatch({ type: "ADD_ITEM", payload: { product, sku, quantity } })
  }

  const removeItem = (productId: string, skuId: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: { productId, skuId } })
  }

  const updateQuantity = (productId: string, skuId: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { productId, skuId, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" })
  }

  const toggleCart = () => {
    dispatch({ type: "TOGGLE_CART" })
  }

  const openCart = () => {
    dispatch({ type: "OPEN_CART" })
  }

  const closeCart = () => {
    dispatch({ type: "CLOSE_CART" })
  }

  return (
    <CartContext.Provider
      value={{
        state,
        dispatch,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        toggleCart,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
