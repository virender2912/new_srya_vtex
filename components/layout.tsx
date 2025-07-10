"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, ShoppingCart, Menu, User, Heart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useCart } from "@/contexts/cart-context"
import { useWishlist } from "@/contexts/wishlist-context"
import { useAuth } from "@/contexts/auth-context"
import { LiveSearch } from "@/components/live-search"
import LanguageToggle from "./language-toggle"
import { useTranslation } from "@/hooks/use-translation"
import { useLanguage } from "@/contexts/language-context"

interface LayoutProps {
  children: React.ReactNode
}

interface Category {
  id: string
  name: string
  slug: string
  children?: {
    id: string
    name: string
    slug: string
    productCount: number
  }[]
}

export function Layout({ children }: LayoutProps) {
  const { state: cartState, toggleCart } = useCart()
  const { state: wishlistState } = useWishlist()
  const { state: authState, logout } = useAuth()
  const { t } = useTranslation()
  const { isRTL } = useLanguage()

  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories")
        const data = await res.json()
    setCategories(
  data.filter((cat: Category) =>
    ["men", "women", "kids", "baby", "sports"].includes(cat.slug.toLowerCase())
  )
)
      } catch (err) {
        console.error("Failed to load categories", err)
      }
    }

    fetchCategories()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Top Banner */}
      <div className="bg-black text-white text-center py-2 text-sm">
        <p>
           {t("announcement_bar")}
        </p>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-20 items-center">
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <div>
                
            {authState.isAuthenticated ? (
              <Button variant="ghost" size="icon" asChild>
                <Link href="/account">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <Button variant="ghost" size="icon" asChild>
                <Link href="/login">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            )}

            <LanguageToggle/>
              </div>
              {/* Mobile Nav (optional) */}
              <nav className="flex flex-col space-y-6 pt-6">
                {categories.map((cat) => (
                  <div key={cat.id}>
                    <Link href={`/category/${cat.slug}`} className="block text-lg font-medium">
                      {cat.name}
                    </Link>
                    {cat.children?.map((sub) => (
                      <Link
                        key={sub.id}
                        href={`/category/${cat.slug}/${sub.slug}`}
                        className="block text-sm ml-4 text-gray-600"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="mr-8 flex items-center space-x-2 logoimage">
            <Image
              src="/Logo Final (1).png"
              alt="Fashion Logo"
              width={120}
              height={40}
              priority
            />
          </Link>

          {/* Desktop Navigation with Subcategories */}
     <nav className="hidden md:flex items-center space-x-6 text-sm font-medium tracking-wide relative">
  {categories.map((category) => (
    <div key={category.id} className="group relative">
      <Link
        href={`/category/${category.slug}`}
        className="transition-colors hover:text-primary uppercase"
      >
        {category.name}
      </Link>

      {category.children && category.children.length > 0 && (
        <div className="absolute left-0 top-full mt-2 hidden group-hover:block bg-white shadow-md rounded-md w-48 z-50 subcollections">
          <ul className="py-2">
            {category.children.map((subcat) => (
              <li key={subcat.id}>
                <Link
                  href={`/category/${subcat.slug}`} // ✅ Only use subcat.slug
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {subcat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  ))}
</nav>


          {/* Right Side: Search, Wishlist, Cart, User */}
          <div className="flex flex-1 items-center justify-end space-x-4 headericons">
            <div className="hidden sm:block">
              <LiveSearch className="w-[250px] lg:w-[350px] livesearch" />
            </div>

            <Button variant="ghost" size="icon" className="sm:hidden searchbtn" asChild>
              <Link href="/search">
                <Search className="h-5 w-5" />
              </Link>
            </Button>

            <Button variant="ghost" size="icon" className="relative wishlist" asChild>
              <Link href="/wishlist">
                <Heart className="h-5 w-5" />
                {wishlistState.totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                    {wishlistState.totalItems > 99 ? "99+" : wishlistState.totalItems}
                  </span>
                )}
              </Link>
            </Button>

            {authState.isAuthenticated ? (
              <Button variant="ghost" size="icon" asChild>
                <Link href="/account">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <Button variant="ghost" size="icon" asChild className="hidden md:block usericon">
                <Link className="desktop_login_icon" href="/login">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            )}

            <Button variant="ghost" size="icon" className="relative" onClick={toggleCart}>
              <ShoppingCart className="h-5 w-5" />
              {cartState.totalItems > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-black text-xs text-white flex items-center justify-center">
                  {cartState.totalItems > 99 ? "99+" : cartState.totalItems}
                </span>
              )}
            </Button>
<div className="hidden md:block">
            <LanguageToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      {/* You can keep your existing footer */}
      <footer className="bg-black text-white">
        <div className="container py-16 adding-padding">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <h3 className="text-2xl font-light mb-6 tracking-wider">{t("syra")}</h3>
              <p className="text-white/80 leading-relaxed">
                {t("brand_description")}
              </p>
            </div>
            <div className="ftrshopmenu">
              <h4 className="font-medium mb-6 uppercase tracking-wide">{t("shop")}</h4>
              <ul className="space-y-3 text-white/80">
                <li>
                  <Link href="/category/women" className="hover:text-white transition-colors">
                    {t("women")}
                  </Link>
                </li>
                <li>
                  <Link href="/category/men" className="hover:text-white transition-colors">
                    {t("men")}
                  </Link>
                </li>
                <li>
                  <Link href="/category/kids" className="hover:text-white transition-colors">
                    {t("kids")}
                  </Link>
                </li>
                <li>
                  <Link href="/category/baby" className="hover:text-white transition-colors">
                    {t("baby")}  
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-6 uppercase tracking-wide">{t("customer_care")}</h4>
              <ul className="space-y-3 text-white/80">
                <li>
                  <Link href="/help" className="hover:text-white transition-colors">
                    {t("help_center")}
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    {t("contact_us")}
                  </Link>
                </li>
                <li>
                  <Link href="/shipping" className="hover:text-white transition-colors">
                    {t("shipping_returns")}
                  </Link>
                </li>
                <li>
                  <Link href="/size-guide" className="hover:text-white transition-colors">
                    {t("size_guide")}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              {/* <h4 className="font-medium mb-6 uppercase tracking-wide">Connect</h4>
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
              </ul> */}

 <h2 className="text-5xl font-light mb-6 tracking-tight">{t("stay_in_the_loop")}</h2>
          {/* <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
            Be the first to know about new arrivals, exclusive offers, and style tips from our fashion experts
          </p> */}

<div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-8 ftrnewslter">
            <input
              type="email"
              placeholder={t("enter_your_email")}
              className="flex-1 px-6 py-4 rounded-full text-black text-lg"
            />
            <Button size="lg" className="bg-white text-black hover:bg-white/90 px-8 py-4 rounded-full">
              {t("subscribe")}
            </Button>
          </div>


            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/20 text-center text-white/60">
            <p>{t("footer_lower_text")}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
