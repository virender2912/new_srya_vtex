"use client"

import type React from "react"

import { Search, ShoppingCart, Menu, User, Heart } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useCart } from "@/contexts/cart-context"
import { useWishlist } from "@/contexts/wishlist-context"
import { useAuth } from "@/contexts/auth-context"
import { LiveSearch } from "@/components/live-search"

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { state: cartState, toggleCart } = useCart()
  const { state: wishlistState } = useWishlist()
  const { state: authState, logout } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      {/* Top Banner */}
      <div className="bg-black text-white text-center py-2 text-sm">
        <p>Free shipping on orders over $75 | New arrivals weekly</p>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-20 items-center">
          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <nav className="flex flex-col space-y-6 pt-6">
                <Link href="/" className="text-2xl font-light">
                  FASHION
                </Link>
                <div className="space-y-4">
                  <Link href="/category/womens-fashion" className="block text-lg hover:text-primary transition-colors">
                    Women's
                  </Link>
                  <Link href="/category/mens-fashion" className="block text-lg hover:text-primary transition-colors">
                    Men's
                  </Link>
                  <Link href="/category/accessories" className="block text-lg hover:text-primary transition-colors">
                    Accessories
                  </Link>
                  <Link href="/category/shoes" className="block text-lg hover:text-primary transition-colors">
                    Shoes
                  </Link>
                  <Link
                    href="/category/sale"
                    className="block text-lg hover:text-primary transition-colors text-red-600"
                  >
                    Sale
                  </Link>
                </div>
                <div className="pt-6 border-t space-y-4">
                  <Link href="/wishlist" className="block text-sm">
                    Wishlist ({wishlistState.totalItems})
                  </Link>
                  <Link href="/cart" className="block text-sm">
                    Cart ({cartState.totalItems})
                  </Link>
                  {authState.isAuthenticated ? (
                    <>
                      <Link href="/account" className="block text-sm">
                        My Account
                      </Link>
                      <button onClick={logout} className="block text-sm text-left">
                        Logout
                      </button>
                    </>
                  ) : (
                    <Link href="/login" className="block text-sm">
                      Login
                    </Link>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="mr-8 flex items-center space-x-2">
            <span className="text-3xl font-light tracking-wider">FASHION</span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium tracking-wide">
            <Link href="/category/nike" className="transition-colors hover:text-primary uppercase">
             Nike
            </Link>
            <Link href="/category/mens" className="transition-colors hover:text-primary uppercase">
              Men's
            </Link>
            <Link href="/category/scarf" className="transition-colors hover:text-primary uppercase">
              Accessories
            </Link>
            <Link href="/category/nike" className="transition-colors hover:text-primary uppercase">
              Shoes
            </Link>
            <Link href="/category/sale" className="transition-colors hover:text-red-600 uppercase text-red-600">
              Sale
            </Link>
          </nav>

          <div className="flex flex-1 items-center justify-end space-x-4">
            {/* Desktop Live Search */}
            <div className="hidden sm:block">
              <LiveSearch className="w-[250px] lg:w-[350px]" />
            </div>

            {/* Mobile search */}
            <Button variant="ghost" size="icon" className="sm:hidden" asChild>
              <Link href="/search">
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Link>
            </Button>

            {/* Wishlist */}
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link href="/wishlist">
                <Heart className="h-5 w-5" />
                {wishlistState.totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                    {wishlistState.totalItems > 99 ? "99+" : wishlistState.totalItems}
                  </span>
                )}
                <span className="sr-only">Wishlist</span>
              </Link>
            </Button>

            {/* User account */}
            {authState.isAuthenticated ? (
              <Button variant="ghost" size="icon" asChild>
                <Link href="/account">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Account</span>
                </Link>
              </Button>
            ) : (
              <Button variant="ghost" size="icon" asChild>
                <Link href="/login">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Login</span>
                </Link>
              </Button>
            )}

            {/* Cart */}
            <Button variant="ghost" size="icon" className="relative" onClick={toggleCart}>
              <ShoppingCart className="h-5 w-5" />
              {cartState.totalItems > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-black text-xs text-white flex items-center justify-center">
                  {cartState.totalItems > 99 ? "99+" : cartState.totalItems}
                </span>
              )}
              <span className="sr-only">Shopping cart</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-black text-white">
        <div className="container py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <h3 className="text-2xl font-light mb-6 tracking-wider">FASHION</h3>
              <p className="text-white/80 leading-relaxed">
                Discover timeless elegance and contemporary style. Your destination for premium fashion.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-6 uppercase tracking-wide">Shop</h4>
              <ul className="space-y-3 text-white/80">
                <li>
                  <Link href="/category/womens-fashion" className="hover:text-white transition-colors">
                    Women's Fashion
                  </Link>
                </li>
                <li>
                  <Link href="/category/mens-fashion" className="hover:text-white transition-colors">
                    Men's Fashion
                  </Link>
                </li>
                <li>
                  <Link href="/category/accessories" className="hover:text-white transition-colors">
                    Accessories
                  </Link>
                </li>
                <li>
                  <Link href="/category/sale" className="hover:text-white transition-colors">
                    Sale
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-6 uppercase tracking-wide">Customer Care</h4>
              <ul className="space-y-3 text-white/80">
                <li>
                  <Link href="/help" className="hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/shipping" className="hover:text-white transition-colors">
                    Shipping & Returns
                  </Link>
                </li>
                <li>
                  <Link href="/size-guide" className="hover:text-white transition-colors">
                    Size Guide
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-6 uppercase tracking-wide">Connect</h4>
              <ul className="space-y-3 text-white/80">
                <li>
                  <Link href="/newsletter" className="hover:text-white transition-colors">
                    Newsletter
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Instagram
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Facebook
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Twitter
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/20 text-center text-white/60">
            <p>&copy; 2024 Fashion Store. All rights reserved. | Privacy Policy | Terms of Service</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
