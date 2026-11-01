import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Subida de fotos (máx. 4 MB, ver src/lib/image-sniff.ts). Vercel corta en 4,5 MB por request.
      bodySizeLimit: "4.5mb",
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      // Supabase Storage (subida de imágenes/videos)
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
  async redirects() {
    return [
      // Dominio propio: la dirección vieja de Vercel lleva a la nueva (misma página y parámetros).
      // Solo la dirección de producción; las vistas previas de Vercel siguen funcionando.
      {
        source: "/:path*",
        has: [{ type: "host", value: "espdediciones.vercel.app" }],
        destination: "https://www.expedicionesfotograficas.com.ar/:path*",
        permanent: true,
      },
      // Viajes a Medida dejó de ser una categoría del catálogo: los enlaces viejos van a su página.
      {
        source: "/expediciones",
        has: [{ type: "query", key: "categoria", value: "a-medida" }],
        destination: "/viajes-a-medida",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
