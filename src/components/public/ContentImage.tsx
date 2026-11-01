import Image from "next/image";
import { cn } from "@/lib/cn";
import { isOptimizableImage } from "@/lib/content-fields";

/**
 * Imagen que ocupa todo su contenedor (el contenedor define la proporción, así
 * no hay saltos de diseño). Usa next/image si el host está habilitado en
 * next.config.ts; si no (URL pegada a mano de otro sitio), un <img> diferido.
 * `position` = encuadre del recorte (CSS object-position, p. ej. "50% 30%").
 */
export function ContentImage({
  src,
  alt,
  sizes,
  priority = false,
  className,
  position,
  fit = "cover",
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  position?: string;
  /** "cover" = llena recortando (lo de siempre); "contain" = foto entera. */
  fit?: "cover" | "contain";
}) {
  const style = position ? { objectPosition: position } : undefined;
  const fitCls = fit === "contain" ? "object-contain" : "object-cover";
  if (isOptimizableImage(src)) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        style={style}
        className={cn(fitCls, className)}
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      style={style}
      className={cn("absolute inset-0 h-full w-full", fitCls, className)}
    />
  );
}
