"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"

interface FeaturedPost {
  title: string
  slug: string
  image: string | null
  excerpt: string
}

export function HomeCarousel({
  clubName,
  slogan,
  banner,
  featuredPosts,
}: {
  clubName: string
  slogan: string
  banner?: string | null
  featuredPosts: FeaturedPost[]
}) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const hasPosts = featuredPosts.length > 0

  const slides = banner
    ? [
        { type: "banner" as const, image: banner, title: slogan, subtitle: clubName },
        ...featuredPosts.slice(0, 3).map((p) => ({
          type: "post" as const,
          image: p.image,
          title: p.title,
          subtitle: p.excerpt,
          slug: p.slug,
        })),
      ]
    : featuredPosts.slice(0, 4).map((p) => ({
        type: "post" as const,
        image: p.image,
        title: p.title,
        subtitle: p.excerpt,
        slug: p.slug,
      }))

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }, [slides.length])

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }, [slides.length])

  useEffect(() => {
    const timer = setInterval(nextSlide, 6000)
    return () => clearInterval(timer)
  }, [nextSlide])

  if (slides.length === 0) {
    return (
      <section className="relative h-[70vh] min-h-[500px] dxic-gradient flex items-center justify-center">
        <div className="text-center text-white px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 text-shadow-lg">{slogan}</h1>
          <p className="text-xl md:text-2xl text-white/90">{clubName}</p>
        </div>
      </section>
    )
  }

  const current = slides[currentSlide]

  return (
    <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Background Image */}
          {slide.image ? (
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full dxic-gradient" />
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          {/* Content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white px-4 max-w-4xl mx-auto">
              {slide.type === "banner" ? (
                <>
                  <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 text-shadow-lg animate-fade-in">
                    {slide.title}
                  </h1>
                  <p className="text-lg sm:text-xl md:text-2xl text-white/90 animate-fade-in-delay-1">
                    {slide.subtitle}
                  </p>
                </>
              ) : (
                <div>
                  <span className="inline-block px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-full mb-4 animate-fade-in">
                    Berita Unggulan
                  </span>
                  <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4 text-shadow-lg animate-fade-in-delay-1">
                    {slide.title}
                  </h2>
                  <p className="text-sm sm:text-base md:text-lg text-white/80 max-w-2xl mx-auto mb-6 animate-fade-in-delay-2 line-clamp-2">
                    {(slide as any).subtitle}
                  </p>
                  {"slug" in slide && slide.slug && (
                    <Link
                      href={`/berita/${slide.slug}`}
                      className="inline-flex items-center gap-2 bg-white text-red-600 px-6 py-3 rounded-full font-semibold hover:bg-red-50 transition-all hover:scale-105 animate-fade-in-delay-2"
                    >
                      Baca Selengkapnya
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/40 transition-all z-10"
        aria-label="Sebelumnya"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/40 transition-all z-10"
        aria-label="Selanjutnya"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentSlide
                ? "w-8 h-3 bg-white"
                : "w-3 h-3 bg-white/50 hover:bg-white/70"
            }`}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
