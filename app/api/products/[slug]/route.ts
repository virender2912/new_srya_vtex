import { type NextRequest, NextResponse } from "next/server"
import { getProductBySlug } from "@/lib/vtex-api"

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const product = await getProductBySlug(params.slug)
    return NextResponse.json(product)
  } catch (error) {
    console.error("API Error:", error)

    // Return mock product as fallback
    const mockProduct = {
      productId: "1",
      productName: "Sample Product",
      brand: "Sample Brand",
      brandId: 1,
      brandImageUrl: "",
      linkText: params.slug,
      productReference: "SP001",
      categoryId: "1",
      productTitle: "Sample Product",
      metaTagDescription: "A great sample product",
      releaseDate: "2024-01-01",
      clusterHighlights: {},
      productClusters: {},
      searchableClusters: {},
      categories: ["Electronics", "Gadgets"],
      categoriesIds: ["1", "2"],
      link: `/${params.slug}`,
      description:
        "<p>This is a detailed description of our sample product. It features high-quality materials and excellent craftsmanship.</p><p>Perfect for everyday use and built to last.</p>",
      items: [
        {
          itemId: "1",
          name: "Sample Product - Default",
          nameComplete: "Sample Product - Default Variation",
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
              imageUrl: "/placeholder.svg?height=600&width=600",
              imageText: "Sample Product Main Image",
              imageLastModified: "2024-01-01",
            },
            {
              imageId: "2",
              imageLabel: "Side",
              imageTag: "",
              imageUrl: "/placeholder.svg?height=600&width=600",
              imageText: "Sample Product Side View",
              imageLastModified: "2024-01-01",
            },
            {
              imageId: "3",
              imageLabel: "Back",
              imageTag: "",
              imageUrl: "/placeholder.svg?height=600&width=600",
              imageText: "Sample Product Back View",
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
                Installments: [
                  {
                    Value: 9999,
                    InterestRate: 0,
                    TotalValuePlusInterestRate: 9999,
                    NumberOfInstallments: 1,
                    PaymentSystemName: "Credit Card",
                    PaymentSystemGroupName: "creditCard",
                    Name: "1x of $99.99",
                  },
                ],
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
    }

    return NextResponse.json(mockProduct)
  }
}
