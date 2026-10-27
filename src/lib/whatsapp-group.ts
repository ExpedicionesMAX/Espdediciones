/**
 * Link de invitación a un grupo de WhatsApp (https://chat.whatsapp.com/CODIGO).
 * Solo se aceptan links de ese dominio, para que el botón «Unirme al grupo»
 * nunca lleve a otro sitio. Devuelve el link limpio, o null si no es válido.
 */
export function normalizeWhatsappGroupUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  let raw = value.trim();
  if (!raw) return null;
  // Se tolera que lo peguen sin «https://».
  if (/^chat\.whatsapp\.com\//i.test(raw)) raw = `https://${raw}`;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  if (url.hostname.toLowerCase() !== "chat.whatsapp.com") return null;
  const code = url.pathname.replace(/^\/+|\/+$/g, "");
  // Código de invitación: letras y números (WhatsApp usa ~22 caracteres).
  if (!/^[A-Za-z0-9]{10,64}$/.test(code)) return null;
  return `https://chat.whatsapp.com/${code}`;
}
