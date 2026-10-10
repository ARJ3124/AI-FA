import type { Transaction, Budget, FinancialGoal, ChatMessage, AppNotification, UserProfile } from '../types';
import { supabase } from '../lib/supabaseClient';

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    type: 'income',
    amount: 75000,
    category: 'Salary',
    description: 'Monthly Salary Deposit',
    date: '2026-08-01',
    paymentMethod: 'Bank Transfer',
  },
  {
    id: 'tx-2',
    type: 'expense',
    amount: 4500,
    category: 'Food',
    description: 'Whole Foods Grocery Shopping',
    date: '2026-08-02',
    paymentMethod: 'Credit Card',
  },
  {
    id: 'tx-3',
    type: 'expense',
    amount: 3200,
    category: 'Bills',
    description: 'Electric & Power Bill',
    date: '2026-08-05',
    paymentMethod: 'Bank Transfer',
  },
  {
    id: 'tx-4',
    type: 'expense',
    amount: 1500,
    category: 'Transport',
    description: 'Petrol station refill',
    date: '2026-08-07',
    paymentMethod: 'Debit Card',
  },
  {
    id: 'tx-5',
    type: 'expense',
    amount: 799,
    category: 'Entertainment',
    description: 'Netflix & Spotify subscriptions',
    date: '2026-08-10',
    paymentMethod: 'Credit Card',
  },
  {
    id: 'tx-6',
    type: 'income',
    amount: 15000,
    category: 'Freelance',
    description: 'UI Design consulting gig',
    date: '2026-08-12',
    paymentMethod: 'UPI',
  },
  {
    id: 'tx-7',
    type: 'expense',
    amount: 3500,
    category: 'Shopping',
    description: 'New running shoes',
    date: '2026-08-14',
    paymentMethod: 'Credit Card',
  },
  {
    id: 'tx-8',
    type: 'expense',
    amount: 5400,
    category: 'Food',
    description: 'Dinner with friends & weekend dining',
    date: '2026-08-15',
    paymentMethod: 'UPI',
  }
];

const INITIAL_BUDGET: Budget = {
  monthlyLimit: 45000,
  categoryLimits: {
    Food: 15000,
    Bills: 10000,
    Transport: 5000,
    Shopping: 8000,
    Entertainment: 3000,
    Healthcare: 5000,
    Other: 4000,
  },
};

const INITIAL_GOALS: FinancialGoal[] = [
  {
    id: 'g-1',
    title: 'Emergency Fund',
    targetAmount: 200000,
    currentAmount: 135000,
    targetDate: '2026-12-31',
    iconName: 'ShieldAlert',
  },
  {
    id: 'g-2',
    title: 'MacBook Pro',
    targetAmount: 150000,
    currentAmount: 95000,
    targetDate: '2026-10-15',
    iconName: 'Laptop',
  },
  {
    id: 'g-3',
    title: 'Goa Vacation Trip',
    targetAmount: 40000,
    currentAmount: 22000,
    targetDate: '2026-11-20',
    iconName: 'Plane',
  },
];

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Budget Threshold Warning ⚠️',
    message: 'Your Food expenses have reached 66% of your ₹15,000 monthly limit.',
    time: '2 hours ago',
    read: false,
    type: 'budget',
  },
  {
    id: 'notif-2',
    title: 'Salary Credited 🎉',
    message: '₹75,000 salary deposit credited to your primary account.',
    time: 'Yesterday',
    read: false,
    type: 'success',
  },
  {
    id: 'notif-3',
    title: 'AI Smart Tip 💡',
    message: 'You can save up to ₹2,500 this week by reducing restaurant orders.',
    time: '2 days ago',
    read: true,
    type: 'info',
  },
];

const INITIAL_PROFILE: UserProfile = {
  name: 'Jagadeesh',
  email: 'jagadeesh@finflow.app',
  theme: 'dark',
  notificationsEnabled: true,
};

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'm-1',
    sender: 'ai',
    text: 'Namaste! I am your FinFlow AI Financial Assistant. I can analyze your spending patterns, track your budget in Indian Rupees (₹), and help you reach your saving goals. How can I assist you today?',
    timestamp: '2026-08-16 10:00 AM',
    suggestions: [
      'Analyze my food expenses',
      'Am I exceeding my budget?',
      'How can I save ₹5,000 this month?',
      'Predict my end-of-month expenses',
    ],
  },
];

