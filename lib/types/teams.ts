export interface TeamResponseDto {
  id: string;
  name: string;
  organizationId: string;
  createdAt: string;
  _count: { users: number; leads: number };
}

export interface CreateTeamRequest {
  name: string;
}

export interface UpdateTeamRequest {
  name?: string;
}
