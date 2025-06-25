import { NextResponse } from "next/server"


const VTEX_ACCOUNT = process.env.NEXT_PUBLIC_VTEX_ACCOUNT || "iamtechiepartneruae"
const VTEX_ENVIRONMENT = process.env.NEXT_PUBLIC_VTEX_ENVIRONMENT || "vtexcommercestable"
const BASE_URL = `https://${VTEX_ACCOUNT}.${VTEX_ENVIRONMENT}.com.br`



export async function GET() {
  try {
    // Try to fetch from VTEX API
    if (VTEX_ACCOUNT && VTEX_ACCOUNT !== "your-account") {
      const response = await fetch(`${BASE_URL}/api/catalog_system/pub/category/tree/3`, {
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const vtexCategories = await response.json()

        // Transform VTEX categories to our format
        const categories = vtexCategories.map((cat: any) => ({
          id: cat.id.toString(),
          name: cat.name,
          slug: cat.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, ""),
          description: `Discover our ${cat.name.toLowerCase()} collection`,
          imageUrl: "/placeholder.svg?height=200&width=300",
          productCount: Math.floor(Math.random() * 50) + 10, // Mock count
          children:
            cat.children?.map((child: any) => ({
              id: child.id.toString(),
              name: child.name,
              slug: child.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, ""),
              productCount: Math.floor(Math.random() * 30) + 5,
            })) || [],
        }))

        return NextResponse.json(categories)
      }
    }

    // Fallback to fashion-focused mock categories
    const fashionCategories = [
      {
        id: "1",
        name: "Women's Fashion",
        slug: "womens-fashion",
        description: "Discover the latest trends in women's clothing and accessories",
        imageUrl: "/placeholder.svg?height=200&width=300",
        productCount: 156,
        children: [
          { id: "11", name: "Dresses", slug: "dresses", productCount: 45 },
          { id: "12", name: "Tops & Blouses", slug: "tops-blouses", productCount: 38 },
          { id: "13", name: "Pants & Jeans", slug: "pants-jeans", productCount: 32 },
          { id: "14", name: "Outerwear", slug: "outerwear", productCount: 25 },
          { id: "15", name: "Activewear", slug: "activewear", productCount: 16 },
        ],
      },
      {
        id: "2",
        name: "Men's Fashion",
        slug: "mens-fashion",
        description: "Stylish and comfortable clothing for the modern man",
        imageUrl: "/placeholder.svg?height=200&width=300",
        productCount: 124,
        children: [
          { id: "21", name: "Shirts", slug: "shirts", productCount: 35 },
          { id: "22", name: "T-Shirts & Polos", slug: "tshirts-polos", productCount: 28 },
          { id: "23", name: "Pants & Chinos", slug: "pants-chinos", productCount: 24 },
          { id: "24", name: "Jackets & Coats", slug: "jackets-coats", productCount: 22 },
          { id: "25", name: "Sportswear", slug: "sportswear", productCount: 15 },
        ],
      },
      {
        id: "3",
        name: "Accessories",
        slug: "accessories",
        description: "Complete your look with our curated accessories",
        imageUrl: "/placeholder.svg?height=200&width=300",
        productCount: 89,
        children: [
          { id: "31", name: "Bags & Handbags", slug: "bags-handbags", productCount: 25 },
          { id: "32", name: "Jewelry", slug: "jewelry", productCount: 22 },
          { id: "33", name: "Watches", slug: "watches", productCount: 18 },
          { id: "34", name: "Sunglasses", slug: "sunglasses", productCount: 14 },
          { id: "35", name: "Belts", slug: "belts", productCount: 10 },
        ],
      },
      {
        id: "4",
        name: "Shoes",
        slug: "shoes",
        description: "Step out in style with our footwear collection",
        imageUrl: "/placeholder.svg?height=200&width=300",
        productCount: 78,
        children: [
          { id: "41", name: "Sneakers", slug: "sneakers", productCount: 28 },
          { id: "42", name: "Heels", slug: "heels", productCount: 20 },
          { id: "43", name: "Boots", slug: "boots", productCount: 15 },
          { id: "44", name: "Flats", slug: "flats", productCount: 10 },
          { id: "45", name: "Sandals", slug: "sandals", productCount: 5 },
        ],
      },
      {
        id: "5",
        name: "New Arrivals",
        slug: "new-arrivals",
        description: "Fresh styles just landed - be the first to shop",
        imageUrl: "/placeholder.svg?height=200&width=300",
        productCount: 42,
        children: [
          { id: "51", name: "This Week", slug: "this-week", productCount: 15 },
          { id: "52", name: "Last 30 Days", slug: "last-30-days", productCount: 27 },
        ],
      },
      {
        id: "6",
        name: "Sale",
        slug: "sale",
        description: "Don't miss out on these amazing deals",
        imageUrl: "/placeholder.svg?height=200&width=300",
        productCount: 67,
        children: [
          { id: "61", name: "Up to 30% Off", slug: "up-to-30-off", productCount: 25 },
          { id: "62", name: "Up to 50% Off", slug: "up-to-50-off", productCount: 22 },
          { id: "63", name: "Up to 70% Off", slug: "up-to-70-off", productCount: 20 },
        ],
      },
    ]

    return NextResponse.json(fashionCategories)
  } catch (error) {
    console.error("Categories API Error:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}
