// lib/auth/permissions.ts
import { UserRole } from '@prisma/client';

export const ROLE_PERMISSIONS = {
  MOTHER: ['read:own', 'update:own', 'emergency:create'],
  MIDWIFE: ['read:assigned', 'update:assigned', 'metrics:create'],
  DOCTOR: [
    'read:all',
    'update:all',
    'prescribe:create',
    'telemedicine:access',
    'risk:mark',
  ],
  ADMIN: ['*'],
};

export function hasPermission(
  userRole: UserRole,
  permission: string
): boolean {
  const permissions = ROLE_PERMISSIONS[userRole];
  return permissions.includes('*') || permissions.includes(permission);
}

export function canAccessRoute(userRole: UserRole, route: string): boolean {
  const routePermissions: Record<string, UserRole[]> = {
    '/dashboard/mother': ['MOTHER', 'ADMIN'],
    '/dashboard/midwife': ['MIDWIFE', 'ADMIN'],
    '/dashboard/doctor': ['DOCTOR', 'ADMIN'],
    '/dashboard/admin': ['ADMIN'],
  };

  const allowedRoles = routePermissions[route];
  return allowedRoles ? allowedRoles.includes(userRole) : false;
}
