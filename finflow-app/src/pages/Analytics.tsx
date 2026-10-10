import React, { useState, useMemo } from 'react';
import type { Transaction } from '../types';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { PieChart as PieIcon, BarChart3, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';

interface AnalyticsProps {
  transactions: Transaction[];
}

const COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

export const AnalyticsPage: React.FC<AnalyticsProps> = ({ transactions }) => {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth()); // 0-indexed

  const isCurrentMonth = selectedMonth === now.getMonth() && selectedYear === now.getFullYear();

  const goPrev = () => {
    if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear(y => y - 1); }
    else { setSelectedMonth(m => m - 1); }
  };
  const goNext = () => {
    if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear(y => y + 1); }
    else { setSelectedMonth(m => m + 1); }
  };

  // Filter transactions for selected month
  const filteredTx = useMemo(() => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const prefix = `${selectedYear}-${pad(selectedMonth + 1)}`;
    return transactions.filter((tx) => tx.date.startsWith(prefix));
  }, [transactions, selectedMonth, selectedYear]);

  const totalIncome = filteredTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = filteredTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  // Category spending for pie chart
  const categorySpending: Record<string, number> = {};
  filteredTx.forEach((tx) => {
    if (tx.type === 'expense') {
      categorySpending[tx.category] = (categorySpending[tx.category] || 0) + tx.amount;
    }
  });

  const pieData = Object.entries(categorySpending).map(([name, value]) => ({ name, value }));

  const barData = [
    { name: 'Income', amount: totalIncome },
    { name: 'Expenses', amount: totalExpense },
    { name: 'Net Savings', amount: Math.max(totalIncome - totalExpense, 0) },
  ];

  // Daily trend
  const sortedTx = [...filteredTx].sort((a, b) => a.date.localeCompare(b.date));
  const trendMap: Record<string, { income: number; expense: number }> = {};
  sortedTx.forEach((tx) => {
    if (!trendMap[tx.date]) trendMap[tx.date] = { income: 0, expense: 0 };
    if (tx.type === 'income') trendMap[tx.date].income += tx.amount;
    else trendMap[tx.date].expense += tx.amount;
  });
  const areaData = Object.entries(trendMap).map(([date, vals]) => ({
    date: date.substring(8), // day of month DD
    income: vals.income,
    expense: vals.expense,
  }));

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Financial Analytics
        </h1>
        <p className="text-sm text-slate-400">
          Visualize your income distribution, expense categories, and monthly spending trends.
        </p>
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
          <div className="text-xs text-slate-500 mt-0.5">
            Income: <span className="text-emerald-400 font-bold">₹{totalIncome.toLocaleString()}</span>
            {' · '}
            Expenses: <span className="text-rose-400 font-bold">₹{totalExpense.toLocaleString()}</span>
          </div>
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

      {/* Empty state */}
      {filteredTx.length === 0 && (
        <div className="py-16 text-center bg-slate-900/90 border border-slate-800 rounded-3xl">
          <p className="text-slate-400 font-semibold">No transactions found for {MONTH_NAMES[selectedMonth]} {selectedYear}</p>
          <p className="text-slate-500 text-sm mt-1">Navigate to a month with recorded data.</p>
        </div>
      )}

      {filteredTx.length > 0 && (
        <>
          {/* Chart Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Category Breakdown Pie Chart */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <PieIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Expense Distribution</h3>
                  <p className="text-xs text-slate-400">Spending breakdown by category</p>
                </div>
              </div>

              <div className="h-72 w-full">
                {pieData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                    No expense data recorded
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                        itemStyle={{ color: '#f8fafc' }}
                        formatter={(value: any) => [`₹${Number(value || 0).toLocaleString()}`, '']}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Income vs Expenses Bar Chart */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Income vs Expenses</h3>
                  <p className="text-xs text-slate-400">Financial flow summary</p>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                      itemStyle={{ color: '#f8fafc' }}
                      formatter={(value: any) => [`₹${Number(value || 0).toLocaleString()}`, '']}
                    />
                    <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                      <Cell fill="#10b981" />
                      <Cell fill="#f43f5e" />
                      <Cell fill="#6366f1" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Full Width Area Chart: Daily Cashflow */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Daily Cashflow Trend</h3>
                <p className="text-xs text-slate-400">Income vs expense by day — {MONTH_NAMES[selectedMonth]} {selectedYear}</p>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaData}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#94a3b8" label={{ value: 'Day', position: 'insideBottom', offset: -2, fill: '#64748b', fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                    itemStyle={{ color: '#f8fafc' }}
                    formatter={(value: any) => [`₹${Number(value || 0).toLocaleString()}`, '']}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#incomeGrad)" name="Income" />
                  <Area type="monotone" dataKey="expense" stroke="#f43f5e" fillOpacity={1} fill="url(#expenseGrad)" name="Expense" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
