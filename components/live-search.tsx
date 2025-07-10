"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Search, Loader2 } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { formatPrice, getBestPrice } from "@/lib/vtex-api"
import type { VtexProduct } from "@/lib/vtex-api"

import { useTranslation } from "@/hooks/use-translation"
interface LiveSearchProps {
  className?: string
}

export function LiveSearch({ className }: LiveSearchProps) {
  const { language } = useTranslation() 
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<VtexProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  
  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim().length > 2) {
        performSearch(query)
      } else {
        setResults([])
        setShowResults(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query])

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const performSearch = async (searchQuery: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&pageSize=5`)
      if (response.ok) {
        const data = await response.json()
        setResults(data.products)
        setShowResults(true)
      }
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
      setShowResults(false)
      setQuery("")
    }
  }

  const handleResultClick = () => {
    setShowResults(false)
    setQuery("")
  }

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            className="pl-8"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (results.length > 0) setShowResults(true)
            }}
          />
          {loading && <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
      </form>

      {/* Search Results Dropdown */}
      {showResults && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-96 overflow-y-auto">
          <CardContent className="p-0">
            {results.length > 0 ? (
              <div className="space-y-0">
                {results.map((product) => {
                  const arabicTitle = Array.isArray(product.Arabic_title) ? product.Arabic_title[0] : null
  const title = language === "ar" && arabicTitle ? arabicTitle : product.productName
                  const firstSku = product.items[0]
                  const price = getBestPrice(firstSku)
                  const imageUrl = firstSku?.images[0]?.imageUrl

                  return (
                    <Link
                      key={product.productId}
                      href={`/product/${product.linkText}`}
                      onClick={handleResultClick}
                      className="flex items-center gap-3 p-3 hover:bg-muted transition-colors border-b last:border-b-0"
                    >
                      <div className="relative w-12 h-12 rounded overflow-hidden border">
                        <Image
                          src={imageUrl || "/placeholder.svg?height=48&width=48"}
                          alt={product.productName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">

                        <h4 className="font-medium text-sm line-clamp-1">
                         {title}

                        </h4>

                        <p className="text-xs text-muted-foreground">{product.brand}</p>
                        <p className="text-sm font-semibold">{formatPrice(price)}</p>
                      </div>
                    </Link>
                  )
                })}
                <div className="p-3 border-t">
                  <button
                    onClick={() => {
                      router.push(`/search?q=${encodeURIComponent(query)}`)
                      handleResultClick()
                    }}
                    className="text-sm text-primary hover:underline"
                  >
                    View all results for "{query}"
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">No products found for "{query}"</div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
