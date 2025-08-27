export interface User {
  id: string;
  email: string;
  password_hash: string;
  nickname: string;
  temperature: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  nickname: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  email: string;
  nickname: string;
  temperature: number;
  created_at: Date;
}

export interface UpdateUserRequest {
  nickname?: string;
  temperature?: number;
}
