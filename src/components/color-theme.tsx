import { prisma } from "@/lib/prisma";
import { generateCssVariables } from "@/lib/color-palette";

export async function ColorThemeScript() {
  const profile = await prisma.siteProfile.findFirst({ where: { id: 1 } });
  const primaryColor = profile?.primaryColor || "#1e40af";
  const vars = generateCssVariables(primaryColor);

  const cssVarsString = Object.entries(vars)
    .map(([key, val]) => `${key}: ${val};`)
    .join(" ");

  return (
    <style id="color-theme-vars">{`:root { ${cssVarsString} }`}</style>
  );
}
