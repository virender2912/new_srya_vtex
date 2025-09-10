"use client"
import React from 'react'
import Link from "next/link"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { useTranslation } from "@/hooks/use-translation"

function CategoriesShowcase() {
    const { t } = useTranslation();
    return (
        <section className="py-20 categories-section">
            <div className="container adding-padding">
                <div className="text-center mb-16">
                    <h2 className="text-5xl font-light mb-6 tracking-tight">
                        {t("discover_your_style")}
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        {t("curated_collections_for_ever_moment_every_mood_every_you")}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <Link
                        href="/category/women"
                        className="group relative overflow-hidden rounded-2xl aspect-[3/4] block"
                    >
                        <Image
                            src="/images/women.jpg"
                            alt="Women's Fashion"
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-8 left-8 text-white">
                            <h3 className="text-3xl font-light mb-3">{t("womens")}</h3>
                            <p className="text-white/80 mb-4">{t("elegant_contemporary")}</p>
                            <Button variant="outline" className="border-black bg-black text-white hover:bg-white hover:text-black coltnbtn">
                                {t("explorecollection")}
                            </Button>
                        </div>
                    </Link>

                    <Link
                        href="/category/men"
                        className="group relative overflow-hidden rounded-2xl aspect-[3/4] block"
                    >
                        <Image
                            src="/images/men.jpg"
                            alt="Men's Fashion"
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-8 left-8 text-white">
                            <h3 className="text-3xl font-light mb-3">{t("mens")}</h3>
                            <p className="text-white/80 mb-4">{t("refined_modern")}</p>
                            <Button variant="outline" className="border-black bg-black text-white hover:bg-white hover:text-black coltnbtn">
                                {t("explorecollection")}
                            </Button>
                        </div>
                    </Link>

                    <Link
                        href="/category/kids"
                        className="group relative overflow-hidden rounded-2xl aspect-[3/4] block"
                    >
                        <Image
                            src="/kidsfashionnew.jpg"
                            alt="Accessories"
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-8 left-8 text-white">
                            <h3 className="text-3xl font-light mb-3">{t("kids")}</h3>
                            <p className="text-white/80 mb-4">{t("statement_pieces")}</p>
                            <Button variant="outline" className="border-black bg-black text-white hover:bg-white hover:text-black coltnbtn">
                                {t("explorecollection")}
                            </Button>
                        </div>
                    </Link>
                </div>
            </div>
        </section>
    )
}

export default CategoriesShowcase
