import { type NextRequest, NextResponse } from "next/server"
import { searchProducts } from "@/lib/vtex-api"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""
   
    const page = Number.parseInt(searchParams.get("page") || "1")
    const pageSize = Number.parseInt(searchParams.get("pageSize") || "50")

    // Add category filtering logic
    const category = searchParams.get("category") || ""

    // If category is provided, modify the search query or endpoint
    // Assuming BASE_URL is defined elsewhere or should be replaced with the actual base URL
    const BASE_URL = process.env.NEXT_PUBLIC_VTEX_STORE_DOMAIN // Replace with your actual base URL
    const from = (page - 1) * pageSize
    const to = page * pageSize - 1

    let apiUrl = `${BASE_URL}/api/catalog_system/pub/products/search?ft=${encodeURIComponent(query)}&_from=${from}&_to=${to}`

    if (category) {
      // For category filtering, use category-specific endpoint or add category filter
      apiUrl = `${BASE_URL}/api/catalog_system/pub/products/search?fq=C:/${category}/&_from=${from}&_to=${to}`
      if (query) {
        apiUrl += `&ft=${encodeURIComponent(query)}`
      }
    }

    const result = await searchProducts(query, page, pageSize, category) // Modified to pass category
    return NextResponse.json(result)
  } catch (error) {
    console.error("API Error:", error)

    // Return mock data as fallback
    const mockProducts = [
      {
        productId: "1",
        productName: "Sample Product 1",
        brand: "Sample Brand",
        brandId: 1,
        brandImageUrl: "",
        linkText: "sample-product-1",
        productReference: "SP001",
        categoryId: "1",
        productTitle: "Sample Product 1",
        metaTagDescription: "A great sample product",
        releaseDate: "2024-01-01",
        clusterHighlights: {},
        productClusters: {},
        searchableClusters: {},
        categories: ["Electronics"],
        categoriesIds: ["1"],
        link: "/sample-product-1",
        description: "This is a sample product for demonstration purposes.",
        items: [
          {
            itemId: "1",
            name: "Sample Product 1",
            nameComplete: "Sample Product 1 - Default",
            complementName: "",
            ean: "1234567890123",
            referenceId: [{ Key: "RefId", Value: "SP001" }],
            measurementUnit: "un",
            unitMultiplier: 1,
            modalType: "",
            isKit: false,
            images: [
              {
                imageId: "1",
                imageLabel: "Main",
                imageTag: "",
                imageUrl: "/placeholder.svg?height=400&width=400",
                imageText: "Sample Product 1",
                imageLastModified: "2024-01-01",
              },
            ],
            sellers: [
              {
                sellerId: "1",
                sellerName: "Main Seller",
                addToCartLink: "",
                sellerDefault: true,
                commertialOffer: {
                  DeliverySlaSamplesPerRegion: {},
                  Installments: [],
                  DiscountHighLight: [],
                  GiftSkuIds: [],
                  Teasers: [],
                  PromotionTeasers: [],
                  BuyTogether: [],
                  ItemMetadataAttachment: [],
                  Price: 9999,
                  ListPrice: 12999,
                  PriceWithoutDiscount: 12999,
                  RewardValue: 0,
                  PriceValidUntil: "2024-12-31",
                  AvailableQuantity: 10,
                  IsAvailable: true,
                  Tax: 0,
                  DeliverySlaSamples: [],
                  GetInfoErrorMessage: null,
                  CacheVersionUsedToCallCheckout: "",
                  PaymentOptions: {
                    installmentOptions: [],
                    paymentSystems: [],
                    payments: [],
                    giftCards: [],
                    giftCardMessages: [],
                    availableAccounts: [],
                    availableTokens: [],
                  },
                },
              },
            ],
          },
        ],
      },
      {
        productId: "2",
        productName: "Sample Product 2",
        brand: "Sample Brand",
        brandId: 1,
        brandImageUrl: "",
        linkText: "sample-product-2",
        productReference: "SP002",
        categoryId: "1",
        productTitle: "Sample Product 2",
        metaTagDescription: "Another great sample product",
        releaseDate: "2024-01-01",
        clusterHighlights: {},
        productClusters: {},
        searchableClusters: {},
        categories: ["Electronics"],
        categoriesIds: ["1"],
        link: "/sample-product-2",
        description: "This is another sample product for demonstration purposes.",
        items: [
          {
            itemId: "2",
            name: "Sample Product 2",
            nameComplete: "Sample Product 2 - Default",
            complementName: "",
            ean: "1234567890124",
            referenceId: [{ Key: "RefId", Value: "SP002" }],
            measurementUnit: "un",
            unitMultiplier: 1,
            modalType: "",
            isKit: false,
            images: [
              {
                imageId: "2",
                imageLabel: "Main",
                imageTag: "",
                imageUrl: "/placeholder.svg?height=400&width=400",
                imageText: "Sample Product 2",
                imageLastModified: "2024-01-01",
              },
            ],
            sellers: [
              {
                sellerId: "1",
                sellerName: "Main Seller",
                addToCartLink: "",
                sellerDefault: true,
                commertialOffer: {
                  DeliverySlaSamplesPerRegion: {},
                  Installments: [],
                  DiscountHighLight: [],
                  GiftSkuIds: [],
                  Teasers: [],
                  PromotionTeasers: [],
                  BuyTogether: [],
                  ItemMetadataAttachment: [],
                  Price: 7999,
                  ListPrice: 7999,
                  PriceWithoutDiscount: 7999,
                  RewardValue: 0,
                  PriceValidUntil: "2024-12-31",
                  AvailableQuantity: 5,
                  IsAvailable: true,
                  Tax: 0,
                  DeliverySlaSamples: [],
                  GetInfoErrorMessage: null,
                  CacheVersionUsedToCallCheckout: "",
                  PaymentOptions: {
                    installmentOptions: [],
                    paymentSystems: [],
                    payments: [],
                    giftCards: [],
                    giftCardMessages: [],
                    availableAccounts: [],
                    availableTokens: [],
                  },
                },
              },
            ],
          },
        ],
      },
    ]

    return NextResponse.json({
      products: mockProducts,
      recordsFiltered: mockProducts.length,
      correction: { misspelled: false },
      fuzzy: "",
      operator: "and",
      translated: false,
      pagination: {
        count: 1,
        current: { index: 1, proxyUrl: "" },
        before: [],
        after: [],
        perPage: 12,
        next: { index: 2, proxyUrl: "" },
        previous: { index: 0, proxyUrl: "" },
        first: { index: 1, proxyUrl: "" },
        last: { index: 1, proxyUrl: "" },
      },
    })
  }
}
