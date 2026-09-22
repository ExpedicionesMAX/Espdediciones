import { SiteHeader } from "@/components/public/SiteHeader";
import { SiteFooter } from "@/components/public/SiteFooter";
import { WhatsAppFloat } from "@/components/public/WhatsAppFloat";
import { getSiteSettings } from "@/lib/site";
import { whatsappUrl } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, menuPages] = await Promise.all([
    getSiteSettings(),
    prisma.page
      .findMany({
        where: { published: true, showInMenu: true },
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
