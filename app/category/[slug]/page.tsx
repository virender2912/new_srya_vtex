"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Filter, Grid, List, ArrowLeft } from "lucide-react"
import Link from "next/link"

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

interface CategoryData {
  id: string
  name: string
  slug: string
  description: string
  productCount: number
}

export default function CategoryPage() {
  const params = useParams()
  const slug = params.slug as string

  const [category, setCategory] = useState<CategoryData | null>(null)
  const [products, setProducts] = useState<VtexProduct[]>([])
  const [filteredProducts, setFilteredProducts] = useState<VtexProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("relevance")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [availableBrands, setAvailableBrands] = useState<string[]>([])

useEffect(() => {
  const loadCategoryData = async () => {
    setLoading(true)
    try {
      // Fetch all categories
      const categoryResponse = await fetch("/api/categories?level=3")
      if (!categoryResponse.ok) throw new Error("Failed to fetch categories")

      const categories: CategoryData[] = await categoryResponse.json()
      const matchedCategory = categories.find((cat) => cat.slug === slug)

      if (!matchedCategory) {
        setCategory(null)
        setProducts([])
        setFilteredProducts([])
        return
      }

      setCategory(matchedCategory)

      // Now fetch products using category ID
      const productsResponse = await fetch(`/api/products?category=${matchedCategory.id}&count=1000`)
      if (!productsResponse.ok) throw new Error("Failed to fetch products")

      const result = await productsResponse.json()
      setProducts(result.products)
      setFilteredProducts(result.products)

      // Extract brands
      const brands = [...new Set(result.products.map((p: VtexProduct) => p.brand))] as string[]
      setAvailableBrands(brands)

    } catch (error) {
      console.error("Error loading category/products:", error)
    } finally {
      setLoading(false)
    }
  }

  if (slug) {
    loadCategoryData()
  }
}, [slug])


  // Filter products based on search, price, and brands
  useEffect(() => {
    let filtered = products

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.brand.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Brand filter
    if (selectedBrands.length > 0) {
      filtered = filtered.filter((product) => selectedBrands.includes(product.brand))
    }

    // Price filter (simplified - using first SKU price)
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
      default:
        // Keep original order for relevance
        break
    }

    setFilteredProducts(filtered)
  }, [products, searchQuery, selectedBrands, priceRange, sortBy])

  const handleBrandChange = (brand: string, checked: boolean) => {
    if (checked) {
      setSelectedBrands([...selectedBrands, brand])
    } else {
      setSelectedBrands(selectedBrands.filter((b) => b !== brand))
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Search is handled by useEffect
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedBrands([])
    setPriceRange([0, 1000])
    setSortBy("relevance")
  }

  if (loading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-4 bg-muted rounded w-2/3" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="aspect-square bg-muted rounded" />
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (!category) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
            <p className="text-muted-foreground mb-8">The category you're looking for doesn't exist.</p>
            <Button asChild>
              <Link href="/categories">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Browse Categories
              </Link>
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6 breadcrumb">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span>/</span>
          <Link href="/categories" className="hover:text-foreground">
            Categories
          </Link>
          <span>/</span>
          <span className="text-foreground">{category.name}</span>
        </nav>

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-4">{category.name}</h1>
          <p className="text-muted-foreground mb-4">{category.description}</p>
          <p className="text-sm text-muted-foreground">
            {filteredProducts.length} of {products.length} products
          </p>
        </div>

        {/* Filters and Products */}
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
          <div className="flex-1 adding-padding">
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
            {filteredProducts.length > 0 ? (
              <div
                className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 listview"}`}
              >
                {filteredProducts.map((product) => (
                  <ProductCard key={product.productId} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground mb-4">No products found</p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

// Filter content component to avoid duplication
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
            placeholder="Search in category..."
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
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Price Range</h3>
        <div className="space-y-4">
          <Slider value={priceRange} onValueChange={setPriceRange} max={1000} min={0} step={10} className="w-full" />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>AED {priceRange[0]}</span>
            <span>AED {priceRange[1]}</span>
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
