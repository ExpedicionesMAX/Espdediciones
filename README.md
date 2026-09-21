# Cumbre — Plataforma de Expediciones

Motor tipo **CMS + CRM + reservas** para una empresa de expediciones, montañismo, trekking y fotografía. El administrador carga una expedición desde `/admin` y **la página pública se genera sola** en `/expediciones/[slug]`. Nada de contenido hardcodeado; nada que envíe un visitante se publica sin moderación.

Construido por **rebanadas verticales**: esta primera entrega es el motor completo pero angosto (auth + expediciones + generación de página pública + consultas/CRM), listo para ensanchar módulo por módulo.

## Stack

- **Next.js 16** (App Router, Server Components + Server Actions) · **React 19** · **TypeScript**
- **Tailwind CSS v4**
- **Prisma 6** + **PostgreSQL (Supabase)**
- **Auth.js v5** (credenciales, sesión JWT, RBAC propio)
- **Supabase Storage** para multimedia (opcional en dev)

## Puesta en marcha

```bash
npm install
cp .env.example .env      # completar credenciales
npm run db:migrate        # crea el esquema en la base
npm run db:seed           # carga datos demo + usuario admin
npm run dev               # http://localhost:3000
```

### Variables de entorno

Ver [`.env.example`](.env.example). Claves:

| Variable | Qué es |
|---|---|
| `DATABASE_URL` | Postgres de Supabase — connection pooling (puerto 6543) |
| `DIRECT_URL` | Postgres de Supabase — conexión directa (5432), para migraciones |
| `AUTH_SECRET` | Secreto de Auth.js (`node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`) |
| `NEXT_PUBLIC_SUPABASE_URL` / `..._ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | Supabase Storage (subida de archivos) |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | Usuario admin que crea el seed |

## Usuario inicial

El seed crea un **SUPER_ADMIN** con las credenciales de `.env`
(por defecto `admin@expediciones.com` / `Cambiar123!`). Cambialas antes de producción.

## Scripts

| Script | Acción |
|---|---|
| `npm run dev` | Desarrollo |
| `npm run build` / `start` | Build y producción |
| `npm run db:migrate` | Migraciones de Prisma |
| `npm run db:seed` | Datos demo |
| `npm run db:studio` | Prisma Studio (explorar la base) |

## Roles y permisos

RBAC en [`src/lib/permissions.ts`](src/lib/permissions.ts). Roles: `SUPER_ADMIN`, `ADMIN`, `EDITOR`, `MODERATOR`, `GUIDE`, `COMMERCIAL`, con permisos granulares por usuario. **La autorización se valida en el servidor** (Server Actions + `auth-guard`), no solo ocultando botones. El middleware exige sesión para todo `/admin`.

## Estructura

```
prisma/            schema.prisma + seed
src/
  app/
    (public)/      sitio público (home, expediciones, detalle, contacto)
    admin/         login + panel protegido (dashboard, expediciones, consultas)
    api/auth/      handler de Auth.js
  components/      public/ · admin/
  lib/             prisma, auth, permisos, validaciones, formato, helpers
  server/actions/  Server Actions (expediciones, consultas, auth)
  middleware.ts    puerta de /admin
```

## Qué está hecho (Fase 1 — rebanada vertical)

- ✅ Autenticación real (login/logout, sesión, protección server-side de `/admin` y de las acciones)
- ✅ Roles + permisos granulares
- ✅ CRUD de expediciones con formulario completo (datos, ubicación, fechas, precio, multimedia, incluye/no incluye, requisitos, equipamiento, **itinerario día a día**, SEO)
- ✅ Estados (`DRAFT → OPEN/LIMITED/FULL/COMPLETED/ARCHIVED…`) con publicación gobernada por permiso
- ✅ **Generación automática** de la página pública por template
- ✅ SEO dinámico + Open Graph por expedición
- ✅ Sitio público: home, listado con filtros (actividad/dificultad/destino/búsqueda), detalle, contacto
- ✅ Consultas de visitantes → entran `PENDING` (con honeypot anti-bot) → embudo CRM en `/admin/consultas`
- ✅ WhatsApp con mensaje pre-cargado por expedición
- ✅ Dashboard con métricas y actividad reciente · auditoría de cambios
- ✅ Vista previa de expediciones no publicadas para staff logueado

## Próximas rebanadas (arquitectura ya preparada en el schema)

Destinos y guías con ABM propio · Media Library + subida a Supabase Storage · Reservas/inscripciones y cupos · CRM completo (fichas de contacto, actividades, embudo visual) · Testimonios y fotos de visitantes con moderación · Historias · CMS visual por bloques · Temas · Multiidioma (ES/EN/PT) · QR + ficha PDF · Estadísticas por expedición · Newsletter · Pagos.

---

Panel: `/admin` · Sitio: `/`
