import React, { useState } from 'react';
import { Plus, DollarSign, CheckCircle2, Clock, Trash2, Edit2, AlertCircle, PieChart, Tag, ArrowUpRight } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/helpers';
import ExpenseModal from './ExpenseModal';
import ConfirmModal from './ConfirmModal';

export default function BudgetPlanner({ event, onAddExpense, onUpdateExpense, onDeleteExpense }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [deleteExpenseId, setDeleteExpenseId] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const expenses = event.expenses || [];
  const targetBudget = Number(event.targetBudget) || 0;
  const totalSpent = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const paidSpent = expenses.filter(e => e.status === 'paid').reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const pendingSpent = expenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const remainingBudget = targetBudget - totalSpent;
  const budgetPercentage = targetBudget > 0 ? Math.round((totalSpent / targetBudget) * 100) : 0;
  const isOverBudget = remainingBudget < 0;

  // Category breakdown
  const categoryMap = expenses.reduce((acc, e) => {
    const cat = e.category || 'Other';
    acc[cat] = (acc[cat] || 0) + (Number(e.amount) || 0);
    return acc;
  }, {});

  const categoryList = Object.entries(categoryMap).map(([category, amount]) => ({
    category,
    amount,
    percentage: totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0
  })).sort((a, b) => b.amount - a.amount);

  // Filtered expenses
  const filteredExpenses = expenses.filter((e) => {
    if (filterCategory !== 'all' && e.category !== filterCategory) return false;
    if (filterStatus !== 'all' && e.status !== filterStatus) return false;
    return true;
  });

  const handleEdit = (expense) => {
    setExpenseToEdit(expense);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setExpenseToEdit(null);
    setIsModalOpen(true);
  };

  const handleSave = async (data) => {
    if (expenseToEdit) {
      await onUpdateExpense(expenseToEdit.id, data);
    } else {
      await onAddExpense(event.id, data);
    }
  };

  const confirmDelete = async () => {
    if (deleteExpenseId) {
      await onDeleteExpense(deleteExpenseId);
      setDeleteExpenseId(null);
    }
  };

  const toggleStatus = async (expense) => {
    const nextStatus = expense.status === 'paid' ? 'pending' : 'paid';
    await onUpdateExpense(expense.id, { ...expense, status: nextStatus });
  };

  return (
    <div className="space-y-6">
      {/* Top Budget Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Target Budget */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Target Budget</span>
            <DollarSign className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            {formatCurrency(targetBudget)}
          </div>
          <div className="text-xs text-zinc-400 mt-1">
            Planned celebration cap
          </div>
        </div>

        {/* Total Committed / Spent */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Total Committed</span>
            <ArrowUpRight className="w-4 h-4 text-pink-400" />
          </div>
          <div className={`text-2xl font-extrabold ${isOverBudget ? 'text-rose-400' : 'text-zinc-100'}`}>
            {formatCurrency(totalSpent)}
          </div>
          <div className="text-xs text-zinc-400 mt-1">
            {budgetPercentage}% of target budget
          </div>
        </div>

        {/* Paid in Full */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Paid in Full</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400">
            {formatCurrency(paidSpent)}
          </div>
          <div className="text-xs text-zinc-400 mt-1">
            Settled invoices
          </div>
        </div>

        {/* Remaining / Variance */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>{isOverBudget ? 'Over Budget By' : 'Remaining Balance'}</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className={`text-2xl font-extrabold ${isOverBudget ? 'text-rose-400' : 'text-purple-300'}`}>
            {formatCurrency(Math.abs(remainingBudget))}
          </div>
          <div className="text-xs text-zinc-400 mt-1">
            {isOverBudget ? '⚠️ Budget limit exceeded' : `${formatCurrency(pendingSpent)} pending payment`}
          </div>
        </div>
      </div>

      {/* Visual Budget Progress Bar */}
      <div className="glass-panel p-5 rounded-2xl">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">Budget Consumption</span>
            {isOverBudget && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                Over by {formatCurrency(Math.abs(remainingBudget))}
              </span>
            )}
          </div>
          <span className="text-xs font-mono font-medium text-zinc-300">
            {budgetPercentage}% used
          </span>
        </div>

        {/* Multi-track Bar */}
        <div className="w-full h-3.5 bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-zinc-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isOverBudget
                ? 'bg-gradient-to-r from-rose-500 to-red-600 shadow-glow-pink'
                : budgetPercentage > 80
                ? 'bg-gradient-to-r from-amber-500 via-pink-500 to-purple-500'
                : 'bg-gradient-to-r from-purple-500 via-pink-500 to-purple-400 shadow-glow-purple'
            }`}
            style={{ width: `${Math.min(100, budgetPercentage)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-zinc-400 mt-2">
          <span>{formatCurrency(0)}</span>
          <span className="text-purple-300 font-medium">Target: {formatCurrency(targetBudget)}</span>
        </div>
      </div>

      {/* Category Breakdown & Expenses List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown Sidebar */}
        <div className="glass-panel p-5 rounded-2xl lg:col-span-1 space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3">
            <PieChart className="w-4 h-4 text-pink-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Spending By Category</h3>
          </div>

          {categoryList.length === 0 ? (
            <p className="text-xs text-zinc-500 py-4 text-center">No expenses recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {categoryList.map((item) => (
                <div key={item.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-300 font-medium">{item.category}</span>
                    <span className="text-zinc-200 font-semibold">{formatCurrency(item.amount)} ({item.percentage}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expenses Table / Cards */}
        <div className="glass-panel p-5 rounded-2xl lg:col-span-2 space-y-4">
          {/* Action and Filter Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
            <div>
              <h3 className="text-base font-bold text-white">Expense Records</h3>
              <p className="text-xs text-zinc-400">{expenses.length} total entries</p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Category Filter */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl glass-input text-xs"
              >
                <option value="all" className="bg-zinc-900 text-white">All Categories</option>
                {Array.from(new Set(expenses.map(e => e.category))).map(c => (
                  <option key={c} value={c} className="bg-zinc-900 text-white">{c}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl glass-input text-xs"
              >
                <option value="all" className="bg-zinc-900 text-white">All Statuses</option>
                <option value="paid" className="bg-zinc-900 text-emerald-400">Paid Only</option>
                <option value="pending" className="bg-zinc-900 text-amber-400">Pending Only</option>
              </select>

              {/* Add Expense Button */}
              <button
                onClick={handleCreate}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-md shadow-purple-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Expense</span>
              </button>
            </div>
          </div>

          {/* Expense Items List */}
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-zinc-800 rounded-xl">
              <DollarSign className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-zinc-300">No expenses found</h4>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto mt-1 mb-4">
                Record your venue deposit, catering, photography, and decor to track your celebration budget.
              </p>
              <button
                onClick={handleCreate}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-800 text-purple-300 hover:bg-zinc-700 hover:text-white transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add First Expense
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredExpenses.map((expense) => {
                const isPaid = expense.status === 'paid';
                return (
                  <div
                    key={expense.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80 hover:border-purple-500/30 transition-all gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleStatus(expense)}
                        title={isPaid ? 'Click to mark pending' : 'Click to mark paid'}
                        className={`mt-0.5 p-1 rounded-lg transition-colors ${
                          isPaid
                            ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                        }`}
                      >
                        {isPaid ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      </button>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-white">{expense.title}</span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                            {expense.category}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase ${
                            isPaid
                              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
                          }`}>
                            {isPaid ? 'Paid' : 'Pending'}
                          </span>
                        </div>
                        {expense.notes && (
                          <p className="text-xs text-zinc-400 mt-0.5 italic">{expense.notes}</p>
                        )}
                        <span className="text-[11px] text-zinc-500 mt-1 block">
                          Recorded: {formatDate(expense.date)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-center">
                      <span className="text-base font-extrabold text-white">
                        {formatCurrency(expense.amount)}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                          title="Edit expense"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteExpenseId(expense.id)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete expense"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Expense Modal */}
      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        expenseToEdit={expenseToEdit}
        eventId={event.id}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteExpenseId)}
        title="Delete Expense Item"
        message="Are you sure you want to delete this expense record? This will adjust your total spent calculations."
        confirmText="Delete Expense"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteExpenseId(null)}
        isDanger={true}
      />
    </div>
  );
}
