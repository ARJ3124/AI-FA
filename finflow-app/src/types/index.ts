export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string;
  paymentMethod: 'Credit Card' | 'Debit Card' | 'Cash' | 'Bank Transfer' | 'UPI';
}

export interface Category {
  id: string;
  name: string;
  iconName: string;
  color: string;
  type: TransactionType;
}

export interface Budget {
  monthlyLimit: number;
  categoryLimits: Record<string, number>;
}

export interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  iconName: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  suggestions?: string[];
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'alert' | 'info' | 'success' | 'budget';
}

export interface UserProfile {
  name: string;
  email: string;
  theme: 'dark' | 'light';
  notificationsEnabled: boolean;
}

