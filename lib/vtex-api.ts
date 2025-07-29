// VTEX API configuration and utilities
export const VTEX_ACCOUNT = process.env.NEXT_PUBLIC_VTEX_ACCOUNT || "iamtechiepartneruae"
export const VTEX_ENVIRONMENT = process.env.NEXT_PUBLIC_VTEX_ENVIRONMENT || "vtexcommercestable"

const BASE_URL = `https://${VTEX_ACCOUNT}.${VTEX_ENVIRONMENT}.com.br`

export const VTEX_CONFIG = {
  accountName: VTEX_ACCOUNT,
  environment: VTEX_ENVIRONMENT,
  appKey: process.env.VTEX_API_KEY || process.env.VTEX_APP_KEY,
  appToken: process.env.VTEX_API_TOKEN || process.env.VTEX_APP_TOKEN,
  locale: "en-US"
}

// Check if we have proper authentication
export const hasVTEXCredentials = !!(VTEX_CONFIG.appKey && VTEX_CONFIG.appToken)

export const vtexHeaders = {
  "Content-Type": "application/json",
  Accept: "application/json",
  ...(VTEX_CONFIG.appKey &&
    VTEX_CONFIG.appToken && {
      "X-VTEX-API-AppKey": VTEX_CONFIG.appKey,
      "X-VTEX-API-AppToken": VTEX_CONFIG.appToken,
    }),
}

export const VTEX_ENDPOINTS = {
  orderForm: (orderFormId?: string) =>
    `https://${VTEX_ACCOUNT}.${VTEX_ENVIRONMENT}.com.br/api/checkout/pub/orderForm${orderFormId ? `/${orderFormId}` : ""}`,
  addItems: (orderFormId: string) =>
    `https://${VTEX_ACCOUNT}.${VTEX_ENVIRONMENT}.com.br/api/checkout/pub/orderForm/${orderFormId}/items`,
  updateItems: (orderFormId: string) =>
    `https://${VTEX_ACCOUNT}.${VTEX_ENVIRONMENT}.com.br/api/checkout/pub/orderForm/${orderFormId}/items/update`,
  removeItems: (orderFormId: string) =>
    `https://${VTEX_ACCOUNT}.${VTEX_ENVIRONMENT}.com.br/api/checkout/pub/orderForm/${orderFormId}/items/update`,
  // Direct checkout URL - goes to cart review step first
  checkout: (orderFormId: string) =>
    `https://${VTEX_ACCOUNT}.vtexcommercestable.com.br/checkout/?orderFormId=${orderFormId}#/orderform`,
  // Alternative checkout URL with orderFormId parameter
  checkoutWithId: (orderFormId: string) =>
    `https://${VTEX_ACCOUNT}.vtexcommercestable.com.br/checkout/?orderFormId=${orderFormId}`,
  // Checkout gateway
  gateway: (orderFormId: string) =>
    `https://${VTEX_ACCOUNT}.${VTEX_ENVIRONMENT}.com.br/api/checkout/pub/gateway/orderForm/${orderFormId}`,
  // Prepare checkout
  attachments: (orderFormId: string) =>
    `https://${VTEX_ACCOUNT}.${VTEX_ENVIRONMENT}.com.br/api/checkout/pub/orderForm/${orderFormId}/attachments`,
  search: (query?: string, from = 0, to = 49) =>
    `https://${VTEX_ACCOUNT}.${VTEX_ENVIRONMENT}.com.br/api/catalog_system/pub/products/search${query ? `?fq=${encodeURIComponent(query)}` : ""}${query ? "&" : "?"}_from=${from}&_to=${to}`,
  productById: (productId: string) =>
    `https://${VTEX_ACCOUNT}.${VTEX_ENVIRONMENT}.com.br/api/catalog_system/pub/products/search?fq=productId:${productId}`,
  categories: () =>
    `https://${VTEX_ACCOUNT}.${VTEX_ENVIRONMENT}.com.br/api/catalog_system/pub/category/tree/1`,
}