// Local storage helpers
const getStoredData = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

const setStoredData = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
};

// AI Category Predictor
export const predictCategory = (description: string): string => {
  const lower = description.toLowerCase();
  if (lower.includes('food') || lower.includes('grocery') || lower.includes('dinner') || lower.includes('coffee') || lower.includes('restaurant') || lower.includes('swiggy') || lower.includes('zomato') || lower.includes('cafe')) {
    return 'Food';
  }
  if (lower.includes('bill') || lower.includes('electric') || lower.includes('power') || lower.includes('water') || lower.includes('rent') || lower.includes('wifi') || lower.includes('internet') || lower.includes('recharge')) {
    return 'Bills';
  }
  if (lower.includes('gas') || lower.includes('petrol') || lower.includes('fuel') || lower.includes('uber') || lower.includes('ola') || lower.includes('rapido') || lower.includes('auto') || lower.includes('transport')) {
    return 'Transport';
  }
  if (lower.includes('shoe') || lower.includes('cloth') || lower.includes('amazon') || lower.includes('flipkart') || lower.includes('myntra') || lower.includes('shopping')) {
    return 'Shopping';
  }
  if (lower.includes('movie') || lower.includes('netflix') || lower.includes('spotify') || lower.includes('hotstar') || lower.includes('cinema') || lower.includes('game')) {
    return 'Entertainment';
  }
  if (lower.includes('doctor') || lower.includes('pharma') || lower.includes('medicine') || lower.includes('hospital') || lower.includes('health')) {
    return 'Healthcare';
  }
  if (lower.includes('salary') || lower.includes('paycheck') || lower.includes('freelance') || lower.includes('stipend') || lower.includes('bonus')) {
    return 'Salary';
  }
  return 'Other';
};

export class FinanceService {
  public static getTransactions(): Transaction[] {
    return getStoredData<Transaction[]>('finflow_transactions', INITIAL_TRANSACTIONS);
  }

  public static saveTransactions(transactions: Transaction[]): void {
    setStoredData('finflow_transactions', transactions);
  }

  public static addTransaction(transaction: Omit<Transaction, 'id'>): Transaction {
    const transactions = this.getTransactions();
    const newTx: Transaction = {
      ...transaction,
      id: `tx-${Date.now()}`,
    };
    const updated = [newTx, ...transactions];
    this.saveTransactions(updated);

    // Async sync to Supabase if authenticated
    this.syncAddTransactionToSupabase(newTx);

    return newTx;
  }

  public static deleteTransaction(id: string): void {
    const transactions = this.getTransactions();
    const updated = transactions.filter((t) => t.id !== id);
    this.saveTransactions(updated);

    // Async sync deletion to Supabase
    this.syncDeleteTransactionFromSupabase(id);
  }

  public static getBudget(): Budget {
    return getStoredData<Budget>('finflow_budget', INITIAL_BUDGET);
  }

  public static saveBudget(budget: Budget): void {
    setStoredData('finflow_budget', budget);
    this.syncSaveBudgetToSupabase(budget);
  }

  public static getGoals(): FinancialGoal[] {
    return getStoredData<FinancialGoal[]>('finflow_goals', INITIAL_GOALS);
  }

  public static saveGoals(goals: FinancialGoal[]): void {
    setStoredData('finflow_goals', goals);
  }

  public static addGoal(goal: Omit<FinancialGoal, 'id'>): FinancialGoal {
    const goals = this.getGoals();
    const newGoal: FinancialGoal = {
      ...goal,
      id: `g-${Date.now()}`,
    };
    const updated = [...goals, newGoal];
    this.saveGoals(updated);
    return newGoal;
  }

  public static getNotifications(): AppNotification[] {
    return getStoredData<AppNotification[]>('finflow_notifications', INITIAL_NOTIFICATIONS);
  }

  public static saveNotifications(notifications: AppNotification[]): void {
    setStoredData('finflow_notifications', notifications);
  }

