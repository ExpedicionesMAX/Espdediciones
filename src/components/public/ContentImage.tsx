import Image from "next/image";
import { cn } from "@/lib/cn";
import { isOptimizableImage } from "@/lib/content-fields";

/**
 * Imagen que ocupa todo su contenedor (el contenedor define la proporción, así
 * no hay saltos de diseño). Usa next/image si el host está habilitado en
 * next.config.ts; si no (URL pegada a mano de otro sitio), un <img> diferido.
 */
export function ContentImage({
  src,
  alt,
  sizes,
  priority = false,
  className,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  if (isOptimizableImage(src)) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn("object-cover", className)}
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
      className={cn("absolute inset-0 h-full w-full object-cover", className)}
    />
  );
}
