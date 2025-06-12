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
  author?: User;
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

export interface Task {
  id: number;
  name: string;
  description?: string;
  household: number;
  due_date?: string;
  added_by: User;
  is_completed: boolean;
  created_at: string;
}

export interface CreateTaskData {
  name: string;
  description?: string;
  due_date?: string;
  household?: number;
  is_completed?: boolean;
}

export interface ExpenseSummary {
  total_expenses: number;
  total_amount_paid: number;
  total_amount_paid_self: number;
  total_amount_owed: number;
  net_balance: number;
}

export interface HouseholdExpenseSummary {
  household_id: number;
  household_name: string;
  total_expenses: number;
  total_amount: number;
  total_settled: number;
  total_unsettled: number;
  user_amount_paid: number;
  user_amount_paid_self: number;
  user_amount_owed: number;
  user_balance: number;
}

export interface ShoppingListItem {
  id: number;
  name: string;
  quantity: number;
  unit?: string;
  household: number;
  is_purchased: boolean;
  added_at: string;
  purchased_at?: string;
  added_by: User;
  purchased_by?: User;
}

export interface CreateShoppingListItemData {
  name: string;
  quantity: number;
  unit?: string;
  household?: number;
}

export interface UserBalance {
  user_id: number;
  username: string;
  balance: number;
}

export interface HouseholdBalances {
  household_id: number;
  household_name: string;
  balances: UserBalance[];
}

export interface SettlementTransaction {
  payer_id: number;
  payer_username: string;
  payee_id: number;
  payee_username: string;
  amount: number;
}

export interface SettlementPlan {
  household_id: number;
  household_name: string;
  settlement_plan: SettlementTransaction[];
  total_transactions: number;
}

export interface ProcessSettlementData {
  payer_id: number;
  payee_id: number;
  amount: number;
}

export interface ProcessSettlementResult {
  household_id: number;
  payer_id: number;
  payer_username: string;
  payee_id: number;
  payee_username: string;
  payment_amount: number;
  optimal_amount: number;
  case: number;
  actions_taken: string[];
}
