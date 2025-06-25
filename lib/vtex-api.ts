// VTEX API configuration and utilities
const VTEX_ACCOUNT = process.env.NEXT_PUBLIC_VTEX_ACCOUNT || "iamtechiepartneruae"
const VTEX_ENVIRONMENT = process.env.NEXT_PUBLIC_VTEX_ENVIRONMENT || "vtexcommercestable"
const VTEX_APP_KEY = "vtexappkey-iamtechiepartneruae-WJLMGP"
const VTEX_APP_TOKEN = "BOYZYIBHLFAANVTZIUKBYFTJJNWYIZGPYPPCQBXZKNCBRDKHBITJCAVKKGQHZXASSXJCTJZRQOCRHIRGTWPPUBSONYGDVFEROCDWJDILRFKLHOBTKRHJGWXYQFGZURDO"

const BASE_URL = `https://${VTEX_ACCOUNT}.${VTEX_ENVIRONMENT}.com.br`

// Types for VTEX API responses
export interface VtexProduct {
  productId: string
  productName: string
  brand: string
  brandId: number
  brandImageUrl: string
  linkText: string
  productReference: string
  categoryId: string
  productTitle: string
  metaTagDescription: string
  releaseDate: string
  clusterHighlights: Record<string, string>
  productClusters: Record<string, string>
  searchableClusters: Record<string, string>
  categories: string[]
  categoriesIds: string[]
  link: string
  description: string
  items: VtexSku[]
}

export interface VtexSku {
  itemId: string
  name: string
  nameComplete: string
  complementName: string
  ean: string
  referenceId: Array<{ Key: string; Value: string }>
  measurementUnit: string
  unitMultiplier: number
  modalType: string
  isKit: boolean
  images: Array<{
    imageId: string
    imageLabel: string
    imageTag: string
    imageUrl: string
    imageText: string
    imageLastModified: string
  }>
  sellers: Array<{
    sellerId: string
    sellerName: string
    addToCartLink: string
    sellerDefault: boolean
    commertialOffer: {
      DeliverySlaSamplesPerRegion: Record<string, any>
      Installments: Array<{
        Value: number
        InterestRate: number
        TotalValuePlusInterestRate: number
        NumberOfInstallments: number
        PaymentSystemName: string
        PaymentSystemGroupName: string
        Name: string
      }>
      DiscountHighLight: any[]
      GiftSkuIds: string[]
      Teasers: any[]
      PromotionTeasers: any[]
      BuyTogether: any[]
      ItemMetadataAttachment: any[]
      Price: number
      ListPrice: number
      PriceWithoutDiscount: number
      RewardValue: number
      PriceValidUntil: string
      AvailableQuantity: number
      IsAvailable: boolean
      Tax: number
      DeliverySlaSamples: Array<{
        DeliverySlaPerTypes: any[]
        Region: any
      }>
      GetInfoErrorMessage: any
      CacheVersionUsedToCallCheckout: string
      PaymentOptions: {
        installmentOptions: Array<{
          paymentSystem: string
          bin: any
          paymentName: string
          paymentGroupName: string
          value: number
          installments: Array<{
            count: number
            hasInterestRate: boolean
            interestRate: number
            value: number
            total: number
          }>
        }>
        paymentSystems: Array<{
          id: number
          name: string
          groupName: string
          validator: any
          stringId: string
          template: string
          requiresDocument: boolean
          isCustom: boolean
          description: any
          requiresAuthentication: boolean
          dueDate: string
          availablePayments: any
        }>
        payments: any[]
        giftCards: any[]
        giftCardMessages: any[]
        availableAccounts: any[]
        availableTokens: any[]
      }
    }
  }>
}

