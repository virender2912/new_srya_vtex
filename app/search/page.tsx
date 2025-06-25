"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { SearchIcon, Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Layout } from "@/components/layout"
import { ProductCard } from "@/components/product-card"
import type { VtexProduct } from "@/lib/vtex-api"

interface SearchResult {
  products: VtexProduct[]
  recordsFiltered: number
  query: string
  suggestions: string[]
}

export default function SearchPage() {
  const [results, setResults] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""

  useEffect(() => {
    setSearchQuery(initialQuery)
    if (initialQuery) {
      performSearch(initialQuery)
    }
  }, [initialQuery])

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setResults(null)
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      if (!response.ok) {
        throw new Error("Search failed")
      }
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error("Search error:", error)
      setResults({
        products: [],
        recordsFiltered: 0,
        query,
        suggestions: [],
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.history.pushState({}, "", `/search?q=${encodeURIComponent(searchQuery)}`)
      performSearch(searchQuery)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion)
    window.history.pushState({}, "", `/search?q=${encodeURIComponent(suggestion)}`)
    performSearch(suggestion)
  }

  return (
    <Layout>
      <div className="container py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Search Products</h1>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </Button>
          </form>
        </div>

        {/* Search Results */}
        {results && (
          <div>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">
                  {results.recordsFiltered > 0
                    ? `Found ${results.recordsFiltered} results for "${results.query}"`
                    : `No results found for "${results.query}"`}
                </h2>
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>

            {/* Suggestions */}
            {results.suggestions.length > 0 && results.recordsFiltered === 0 && (
              <Card className="mb-6">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">Try searching for:</h3>
                  <div className="flex flex-wrap gap-2">
                    {results.suggestions.map((suggestion) => (
                      <Badge
                        key={suggestion}
                        variant="secondary"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="aspect-square bg-muted" />
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded" />
                        <div className="h-3 bg-muted rounded w-2/3" />
                        <div className="h-5 bg-muted rounded w-1/2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : results.products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {results.products.map((product) => (
                  <ProductCard key={product.productId} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <SearchIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your search terms or browse our categories</p>
                <Button onClick={() => setSearchQuery("")}>Clear Search</Button>
              </div>
            )}
          </div>
        )}

        {/* Initial State */}
        {!results && !loading && (
          <div className="text-center py-12">
            <SearchIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Start your search</h3>
            <p className="text-muted-foreground">Enter a search term to find products</p>
          </div>
        )}
      </div>
    </Layout>
  )
}
