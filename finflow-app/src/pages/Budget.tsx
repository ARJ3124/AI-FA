import React, { useState, useMemo } from 'react';
import type { Budget, Transaction } from '../types';
import { Target, AlertTriangle, CheckCircle, ShieldAlert, Save, ChevronLeft, ChevronRight } from 'lucide-react';

interface BudgetProps {
  budget: Budget;
  transactions: Transaction[];
  onUpdateBudget: (newBudget: Budget) => void;
}

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

export const BudgetPage: React.FC<BudgetProps> = ({ budget, transactions, onUpdateBudget }) => {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth()); // 0-indexed
  const [monthlyLimit, setMonthlyLimit] = useState(budget.monthlyLimit);
  const [categoryLimits, setCategoryLimits] = useState(budget.categoryLimits);
  const [savedMessage, setSavedMessage] = useState(false);

  // Navigate months
  const goPrev = () => {
    if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear(y => y - 1); }
    else { setSelectedMonth(m => m - 1); }
  };
  const goNext = () => {
    if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear(y => y + 1); }
    else { setSelectedMonth(m => m + 1); }
  };
  const isCurrentMonth = selectedMonth === now.getMonth() && selectedYear === now.getFullYear();

  // Compute category spending for the selected month from transactions
  const categorySpending = useMemo(() => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const prefix = `${selectedYear}-${pad(selectedMonth + 1)}`;
    const result: Record<string, number> = {};
    transactions.forEach((tx) => {
      if (tx.type === 'expense' && tx.date.startsWith(prefix)) {
        result[tx.category] = (result[tx.category] || 0) + tx.amount;
      }
    });
    return result;
  }, [transactions, selectedMonth, selectedYear]);

  const totalSpent = Object.values(categorySpending).reduce((a, b) => a + b, 0);
  const totalLimit = monthlyLimit;
  const overallUsedPct = Math.min(Math.round((totalSpent / totalLimit) * 100), 100);

  const handleSave = () => {
    onUpdateBudget({ monthlyLimit, categoryLimits });
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  const handleCategoryLimitChange = (cat: string, val: number) => {
    setCategoryLimits((prev) => ({ ...prev, [cat]: val }));
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Budget Management
          </h1>
          <p className="text-sm text-slate-400">
            Set spending limits for each category and track threshold warnings.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all"
        >
          <Save className="h-4 w-4" />
          <span>Save Changes</span>
        </button>
      </div>

      {/* Month Filter */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-2xl px-5 py-3 shadow-lg">
        <button
          onClick={goPrev}
          className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Previous month"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="text-center">
          <span className="text-lg font-bold text-white">
            {MONTH_NAMES[selectedMonth]} {selectedYear}
          </span>
          {isCurrentMonth && (
            <span className="ml-2 px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-xs font-semibold">
              Current
            </span>
          )}
        </div>

        <button
          onClick={goNext}
          disabled={isCurrentMonth}
          className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Next month"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {savedMessage && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl text-emerald-300 text-sm font-semibold flex items-center space-x-2 animate-fadeIn">
          <CheckCircle className="h-5 w-5 text-emerald-400" />
          <span>Budget preferences saved successfully!</span>
        </div>
      )}

      {/* Overall Budget Header Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">
                Overall Monthly Cap
              </span>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className="text-2xl font-bold text-white">₹</span>
                <input
                  type="number"
                  value={monthlyLimit}
                  onChange={(e) => setMonthlyLimit(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-1.5 text-2xl font-extrabold text-white w-36 outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block">Total Spent — {MONTH_NAMES[selectedMonth]} {selectedYear}</span>
            <span className="text-2xl font-extrabold text-rose-400">₹{totalSpent.toLocaleString()}</span>
            <span className="text-xs text-slate-500 block">
              Remaining: ₹{(totalLimit - totalSpent).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-300">
            <span>Overall Budget Utilization</span>
            <span>{overallUsedPct}%</span>
          </div>
          <div className="w-full bg-slate-950 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                overallUsedPct >= 100
                  ? 'bg-rose-500'
                  : overallUsedPct >= 85
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${overallUsedPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(categoryLimits).map(([category, limit]) => {
          const spent = categorySpending[category] || 0;
          const pct = Math.min(Math.round((spent / limit) * 100), 100);

          let statusBadge = { label: 'Normal', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: CheckCircle };
          if (spent >= limit) {
            statusBadge = { label: 'Exceeded', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20', icon: ShieldAlert };
          } else if (pct >= 80) {
            statusBadge = { label: 'Near Limit', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: AlertTriangle };
          }

          const BadgeIcon = statusBadge.icon;

          return (
            <div
              key={category}
              className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">{category}</h3>
                  <span className="text-xs text-slate-400">
                    Spent: <strong className="text-slate-200">₹{spent.toLocaleString()}</strong>
                  </span>
                </div>

                <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusBadge.color}`}>
                  <BadgeIcon className="h-3.5 w-3.5" />
                  <span>{statusBadge.label}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-400 font-medium">
                  <span>Usage ({pct}%)</span>
                  <span>Target Cap: ₹{limit.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      spent >= limit ? 'bg-rose-500' : pct >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Editable limit */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                <span className="text-slate-400 font-medium">Adjust Cap (₹):</span>
                <input
                  type="number"
                  value={limit}
                  onChange={(e) => handleCategoryLimitChange(category, Number(e.target.value))}
                  className="bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-2.5 py-1 text-white text-right w-28 outline-none font-bold"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
