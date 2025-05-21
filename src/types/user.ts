export interface UserRole {
  role: string | null;
}

export interface TokenState {
  token: string | null;
  isRefreshing: boolean;
  error: string | null;
  copied: boolean;
} 