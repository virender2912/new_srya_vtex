"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"
import type { VtexProduct } from "@/lib/vtex-api"

export interface WishlistItem {
  productId: string
  productName: string
  brand: string
  price: number
  listPrice: number
  imageUrl: string
  linkText: string
  addedAt: string
}

interface WishlistState {
  items: WishlistItem[]
  totalItems: number
}

type WishlistAction =
  | { type: "ADD_ITEM"; payload: WishlistItem }
  | { type: "REMOVE_ITEM"; payload: { productId: string } }
  | { type: "CLEAR_WISHLIST" }
  | { type: "LOAD_WISHLIST"; payload: WishlistItem[] }

const initialState: WishlistState = {
  items: [],
  totalItems: 0,
}

function wishlistReducer(state: WishlistState, action: WishlistAction): WishlistState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItem = state.items.find((item) => item.productId === action.payload.productId)
      if (existingItem) {
        return state // Item already in wishlist
      }

      const newItems = [...state.items, action.payload]
      return {
        ...state,
        items: newItems,
        totalItems: newItems.length,
      }
    }

    case "REMOVE_ITEM": {
      const newItems = state.items.filter((item) => item.productId !== action.payload.productId)
      return {
        ...state,
        items: newItems,
        totalItems: newItems.length,
      }
    }

    case "CLEAR_WISHLIST":
      return {
        ...state,
        items: [],
        totalItems: 0,
      }

    case "LOAD_WISHLIST": {
      const items = action.payload
      return {
        ...state,
        items,
        totalItems: items.length,
      }
    }

    default:
      return state
  }
}

const WishlistContext = createContext<{
  state: WishlistState
  dispatch: React.Dispatch<WishlistAction>
  addItem: (product: VtexProduct) => void
  removeItem: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => void
} | null>(null)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(wishlistReducer, initialState)

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem("vtex-wishlist")
    if (savedWishlist) {
      try {
        const wishlistItems = JSON.parse(savedWishlist)
        dispatch({ type: "LOAD_WISHLIST", payload: wishlistItems })
      } catch (error) {
        console.error("Failed to load wishlist from localStorage:", error)
      }
    }
  }, [])

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("vtex-wishlist", JSON.stringify(state.items))
  }, [state.items])

  const addItem = (product: VtexProduct) => {
    const firstSku = product.items[0]
    const seller = firstSku?.sellers.find((s) => s.sellerDefault) || firstSku?.sellers[0]
    const price = seller?.commertialOffer?.Price || 0
    const listPrice = seller?.commertialOffer?.ListPrice || 0
    const imageUrl = firstSku?.images[0]?.imageUrl || ""

    const wishlistItem: WishlistItem = {
      productId: product.productId,
      productName: product.productName,
      brand: product.brand,
      price,
      listPrice,
      imageUrl,
      linkText: product.linkText,
      addedAt: new Date().toISOString(),
    }

    dispatch({ type: "ADD_ITEM", payload: wishlistItem })
  }

  const removeItem = (productId: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: { productId } })
  }

  const isInWishlist = (productId: string) => {
    return state.items.some((item) => item.productId === productId)
  }

  const clearWishlist = () => {
    dispatch({ type: "CLEAR_WISHLIST" })
  }

  return (
    <WishlistContext.Provider
      value={{
        state,
        dispatch,
        addItem,
        removeItem,
        isInWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}
