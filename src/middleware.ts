import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Puerta gruesa: exige sesión para /admin/*. La autorización fina por rol/permiso
// se resuelve además en cada Server Component / Server Action (auth-guard.ts).
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