export interface VtexSearchResult {
  products: VtexProduct[]
  recordsFiltered: number
  correction: {
    misspelled: boolean
  }
  fuzzy: string
  operator: string
  translated: boolean
  pagination: {
    count: number
    current: {
      index: number
      proxyUrl: string
    }
    before: Array<{
      index: number
      proxyUrl: string
    }>
    after: Array<{
      index: number
      proxyUrl: string
    }>
    perPage: number
    next: {
      index: number
      proxyUrl: string
    }
    previous: {
      index: number
      proxyUrl: string
    }
    first: {
      index: number
      proxyUrl: string
    }
    last: {
      index: number
      proxyUrl: string
    }
  }
}

// API functions
export async function searchProducts(query: string, page = 1, pageSize = 12): Promise<VtexSearchResult> {
  // Check if VTEX configuration is available
  if (!VTEX_ACCOUNT || VTEX_ACCOUNT === "your-account") {
    throw new Error("VTEX configuration not found. Please set up your environment variables.")
  }

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const response = await fetch(
    `${BASE_URL}/api/catalog_system/pub/products/search?ft=${encodeURIComponent(query)}&_from=${from}&_to=${to}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  )

  if (!response.ok) {
    throw new Error(`Failed to search products: ${response.status} ${response.statusText}`)
  }

  const products = await response.json()

  return {
    products,
    recordsFiltered: products.length,
    correction: { misspelled: false },
    fuzzy: "",
    operator: "and",
    translated: false,
    pagination: {
      count: Math.ceil(products.length / pageSize),
      current: { index: page, proxyUrl: "" },
      before: [],
      after: [],
      perPage: pageSize,
      next: { index: page + 1, proxyUrl: "" },
      previous: { index: page - 1, proxyUrl: "" },
      first: { index: 1, proxyUrl: "" },
      last: { index: Math.ceil(products.length / pageSize), proxyUrl: "" },
    },
  }
}

export async function getProductById(productId: string): Promise<VtexProduct> {
  const response = await fetch(`${BASE_URL}/api/catalog_system/pub/products/search?fq=productId:${productId}`, {
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error("Failed to get product")
  }

  const products = await response.json()

  if (!products || products.length === 0) {
    throw new Error("Product not found")
  }

  return products[0]
}

export async function getProductBySlug(slug: string): Promise<VtexProduct> {
  // Check if VTEX configuration is available
  if (!VTEX_ACCOUNT || VTEX_ACCOUNT === "your-account") {
    throw new Error("VTEX configuration not found. Please set up your environment variables.")
  }

  const response = await fetch(`${BASE_URL}/api/catalog_system/pub/products/search/${slug}`, {
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to get product: ${response.status} ${response.statusText}`)
  }

  const products = await response.json()

  if (!products || products.length === 0) {
    throw new Error("Product not found")
  }

  return products[0]
}

export async function getCategories() {
  const response = await fetch(`${BASE_URL}/api/catalog_system/pub/category/tree/1`, {
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error("Failed to get categories")
  }

  return response.json()
}

export async function getProductsByCategory(categoryId: string, page = 1, pageSize = 12) {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const response = await fetch(
    `${BASE_URL}/api/catalog_system/pub/products/search?fq=C:/${categoryId}/&_from=${from}&_to=${to}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  )

  if (!response.ok) {
    throw new Error("Failed to get products by category")
  }

  return response.json()
}

// Format price helper - show as $1.20
export function formatPrice(price: number): string {
  return `$${(price / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

// Get best available price from SKU
export function getBestPrice(sku: VtexSku): number {
  const seller = sku.sellers.find((s) => s.sellerDefault) || sku.sellers[0]
  return seller?.commertialOffer?.Price || 0
}

// Get best available list price from SKU
export function getListPrice(sku: VtexSku): number {
  const seller = sku.sellers.find((s) => s.sellerDefault) || sku.sellers[0]
  return seller?.commertialOffer?.ListPrice || 0
}


// Check if product is available
export function isProductAvailable(sku: VtexSku): boolean {
  const seller = sku.sellers.find((s) => s.sellerDefault) || sku.sellers[0]
  return seller?.commertialOffer?.IsAvailable || false
}