  public static markNotificationRead(id: string): AppNotification[] {
    const notifications = this.getNotifications().map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    this.saveNotifications(notifications);
    return notifications;
  }

  public static clearNotifications(): void {
    this.saveNotifications([]);
  }

  public static getUserProfile(): UserProfile {
    return getStoredData<UserProfile>('finflow_user_profile', INITIAL_PROFILE);
  }

  public static saveUserProfile(profile: UserProfile): void {
    setStoredData('finflow_user_profile', profile);
    this.syncSaveProfileToSupabase(profile);
  }

  public static getMessages(): ChatMessage[] {
    return getStoredData<ChatMessage[]>('finflow_messages', INITIAL_MESSAGES);
  }

  public static saveMessages(messages: ChatMessage[]): void {
    setStoredData('finflow_messages', messages);
  }

  public static getSummary() {
    const transactions = this.getTransactions();
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((tx) => {
      if (tx.type === 'income') {
        totalIncome += tx.amount;
      } else {
        totalExpense += tx.amount;
      }
    });

    const netBalance = totalIncome - totalExpense;

    const categorySpending: Record<string, number> = {};
    transactions.forEach((tx) => {
      if (tx.type === 'expense') {
        categorySpending[tx.category] = (categorySpending[tx.category] || 0) + tx.amount;
      }
    });

    const budget = this.getBudget();
    const budgetUsedPercentage = Math.round((totalExpense / budget.monthlyLimit) * 100);

    return {
      netBalance,
      totalIncome,
      totalExpense,
      categorySpending,
      monthlyBudget: budget.monthlyLimit,
      budgetUsedPercentage,
      budgetRemaining: budget.monthlyLimit - totalExpense,
    };
  }

  // ──────────────────────────────────────────────
  // SUPABASE DATABASE SYNC METHOD HELPERS
  // ──────────────────────────────────────────────

  /**
   * Load User's Data from Supabase Database on login
   */
  public static async loadUserDataFromSupabase(userId: string): Promise<void> {
    try {
      // 1. Fetch transactions
      const { data: txData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (txData && txData.length > 0) {
        const mapped: Transaction[] = txData.map((t) => ({
          id: t.id,
          type: t.type,
          amount: Number(t.amount),
          category: t.category,
          description: t.description,
          date: t.date,
          paymentMethod: t.payment_method,
        }));
        this.saveTransactions(mapped);
      }

      // 2. Fetch Budget
      const { data: budgetData } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (budgetData) {
        this.saveBudget({
          monthlyLimit: Number(budgetData.monthly_limit),
          categoryLimits: budgetData.category_limits || INITIAL_BUDGET.categoryLimits,
        });
      }

      // 3. Fetch Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileData) {
        this.saveUserProfile({
          name: profileData.full_name || 'User',
          email: profileData.email || '',
          theme: profileData.theme || 'dark',
          notificationsEnabled: profileData.notifications_enabled ?? true,
        });
      }
    } catch (err) {
      console.warn('[FinFlow] Supabase data sync warning:', err);
    }
  }

