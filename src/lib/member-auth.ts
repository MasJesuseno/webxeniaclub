"use server"

import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"
import { createMemberToken, verifyMemberToken } from "@/lib/member-token"

const COOKIE_NAME = "member_token"

export async function getMemberSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null

  const payload = await verifyMemberToken(token)
  if (!payload) return null

  const member = await prisma.prospectiveMember.findFirst({
    where: { memberId: payload.memberId },
  })

  return member
}

export async function requireMember() {
  const member = await getMemberSession()
  if (!member) redirect("/member/login")
  return member
}

export async function memberLogin(
  memberId: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  // Find member by memberId
  const member = await prisma.prospectiveMember.findFirst({
    where: { memberId },
  })

  if (!member) {
    return { success: false, error: "ID Member tidak ditemukan" }
  }

  if (!member.password) {
    return { success: false, error: "Akun belum memiliki password. Hubungi admin." }
  }

  const isValid = await bcrypt.compare(password, member.password)
  if (!isValid) {
    return { success: false, error: "Password salah" }
  }

  // Check if member is blacklisted
  if (member.statusMember === "Black List") {
    return {
      success: false,
      error: "Mohon maaf ada kesalahan data",
    }
  }

  // Check member is approved
  if (member.status !== "Diterima" && member.statusMember !== "Aktif") {
    return {
      success: false,
      error: "Akun belum aktif. Status: " + (member.status || member.statusMember),
    }
  }

  // Create token and set cookie
  const token = await createMemberToken(memberId)

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  })

  // Update last login
  await prisma.prospectiveMember.update({
    where: { id: member.id },
    data: { lastLoginAt: new Date(), isOnline: true },
  })

  return { success: true }
}

export async function memberLogout() {
  const member = await getMemberSession()
  if (member) {
    await prisma.prospectiveMember.update({
      where: { id: member.id },
      data: { isOnline: false },
    })
  }

  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}
