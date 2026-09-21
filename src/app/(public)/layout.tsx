import { SiteHeader } from "@/components/public/SiteHeader";
import { SiteFooter } from "@/components/public/SiteFooter";
import { getSiteSettings } from "@/lib/site";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();
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
      <SiteHeader siteName={settings.siteName} logoUrl={settings.logoUrl} />
      <main className="flex-1">{children}</main>
      <SiteFooter settings={settings} />
    </div>
  );
}
