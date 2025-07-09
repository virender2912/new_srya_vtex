"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Package } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Layout } from "@/components/layout"
import { fetchCategories } from "@/lib/vtex-api";

interface Category {
  id: string
  name: string
  slug: string
  description: string
  imageUrl: string
  productCount: number
  children?: Array<{
    id: string
    name: string
    slug: string
    productCount: number
  }>
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCategories = async () => {
       const categories = await fetchCategories()
      try {
        const response = await fetch("/api/categories?level=3")
        if (!response.ok) {
          throw new Error("Failed to fetch categories")
        }
        const data = await response.json()
        setCategories(data)
      } catch (error) {
        console.error("Failed to load categories:", error)
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [])

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Shop by Category</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our wide range of products organized by categories. Find exactly what you're looking for.
          </p>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-video bg-muted" />
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <div className="h-6 bg-muted rounded" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Card key={category.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={category.imageUrl || "/placeholder.svg"}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                  <Badge className="absolute top-4 right-4 bg-white text-black">{category.productCount} products</Badge>
                </div>

                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{category.name}</span>
                    <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{category.description}</p>

                  {/* Subcategories */}
                  {category.children && category.children.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Subcategories:</h4>
                      <div className="flex flex-wrap gap-2">
                        {category.children.slice(0, 3).map((child) => (
                          <Link key={child.id} href={`/category/${child.slug}`}>
                            <Badge variant="secondary" className="hover:bg-primary hover:text-primary-foreground">
                              {child.name} ({child.productCount})
                            </Badge>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button asChild className="w-full">
                    <Link href={`/category/${category.slug}`}>
                      <Package className="h-4 w-4 mr-2" />
                      Browse {category.name}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Featured Categories CTA */}
        <div className="mt-16 text-center">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Can't find what you're looking for?</h2>
              <p className="text-primary-foreground/90 mb-6">
                Use our search feature to find specific products across all categories.
              </p>
              <Button variant="secondary" size="lg" asChild>
                <Link href="/search">
                  Search Products
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
