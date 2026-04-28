export interface SignupResponse {
  id: string;
  email: string;
  createdAt: string;
  isActive: boolean;
}

export interface LoginResponse {
  accessToken: string;
}
