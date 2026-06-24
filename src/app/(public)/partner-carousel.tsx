"use client"

import { useState, useEffect, useCallback } from "react"

interface Partner {
  id: string
  name: string
  logo: string
  description: string | null
  website: string | null
}

export function PartnerCarousel({ partners }: { partners: Partner[] }) {
  const [current, setCurrent] = useState(0)
  const totalSlides = Math.ceil(partners.length / 3)

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % totalSlides)
  }, [totalSlides])

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + totalSlides) % totalSlides)
  }, [totalSlides])

  useEffect(() => {
    if (totalSlides <= 1) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next, totalSlides])

  if (partners.length === 0) return null

  return (
    <section className="bg-white py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Mitra Kerja Sama
          </h2>
          <div className="w-20 h-1 dxic-gradient rounded-full mx-auto mb-4" />
          <p className="text-gray-500 max-w-2xl mx-auto">
            Bersama mitra-mitra terbaik kami dalam membangun dan mengembangkan komunitas DXIC
          </p>
        </div>

        {/* Carousel */}
        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${current * 100}%)` }}
            >
              {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                <div key={slideIndex} className="w-full shrink-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    {partners.slice(slideIndex * 3, slideIndex * 3 + 3).map((partner) => (
                      <div
                        key={partner.id}
                        className="group bg-gray-50 rounded-2xl p-6 md:p-8 border border-gray-100 hover:border-red-200 hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center"
                      >
                        {/* Logo */}
                        <div className="w-28 h-28 md:w-32 md:h-32 mb-5 flex items-center justify-center">
                          {partner.logo ? (
                            <img
                              src={partner.logo}
                              alt={partner.name}
                              className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-full dxic-gradient flex items-center justify-center text-white font-bold text-2xl">
                              {partner.name.charAt(0)}
                            </div>
                          )}
                        </div>

                        {/* Name */}
                        <h3 className="font-bold text-gray-900 text-lg mb-2">
                          {partner.name}
                        </h3>

                        {/* Description */}
                        {partner.description && (
                          <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-3">
                            {partner.description}
                          </p>
                        )}

                        {/* Website Link */}
                        {partner.website && (
                          <a
                            href={partner.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-auto inline-flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Kunjungi Website
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          {totalSlides > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute -left-3 md:-left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-red-600 hover:border-red-300 transition-all z-10"
                aria-label="Sebelumnya"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={next}
                className="absolute -right-3 md:-right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-red-600 hover:border-red-300 transition-all z-10"
                aria-label="Selanjutnya"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Dots Indicator */}
        {totalSlides > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === current ? "w-8 h-2.5 bg-red-600" : "w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
