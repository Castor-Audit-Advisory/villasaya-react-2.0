import { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { MobileExpenseSummary } from './expense/MobileExpenseSummary';
import { MobileExpenseSubmit } from './expense/MobileExpenseSubmit';
import { MobileExpenseHistory } from './expense/MobileExpenseHistory';
import { ExpenseSuccessModal } from './expense/ExpenseSuccessModal';
import { MobileViewWrapper } from './mobile/MobileViewWrapper';
import { toast } from 'sonner';
import { triggerHaptic } from '../utils/haptics';

interface MobileExpenseManagerProps {
  villas: any[];
  onNavigate?: (view: string) => void;
}

export function MobileExpenseManager({ villas, onNavigate }: MobileExpenseManagerProps) {
  const { expenses, selectedVilla, loadExpenses, createExpense } = useApp();
  const [currentView, setCurrentView] = useState<'summary' | 'submit' | 'history'>('summary');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedVilla) {
      loadExpenses(selectedVilla.id);
    }
  }, [selectedVilla]);

  const handleSubmitExpense = async (expenseData: any) => {
    if (!selectedVilla) {
      triggerHaptic('error');
      toast.error('Please select a villa first');
      return;
    }

    try {
      await createExpense({
        villaId: selectedVilla.id,
        description: expenseData.description,
        amount: parseFloat(expenseData.amount),
        category: expenseData.category,
        date: expenseData.date || new Date().toISOString(),
        status: 'pending',
      });

      triggerHaptic('success');
      setShowSuccessModal(true);
      if (selectedVilla) {
        loadExpenses(selectedVilla.id);
      }
    } catch (error) {
      console.error('Error submitting expense:', error);
      triggerHaptic('error');
      toast.error('Failed to submit expense');
    }
  };

  const handleViewHistory = () => {
    setShowSuccessModal(false);
    setCurrentView('summary');
  };

  const handleNavigateTab = (tab: string) => {
    const viewMap: { [key: string]: string } = {
      home: 'dashboard',
      villas: 'villas',
      calendar: 'calendar',
      tasks: 'tasks',
      expenses: 'expenses',
    };
    onNavigate?.(viewMap[tab] || tab);
  };

  // Filter expenses by selected villa
  const villaExpenses = selectedVilla 
    ? expenses.filter(e => e.villaId === selectedVilla.id)
    : expenses;

  if (!selectedVilla) {
    return (
      <MobileViewWrapper>
        <div className="flex items-center justify-center h-[50vh] px-4">
          <div className="text-center">
            <p className="text-gray-600">Please select a villa to view expenses</p>
          </div>
        </div>
      </MobileViewWrapper>
    );
  }

  if (loading) {
    return (
      <MobileViewWrapper>
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-[#6E6B7B]">Loading expenses...</div>
        </div>
      </MobileViewWrapper>
    );
  }

  if (currentView === 'submit') {
    return (
      <MobileViewWrapper>
        <MobileExpenseSubmit
          onBack={() => setCurrentView('summary')}
          onSubmit={handleSubmitExpense}
          villaId={selectedVilla.id}
        />
      </MobileViewWrapper>
    );
  }

  if (currentView === 'history') {
    return (
      <MobileViewWrapper>
        <MobileExpenseHistory
          expenses={villaExpenses}
          onBack={() => setCurrentView('summary')}
          onNavigate={handleNavigateTab}
        />
      </MobileViewWrapper>
    );
  }

  return (
    <MobileViewWrapper>
      <MobileExpenseSummary
        expenses={villaExpenses}
        onSubmit={() => setCurrentView('submit')}
        onNavigate={handleNavigateTab}
        onViewHistory={() => setCurrentView('history')}
      />
      <ExpenseSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onViewHistory={handleViewHistory}
      />
    </MobileViewWrapper>
  );
}
