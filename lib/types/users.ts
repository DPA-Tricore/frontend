export type UserRole = 'SUPER_ADMIN' | 'ORG_ADMIN' | 'MANAGER' | 'AGENT' | 'VIEWER';

/** Roles assignable through PATCH /users/:id — ORG_ADMIN/SUPER_ADMIN are not. */
export type AssignableRole = 'MANAGER' | 'AGENT' | 'VIEWER';

export interface OrgUserResponseDto {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  isActive: boolean;
  teamId: string | null;
  team?: { id: string; name: string } | null;
  createdAt: string;
}

export interface UpdateOrgUserRequest {
  role?: AssignableRole;
  teamId?: string | null;
  firstName?: string;
  lastName?: string;
}

/** PATCH /users/me — the only fields a user can change about themselves. */
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
}

export interface CreateOrgUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: AssignableRole;
  teamId?: string;
}
