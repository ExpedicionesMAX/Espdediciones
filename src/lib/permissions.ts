import type { Role } from "@prisma/client";

/**
 * Permisos granulares. Un rol trae un set base; además cada usuario puede
 * tener permisos extra en `user.permissions` (sección 46 del brief).
 * La autorización SIEMPRE se valida en el servidor, nunca solo en la UI.
 */
export const PERMISSIONS = {
  // Contenido
  EXPEDITION_READ: "expedition:read",
  EXPEDITION_CREATE: "expedition:create",
  EXPEDITION_UPDATE: "expedition:update",
  EXPEDITION_PUBLISH: "expedition:publish",
  EXPEDITION_DELETE: "expedition:delete",
  DESTINATION_MANAGE: "destination:manage",
  GUIDE_MANAGE: "guide:manage",
  PAGE_MANAGE: "page:manage",
  MEDIA_MANAGE: "media:manage",
  CONTENT_MODERATE: "content:moderate",
  // Comercial / CRM
  INQUIRY_READ: "inquiry:read",
  INQUIRY_UPDATE: "inquiry:update",
  RESERVATION_READ: "reservation:read",
  RESERVATION_MANAGE: "reservation:manage",
  CRM_READ: "crm:read",
  CRM_MANAGE: "crm:manage",
  // Administración
  USER_MANAGE: "user:manage",
  SETTINGS_MANAGE: "settings:manage",
  STATS_VIEW: "stats:view",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const ALL = Object.values(PERMISSIONS) as Permission[];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SUPER_ADMIN: ALL,
  ADMIN: ALL,
  EDITOR: [
    PERMISSIONS.EXPEDITION_READ,
    PERMISSIONS.EXPEDITION_CREATE,
    PERMISSIONS.EXPEDITION_UPDATE,
    PERMISSIONS.EXPEDITION_PUBLISH,
    PERMISSIONS.DESTINATION_MANAGE,
    PERMISSIONS.GUIDE_MANAGE,
    PERMISSIONS.PAGE_MANAGE,
    PERMISSIONS.MEDIA_MANAGE,
    PERMISSIONS.RESERVATION_READ,
    PERMISSIONS.STATS_VIEW,
  ],
  MODERATOR: [
    PERMISSIONS.EXPEDITION_READ,
    PERMISSIONS.CONTENT_MODERATE,
    PERMISSIONS.INQUIRY_READ,
  ],
  GUIDE: [PERMISSIONS.EXPEDITION_READ],
  COMMERCIAL: [
    PERMISSIONS.EXPEDITION_READ,
    PERMISSIONS.INQUIRY_READ,
    PERMISSIONS.INQUIRY_UPDATE,
    PERMISSIONS.RESERVATION_READ,
    PERMISSIONS.RESERVATION_MANAGE,
    PERMISSIONS.CRM_READ,
    PERMISSIONS.CRM_MANAGE,
    PERMISSIONS.STATS_VIEW,
  ],
};

type PermissionSubject = {
  role?: Role | null;
  permissions?: string[] | null;
};

export function hasPermission(
  user: PermissionSubject | null | undefined,
  permission: Permission,
): boolean {
  if (!user || !user.role) return false;
  if (user.role === "SUPER_ADMIN" || user.role === "ADMIN") return true;
  if ((ROLE_PERMISSIONS[user.role] ?? []).includes(permission)) return true;
  return (user.permissions ?? []).includes(permission);
}

export function permissionsForRole(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}
