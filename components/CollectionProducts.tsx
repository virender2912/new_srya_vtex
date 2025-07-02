import React from 'react'
import { VtexProduct, formatPrice, getBestPrice, getListPrice, isProductAvailable } from '@/lib/vtex-api'
import Link from 'next/link'

interface CollectionProductsProps {
  products: VtexProduct[]
}

export const CollectionProducts: React.FC<CollectionProductsProps> = ({ products }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => {
        const defaultSku = product.items[0]
        const price = getBestPrice(defaultSku)
        const listPrice = getListPrice(defaultSku)
        const available = isProductAvailable(defaultSku)
        const hasDiscount = listPrice > price

        return (
          <div key={product.productId} className="group relative">
            <Link href={`/products/${product.linkText}`} className="block">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                {defaultSku.images.length > 0 && (
                  <img
                    src={defaultSku.images[0].imageUrl.replace('http://', 'https://')}
                    alt={product.productName}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                )}
              </div>
              <div className="mt-3">
                <h3 className="text-sm font-medium text-gray-900">{product.productName}</h3>
                <div className="mt-1 flex items-center">
                  <p className="text-sm text-gray-900">{formatPrice(price)}</p>
                  {hasDiscount && (
                    <p className="ml-2 text-sm text-gray-500 line-through">{formatPrice(listPrice)}</p>
                  )}
                </div>
                {!available && (
                  <p className="mt-1 text-xs text-red-500">Out of stock</p>
                )}
              </div>
            </Link>
          </div>
        )
      })}
    </div>
  )
}