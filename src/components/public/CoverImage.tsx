import { ContentImage } from "@/components/public/ContentImage";
import { focusCss, isWhole } from "@/lib/focus";

/**
 * Foto de portada (llena su contenedor). Según el ajuste elegido en el panel:
 * - encuadre "X% Y%": recorta dejando visible ese punto;
 * - "entera": la foto completa, sin recortes; el espacio sobrante se rellena
 *   con la misma foto ampliada y desenfocada (sin bandas negras).
 * `focus` vacío o null = recorte centrado (lo de siempre).
 */
export function CoverImage({
  src,
  alt,
  sizes,
  priority = false,
  focus,
  className,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  focus?: string | null;
  className?: string;
}) {
  if (isWhole(focus)) {
    return (
      <>
        <ContentImage
          src={src}
          alt=""
          sizes={sizes}
          priority={priority}
          className="scale-110 blur-2xl brightness-90"
        />
        <ContentImage src={src} alt={alt} sizes={sizes} priority={priority} fit="contain" className={className} />
      </>
    );
  }
  return (
    <ContentImage
      src={src}
      alt={alt}
      sizes={sizes}
      priority={priority}
      position={focus ? focusCss(focus) : undefined}
      className={className}
    />
  );
}