  private static async syncAddTransactionToSupabase(tx: Transaction): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      await supabase.from('transactions').insert({
        id: tx.id,
        user_id: session.user.id,
        type: tx.type,
        amount: tx.amount,
        category: tx.category,
        description: tx.description,
        date: tx.date,
        payment_method: tx.paymentMethod,
      });
    } catch {
      // ignore offline sync errors
    }
  }

  private static async syncDeleteTransactionFromSupabase(id: string): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      await supabase.from('transactions').delete().eq('id', id).eq('user_id', session.user.id);
    } catch {
      // ignore
    }
  }

  private static async syncSaveBudgetToSupabase(budget: Budget): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      await supabase.from('budgets').upsert({
        user_id: session.user.id,
        monthly_limit: budget.monthlyLimit,
        category_limits: budget.categoryLimits,
        updated_at: new Date().toISOString(),
      });
    } catch {
      // ignore
    }
  }

  private static async syncSaveProfileToSupabase(profile: UserProfile): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      await supabase.from('profiles').upsert({
        id: session.user.id,
        full_name: profile.name,
        email: profile.email,
        theme: profile.theme,
        notifications_enabled: profile.notificationsEnabled,
        updated_at: new Date().toISOString(),
      });
    } catch {
      // ignore
    }
  }

  // Simulated AI response fallback logic
  public static generateAIResponse(userText: string): ChatMessage {
    const summary = this.getSummary();
    const lower = userText.toLowerCase();
    let replyText = '';
    const suggestions: string[] = [];

    if (lower.includes('food')) {
      const foodSpent = summary.categorySpending['Food'] || 0;
      const foodBudget = this.getBudget().categoryLimits['Food'] || 15000;
      replyText = `You have spent ₹${foodSpent.toLocaleString()} on Food out of your ₹${foodBudget.toLocaleString()} monthly allocation (${Math.round((foodSpent / foodBudget) * 100)}% used).\n\n💡 **Smart Tip**: Consider meal prepping on weekends or capping Swiggy/Zomato orders to save up to ₹2,500 this month.`;
      suggestions.push('Show full category breakdown', 'How to save ₹5,000?', 'Check budget limits');
    } else if (lower.includes('budget') || lower.includes('exceed')) {
      const percentage = summary.budgetUsedPercentage;
      let statusStr = 'Normal';
      if (percentage >= 100) statusStr = 'Exceeded 🚨';
      else if (percentage >= 85) statusStr = 'Near Limit ⚠️';
      else if (percentage >= 70) statusStr = 'Warning 🟡';

      replyText = `Your overall budget status is **${statusStr}**.\n- Monthly Limit: ₹${summary.monthlyBudget.toLocaleString()}\n- Total Expenses: ₹${summary.totalExpense.toLocaleString()}\n- Remaining Balance: ₹${summary.budgetRemaining.toLocaleString()}\n- Utilization: ${percentage}%\n\n${percentage > 85 ? 'Recommendation: Limit discretionary spending on Entertainment and Shopping for the rest of the month.' : 'Great job! You are spending within healthy financial parameters.'}`;
      suggestions.push('Predict end-of-month expense', 'Show goals', 'Analyze food expenses');
    } else if (lower.includes('predict') || lower.includes('forecast')) {
      const predictedTotal = Math.round(summary.totalExpense * 1.25);
      replyText = `🤖 **ML Expense Forecast Model**: Based on your recent transaction velocity, your predicted total monthly expense is **₹${predictedTotal.toLocaleString()}** (Confidence: 91%).\n\nCompared to your ₹${summary.monthlyBudget.toLocaleString()} budget, you are forecasted to save **₹${(summary.monthlyBudget - predictedTotal).toLocaleString()}**.`;
      suggestions.push('How to cut spending?', 'Check Emergency Fund goal', 'Am I exceeding my budget?');
    } else if (lower.includes('save') || lower.includes('5000') || lower.includes('5,000')) {
      replyText = `Here are 3 tailored actions to save ₹5,000 this month:\n1. 🍔 **Reduce Dining Out**: Lower Swiggy/dining expenses from ₹${summary.categorySpending['Food'] || 0} to ₹7,000 (Saves ~₹2,900).\n2. 🛍️ **Pause Non-Essential Shopping**: Defer online shopping (Saves ~₹1,500).\n3. 📺 **Audit Subscriptions**: Cancel redundant OTT apps (Saves ~₹600).\n\nThis will easily yield **₹5,000 in net savings** for your Emergency Fund!`;
      suggestions.push('Check goals', 'Predict end-of-month expense', 'Analyze food expenses');
    } else {
      replyText = `Based on your current net balance of **₹${summary.netBalance.toLocaleString()}** and total monthly income of **₹${summary.totalIncome.toLocaleString()}**, your cashflow velocity looks healthy.\n\nYou have saved **${Math.max(100 - summary.budgetUsedPercentage, 0)}%** of your target monthly budget so far. Let me know if you would like me to analyze a specific category or goal!`;
      suggestions.push('Analyze my food expenses', 'Am I exceeding my budget?', 'Predict end-of-month expenses');
    }

    return {
      id: `m-${Date.now()}`,
      sender: 'ai',
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions,
    };
  }
}
