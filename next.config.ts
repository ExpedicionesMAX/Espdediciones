import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
