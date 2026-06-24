import { NextResponse } from "next/server"
import { generateCaptcha } from "@/lib/math-captcha"

export async function GET() {
  try {
    const captcha = generateCaptcha()
    return NextResponse.json({
      token: captcha.token,
      question: captcha.question,
    })
  } catch (error) {
    console.error("Captcha generation error:", error)
    return NextResponse.json(
      { error: "Gagal membuat captcha" },
      { status: 500 }
    )
  }
}
