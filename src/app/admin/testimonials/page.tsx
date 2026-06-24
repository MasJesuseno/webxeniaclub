import { prisma } from "@/lib/prisma"
import { TestimonialManager } from "./testimonial-manager"

export default async function AdminTestimonialsPage() {
  const testimonials = await prisma.testimonial.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Testimoni</h1>
      <TestimonialManager testimonials={testimonials} />
    </div>
  )
}
