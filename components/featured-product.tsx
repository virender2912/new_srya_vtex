"use client"
import React from 'react'
import { useEffect, useState } from "react"
import { ArrowRight, ChevronLeft, ChevronRight, Play, Instagram, Facebook, Twitter } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Layout } from "@/components/layout"
import { ProductCard } from "@/components/product-card"
import type { VtexProduct } from "@/lib/vtex-api"
import { useTranslation } from "@/hooks/use-translation"



function FeaturedProduct() {
    const [featuredProducts, setFeaturedProducts] = useState<VtexProduct[]>([])
    const [newArrivals, setNewArrivals] = useState<VtexProduct[]>([])
    const [saleProducts, setSaleProducts] = useState<VtexProduct[]>([])
    const [loading, setLoading] = useState(true)
    const { t } = useTranslation();

    useEffect(() => {
    const loadProducts = async () => {
      try {
        const [featuredRes, newArrivalsRes, saleRes] = await Promise.all([
          fetch("/api/products?pageSize=8&category=28"),
          fetch("/api/products?pageSize=8&category=20"),
          fetch("/api/products?pageSize=8&category=36"),
        ])

        if (featuredRes.ok) {
          const featuredData = await featuredRes.json()
          setFeaturedProducts(featuredData.products)
        }

        if (newArrivalsRes.ok) {
          const newArrivalsData = await newArrivalsRes.json()
          setNewArrivals(newArrivalsData.products)
        }

        if (saleRes.ok) {
          const saleData = await saleRes.json()
          setSaleProducts(saleData.products)
        }
      } catch (error) {
        console.error("Failed to load products:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])


    return (
        <div>
            <section className="py-20 bg-gray-50 ftrdproducts">
                <div className="container adding-padding">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-light mb-6 tracking-tight">{t("trending_now")}</h2>
                        <p className="text-xl text-muted-foreground">{t("discover_whats_capturing_hearts_this_season")}</p>
                    </div>

                    <Tabs defaultValue="featured" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-16 bg-white">
                            <TabsTrigger value="featured" className="text-lg">
                                {t("women")}
                            </TabsTrigger>
                            <TabsTrigger value="new" className="text-lg">
                                {t("men")}
                            </TabsTrigger>
                            <TabsTrigger value="sale" className="text-lg">
                                {t("kids")}
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="featured">
                            {loading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                    {Array.from({ length: 8 }).map((_, i) => (
                                        <div key={i} className="animate-pulse">
                                            <div className="aspect-square bg-gray-200 rounded-2xl mb-4" />
                                            <div className="space-y-2">
                                                <div className="h-4 bg-gray-200 rounded" />
                                                <div className="h-3 bg-gray-200 rounded w-2/3" />
                                                <div className="h-5 bg-gray-200 rounded w-1/2" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                    {featuredProducts.map((product) => (
                                        <ProductCard key={product.productId} product={product} />
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="new">
                            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                {newArrivals.map((product) => (
                                    <ProductCard key={product.productId} product={product} />
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="sale">
                            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                {saleProducts.map((product) => (
                                    <ProductCard key={product.productId} product={product} />
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </section>
        </div>
    )
}

export default FeaturedProduct
