"use client"
import React from 'react'
import { useState } from "react"
import { ArrowRight, ChevronLeft, ChevronRight, Play, Instagram, Facebook, Twitter } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTranslation } from "@/hooks/use-translation"


function HeroSlides() {
    const { t } = useTranslation();
    const heroSlides = [
        {
            id: 1,
            title: "slider_title_3",
            subtitle: "slider_subtitle_3",
            description: "slider_description_3",
            cta: "slider_cta_3",
            image: "/images/banner-3.jpg",
            link: "/category/men",
            theme: "dark",
        },
        {
            id: 2,
            title: "slider_title_1",
            subtitle: "slider_subtitle_1",
            description: "slider_description_1",
            cta: "slider_cta_1",
            image: "/images/women-banner.jpg",
            link: "/category/kids",
            theme: "dark",
        },
        {
            id: 3,
            title: "slider_title_2",
            subtitle: "slider_subtitle_2",
            description: "slider_description_2",
            cta: "slider_cta_2",
            image: "/images/banner-2.jpg",
            link: "/category/women",
            theme: "dark",
        }
    ];

    const [currentSlide, setCurrentSlide] = useState(0);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="relative h-[85vh] overflow-hidden">
            {heroSlides.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`absolute inset-0 transition-all duration-700 ease-in-out 
                   ${index === currentSlide ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-105 pointer-events-none"}`}
                >

                    <div className="relative h-full">
                        <Image src={slide.image} alt={slide.title} fill className="object-cover" priority={index === 0} />
                        <div className={`absolute inset-0 ${slide.theme === "dark" ? "bg-black/50" : "bg-white/30"}`} />

                        <div className="absolute inset-0 flex items-center">
                            <div className="container">
                                <div className={`max-w-2xl heroslider ${slide.theme === "light" ? "text-black" : "text-white"}`}>
                                    <Badge className={`mb-6 ${slide.theme === "light" ? "bg-black/10 text-black border-black/20" : "bg-white/20 text-white border-white/30"}`}>
                                        {t(slide.subtitle as any)}
                                    </Badge>

                                    <h1 className="text-6xl md:text-8xl font-light mb-8 leading-tight tracking-tight sliderheading">
                                        {t(slide.title as any)}
                                    </h1>

                                    <p className={`text-xl mb-10 leading-relaxed slidercntn ${slide.theme === "light" ? "text-black/80" : "text-white/90"}`}>
                                        {t(slide.description as any)}
                                    </p>

                                    {/* DEBUG: shows the link */}

                                    <Link href={slide.link} key={slide.id}>
                                        <Button
                                            size="lg"
                                            className={`${slide.theme === "light" ? "bg-black text-white hover:bg-black/90" : "bg-white text-black hover:bg-white/90"} px-8 py-6 text-lg sliderbtn`}
                                        >
                                            {t(slide.cta as any)}
                                            <ArrowRight className="ml-3 h-5 w-5" />
                                        </Button>
                                    </Link>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            <button onClick={prevSlide} className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-3 rounded-full transition-all sliderbtnleft">
                <ChevronLeft className="h-6 w-6" />
            </button>

            <button onClick={nextSlide} className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-3 rounded-full transition-all sliderbtnright">
                <ChevronRight className="h-6 w-6" />
            </button>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3">
                {heroSlides.map((_, index) => (
                    <button key={index} onClick={() => setCurrentSlide(index)} className={`w-12 h-1 rounded-full transition-all ${index === currentSlide ? "bg-white" : "bg-white/40"}`} />
                ))}
            </div>
        </section>
    );
}


export default HeroSlides