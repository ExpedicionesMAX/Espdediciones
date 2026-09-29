import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/permissions";
import { getSiteSettings } from "@/lib/site";
import { prisma } from "@/lib/prisma";
import { SettingsForm, type SettingsFormValues } from "@/components/admin/SettingsForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Configuración" };

export default async function SettingsPage() {
  await requirePermission(PERMISSIONS.SETTINGS_MANAGE);
  const s = await getSiteSettings();
  const expeditions = await prisma.expedition.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  // Si no hay pilares estructurados, sembramos desde los ítems simples (legacy).
  const pillars =
    s.homeWhyPillars.length > 0
      ? s.homeWhyPillars
      : s.homeWhyItems.map((t, i) => ({ title: t, active: true, order: i }));

  const values: SettingsFormValues = {
    siteName: s.siteName,
    tagline: s.tagline ?? "",
    logoUrl: s.logoUrl ?? "",
    whatsappNumber: s.whatsappNumber ?? "",
    contactEmail: s.contactEmail ?? "",
    contactPhone: s.contactPhone ?? "",
    accentColor: s.accentColor,
    displayFont: s.displayFont,
    paymentMode: s.paymentMode,
    socialInstagram: s.social.instagram ?? "",
    socialYoutube: s.social.youtube ?? "",
    socialFacebook: s.social.facebook ?? "",
    socialTiktok: s.social.tiktok ?? "",
    socialLinkedin: s.social.linkedin ?? "",
    socialX: s.social.x ?? "",
    socialVimeo: s.social.vimeo ?? "",
    homeExpsTitle: s.homeExpsTitle,
    homeExpsSubtitle: s.homeExpsSubtitle,
    ctaTitle: s.ctaTitle,
    ctaText: s.ctaText,
    ctaButton: s.ctaButton,
    homeWhyTitle: s.homeWhyTitle ?? "",
    homeWhyItems: s.homeWhyItems.join("\n"),
    homeWhyPillars: pillars,
    upcomingExpeditionId: s.upcomingExpeditionId ?? "",
    reviewsLabel: s.reviewsLabel ?? "",
    reviewsUrl: s.reviewsUrl ?? "",
  };

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-3xl font-semibold text-ink">Configuración del sitio</h1>
      <p className="mt-1 text-stone-500">
        Editá la identidad, el contacto y las redes. Los cambios se ven al instante en el sitio público.
      </p>
      <div className="mt-8">
        <SettingsForm values={values} expeditions={expeditions} />
      </div>
    </div>
  );
}