// Types for VTEX API responses
export interface VtexProduct {
  productId: string
  productName: string
  productName_ar?: string   
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
  Arabic_title?: string[]
  Arabic_description?: string[]
  // Additional properties for cart compatibility
  id?: string
  name?: string
  price?: number
  imageUrl?: string
  quantity?: number
}

export interface VTEXOrderForm {
  orderFormId: string
  items: Array<{
    id: string
    productId: string
    name: string
    price: number
    imageUrl: string
    quantity: number
    seller: string
    availableQuantity?: number
  }>
  totalizers: Array<{
    id: string
    name: string
    value: number
  }>
  value: number
}


export interface VtexSku {
  itemId: string
  name: string
   name_ar?: string  
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

export async function fetchCategories(level: number = 3) {
  const response = await fetch(`/api/categories?level=${level}`);
  if (!response.ok) throw new Error("Failed to fetch categories");
  return await response.json();
}

export async function searchProducts(
  query: string,
  page = 1,
  pageSize = 12,
  category = ""
): Promise<VtexSearchResult> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const cleanQuery = query.trim();

  let url = `${BASE_URL}/api/catalog_system/pub/products/search?_from=${from}&_to=${to}`;

  if (category) {
    url += `&fq=C:/${category}/`;
  }

  if (cleanQuery) {
    url += `&ft=${encodeURIComponent(cleanQuery)}`;
  }

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to search products: ${response.status} ${response.statusText}`);
  }

  const products = await response.json();

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
  };
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





export async function getProductsByCategory(categoryId: string, page = 1, pageSize = 50) {
  const from = (page - 1) * pageSize
  const to = 50

  const response = await fetch(
    `${BASE_URL}/api/catalog_system/pub/products/search?fq=C:/${categoryId}/&_from=${from}&_to=${to}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  )

  if (!response.ok) {
    throw new Error("Failed to get products by category")
  }

  const products = await response.json()

  // sort by latest release date
  products.sort((a: VtexProduct, b: VtexProduct) => {
    return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
  })

  return products
}


// Format price helper - show as $1.20
export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
  }).format(price / 100)

  
}



export function formatPricee(price: number) {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
  }).format(price / 10000)

  
}


// export function formatPrice(price: number, currency: string = "SAR") {
//   return new Intl.NumberFormat("en-SA", {
//     style: "currency",
//     currency,
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2
//   }).format(price);
// }

// Get best available price from SKU
export function getBestPrice(sku: VtexSku): number {
  if (!sku || !Array.isArray(sku.sellers) || sku.sellers.length === 0) {
    return 0;
  }
  const seller = sku.sellers.find((s) => s.sellerDefault) || sku.sellers[0];
  return seller?.commertialOffer?.Price || 0;
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

// Get available quantity for a product SKU
export function getAvailableQuantity(sku: VtexSku): number {
  const seller = sku.sellers.find((s) => s.sellerDefault) || sku.sellers[0]
  return seller?.commertialOffer?.AvailableQuantity || 0
}

// Fetch product information for cart items (works without authentication)
export async function getProductInfo(productId: string, skuId: string): Promise<{
  name: string
  price: number
  imageUrl: string
  availableQuantity: number
}> {
  try {
    const product = await getProductById(productId)
    const sku = product.items.find(item => item.itemId === skuId)
    
    if (!sku) {
      throw new Error("SKU not found")
    }

    const seller = sku.sellers.find(s => s.sellerDefault) || sku.sellers[0]
    if (!seller) {
      throw new Error("No seller found")
    }

    const imageUrl = sku.images?.[0]?.imageUrl || "/placeholder.svg"
    const price = seller.commertialOffer.Price || 0
    const availableQuantity = seller.commertialOffer.AvailableQuantity || 0

    return {
      name: product.productName,
      price: price,
      imageUrl: imageUrl,
      availableQuantity: availableQuantity
    }
  } catch (error) {
    console.warn("Failed to fetch product info:", error)
    // Return fallback data
    return {
      name: `Product ${productId}`,
      price: 0,
      imageUrl: "/placeholder.svg",
      availableQuantity: 10
    }
  }
}





