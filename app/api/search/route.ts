import { type NextRequest, NextResponse } from "next/server"
import { searchProducts } from "@/lib/vtex-api"

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const searchParams = url.searchParams
    const query = searchParams.get("q") || ""
    const page = Number.parseInt(searchParams.get("page") || "1")
    const pageSize = Number.parseInt(searchParams.get("pageSize") || "20")

    if (!query.trim()) {
      return NextResponse.json({
        products: [],
        recordsFiltered: 0,
        query: "",
        suggestions: ["electronics", "clothing", "books", "home", "sports"],
      })
    }

    const result = await searchProducts(query, page, pageSize)
    console.log("query",query)
    return NextResponse.json({
      ...result,
      query,
      suggestions: [],
    })
  } catch (error) {
    console.error("Search API Error:", error)

    // Return mock search results as fallback
    const mockResults = [
      {
        productId: "search-1",
        productName: `Search Result for "${request.url.split("?")[1].split("=")[1]}"`,
        brand: "Sample Brand",
        brandId: 1,
        brandImageUrl: "",
        linkText: "search-result-1",
        productReference: "SR001",
        categoryId: "1",
        productTitle: "Search Result 1",
        metaTagDescription: "A search result",
        releaseDate: "2024-01-01",
        clusterHighlights: {},
        productClusters: {},
        searchableClusters: {},
        categories: ["Search Results"],
        categoriesIds: ["1"],
        link: "/search-result-1",
        description: "This is a search result for demonstration purposes.",
        items: [
          {
            itemId: "search-1",
            name: "Search Result 1",
            nameComplete: "Search Result 1 - Default",
            complementName: "",
            ean: "1234567890125",
            referenceId: [{ Key: "RefId", Value: "SR001" }],
            measurementUnit: "un",
            unitMultiplier: 1,
            modalType: "",
            isKit: false,
            images: [
              {
                imageId: "search-1",
                imageLabel: "Main",
                imageTag: "",
                imageUrl: "/placeholder.svg?height=400&width=400",
                imageText: "Search Result 1",
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
                  Price: 5999,
                  ListPrice: 5999,
                  PriceWithoutDiscount: 5999,
                  RewardValue: 0,
                  PriceValidUntil: "2024-12-31",
                  AvailableQuantity: 15,
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
      products: mockResults,
      recordsFiltered: mockResults.length,
      query: request.url.split("?")[1].split("=")[1] || "",
      suggestions: ["electronics", "clothing", "books", "home", "sports"],
      correction: { misspelled: false },
      fuzzy: "",
      operator: "and",
      translated: false,
      pagination: {
        count: 1,
        current: { index: 1, proxyUrl: "" },
        before: [],
        after: [],
        perPage: 20,
        next: { index: 2, proxyUrl: "" },
        previous: { index: 0, proxyUrl: "" },
        first: { index: 1, proxyUrl: "" },
        last: { index: 1, proxyUrl: "" },
      },
    })
  }
}
