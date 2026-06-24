const CAPTCHA_SECRET = "dxic-captcha-2024"

function simpleHash(value: string): string {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    const char = value.charCodeAt(i)
    const secretChar = CAPTCHA_SECRET.charCodeAt(i % CAPTCHA_SECRET.length)
    hash = ((hash << 5) - hash) + (char ^ secretChar)
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

function generateNonce(): string {
  return Math.random().toString(36).substring(2, 10) +
    Date.now().toString(36)
}

/**
 * Generate a random math captcha question.
 * The token contains the answer hash, so validation works across server bundles.
 */
export function generateCaptcha(): { token: string; question: string } {
  const isAddition = Math.random() > 0.5
  let a: number, b: number, answer: number

  if (isAddition) {
    a = Math.floor(Math.random() * 50) + 1
    b = Math.floor(Math.random() * 50) + 1
    answer = a + b
  } else {
    a = Math.floor(Math.random() * 50) + 10
    b = Math.floor(Math.random() * a) + 1
    answer = a - b
  }

  const operator = isAddition ? "+" : "-"
  const question = `${a} ${operator} ${b}`

  const answerHash = simpleHash(String(answer))
  const nonce = generateNonce()
  const token = answerHash + ":" + nonce

  return { token, question }
}

/**
 * Validate a captcha answer.
 * Re-computes the answer hash from the user's answer to validate.
 * No in-memory store needed - the token is self-contained.
 */
export function validateCaptcha(
  token: string,
  answer: string
): boolean {
  if (!token || !answer) return false

  const parts = token.split(":")
  if (parts.length !== 2) return false

  const [expectedHash] = parts
  const actualHash = simpleHash(answer.trim())

  return expectedHash === actualHash
}
