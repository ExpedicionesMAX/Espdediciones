import { SiteHeader } from "@/components/public/SiteHeader";
import { SiteFooter } from "@/components/public/SiteFooter";
import { WhatsAppFloat } from "@/components/public/WhatsAppFloat";
import { getSiteSettings } from "@/lib/site";
import { whatsappUrl } from "@/lib/format";
import { fontVar } from "@/lib/fonts";
import { prisma } from "@/lib/prisma";
import { ABOUT_PAGE_SLUG } from "@/lib/page-content";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, menuPages] = await Promise.all([
    getSiteSettings(),
    prisma.page
      .findMany({
        // «Nosotros» ahora es el inicio: no se repite en el menú.
        where: { published: true, showInMenu: true, slug: { not: ABOUT_PAGE_SLUG } },
        orderBy: { menuOrder: "asc" },
        select: { slug: true, title: true },
      })
      .catch(() => []),
  ]);
  const wa = whatsappUrl(
    settings.whatsappNumber,
    "Hola, quiero información sobre las expediciones.",
  );
  return (
    <div
      className="flex min-h-full flex-col"
      style={
        {
          "--color-accent": settings.accentColor,
          "--color-accent-dark": settings.accentColor,
          "--font-display": `var(${fontVar(settings.displayFont)}), ui-sans-serif, sans-serif`,
        } as React.CSSProperties
      }
    >
      <SiteHeader siteName={settings.siteName} logoUrl={settings.logoUrl} pages={menuPages} />
      <main className="flex-1">{children}</main>
      <SiteFooter settings={settings} />
      {wa && <WhatsAppFloat href={wa} />}
    </div>
  );
}
