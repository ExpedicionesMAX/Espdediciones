import { test } from "node:test";
import assert from "node:assert/strict";
import { imageUrl, paragraphs, safeHref, str, isOptimizableImage } from "@/lib/content-fields";
import {
  HOME_DEFAULTS,
  HOME_SECTIONS,
  normalizeStoredHome,
  resolveHome,
} from "@/lib/home-content";
import {
  CUSTOM_TRIP_DEFAULTS,
  normalizeStoredCustomTrip,
  resolveCustomTrip,
} from "@/lib/custom-trip-content";

test("safeHref acepta rutas internas, anclas y http(s)", () => {
  assert.equal(safeHref("/expediciones"), "/expediciones");
  assert.equal(safeHref("#nosotros"), "#nosotros");
  assert.equal(safeHref("https://wa.me/549"), "https://wa.me/549");
});

test("safeHref rechaza esquemas peligrosos y protocol-relative", () => {
  for (const bad of ["javascript:alert(1)", "JaVaScRiPt:alert(1)", "data:text/html,x", "//evil.com", "vbscript:x", "# con espacio", 42, null]) {
    assert.equal(safeHref(bad), "", `debería rechazar ${String(bad)}`);
  }
});

test("imageUrl solo deja http(s) o rutas locales", () => {
  assert.equal(imageUrl("https://x.supabase.co/a.jpg"), "https://x.supabase.co/a.jpg");
  assert.equal(imageUrl("/foto.jpg"), "/foto.jpg");
  assert.equal(imageUrl("javascript:alert(1)"), "");
  assert.equal(imageUrl("data:image/svg+xml;base64,AAA"), "");
  assert.equal(imageUrl("//evil.com/a.jpg"), "");
});

test("str recorta y limita largo; no-strings → vacío", () => {
  assert.equal(str("  hola  "), "hola");
  assert.equal(str("abcdef", 3), "abc");
  assert.equal(str({ a: 1 }), "");
});

test("paragraphs separa por línea en blanco (también \\r\\n)", () => {
  assert.deepEqual(paragraphs("uno\n\ndos\n   \ntres"), ["uno", "dos", "tres"]);
  assert.deepEqual(paragraphs(""), []);
});

test("isOptimizableImage refleja next.config (Supabase sí, otros no)", () => {
  assert.equal(isOptimizableImage("https://abc.supabase.co/x.jpg"), true);
  assert.equal(isOptimizableImage("https://otro-sitio.com/x.jpg"), false);
  assert.equal(isOptimizableImage("no es url"), false);
});

test("normalizeStoredHome tolera null/basura y devuelve todas las secciones", () => {
  for (const raw of [null, undefined, "texto", 3, [], { sections: "x", hero: 5 }]) {
    const n = normalizeStoredHome(raw);
    assert.equal(n.hero.title, "");
    assert.equal(n.sections.length, HOME_SECTIONS.length);
  }
});

test("normalizeStoredHome sanea links e imágenes guardados", () => {
  const n = normalizeStoredHome({
    hero: { primaryHref: "javascript:alert(1)", image: "javascript:x", title: "  Hola  " },
    team: { members: [{ name: "", role: "sin nombre" }, { name: "Ana", photo: "data:x" }] },
  });
  assert.equal(n.hero.primaryHref, "");
  assert.equal(n.hero.image, "");
  assert.equal(n.hero.title, "Hola");
  assert.equal(n.team.members.length, 1, "se descartan integrantes sin nombre");
  assert.equal(n.team.members[0].photo, "");
});

test("secciones: respeta el orden guardado, completa faltantes y no deja ocultar el cierre", () => {
  const n = normalizeStoredHome({
    sections: [
      { key: "viajes", visible: true },
      { key: "cierre", visible: false },
      { key: "inventada", visible: true },
      { key: "viajes", visible: false },
    ],
  });
  assert.equal(n.sections[0].key, "viajes");
  assert.equal(n.sections[0].visible, true, "la primera aparición manda");
  assert.equal(n.sections.find((s) => s.key === "cierre")?.visible, true);
  assert.ok(!n.sections.some((s) => (s.key as string) === "inventada"));
  assert.equal(new Set(n.sections.map((s) => s.key)).size, HOME_SECTIONS.length);
});

test("resolveHome: vacío usa el valor por defecto; lo cargado lo reemplaza", () => {
  const empty = resolveHome(normalizeStoredHome(null));
  assert.equal(empty.hero.title, HOME_DEFAULTS.hero.title);
  assert.equal(empty.philosophy.items.length, HOME_DEFAULTS.philosophy.items.length);
  assert.equal(empty.team.members.length, 0, "nunca se inventan integrantes");

  const custom = resolveHome(
    normalizeStoredHome({ hero: { title: "Mirar despacio" }, philosophy: { items: [{ title: "Silencio" }] } }),
  );
  assert.equal(custom.hero.title, "Mirar despacio");
  assert.equal(custom.hero.text, HOME_DEFAULTS.hero.text);
  assert.deepEqual(custom.philosophy.items, [{ title: "Silencio", text: "" }]);
});

test("Viajes a Medida: defaults, formulario visible por defecto y pasos saneados", () => {
  const d = resolveCustomTrip(normalizeStoredCustomTrip(null));
  assert.equal(d.hero.title, CUSTOM_TRIP_DEFAULTS.hero.title);
  assert.equal(d.form.show, true);

  const c = resolveCustomTrip(
    normalizeStoredCustomTrip({ form: { show: false }, process: { steps: [{ title: "" }, { title: "Uno", text: "x" }] } }),
  );
  assert.equal(c.form.show, false);
  assert.deepEqual(c.process.steps, [{ title: "Uno", text: "x" }]);
});
