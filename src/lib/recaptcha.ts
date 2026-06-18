export async function verifyRecaptchaToken(token: string): Promise<boolean> {
  if (!token) return false;

  try {
    const response = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: process.env.RECAPTCHA_SECRET!,
          response: token,
        }),
      }
    );

    const data = await response.json();
    return data.success === true;
  } catch {
    return false;
  }
}
