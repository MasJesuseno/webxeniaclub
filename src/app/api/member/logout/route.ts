import { memberLogout } from "@/lib/member-auth"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    await memberLogout()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Member logout error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}
