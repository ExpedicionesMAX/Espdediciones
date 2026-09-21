import { InquiryForm } from "@/components/public/InquiryForm";
import { getSiteSettings } from "@/lib/site";
import { getSiteTexts } from "@/lib/site-texts";
import { whatsappUrl } from "@/lib/format";

export const metadata = {
  title: "Contacto",
  description: "Escribinos para armar tu próxima expedición.",
};

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const texts = await getSiteTexts();
  const wa = whatsappUrl(
    settings.whatsappNumber,
    "Hola, quiero consultar por una expedición.",
  );

  return (
    <>
      <section className="bg-ink px-4 pb-12 pt-32 text-white sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="font-display text-4xl font-semibold sm:text-5xl">
            {texts.contactoTitle}
          </h1>
          <p className="mt-3 max-w-xl text-stone-300">{texts.contactoSubtitle}</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink">
            {texts.contactoHablemos}
          </h2>
          <p className="mt-3 text-stone-600">{texts.contactoHablemosText}</p>
          <ul className="mt-6 space-y-3 text-sm text-stone-700">
            {settings.contactEmail && (
              <li>
                <span className="font-medium text-ink">Email:</span>{" "}
                <a href={`mailto:${settings.contactEmail}`} className="text-accent hover:underline">
                  {settings.contactEmail}
                </a>
              </li>
            )}
            {settings.contactPhone && (
              <li>
                <span className="font-medium text-ink">Teléfono:</span>{" "}
                {settings.contactPhone}
              </li>
            )}
          </ul>
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Escribir por WhatsApp
            </a>
          )}
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <InquiryForm />
        </div>
      </section>
    </>
  );
}
