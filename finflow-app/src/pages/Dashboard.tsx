import React from 'react';
import { SummaryCards } from '../components/SummaryCards';
import type { Transaction } from '../types';
import { Sparkles, ArrowRight, TrendingUp, TrendingDown, Receipt, Target, Plus } from 'lucide-react';

interface DashboardProps {
  summary: {
    netBalance: number;
    totalIncome: number;
    totalExpense: number;
    monthlyBudget: number;
    budgetUsedPercentage: number;
    budgetRemaining: number;
    categorySpending: Record<string, number>;
  };
  transactions: Transaction[];
  onOpenAddModal: () => void;
  onNavigate: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  summary,
  transactions,
  onOpenAddModal,
  onNavigate,
}) => {
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner / Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/60 via-slate-900 to-purple-900/40 border border-slate-800 p-8 shadow-xl">
        <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider mb-2">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span>AI Financial Overview</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
              Welcome back to <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-emerald-400">FinFlow</span>
            </h1>
            <p className="text-slate-400 text-sm max-w-xl">
              Your financial health is optimal. You have saved <strong className="text-emerald-400">₹{summary.budgetRemaining.toLocaleString()}</strong> out of your target monthly budget.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenAddModal}
              className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4" />
              <span>Add Transaction</span>
            </button>
            <button
              onClick={() => onNavigate('ai-assistant')}
              className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-sm transition-all"
            >
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <span>Ask AI Assistant</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <SummaryCards
        netBalance={summary.netBalance}
        totalIncome={summary.totalIncome}
        totalExpense={summary.totalExpense}
        monthlyBudget={summary.monthlyBudget}
        budgetUsedPercentage={summary.budgetUsedPercentage}
        onOpenAddModal={onOpenAddModal}
      />

      {/* Main Grid: Recent Transactions + Budget Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 cols): Recent Transactions */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Receipt className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-white">Recent Transactions</h2>
            </div>
            <button
              onClick={() => onNavigate('transactions')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`h-11 w-11 rounded-2xl flex items-center justify-center font-bold ${
                      tx.type === 'income'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {tx.type === 'income' ? (
                      <TrendingUp className="h-5 w-5" />
                    ) : (
                      <TrendingDown className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{tx.description}</h4>
                    <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium">
                        {tx.category}
                      </span>
                      <span>•</span>
                      <span>{tx.date}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-base font-extrabold ${
                      tx.type === 'income' ? 'text-emerald-400' : 'text-slate-200'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                  </span>
                  <span className="block text-[11px] text-slate-500">{tx.paymentMethod}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: AI Smart Spending Insights */}
        <div className="space-y-6">
          {/* Quick Budget Health Widget */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2 text-white font-bold text-base">
                <Target className="h-5 w-5 text-indigo-400" />
                <span>Monthly Budget</span>
              </div>
              <button
                onClick={() => onNavigate('budget')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Manage
              </button>
            </div>

            <div className="space-y-4">
              {Object.entries(summary.categorySpending).slice(0, 4).map(([category, amount]) => {
                const limit = category === 'Food' ? 15000 : 10000;
                const pct = Math.min(Math.round((amount / limit) * 100), 100);
                return (
                  <div key={category} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">{category}</span>
                      <span className="text-slate-400">
                        ₹{amount.toLocaleString()} / ₹{limit.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pct >= 90 ? 'bg-rose-500' : pct >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Recommendation Banner */}
          <div className="bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 border border-indigo-500/30 rounded-3xl p-6 shadow-xl relative">
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="h-4 w-4" />
              <span>Smart Recommendation</span>
            </div>
            <h4 className="text-base font-bold text-white mb-2">
              Save up to ₹2,500 on Dining
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Your Food & Dining expenses are currently 25% higher than last week. Cooking 2 extra meals at home can preserve your Emergency Fund target!
            </p>
            <button
              onClick={() => onNavigate('ai-assistant')}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all"
            >
              Ask AI for Detailed Savings Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
