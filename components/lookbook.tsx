import React from 'react'
import Image from "next/image"
import { useTranslation } from "@/hooks/use-translation"

function Lookbook() {
    const { t } = useTranslation();

    const lookbookItems = [
        {
            id: 1,
            title: "kids_pasion",
            // description: "Professional meets stylish",
            image: "/kidsfashion.webp",
            products: ["Blazer", "Trousers", "Shoes"],
        },
        {
            id: 2,
            title: "weekend_casual",
            // description: "Effortless everyday style",
            image: "/mensfashion.jfif",
            products: ["Sweater", "Jeans", "Sneakers"],
        },
        {
            id: 3,
            title: "evening_elegance",
            //description: "Make a statement",
            image: "/womenfashion.webp",
            products: ["Dress", "Jewelry", "Clutch"],
        },
    ]

    return (
        <div>
            <section className="py-20">
                <div className="container adding-padding">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-light mb-6 tracking-tight">{t("style_inspiration")}</h2>
                        <p className="text-xl text-muted-foreground">{t("curated_looks_for_every_occasion")}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {lookbookItems.map((item) => (
                            <div key={item.id} className="group cursor-pointer">
                                <div className="relative overflow-hidden rounded-2xl aspect-[3/4] mb-6">
                                    <Image
                                        src={item.image || "/placeholder.svg"}
                                        alt={item.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                                    {/* <Button size="sm" className="absolute bottom-6 left-6 bg-white text-black hover:bg-white/90">
                          <Play className="h-4 w-4 mr-2" />
                          Shop the Look
                        </Button> */}
                                </div>
                                <h3 className="text-2xl font-light mb-2">{t(item.title as any)}</h3>
                                {/* <p className="text-muted-foreground mb-3">{item.description}</p> */}
                                {/* <div className="flex flex-wrap gap-2">
                        {item.products.map((product) => (
                          <Badge key={product} variant="outline">
                            {product}
                          </Badge>
                        ))}
                      </div> */}
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Lookbook
