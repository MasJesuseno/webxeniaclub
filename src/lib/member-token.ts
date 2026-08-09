// Edge Runtime-compatible token verification
// No "use server" directive - can be imported in middleware and API routes

const TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000 // 7 days

function getSecret(): string {
  return process.env.NEXTAUTH_SECRET || "dxic-member-secret-default"
}

/**
 * Verify a member JWT token.
 * Uses Web Crypto API-compatible HMAC signing for Edge Runtime support.
 */
export async function verifyMemberToken(
  token: string
): Promise<{ memberId: string } | null> {
  try {
    const secret = getSecret()
    const parts = token.split(".")
    if (parts.length !== 2) return null

    const [encodedPayload, signature] = parts

    // Compute expected signature
    const payloadStr = Buffer.from(encodedPayload, "base64url").toString()
    const expectedSig = await computeHmac(payloadStr, secret)

    // Constant-time comparison
    if (signature.length !== expectedSig.length) return null
    let valid = true
    for (let i = 0; i < signature.length; i++) {
      if (signature[i] !== expectedSig[i]) valid = false
    }
    if (!valid) return null

    const payload = JSON.parse(payloadStr)
    if (payload.exp && payload.exp < Date.now()) return null

    return { memberId: payload.memberId }
  } catch {
    return null
  }
}

/**
 * Create a member JWT token.
 */
export async function createMemberToken(memberId: string): Promise<string> {
  const secret = getSecret()
  const payload = JSON.stringify({
    memberId,
    iat: Date.now(),
    exp: Date.now() + TOKEN_EXPIRY,
  })

  const encodedPayload = Buffer.from(payload).toString("base64url")
  const signature = await computeHmac(payload, secret)

  return encodedPayload + "." + signature
}

/**
 * Compute HMAC-SHA256 signature using Web Crypto API (Edge-compatible).
 */
async function computeHmac(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const messageData = encoder.encode(data)

  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )

  const signature = await crypto.subtle.sign("HMAC", key, messageData)
  const bytes = new Uint8Array(signature)
  return base64urlEncode(bytes)
}

function base64urlEncode(bytes: Uint8Array): string {
  let binary = ""
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")
}
