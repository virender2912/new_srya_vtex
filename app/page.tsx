"use client"

import { useEffect, useState } from "react"
import { ArrowRight, ChevronLeft, ChevronRight, Play, Instagram, Facebook, Twitter } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Layout } from "@/components/layout"
import { ProductCard } from "@/components/product-card"
import type { VtexProduct } from "@/lib/vtex-api"
  import { useTranslation } from "@/hooks/use-translation"


const heroSlides = [
  {
    id: 1,
    title: "slider_title_1",
    subtitle: "slider_subtitle_1",
    description: "slider_description_1",
    cta: "slider_cta_1",
    image: "/placeholder.svg?height=800&width=1400",
    link: "/category/men",
    theme: "dark",
  },
  {
    id: 2,
    title: "slider_title_2",
    subtitle: "slider_subtitle_2",
    description: "slider_description_2",
    cta: "slider_cta_2",
    image: "/placeholder.svg?height=800&width=1400",
    link: "/category/women",
    theme: "light",
  },
  {
    id: 3,
    title: "slider_title_3",
    subtitle: "slider_subtitle_3",
    description: "slider_description_3",
    cta: "slider_cta_3",
    image: "/placeholder.svg?height=800&width=1400",
    link: "/category/kids",
    theme: "dark",
  },
]


const lookbookItems = [
  {
    id: 1,
    title: "kids_pasion",
    // description: "Professional meets stylish",
    image: "/kidsfashion.webp",
    products: ["Blazer", "Trousers", "Shoes"],
  },
  {
    id: 2,
    title: "weekend_casual",
    // description: "Effortless everyday style",
    image: "/mensfashion.jfif",
    products: ["Sweater", "Jeans", "Sneakers"],
  },
  {
    id: 3,
    title: "evening_elegance",
    //description: "Make a statement",
    image: "/womenfashion.webp",
    products: ["Dress", "Jewelry", "Clutch"],
  },
]

