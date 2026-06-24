import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      roles: string[]
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }

  interface User {
    roles?: string[]
  }
}

// Augment JWT via next-auth module directly
declare module "next-auth" {
  interface JWT {
    id: string
    roles: string[]
  }
}
