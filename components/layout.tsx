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
import { TranslationKey } from "@/lib/translations" // Make sure this import points to your translations file

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

  // Safe translation function with fallback
const getTranslatedName = (slug: string, originalName: string): string => {
  // First try to translate the original name directly
  const nameTranslation = t(originalName.toLowerCase() as TranslationKey);
  if (nameTranslation !== originalName.toLowerCase()) return nameTranslation;

  // Fallback to slug-based translation if name translation not found
  try {
    const slugTranslation = t(slug.toLowerCase() as TranslationKey);
    if (slugTranslation !== slug.toLowerCase()) return slugTranslation;
  } catch (e) {
    console.warn(`Translation not found for: ${slug}`);
  }

  // Final fallback to original name
  return originalName;
};

  return (
    <div className="min-h-screen bg-background">
      {/* Top Banner */}
      <div className="bg-black text-white text-center py-2 text-sm">
        <p>{t("announcement_bar")}</p>
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
            <SheetContent side={isRTL ? "right" : "left"} className="w-80">
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
                <LanguageToggle />
              </div>
              {/* Mobile Nav */}
              <nav className="flex flex-col space-y-6 pt-6">
                {categories.map((cat) => (
                  <div key={cat.id}>
                    <Link href={`/category/${cat.slug}`} className="block text-lg font-medium">
                      {getTranslatedName(cat.slug, cat.name)}
                    </Link>
                    {cat.children?.map((sub) => (
                      <Link
                        key={sub.id}
                        href={`/category/${cat.slug}/${sub.slug}`}
                        className="block text-sm ml-4 text-gray-600"
                      >
                        {getTranslatedName(`${cat.slug}/${sub.slug}`, sub.name)}
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
        {getTranslatedName(category.slug, category.name)}
      </Link>

      {category.children && category.children.length > 0 && (
        <div className="absolute left-0 top-full mt-2 hidden group-hover:block bg-white shadow-md rounded-md w-48 z-50 subcollections">
          <ul className="py-2">
            {category.children.map((subcat) => (
              <li key={subcat.id}>
                <Link
                  href={`/category/${subcat.slug}`}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {getTranslatedName(subcat.slug, subcat.name)}
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
              <span className="sr-only">{t("cart")}</span>
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
    </div>
  )
}