"use client"

import Link from "next/link"
import { useTranslation } from "@/hooks/use-translation"
import { useLanguage } from "@/contexts/language-context"
import LanguageToggle from "./language-toggle" 
import { Button } from "@/components/ui/button" 
import { Input } from "@/components/ui/input"
import { ShoppingCart, Search, Menu } from "lucide-react"

export default function Header() { 
  const { t } = useTranslation()
  const { isRTL } = useLanguage()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">V</span>
            </div>
            <span className="font-bold text-xl">VTEX Store</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
              {t("home")}
            </Link>
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
              {t("Nike")}
            </Link>
            <Link href="/products" className="text-sm font-medium hover:text-primary transition-colors">
              {t("products")}
            </Link>
            <Link href="/categories" className="text-sm font-medium hover:text-primary transition-colors">
              {t("categories")}
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center space-x-2 flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search
                className={`absolute top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 ${
                  isRTL ? "right-3" : "left-3"
                }`}
              />
              <Input
                type="search"
                placeholder={t("search")}
                className={`w-full ${isRTL ? "pr-10 text-right" : "pl-10"}`}
              />
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            <LanguageToggle />

            <Button variant="ghost" size="sm" className="relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                0
              </span>
            </Button>

            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
