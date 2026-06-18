import { prisma } from "@/lib/prisma";

export async function FontStyleScript() {
  const profile = await prisma.siteProfile.findFirst({ where: { id: 1 } });

  const headingFont = profile?.headingFont || "Inter";
  const bodyFont = profile?.bodyFont || "Inter";
  const headingWeight = profile?.headingWeight || "700";

  const css = `
    :root {
      --font-heading: "${headingFont}", sans-serif;
      --font-body: "${bodyFont}", sans-serif;
      --heading-font-weight: ${headingWeight};
    }
  `;

  return (
    <style id="font-style-vars">{css}</style>
  );
}
