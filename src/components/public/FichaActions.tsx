"use client";

export function FichaActions({
  qrPng,
  qrSvg,
  slug,
}: {
  qrPng: string;
  qrSvg: string;
  slug: string;
}) {
  const downloadSvg = () => {
    const blob = new Blob([qrSvg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qr-${slug}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-wrap gap-3 print:hidden">
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark"
      >
        Imprimir / Guardar como PDF
      </button>
      <a
        href={qrPng}
        download={`qr-${slug}.png`}
        className="rounded-full border border-stone-300 px-5 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-100"
      >
        Descargar QR (PNG)
      </a>
      <button
        type="button"
        onClick={downloadSvg}
        className="rounded-full border border-stone-300 px-5 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-100"
      >
        Descargar QR (SVG)
      </button>
    </div>
  );
}
