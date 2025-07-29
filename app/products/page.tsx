"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Filter, Grid, List } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Layout } from "@/components/layout"
import { ProductCard } from "@/components/product-card"
import type { VtexProduct } from "@/lib/vtex-api"

export default function ProductsPage() {
  const [products, setProducts] = useState<VtexProduct[]>([])
  const [filteredProducts, setFilteredProducts] = useState<VtexProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("relevance")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [availableBrands, setAvailableBrands] = useState<string[]>([])

  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""

  useEffect(() => {
    setSearchQuery(initialQuery)
  }, [initialQuery])

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          q: searchQuery,
          page: currentPage.toString(),
          pageSize: "50", // Load more products for better filtering
        })

        const response = await fetch(`/api/products?${params}`)
        if (!response.ok) {
          throw new Error("Failed to fetch products")
        }

        const result = await response.json()
        setProducts(result.products)
        setTotalProducts(result.recordsFiltered)

        // Extract unique brands
        const brands = [...new Set(result.products.map((p: VtexProduct) => p.brand))]
        //setAvailableBrands(brands)
        setAvailableBrands(brands as string[])
      } catch (error) {
        console.error("Failed to load products:", error)
        setProducts([])
        setTotalProducts(0)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [searchQuery, currentPage])

  // Filter products based on filters
  useEffect(() => {
    let filtered = products

    // Brand filter
    if (selectedBrands.length > 0) {
      filtered = filtered.filter((product) => selectedBrands.includes(product.brand))
    }

    // Price filter
    filtered = filtered.filter((product) => {
      const price = product.items[0]?.sellers[0]?.commertialOffer?.Price || 0
      const priceInReais = price / 100
      return priceInReais >= priceRange[0] && priceInReais <= priceRange[1]
    })

    // Sort products
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => {
          const priceA = a.items[0]?.sellers[0]?.commertialOffer?.Price || 0
          const priceB = b.items[0]?.sellers[0]?.commertialOffer?.Price || 0
          return priceA - priceB
        })
        break
      case "price-high":
        filtered.sort((a, b) => {
          const priceA = a.items[0]?.sellers[0]?.commertialOffer?.Price || 0
          const priceB = b.items[0]?.sellers[0]?.commertialOffer?.Price || 0
          return priceB - priceA
        })
        break
      case "name":
        filtered.sort((a, b) => a.productName.localeCompare(b.productName))
        break
      case "newest":
        filtered.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())
        break
      default:
        // Keep original order for relevance
        break
    }

    setFilteredProducts(filtered)
  }, [products, selectedBrands, priceRange, sortBy])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
  }

  const handleBrandChange = (brand: string, checked: boolean) => {
    if (checked) {
      setSelectedBrands([...selectedBrands, brand])
    } else {
      setSelectedBrands(selectedBrands.filter((b) => b !== brand))
    }
  }

  const clearFilters = () => {
    setSelectedBrands([])
    setPriceRange([0, 1000])
    setSortBy("relevance")
  }

  const totalPages = Math.ceil(totalProducts / 12)

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Products</h1>
          <p className="text-muted-foreground">
            {filteredProducts.length > 0 ? `Showing ${filteredProducts.length} products` : "No products found"}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <div className="lg:w-64 space-y-6">
            {/* Mobile Filter Toggle */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden w-full">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className="space-y-6 pt-6">
                  <FilterContent
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    handleSearch={handleSearch}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    priceRange={priceRange}
                    setPriceRange={setPriceRange}
                    availableBrands={availableBrands}
                    selectedBrands={selectedBrands}
                    handleBrandChange={handleBrandChange}
                    clearFilters={clearFilters}
                  />
                </div>
              </SheetContent>
            </Sheet>

            {/* Desktop Filters */}
            <div className="hidden lg:block space-y-6">
              <FilterContent
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                handleSearch={handleSearch}
                sortBy={sortBy}
                setSortBy={setSortBy}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                availableBrands={availableBrands}
                selectedBrands={selectedBrands}
                handleBrandChange={handleBrandChange}
                clearFilters={clearFilters}
              />
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* View Toggle */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Products */}
            {loading ? (
              <div
                className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-square bg-muted rounded-lg mb-4" />
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded" />
                      <div className="h-3 bg-muted rounded w-2/3" />
                      <div className="h-5 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <>
                <div
                  className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
                >
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.productId} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2 mt-8">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground mb-4">No products found</p>
                <Button
                  onClick={() => {
                    setSearchQuery("")
                    clearFilters()
                  }}
                >
                  Clear Search & Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

// Filter content component
function FilterContent({
  searchQuery,
  setSearchQuery,
  handleSearch,
  sortBy,
  setSortBy,
  priceRange,
  setPriceRange,
  availableBrands,
  selectedBrands,
  handleBrandChange,
  clearFilters,
}: {
  searchQuery: string
  setSearchQuery: (query: string) => void
  handleSearch: (e: React.FormEvent) => void
  sortBy: string
  setSortBy: (sort: string) => void
  priceRange: number[]
  setPriceRange: (range: number[]) => void
  availableBrands: string[]
  selectedBrands: string[]
  handleBrandChange: (brand: string, checked: boolean) => void
  clearFilters: () => void
}) {
  return (
    <>
      <div>
        <h3 className="font-semibold mb-3">Search</h3>
        <form onSubmit={handleSearch}>
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Sort By</h3>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Relevance</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Price Range</h3>
        <div className="space-y-4">
          <Slider value={priceRange} onValueChange={setPriceRange} max={1000} min={0} step={10} className="w-full" />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>R$ {priceRange[0]}</span>
            <span>R$ {priceRange[1]}</span>
          </div>
        </div>
      </div>

      {availableBrands.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Brands</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {availableBrands.map((brand) => (
              <div key={brand} className="flex items-center space-x-2">
                <Checkbox
                  id={brand}
                  checked={selectedBrands.includes(brand)}
                  onCheckedChange={(checked) => handleBrandChange(brand, checked as boolean)}
                />
                <Label htmlFor={brand} className="text-sm">
                  {brand}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      <Button variant="outline" onClick={clearFilters} className="w-full">
        Clear All Filters
      </Button>
    </>
  )
}
