import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRecaptchaToken } from "@/lib/recaptcha";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message, hcaptchaToken } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Semua field wajib diisi" },
        { status: 400 }
      );
    }

    // Verify Google reCAPTCHA
    if (!hcaptchaToken || !(await verifyRecaptchaToken(hcaptchaToken))) {
      return NextResponse.json(
        { error: "Verifikasi CAPTCHA gagal. Silakan coba lagi." },
        { status: 400 }
      );
    }

    const contact = await prisma.contact.create({
      data: { name, email, phone, subject, message },
    });

    return NextResponse.json(
      { message: "Pesan berhasil dikirim", data: contact },
      { status: 201 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
