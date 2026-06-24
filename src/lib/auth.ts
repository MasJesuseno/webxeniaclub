import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { validateCaptcha } from "./math-captcha"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        captchaToken: { label: "Captcha Token", type: "hidden" },
        captchaAnswer: { label: "Captcha Answer", type: "hidden" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null

        const username = credentials.username as string
        const password = credentials.password as string
        const captchaToken = credentials.captchaToken as string
        const captchaAnswer = credentials.captchaAnswer as string

        // Validate captcha
        if (!captchaToken || !captchaAnswer) return null
        if (!validateCaptcha(captchaToken, captchaAnswer)) {
          throw new Error("CaptchaError")
        }

        // Dynamic import to avoid loading Prisma in Edge Runtime (proxy)
        const { prisma } = await import("@/lib/prisma")

        const user = await prisma.user.findUnique({
          where: { username },
          include: {
            roles: {
              include: { role: true },
            },
          },
        })

        if (!user || !user.isActive) return null

        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          roles: user.roles.map((ur) => ur.role.name),
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.roles = (user as any).roles || []
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.roles = token.roles as string[]
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
})
