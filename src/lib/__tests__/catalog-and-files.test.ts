import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CATALOG_CATEGORIES,
  catalogHref,
  categoryLabel,
  isCatalogCategory,
} from "@/lib/trip-categories";
import { seasonLabel } from "@/lib/format";
import { detectImageType } from "@/lib/image-sniff";
import { tripCover } from "@/lib/media";
import { normalizeWhatsappGroupUrl } from "@/lib/whatsapp-group";

test("link del grupo de WhatsApp: acepta invitaciones reales y las deja limpias", () => {
  const code = "AbCdEf1234567890XyZ123";
  assert.equal(normalizeWhatsappGroupUrl(`https://chat.whatsapp.com/${code}`), `https://chat.whatsapp.com/${code}`);
  assert.equal(normalizeWhatsappGroupUrl(`  chat.whatsapp.com/${code}  `), `https://chat.whatsapp.com/${code}`, "sin https");
  assert.equal(normalizeWhatsappGroupUrl(`https://chat.whatsapp.com/${code}?mode=r_c`), `https://chat.whatsapp.com/${code}`, "sin parámetros");
});

test("link del grupo de WhatsApp: rechaza otros sitios y links que no son de grupo", () => {
  for (const bad of [
    "https://wa.me/5491100000000", // chat privado, no grupo
    "https://evil.com/chat.whatsapp.com/AbCdEf1234567890",
    "https://chat.whatsapp.com.evil.com/AbCdEf1234567890",
    "javascript:alert(1)",
    "https://chat.whatsapp.com/",
    "https://chat.whatsapp.com/abc", // código demasiado corto
    "",
    null,
  ]) {
    assert.equal(normalizeWhatsappGroupUrl(bad), null, `debería rechazar ${String(bad)}`);
  }
});

test("el catálogo tiene exactamente las 3 categorías, sin Viajes a Medida", () => {
  assert.deepEqual(
    CATALOG_CATEGORIES.map((c) => c.key),
    ["fotografica", "escapada", "coleccionable"],
  );
  assert.equal(isCatalogCategory("a-medida"), false);
  assert.equal(isCatalogCategory("fotografica"), true);
  assert.equal(isCatalogCategory(undefined), false);
});

test("catalogHref y categoryLabel", () => {
  assert.equal(catalogHref(null), "/expediciones");
  assert.equal(catalogHref("escapada"), "/expediciones?categoria=escapada");
  assert.equal(categoryLabel("coleccionable"), "Viajes Coleccionables");
  assert.equal(categoryLabel("a-medida"), null);
});

test("la categoría «fotografica» se muestra como «Expediciones» sin cambiar su clave ni su URL", () => {
  assert.equal(categoryLabel("fotografica"), "Expediciones");
  assert.equal(catalogHref("fotografica"), "/expediciones?categoria=fotografica");
  assert.deepEqual(
    CATALOG_CATEGORIES.map((c) => c.label),
    ["Expediciones", "Escapadas", "Viajes Coleccionables"],
  );
});

test("tripCover: portada elegida; si no, primera FOTO del propio viaje; si no, null", () => {
  assert.equal(tripCover({ coverImage: "https://a/portada.jpg", gallery: ["https://a/1.jpg"] }), "https://a/portada.jpg");
  assert.equal(
    tripCover({ coverImage: null, gallery: ["https://youtube.com/watch?v=abc", "https://a/1.jpg"] }),
    "https://a/1.jpg",
    "los videos no sirven de portada",
  );
  assert.equal(tripCover({ coverImage: "", gallery: [] }), null);
  assert.equal(tripCover({}), null);
});

test("seasonLabel: meses ordenados y sin repetir; nada si no hay datos", () => {
  assert.equal(seasonLabel(null, null, [7, 6, 7]), "Junio · Julio");
  assert.equal(seasonLabel(null, null, [0, 13]), null);
  assert.equal(seasonLabel(null, null, []), null);
  assert.equal(seasonLabel(undefined, undefined, undefined), null);
});

test("seasonLabel: con fecha de inicio usa las fechas, no los meses", () => {
  const label = seasonLabel(new Date("2027-06-10T12:00:00Z"), null, [1, 2]);
  assert.ok(label && label.includes("2027"), label ?? "null");
});

const bytes = (...arr: number[]) => new Uint8Array([...arr, ...new Array(16).fill(0)]);
const text = (s: string) => Array.from(s).map((c) => c.charCodeAt(0));

test("detectImageType reconoce JPG, PNG, GIF, WebP y AVIF por contenido", () => {
  assert.equal(detectImageType(bytes(0xff, 0xd8, 0xff, 0xe0))?.mime, "image/jpeg");
  assert.equal(detectImageType(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))?.mime, "image/png");
  assert.equal(detectImageType(bytes(...text("GIF89a")))?.mime, "image/gif");
  assert.equal(detectImageType(bytes(...text("RIFF"), 0, 0, 0, 0, ...text("WEBP")))?.mime, "image/webp");
  assert.equal(detectImageType(bytes(0, 0, 0, 0x1c, ...text("ftypavif")))?.mime, "image/avif");
});

test("detectImageType rechaza SVG, HTML y archivos disfrazados", () => {
  assert.equal(detectImageType(new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"><script>x</script></svg>')), null);
  assert.equal(detectImageType(new TextEncoder().encode("<!doctype html><html>")), null);
  assert.equal(detectImageType(new Uint8Array([0x4d, 0x5a, 0x90, 0x00])), null); // ejecutable .exe
  assert.equal(detectImageType(new Uint8Array([])), null);
});

test("logo: tamaño y sombra por defecto como estaban; valores inválidos vuelven al defecto", async () => {
  const { normalizeLogoSize, normalizeLogoShadow, logoSizeClass, logoShadowClass } = await import("@/lib/logo-size");
  assert.equal(normalizeLogoSize(undefined), "md");
  assert.equal(normalizeLogoSize("xl"), "xl");
  assert.equal(normalizeLogoSize("enorme"), "md");
  assert.equal(logoSizeClass(undefined), "h-10 sm:h-12", "el tamaño de siempre");
  assert.equal(normalizeLogoShadow(undefined), "none");
  assert.equal(logoShadowClass(undefined), "", "sin sombra por defecto");
  assert.ok(logoShadowClass("strong").includes("drop-shadow"));
});
