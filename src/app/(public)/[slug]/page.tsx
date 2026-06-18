import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/breadcrumb";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await prisma.page.findUnique({ where: { slug } });
  if (!page || page.status !== "published") return { title: "Halaman tidak ditemukan" };
  return {
    title: page.title,
    description: `Halaman ${page.title} - SMA Annajah`,
  };
}

export default async function DynamicPage({ params }: Props) {
  const { slug } = await params;
  const page = await prisma.page.findUnique({ where: { slug } });

  if (!page || page.status !== "published") {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <Breadcrumb items={[{ label: page.title }]} />

      {/* Hero */}
      <section className="bg-gradient-primary py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            {page.title}
          </h1>
        </div>
      </section>

      {/* Content */}
      <section className={`py-16 lg:py-24 ${page.layout === "full-width" ? "" : "bg-white"}`}>
        <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${
          page.layout === "full-width" ? "max-w-full" : "max-w-4xl"
        }`}>
          <div
            className="text-gray-700 leading-relaxed [&_p]:mb-4 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_li]:mb-2 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-primary-900 [&_h2]:mb-3 [&_h2]:mt-8 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-primary-900 [&_h3]:mb-2 [&_h3]:mt-6 [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:text-primary-900 [&_h4]:mb-2 [&_h4]:mt-4 [&_img]:rounded-xl [&_img]:my-6 [&_img]:max-w-full [&_img]:shadow-md [&_a]:text-primary-600 [&_a]:underline [&_a]:hover:text-primary-800 [&_hr]:my-8 [&_hr]:border-gray-300 [&_blockquote]:border-l-4 [&_blockquote]:border-primary-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-500 [&_blockquote]:my-4 [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-gray-200 [&_th]:p-3 [&_th]:bg-gray-50 [&_th]:text-left [&_th]:font-semibold [&_td]:border [&_td]:border-gray-200 [&_td]:p-3"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </div>
      </section>
    </div>
  );
}
