import { useState } from 'react';
import { Search, Receipt } from 'lucide-react';
import { ExpenseListItem } from './ExpenseListItem';
import { ExpenseDetailCard } from './ExpenseDetailCard';
import { MobileBottomNav } from '../mobile/MobileBottomNav';
import { SwipeToDelete } from '../mobile/SwipeToDelete';
import { PageHeader } from '../shared/PageHeader';
import { DataList } from '../shared/DataList';
import { toast } from 'sonner';
import { apiRequest } from '../../utils/api';
import { useIsLandscape } from '../../utils/orientation';

interface MobileExpenseHistoryProps {
  expenses: any[];
  onBack: () => void;
  onNavigate?: (tab: string) => void;
}

export function MobileExpenseHistory({ expenses, onBack, onNavigate }: MobileExpenseHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [localExpenses, setLocalExpenses] = useState(expenses);
  const isLandscape = useIsLandscape();

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      await apiRequest(`/expenses/${expenseId}`, {
        method: 'DELETE',
      });
      setLocalExpenses(prev => prev.filter(exp => exp.id !== expenseId));
      toast.success('Expense deleted successfully');
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Failed to delete expense');
      throw error; // Propagate error to SwipeToDelete for proper state reset
    }
  };

  const filteredExpenses = localExpenses.filter(exp => {
    const matchesSearch = exp.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exp.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || exp.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (selectedExpense) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] p-6">
        <ExpenseDetailCard
          expense={selectedExpense}
          onClose={() => setSelectedExpense(null)}
        />
      </div>
    );
  }

  return (
    <div
      className={`min-h-dvh bg-[#F8F8F8] ${
        isLandscape
          ? 'pl-[calc(80px+env(safe-area-inset-left))] pb-10'
          : 'pb-[calc(84px+2rem+env(safe-area-inset-bottom))]'
      }`}
    >
      {/* Header */}
      <PageHeader
        title="Expense History"
        subtitle={`${filteredExpenses.length} ${filteredExpenses.length === 1 ? 'expense' : 'expenses'}`}
        onBack={onBack}
      />
      {/* Search and Filter */}
      <div className="px-6 sm:px-8 pt-4 pb-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B9B9C3]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search expenses..."
            className="w-full h-[48px] pl-12 pr-4 bg-white border-2 border-[#E8E8E8] rounded-xl text-[15px] placeholder:text-[#B9B9C3] focus:border-[#7B5FEB] focus:outline-none transition-colors"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-5 h-11 rounded-full text-[14px] font-medium whitespace-nowrap transition-all ${
              filterStatus === 'all'
                ? 'bg-[#7B5FEB] text-white'
                : 'bg-white text-[#6E6B7B] border border-[#E8E8E8]'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-5 h-11 rounded-full text-[14px] font-medium whitespace-nowrap transition-all ${
              filterStatus === 'pending'
                ? 'bg-[#FF9F43] text-white'
                : 'bg-white text-[#6E6B7B] border border-[#E8E8E8]'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilterStatus('approved')}
            className={`px-5 h-11 rounded-full text-[14px] font-medium whitespace-nowrap transition-all ${
              filterStatus === 'approved'
                ? 'bg-[#28C76F] text-white'
                : 'bg-white text-[#6E6B7B] border border-[#E8E8E8]'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilterStatus('rejected')}
            className={`px-5 h-11 rounded-full text-[14px] font-medium whitespace-nowrap transition-all ${
              filterStatus === 'rejected'
                ? 'bg-[#EA5455] text-white'
                : 'bg-white text-[#6E6B7B] border border-[#E8E8E8]'
            }`}
          >
            Rejected
          </button>
        </div>
      </div>

      {/* Expense List */}
      <div className="px-6 sm:px-8">
        <DataList
          data={filteredExpenses}
          isLoading={false}
          error={null}
          renderItem={(expense: any) => (
            <SwipeToDelete
              onDelete={() => handleDeleteExpense(expense.id)}
              deleteLabel="Delete"
            >
              <div onClick={() => setSelectedExpense(expense)} className="cursor-pointer">
                <ExpenseListItem
                  date={new Date(expense.date || expense.created_at).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                  type={expense.description || expense.category || 'Expense'}
                  amount={expense.amount}
                  status={expense.status === 'pending' ? 'review' : (expense.status as any)}
                />
              </div>
            </SwipeToDelete>
          )}
          keyExtractor={(expense, index) => expense.id || index.toString()}
          emptyState={{
            icon: <Receipt className="w-12 h-12 text-[#B9B9C3]" />,
            title: 'No expenses found',
            description: searchQuery || filterStatus !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Your expense history will appear here'
          }}
        />
      </div>

      {/* Bottom Navigation */}
      <MobileBottomNav activeTab="expenses" onTabChange={onNavigate} />
    </div>
  );
}
