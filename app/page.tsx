"use client"
import { Layout } from "@/components/layout"
import HeroSlides from "@/components/heroSlides"
import CategoriesShowcase from "@/components/categories-showcase"
import FeaturedProduct from "@/components/featured-product"
import BrandPartners from "@/components/brand-partners"
import Lookbook from "@/components/lookbook"

export default function HomePage() {
  
  return (
    <Layout>

      {/* Hero Slider */}
      <HeroSlides />

      {/* Categories Showcase */}
      <CategoriesShowcase />

      {/* Featured Products */}
      <FeaturedProduct />

      {/* Brand Partners */}
      <BrandPartners />

      {/* Lookbook Section */}
      <Lookbook/>

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
