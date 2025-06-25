import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

import { AuthProvider } from "@/contexts/auth-context"
import { CartProvider } from "@/contexts/cart-context"
import { WishlistProvider } from "@/contexts/wishlist-context"
import { CartDrawer } from "@/components/cart-drawer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Fashion Store - Modern Fashion E-commerce",
  description: "Discover the latest fashion trends and timeless classics. Shop women's, men's fashion and accessories.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              {children}
              <CartDrawer />
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
