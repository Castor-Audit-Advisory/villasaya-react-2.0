import { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { PageHeader } from '../shared/PageHeader';
import { ExpenseDetailCard } from './ExpenseDetailCard';
import { toast } from 'sonner';
import { apiRequest } from '../../utils/api';
import { triggerHaptic } from '../../utils/haptics';
import { BottomSheet, BottomSheetActions } from '../mobile/BottomSheet';

interface MobileExpenseApprovalProps {
  expense: any;
  onBack: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}

export function MobileExpenseApproval({ expense, onBack, onApprove, onReject }: MobileExpenseApprovalProps) {
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      await apiRequest(`/expenses/${expense.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: 'approved',
        }),
      });
      triggerHaptic('success');
      toast.success('Expense approved successfully!');
      onApprove(expense.id);
    } catch (error) {
      console.error('Error approving expense:', error);
      triggerHaptic('error');
      toast.error('Failed to approve expense');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      triggerHaptic('error');
      toast.error('Please provide a reason for rejection');
      return;
    }

    setLoading(true);
    try {
      await apiRequest(`/expenses/${expense.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: 'rejected',
          rejection_reason: rejectReason,
        }),
      });
      triggerHaptic('warning');
      toast.success('Expense rejected');
      onReject(expense.id, rejectReason);
    } catch (error) {
      console.error('Error rejecting expense:', error);
      triggerHaptic('error');
      toast.error('Failed to reject expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-[#F8F8F8] pb-[calc(env(safe-area-inset-bottom)+2rem)]">
      <PageHeader
        title="Review Expense"
        variant="white"
        onBack={onBack}
        className="mb-4"
      />

      {/* Content */}
      <div className="px-6 sm:px-8 pb-32">
        <ExpenseDetailCard expense={expense} />
      </div>

      {/* Action Buttons */}
      {expense.status === 'pending' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8E8E8] px-6 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <div className="flex gap-3">
            <button
              onClick={() => {
                triggerHaptic('medium');
                setShowRejectDialog(true);
              }}
              disabled={loading}
              className="flex-1 h-[52px] bg-white border-2 border-[#EA5455] text-[#EA5455] rounded-xl font-semibold text-[15px] flex items-center justify-center gap-2 hover:bg-[#EA5455] hover:text-white transition-all active:scale-[0.98] disabled:opacity-50 px-4"
            >
              <XCircle className="w-5 h-5" />
              Reject
            </button>
            <button
              onClick={handleApprove}
              disabled={loading}
              className="flex-1 h-[52px] bg-gradient-to-r from-[#28C76F] to-[#20B561] text-white rounded-xl font-semibold text-[15px] flex items-center justify-center gap-2 shadow-lg shadow-[#28C76F]/30 active:scale-[0.98] transition-transform disabled:opacity-50 px-4"
            >
              <CheckCircle className="w-5 h-5" />
              Approve
            </button>
          </div>
        </div>
      )}

      {/* Reject Bottom Sheet */}
      <BottomSheet
        open={showRejectDialog}
        onOpenChange={(open) => {
          setShowRejectDialog(open);
          if (!open) setRejectReason('');
        }}
        title="Reason for Rejection"
        description="Please provide a reason for rejecting this expense"
      >
        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Explain why this expense is being rejected..."
          className="w-full min-h-[120px] p-4 bg-[#F8F8F8] border-2 border-[#E8E8E8] rounded-xl text-[15px] placeholder:text-[#B9B9C3] focus:border-[#EA5455] focus:outline-none transition-colors resize-none"
          autoFocus
        />

        <BottomSheetActions>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowRejectDialog(false);
                setRejectReason('');
              }}
              className="flex-1 h-[48px] bg-[#F3F2F7] text-[#5E5873] rounded-xl font-medium text-[15px] hover:bg-[#E8E7F0] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={loading || !rejectReason.trim()}
              className="flex-1 h-[48px] bg-[#EA5455] text-white rounded-xl font-semibold text-[15px] hover:bg-[#DC4546] transition-colors disabled:opacity-50"
            >
              Confirm Reject
            </button>
          </div>
        </BottomSheetActions>
      </BottomSheet>
    </div>
  );
}
