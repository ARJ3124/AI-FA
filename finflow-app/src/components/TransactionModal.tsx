import React, { useState } from 'react';
import { X, Sparkles, PlusCircle } from 'lucide-react';
import type { Transaction, TransactionType } from '../types';
import { predictCategory } from '../services/financeService';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
}

const CATEGORIES_EXPENSE = ['Food', 'Bills', 'Transport', 'Shopping', 'Entertainment', 'Healthcare', 'Other'];
const CATEGORIES_INCOME = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'];

export const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onAddTransaction }) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<Transaction['paymentMethod']>('Credit Card');
  const [aiSuggested, setAiSuggested] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDescriptionChange = (val: string) => {
    setDescription(val);
    if (val.trim().length > 2 && type === 'expense') {
      const predicted = predictCategory(val);
      setAiSuggested(predicted);
    } else {
      setAiSuggested(null);
    }
  };

  const applyAiCategory = () => {
    if (aiSuggested) {
      setCategory(aiSuggested);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;
    if (!description.trim()) return;

    onAddTransaction({
      type,
      amount: numAmount,
      description: description.trim(),
      category,
      date,
      paymentMethod,
    });

    // Reset form
    setAmount('');
    setDescription('');
    setCategory(type === 'expense' ? 'Food' : 'Salary');
    setAiSuggested(null);
    onClose();
  };

  const categoryOptions = type === 'expense' ? CATEGORIES_EXPENSE : CATEGORIES_INCOME;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="h-9 w-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <PlusCircle className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Add New Transaction</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-950 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                setCategory('Food');
              }}
              className={`py-2.5 rounded-xl font-bold text-sm transition-all ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategory('Salary');
              }}
              className={`py-2.5 rounded-xl font-bold text-sm transition-all ${
                type === 'income'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Income
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Amount (₹)
            </label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-white text-lg font-bold placeholder-slate-600 outline-none transition-colors"
            />
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Description
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Grocery shopping, Salary deposit..."
              value={description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-white placeholder-slate-600 outline-none transition-colors"
            />

            {/* AI Recommendation Banner */}
            {aiSuggested && type === 'expense' && (
              <div className="mt-2.5 flex items-center justify-between p-2.5 bg-indigo-950/40 border border-indigo-500/30 rounded-xl text-xs">
                <span className="text-indigo-300 flex items-center">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-400 mr-1.5" />
                  AI Suggested Category: <strong className="ml-1 text-white">{aiSuggested}</strong>
                </span>
                <button
                  type="button"
                  onClick={applyAiCategory}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition-colors"
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-white outline-none transition-colors"
            >
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-white text-sm outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as Transaction['paymentMethod'])}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-white text-sm outline-none transition-colors"
              >
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="UPI">UPI</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
          </div>

          {/* Submit Action Buttons */}
          <div className="flex items-center space-x-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-1/2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
            >
              Save Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