const brandPartners = [
  { name: "Nike", logo: "/nike.png" },
  { name: "H&M", logo: "/HMkids.webp" },
  { name: "adidas", logo: "/adidas.png" },
  { name: "Puma", logo: "/puma.jpg" },
  { name: "Reebok", logo: "/rebook.png" },
]

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [featuredProducts, setFeaturedProducts] = useState<VtexProduct[]>([])
  const [newArrivals, setNewArrivals] = useState<VtexProduct[]>([])
  const [saleProducts, setSaleProducts] = useState<VtexProduct[]>([])
  const [loading, setLoading] = useState(true)
    const { t } = useTranslation()

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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 6000)

    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)

  return (
    <Layout>
      {/* Hero Slider */}
      <section className="relative h-[85vh] overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105"
            }`}
          >
            <div className="relative h-full">
              <Image
                src="/images/women-banner.jpg"
                alt={slide.title}
                fill
                className="object-cover"
                priority={index === 0}
              />
              <div className={`absolute inset-0 ${slide.theme === "dark" ? "bg-black/50" : "bg-white/30"}`} />
              <div className="absolute inset-0 flex items-center">
                <div className="container">
                  <div className={`max-w-2xl ${slide.theme === "light" ? "text-black" : "text-white"}`}>
                    <Badge
                      className={`mb-6 ${slide.theme === "light" ? "bg-black/10 text-black border-black/20" : "bg-white/20 text-white border-white/30"}`}
                    >
                      {/* {slide.subtitle} */}
                      {t(slide.subtitle as any)}
                    </Badge>
                    <h1 className="text-6xl md:text-8xl font-light mb-8 leading-tight tracking-tight">
                     {/* {slide.title} */}
                      {t(slide.title as any)}
{/* {t("slider_title_1")} */}


                    </h1>
                    <p
                      className={`text-xl mb-10 leading-relaxed ${slide.theme === "light" ? "text-black/80" : "text-white/90"}`}
                    >
                 {t(slide.description as any)}
                    </p>
                    <Button
                      size="lg"
                      className={`${slide.theme === "light" ? "bg-black text-white hover:bg-black/90" : "bg-white text-black hover:bg-white/90"} px-8 py-6 text-lg sliderbtn`}
                      asChild
                    >
                      <Link href={slide.link}>
                         {t(slide.cta as any)}
                        <ArrowRight className="ml-3 h-5 w-5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={prevSlide}
          className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-3 rounded-full transition-all"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-3 rounded-full transition-all"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-12 h-1 rounded-full transition-all ${index === currentSlide ? "bg-white" : "bg-white/40"}`}
            />
          ))}
        </div>
      </section>

  

      {/* Categories Showcase */}
      <section className="py-20 categories-section">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-light mb-6 tracking-tight">
              {t("discover_your_style")}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t("curated_collections_for_ever_moment_every_mood_every_you")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Link
              href="/category/women"
              className="group relative overflow-hidden rounded-2xl aspect-[3/4] block"
            >
              <Image
                src="/images/women.jpg"
                alt="Women's Fashion"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 text-white">
                <h3 className="text-3xl font-light mb-3">{t("womens")}</h3>
                <p className="text-white/80 mb-4">{t("elegant_contemporary")}</p>
                <Button variant="outline" className="border-black bg-black text-white hover:bg-white hover:text-black coltnbtn">
                  {t("explorecollection")}
                </Button>
              </div>
            </Link>

            <Link
              href="/category/men"
              className="group relative overflow-hidden rounded-2xl aspect-[3/4] block"
            >
              <Image
                src="/images/men.jpg"
                alt="Men's Fashion"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 text-white">
                <h3 className="text-3xl font-light mb-3">{t("mens")}</h3>
                <p className="text-white/80 mb-4">{t("refined_modern")}</p>
                <Button variant="outline" className="border-black bg-black text-white hover:bg-white hover:text-black coltnbtn">
                  {t("explorecollection")}
                </Button>
              </div>
            </Link>

            <Link
              href="/category/kids"
              className="group relative overflow-hidden rounded-2xl aspect-[3/4] block"
            >
              <Image
                src="/kidsfashionnew.jpg"
                alt="Accessories"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 text-white">
                <h3 className="text-3xl font-light mb-3">{t("kids")}</h3>
                <p className="text-white/80 mb-4">{t("statement_pieces")}</p>
                <Button variant="outline" className="border-black bg-black text-white hover:bg-white hover:text-black coltnbtn">
                  {t("explorecollection")}
                </Button>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gray-50">
        <div className="container">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {featuredProducts.map((product) => (
                    <ProductCard key={product.productId} product={product} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="new">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {newArrivals.map((product) => (
                  <ProductCard key={product.productId} product={product} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="sale">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {saleProducts.map((product) => (
                  <ProductCard key={product.productId} product={product} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>



          {/* Brand Partners */}
      <section className="py-12 border-b">
        <div className="container">
          <div className="flex items-center justify-center space-x-12">
            {brandPartners.map((brand) => (
              <div key={brand.name} className="transition-all">
                <Image
                  src={brand.logo || "/placeholder.svg"}
                  alt={brand.name}
                  width={120}
                  height={60}
                  className="object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lookbook Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-light mb-6 tracking-tight">{t("style_inspiration")}</h2>
            <p className="text-xl text-muted-foreground">{t("curated_looks_for_every_occasion")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {lookbookItems.map((item) => (
              <div key={item.id} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-2xl aspect-[3/4] mb-6">
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                  {/* <Button size="sm" className="absolute bottom-6 left-6 bg-white text-black hover:bg-white/90">
                    <Play className="h-4 w-4 mr-2" />
                    Shop the Look
                  </Button> */}
                </div>
                <h3 className="text-2xl font-light mb-2">{t(item.title as any)}</h3>
                {/* <p className="text-muted-foreground mb-3">{item.description}</p> */}
                {/* <div className="flex flex-wrap gap-2">
                  {item.products.map((product) => (
                    <Badge key={product} variant="outline">
                      {product}
                    </Badge>
                  ))}
                </div> */}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      {/* <section className="py-20 bg-black text-white">
        <div className="container text-center">
          <h2 className="text-5xl font-light mb-6 tracking-tight">Stay in the Loop</h2>
          <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
            Be the first to know about new arrivals, exclusive offers, and style tips from our fashion experts
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-8 ftrnewslter">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 rounded-full text-black text-lg"
            />
            <Button size="lg" className="bg-white text-black hover:bg-white/90 px-8 py-4 rounded-full">
              Subscribe
            </Button>
          </div>
          <div className="flex justify-center space-x-6">
            <Button variant="ghost" size="icon" className="text-white hover:text-white/80">
              <Instagram className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:text-white/80">
              <Facebook className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:text-white/80">
              <Twitter className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </section> */}
    </Layout>
  )
}
