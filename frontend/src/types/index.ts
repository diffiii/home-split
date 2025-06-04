export interface User {
  id: number;
  email: string;
  username: string;
  profile_picture?: string;
  membership_id?: number;
  joined_at?: string;
  is_active?: boolean;
}

export interface Household {
  id: number;
  name: string;
  description?: string;
  owner: User;
  members: User[];
  created_at: string;
}

export interface Membership {
  id: number;
  user: User;
  household: Household;
  joined_at: string;
  is_active: boolean;
}

export interface RawMembership {
  id: number;
  user: number;
  household: number;
  joined_at: string;
  is_active: boolean;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
}
