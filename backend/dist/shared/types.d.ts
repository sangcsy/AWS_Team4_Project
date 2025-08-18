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
export interface AuthResponse {
    user: Omit<User, 'password_hash'>;
    token: string;
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
export interface DatabaseConfig {
    host: string;
    user: string;
    password: string;
    database: string;
    port: number;
}
//# sourceMappingURL=types.d.ts.map