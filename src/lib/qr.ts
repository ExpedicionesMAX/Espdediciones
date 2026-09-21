import "server-only";
import QRCode from "qrcode";

const OPTS = {
  margin: 1,
  color: { dark: "#1c1917", light: "#ffffff" },
} as const;

/** QR como data URL PNG (para <img> y descarga). */
export async function qrPngDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, { ...OPTS, width: 600 });
}

/** QR como string SVG (para descarga vectorial). */
export async function qrSvg(text: string): Promise<string> {
  return QRCode.toString(text, { ...OPTS, type: "svg" });
}
