"use client"

import { useState, useEffect, useCallback } from "react"

interface Testimonial {
  name: string
  photo: string | null
  content: string
  title: string | null
}

export function TestimonialCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const [current, setCurrent] = useState(0)

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % testimonials.length)
  }, [testimonials.length])

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }, [testimonials.length])

  useEffect(() => {
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next])

  if (testimonials.length === 0) return null

  const t = testimonials[current]

  return (
    <div className="relative max-w-3xl mx-auto">
      {/* Quote icon */}
      <div className="text-center mb-6">
        <svg className="w-16 h-16 mx-auto text-red-500/50" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
        </svg>
      </div>

      {/* Content */}
      <div key={current} className="testimonial-enter text-center">
        <p className="text-lg md:text-xl text-gray-200 leading-relaxed mb-8 italic">
          &ldquo;{t.content}&rdquo;
        </p>

        <div className="flex items-center justify-center gap-4">
          {t.photo ? (
            <img
              src={t.photo}
              alt={t.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-red-500"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-xl">
              {t.name.charAt(0)}
            </div>
          )}
          <div className="text-left">
            <p className="font-semibold text-white">{t.name}</p>
            {t.title && <p className="text-sm text-gray-400">{t.title}</p>}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4 mt-10">
        <button
          onClick={prev}
          className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-all"
          aria-label="Sebelumnya"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`transition-all duration-300 rounded-full ${
                index === current ? "w-6 h-2 bg-red-500" : "w-2 h-2 bg-white/30 hover:bg-white/50"
              }`}
              aria-label={`Testimoni ${index + 1}`}
            />
          ))}
        </div>
        <button
          onClick={next}
          className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-all"
          aria-label="Selanjutnya"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
