import { memberLogin } from "@/lib/member-auth"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { memberId, password } = body

    if (!memberId || !password) {
      return NextResponse.json(
        { error: "ID Member dan password harus diisi" },
        { status: 400 }
      )
    }

    const result = await memberLogin(memberId, password)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 401 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Member login error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}
