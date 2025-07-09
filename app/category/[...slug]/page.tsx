"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Layout } from "@/components/layout"
import { ProductCard } from "@/components/product-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Grid, List } from "lucide-react"

interface Category {
  id: string
  name: string
  slug: string
  idPath: string
  children?: Category[]
}

export default function CategoryPage() {
  const params = useParams()
  const slugParam = params.slug as string[] | string
  const fullSlug = Array.isArray(slugParam) ? slugParam.join("/") : slugParam

  const [category, setCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<any[]>([])
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [availableBrands, setAvailableBrands] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [sortBy, setSortBy] = useState("relevance")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/categories")
      const allCategories: Category[] = await res.json()

      const findCat = (cats: Category[]): Category | null => {
        for (const cat of cats) {
          if (cat.slug === fullSlug) return cat
          if (cat.children?.length) {
            const found = findCat(cat.children)
            if (found) return found
          }
        }
        return null
      }

      const matched = findCat(allCategories)
      setCategory(matched)

      if (matched) {
        const productRes = await fetch(`/api/products?category=${matched.idPath}`)
        const data = await productRes.json()
        const products = data.products || []

        setProducts(products)
        setFilteredProducts(products)

        const brands = [...new Set(products.map((p: any) => p.brand))] as string[]
        setAvailableBrands(brands)
      }
    }

    if (fullSlug) load()
  }, [fullSlug])

  // Filters
  useEffect(() => {
    let filtered = products

    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.brand.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedBrands.length > 0) {
      filtered = filtered.filter((product) => selectedBrands.includes(product.brand))
    }

    filtered = filtered.filter((product) => {
      const price = product.items[0]?.sellers[0]?.commertialOffer?.Price || 0
      const priceInReais = price / 100
      return priceInReais >= priceRange[0] && priceInReais <= priceRange[1]
    })

    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => (a.items[0]?.sellers[0]?.commertialOffer?.Price || 0) - (b.items[0]?.sellers[0]?.commertialOffer?.Price || 0))
        break
      case "price-high":
        filtered.sort((a, b) => (b.items[0]?.sellers[0]?.commertialOffer?.Price || 0) - (a.items[0]?.sellers[0]?.commertialOffer?.Price || 0))
        break
      case "name":
        filtered.sort((a, b) => a.productName.localeCompare(b.productName))
        break
    }

    setFilteredProducts(filtered)
  }, [searchQuery, selectedBrands, priceRange, sortBy, products])

  const handleBrandChange = (brand: string, checked: boolean) => {
    if (checked) {
      setSelectedBrands([...selectedBrands, brand])
    } else {
      setSelectedBrands(selectedBrands.filter((b) => b !== brand))
    }
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedBrands([])
    setPriceRange([0, 1000])
    setSortBy("relevance")
  }

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-4">{category?.name || "Category"}</h1>

        {/* Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Search</h3>
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div>
              <h3 className="font-semibold mb-2">Sort By</h3>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
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
              <h3 className="font-semibold mb-2">Price Range</h3>
              <Slider value={priceRange} onValueChange={setPriceRange} min={0} max={1000} step={10} />
              <div className="text-sm text-muted-foreground mt-1">
                ₹{priceRange[0]} - ₹{priceRange[1]}
              </div>
            </div>

            {availableBrands.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Brands</h3>
                <div className="space-y-2">
                  {availableBrands.map((brand) => (
                    <div key={brand} className="flex items-center space-x-2">
                      <Checkbox
                        id={brand}
                        checked={selectedBrands.includes(brand)}
                        onCheckedChange={(checked) => handleBrandChange(brand, checked as boolean)}
                      />
                      <Label htmlFor={brand}>{brand}</Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>

          {/* Product Display */}
          <div className="lg:col-span-3">
            <div className="flex justify-end mb-4 gridstyle">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            {filteredProducts.length > 0 ? (
              <div
                className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-1"}`}
              >
                {filteredProducts.map((product) => (
                  <ProductCard key={product.productId} product={product} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No products found.</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
