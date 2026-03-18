export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotRequest {
  email: string;
}

export interface ResetRequest {
  userId: string;
  password: string;
  confirm: string;
}
