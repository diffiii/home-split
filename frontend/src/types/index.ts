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

export interface ExpenseCategory {
  id: number;
  name: string;
  icon?: string;
  description?: string;
}

export interface ExpenseSplit {
  id: number;
  user: User;
  user_id: number;
  amount: string;
  is_settled: boolean;
}

export interface Expense {
  id: number;
  household_id: number;
  category_id: number;
  category?: ExpenseCategory;
  name: string;
  description: string;
  amount: string;
  payer_id?: number;
  payer?: User;
  splits: ExpenseSplit[];
  created_at: string;
  updated_at: string;
}

export interface CreateExpenseSplit {
  user_id: number;
  amount: string;
}

export interface CreateExpenseData {
  household_id: number;
  category_id?: number;
  name: string;
  description: string;
  amount: string;
  payer_id: number;
  splits_data: CreateExpenseSplit[];
}

export type SplitType = 'equal' | 'percentage' | 'fixed' | 'parts' | 'plus_minus';

export interface SplitMember {
  user_id: number;
  user: User;
  value?: number;
}

export interface SplitConfiguration {
  type: SplitType;
  members: SplitMember[];
  totalAmount: number;
}
