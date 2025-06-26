export const translations = {
  en: {
    // Navigation
    home: "Home",
    Nike: "Nike",
    products: "Products",
    categories: "Categories",
    cart: "Cart",
    search: "Search",

    // Product related
    addToCart: "Add to Cart",
    buyNow: "Buy Now",
    price: "Price",
    description: "Description",
    specifications: "Specifications",
    reviews: "Reviews",
    inStock: "In Stock",
    outOfStock: "Out of Stock",

    // Common
    loading: "Loading...",
    error: "Error",
    tryAgain: "Try Again",
    noResults: "No results found",
    showMore: "Show More",
    showLess: "Show Less",

    // Cart
    cartEmpty: "Your cart is empty",
    continueShopping: "Continue Shopping",
    checkout: "Checkout",
    total: "Total",
    quantity: "Quantity",
    remove: "Remove",

    // Footer
    aboutUs: "About Us",
    contactUs: "Contact Us",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",

    // New additions
    mens: "Men's",
    accessories: "Accessories",
    shoes: "Shoes",
    sale: "Sale",
  },
  ar: {
    // Navigation
    home: "الرئيسية",
    Nike: "نايك",
    products: "المنتجات",
    categories: "الفئات",
    cart: "السلة",
    search: "البحث",

    // Product related
    addToCart: "أضف إلى السلة",
    buyNow: "اشتري الآن",
    price: "السعر",
    description: "الوصف",
    specifications: "المواصفات",
    reviews: "التقييمات",
    inStock: "متوفر",
    outOfStock: "غير متوفر",

    // Common
    loading: "جاري التحميل...",
    error: "خطأ",
    tryAgain: "حاول مرة أخرى",
    noResults: "لم يتم العثور على نتائج",
    showMore: "عرض المزيد",
    showLess: "عرض أقل",

    // Cart
    cartEmpty: "سلتك فارغة",
    continueShopping: "متابعة التسوق",
    checkout: "الدفع",
    total: "المجموع",
    quantity: "الكمية",
    remove: "إزالة",

    // Footer
    aboutUs: "من نحن",
    contactUs: "اتصل بنا",
    privacyPolicy: "سياسة الخصوصية",
    termsOfService: "شروط الخدمة",

    // New additions
    mens: "رجال",
    accessories: "إكسسوارات",
    shoes: "أحذية",
    sale: "تخفيضات",
  },
}

export type TranslationKey = keyof typeof translations.en
