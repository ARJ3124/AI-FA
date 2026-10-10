import React from 'react';
import { Wallet, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';

interface SummaryCardsProps {
  netBalance: number;
  totalIncome: number;
  totalExpense: number;
  monthlyBudget: number;
  budgetUsedPercentage: number;
  onOpenAddModal: () => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  netBalance,
  totalIncome,
  totalExpense,
  monthlyBudget,
  budgetUsedPercentage,
  onOpenAddModal,
}) => {
  const getBudgetBadge = (pct: number) => {
    if (pct >= 100) return { label: 'Exceeded', bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
    if (pct >= 85) return { label: 'Near Limit', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
    if (pct >= 70) return { label: 'Warning', bg: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' };
    return { label: 'Healthy', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
  };

  const badge = getBudgetBadge(budgetUsedPercentage);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {/* Total Balance Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-lg group hover:border-indigo-500/50 transition-all duration-300">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Wallet className="h-24 w-24 text-indigo-400" />
        </div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-slate-400">Total Net Balance</span>
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Wallet className="h-5 w-5" />
          </div>
        </div>
        <div className="text-3xl font-extrabold text-white tracking-tight mb-2">
          ₹{netBalance.toLocaleString()}
        </div>
        <div className="flex items-center text-xs text-slate-400">
          <span className="text-emerald-400 font-semibold mr-1.5 flex items-center">
            <TrendingUp className="h-3.5 w-3.5 inline mr-0.5" /> +12.4%
          </span>
          vs last month
        </div>
      </div>

      {/* Total Income Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-lg group hover:border-emerald-500/50 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-slate-400">Total Income</span>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>
        <div className="text-3xl font-extrabold text-emerald-400 tracking-tight mb-2">
          +₹{totalIncome.toLocaleString()}
        </div>
        <div className="text-xs text-slate-400">
          Recorded for current period
        </div>
      </div>

      {/* Total Expenses Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-lg group hover:border-rose-500/50 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-slate-400">Total Expenses</span>
          <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <TrendingDown className="h-5 w-5" />
          </div>
        </div>
        <div className="text-3xl font-extrabold text-rose-400 tracking-tight mb-2">
          -₹{totalExpense.toLocaleString()}
        </div>
        <div className="text-xs text-slate-400 flex items-center justify-between">
          <span>Active tracked expenses</span>
          <button
            onClick={onOpenAddModal}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold underline flex items-center"
          >
            + Add New
          </button>
        </div>
      </div>

      {/* Budget Utilization Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-lg group hover:border-amber-500/50 transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-400">Budget Health</span>
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${badge.bg}`}>
            {badge.label}
          </span>
        </div>
        <div className="flex items-baseline space-x-2 mb-2">
          <span className="text-2xl font-bold text-white">{budgetUsedPercentage}%</span>
          <span className="text-xs text-slate-400">used of ₹{monthlyBudget.toLocaleString()}</span>
        </div>
        {/* Progress bar */}
        <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mb-2">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              budgetUsedPercentage >= 100
                ? 'bg-rose-500'
                : budgetUsedPercentage >= 85
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(budgetUsedPercentage, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Target: ₹{monthlyBudget.toLocaleString()}</span>
          <span className="text-indigo-400 font-medium flex items-center">
            <Sparkles className="h-3 w-3 mr-1" /> AI Monitored
          </span>
        </div>
      </div>
    </div>
  );
};
