export type UserRole = 'SUPER_ADMIN' | 'ORG_ADMIN' | 'MANAGER' | 'AGENT' | 'VIEWER';

/** Roles assignable through PATCH /users/:id — ORG_ADMIN/SUPER_ADMIN are not. */
export type AssignableRole = 'MANAGER' | 'AGENT' | 'VIEWER';

export interface OrgUserResponseDto {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  teamId: string | null;
  team?: { id: string; name: string } | null;
  createdAt: string;
}

export interface UpdateOrgUserRequest {
  role?: AssignableRole;
  teamId?: string | null;
}

export interface CreateOrgUserRequest {
  email: string;
  password: string;
  role: AssignableRole;
  teamId?: string;
}
