import React from 'react'
import Image from "next/image"


function BrandPartners() {

    const brandPartners = [
  { name: "Nike", logo: "/nike.png" },
  { name: "H&M", logo: "/HMkids.webp" },
  { name: "adidas", logo: "/adidas.png" },
  { name: "Puma", logo: "/puma.jpg" },
  { name: "Reebok", logo: "/rebook.png" },
]
  return (
        <section className="py-12 border-b brandsecton">
            <div className="container adding-padding">
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
  )
}

export default BrandPartners