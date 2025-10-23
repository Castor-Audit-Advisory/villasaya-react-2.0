import { useState, useEffect } from 'react';
import { Calendar, User, DollarSign, FileText, CheckCircle, Clock, XCircle, Paperclip, Image as ImageIcon } from 'lucide-react';
import { apiRequest } from '../../utils/api';

interface ExpenseDetailCardProps {
  expense: {
    id: string;
    amount: number;
    category: string;
    description: string;
    date: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    approver?: string;
  };
  onClose?: () => void;
}

export function ExpenseDetailCard({ expense, onClose }: ExpenseDetailCardProps) {
  const [files, setFiles] = useState<any[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  useEffect(() => {
    loadFiles();
  }, [expense.id]);

  const loadFiles = async () => {
    try {
      setLoadingFiles(true);
      const { files: expenseFiles } = await apiRequest(`/expenses/${expense.id}/files`);
      setFiles(expenseFiles || []);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoadingFiles(false);
    }
  };

  const statusConfig = {
    pending: {
      bg: 'bg-orange-50',
      text: 'text-orange-600',
      icon: Clock,
      label: 'Under Review',
    },
    approved: {
      bg: 'bg-green-50',
      text: 'text-green-600',
      icon: CheckCircle,
      label: 'Approved',
    },
    rejected: {
      bg: 'bg-red-50',
      text: 'text-red-600',
      icon: XCircle,
      label: 'Rejected',
    },
  };

  const config = statusConfig[expense.status];
  const StatusIcon = config.icon;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#E8E8E8]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[#1F1F1F] text-[18px] font-semibold">Expense Details</h3>
        <div className={`px-3 py-1.5 rounded-full ${config.bg} ${config.text} text-sm font-medium flex items-center gap-1.5`}>
          <StatusIcon className="w-3.5 h-3.5" />
          {config.label}
        </div>
      </div>

      {/* Amount */}
      <div className="mb-6 text-center py-4 bg-gradient-to-br from-[#7B5FEB]/10 to-[#6B4FDB]/10 rounded-xl">
        <div className="text-[#B9B9C3] text-sm mb-1">Total Amount</div>
        <div className="text-[#7B5FEB] text-[32px] font-bold">${expense.amount}</div>
      </div>

      {/* Details */}
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-[#F3F2F7] rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-[#7B5FEB]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[#B9B9C3] text-sm mb-1">Category</div>
            <div className="text-[#5E5873] text-[15px] font-medium capitalize">
              {expense.category || 'Uncategorized'}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-[#F3F2F7] rounded-lg flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5 text-[#7B5FEB]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[#B9B9C3] text-sm mb-1">Transaction Date</div>
            <div className="text-[#5E5873] text-[15px] font-medium">
              {new Date(expense.date || expense.created_at).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-[#F3F2F7] rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-[#7B5FEB]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[#B9B9C3] text-sm mb-1">Description</div>
            <div className="text-[#5E5873] text-[15px]">
              {expense.description || 'No description provided'}
            </div>
          </div>
        </div>

        {expense.approver && (
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-[#F3F2F7] rounded-lg flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-[#7B5FEB]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[#B9B9C3] text-sm mb-1">Reviewed By</div>
              <div className="text-[#5E5873] text-[15px] font-medium">
                {expense.approver}
              </div>
            </div>
          </div>
        )}

        {/* Attached Files */}
        {files.length > 0 && (
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-[#F3F2F7] rounded-lg flex items-center justify-center flex-shrink-0">
              <Paperclip className="w-5 h-5 text-[#7B5FEB]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[#B9B9C3] text-sm mb-2">Receipts ({files.length})</div>
              <div className="space-y-2">
                {files.map((file) => (
                  <a
                    key={file.id}
                    href={file.signedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 bg-[#F8F8F8] rounded-lg hover:bg-[#F3F2F7] transition-colors"
                  >
                    {file.fileType.startsWith('image/') ? (
                      <ImageIcon className="w-4 h-4 text-[#7B5FEB]" />
                    ) : (
                      <FileText className="w-4 h-4 text-[#7B5FEB]" />
                    )}
                    <span className="text-[#5E5873] text-sm truncate flex-1">
                      {file.fileName}
                    </span>
                    <span className="text-[#7B5FEB] text-sm font-medium">View</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {loadingFiles && (
          <div className="text-center py-2">
            <div className="text-[#B9B9C3] text-sm">Loading receipts...</div>
          </div>
        )}
      </div>

      {/* Action Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="w-full h-[48px] bg-[#F3F2F7] text-[#5E5873] rounded-xl font-medium text-[15px] mt-6 hover:bg-[#E8E7F0] transition-colors px-6 flex items-center justify-center"
        >
          Close
        </button>
      )}
    </div>
  );
}
