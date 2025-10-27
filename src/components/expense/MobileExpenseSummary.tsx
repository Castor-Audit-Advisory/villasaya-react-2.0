import { useState } from 'react';
import { ExpenseStatCard } from './ExpenseStatCard';
import { ExpenseListItem } from './ExpenseListItem';
import { MobileBottomNav } from '../mobile/MobileBottomNav';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useIsLandscape } from '../../utils/orientation';

interface MobileExpenseSummaryProps {
  expenses: any[];
  onSubmit: () => void;
  onNavigate?: (tab: string) => void;
  onViewHistory?: () => void;
}

export function MobileExpenseSummary({ expenses, onSubmit, onNavigate, onViewHistory }: MobileExpenseSummaryProps) {
  const [activeFilter, setActiveFilter] = useState<'review' | 'approved' | 'rejected'>('review');
  const isLandscape = useIsLandscape();

  // Calculate totals
  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const review = expenses.filter(e => e.status === 'pending').reduce((sum, exp) => sum + exp.amount, 0);
  const approved = expenses.filter(e => e.status === 'approved').reduce((sum, exp) => sum + exp.amount, 0);

  // Filter expenses based on active filter
  const filteredExpenses = expenses.filter(exp => {
    if (activeFilter === 'review') return exp.status === 'pending';
    if (activeFilter === 'approved') return exp.status === 'approved';
    if (activeFilter === 'rejected') return exp.status === 'rejected';
    return true;
  });

  const filterCounts = {
    review: expenses.filter(e => e.status === 'pending').length,
    approved: expenses.filter(e => e.status === 'approved').length,
    rejected: expenses.filter(e => e.status === 'rejected').length,
  };

  return (
    <div
      className={`min-h-dvh bg-[#F8F8F8] ${
        isLandscape ? 'pl-[calc(80px+env(safe-area-inset-left))] pb-8' : 'pb-[calc(84px+2rem+env(safe-area-inset-bottom))]'
      }`}
    >
      {/* Status Bar */}
      <div className="bg-gradient-to-br from-[#7B5FEB] to-[#6B4FDB] px-6 sm:px-8 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-2">
        <div className="text-white text-[15px]">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</div>
      </div>

      {/* Header Section */}
      <div className="bg-gradient-to-br from-[#7B5FEB] to-[#6B4FDB] px-6 sm:px-8 pb-6 relative overflow-hidden">
        {/* Decorative stars/sparkles */}
        <div className="absolute top-4 right-8 text-white text-[20px]">✦</div>
        <div className="absolute top-12 right-16 text-white text-sm">✦</div>
        <div className="absolute top-8 right-24 text-white text-[16px]">✦</div>
        
        <div className="flex items-start justify-between mb-6 relative z-10">
          <div>
            <h1 className="text-white text-[28px] font-semibold mb-1">
              Expense Summary
            </h1>
            <p className="text-white/80 text-[14px]">Claim your expenses here.</p>
          </div>
          <div className="w-24 h-16 relative">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1758908176211-5bd0932f956a?w=200"
              alt="Credit Card"
              className="w-full h-full object-contain transform rotate-12"
            />
          </div>
        </div>

        {/* Total Expense Card */}
        <div className="bg-white rounded-2xl p-4 shadow-lg">
          <div className="mb-3">
            <div className="text-[#5E5873] text-[14px] font-semibold">Total Expense</div>
            <div className="text-[#B9B9C3] text-sm">
              Period 1 Jan 2024 - 30 Dec 2024
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ExpenseStatCard label="Total" amount={total} icon="total" />
            <div className="w-px h-12 bg-[#E8E8E8]"></div>
            <ExpenseStatCard label="Review" amount={review} icon="review" />
            <div className="w-px h-12 bg-[#E8E8E8]"></div>
            <ExpenseStatCard label="Approved" amount={approved} icon="approved" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-6 sm:px-8 py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 overflow-x-auto flex-1 scrollbar-hide">
        <button
          onClick={() => setActiveFilter('review')}
          className={`px-5 h-11 rounded-full text-[14px] font-medium transition-all ${
            activeFilter === 'review'
              ? 'bg-[#7B5FEB] text-white shadow-lg shadow-[#7B5FEB]/25'
              : 'bg-white text-[#6E6B7B] border border-[#E8E8E8]'
          }`}
        >
          Review {filterCounts.review > 0 && (
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-sm ${
              activeFilter === 'review' ? 'bg-white/20' : 'bg-[#FF9F43] text-white'
            }`}>
              {filterCounts.review}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveFilter('approved')}
          className={`px-5 h-11 rounded-full text-[14px] font-medium transition-all ${
            activeFilter === 'approved'
              ? 'bg-[#7B5FEB] text-white shadow-lg shadow-[#7B5FEB]/25'
              : 'bg-white text-[#6E6B7B] border border-[#E8E8E8]'
          }`}
        >
          Approved {filterCounts.approved > 0 && (
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-sm ${
              activeFilter === 'approved' ? 'bg-white/20' : 'bg-[#E8E8E8] text-[#6E6B7B]'
            }`}>
              {filterCounts.approved}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveFilter('rejected')}
          className={`px-5 h-11 rounded-full text-[14px] font-medium transition-all ${
            activeFilter === 'rejected'
              ? 'bg-[#7B5FEB] text-white shadow-lg shadow-[#7B5FEB]/25'
              : 'bg-white text-[#6E6B7B] border border-[#E8E8E8]'
          }`}
        >
          Rejected {filterCounts.rejected > 0 && (
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-sm ${
              activeFilter === 'rejected' ? 'bg-white/20' : 'bg-[#E8E8E8] text-[#6E6B7B]'
            }`}>
              {filterCounts.rejected}
            </span>
          )}
        </button>
        </div>
        {onViewHistory && (
          <button
            onClick={onViewHistory}
            className="px-5 h-11 bg-white text-[#7B5FEB] border border-[#7B5FEB] rounded-full text-sm font-medium whitespace-nowrap hover:bg-[#7B5FEB] hover:text-white transition-all"
          >
            View All
          </button>
        )}
      </div>

      {/* Expense List */}
      <div className="px-6 sm:px-8">
        {filteredExpenses.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 sm:p-10 text-center">
            <div className="text-[#B9B9C3] text-[14px]">
              No {activeFilter} expenses found
            </div>
          </div>
        ) : (
          filteredExpenses.map((expense, index) => (
            <ExpenseListItem
              key={index}
              date={new Date(expense.date || expense.created_at).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
              type={expense.description || expense.category || 'E-Learning'}
              amount={expense.amount}
              status={expense.status === 'pending' ? 'review' : expense.status as any}
            />
          ))
        )}
      </div>

      {/* Submit Button */}
      <div
        className="fixed right-0 px-6 sm:px-8 pb-4 max-w-3xl mx-auto"
        style={{
          bottom: 'calc(84px + env(safe-area-inset-bottom) + 1rem)',
          left: isLandscape ? 'calc(80px + env(safe-area-inset-left))' : '0',
        }}
      >
        <button
          onClick={onSubmit}
          className="w-full h-[56px] bg-gradient-to-r from-[#7B5FEB] to-[#6B4FDB] text-white rounded-full font-semibold text-[16px] shadow-xl shadow-[#7B5FEB]/30 active:scale-[0.98] transition-transform px-6 flex items-center justify-center"
        >
          Submit Expense
        </button>
      </div>

      {/* Bottom Navigation */}
      <MobileBottomNav activeTab="expenses" onTabChange={onNavigate} />
    </div>
  );
}
