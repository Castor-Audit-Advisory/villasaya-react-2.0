import { useState, useEffect } from 'react';
import { ChevronLeft, Calendar as CalendarIcon, FileText, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { apiRequest } from '../../utils/api';
import { toast } from 'sonner';
import { MobileCard, MobileButton, MobileInput } from '../mobile';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface MobileLeaveRequestProps {
  villaId: string;
  onBack?: () => void;
}

export function MobileLeaveRequest({ villaId, onBack }: MobileLeaveRequestProps) {
  const [view, setView] = useState<'list' | 'create'>('list');
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [formData, setFormData] = useState({
    type: 'vacation',
    startDate: '',
    endDate: '',
    reason: '',
  });

  useEffect(() => {
    loadLeaves();
  }, [villaId]);

  const loadLeaves = async () => {
    try {
      setLoading(true);
      const { leaves: fetchedLeaves } = await apiRequest(`/staff/leave?villaId=${villaId}`);
      setLeaves(fetchedLeaves || []);
    } catch (error: any) {
      console.error('Error loading leaves:', error);
      toast.error('Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.startDate || !formData.endDate) {
      toast.error('Please select start and end dates');
      return;
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      toast.error('End date must be after start date');
      return;
    }

    try {
      setSubmitting(true);
      await apiRequest('/staff/leave', {
        method: 'POST',
        body: JSON.stringify({
          villaId,
          ...formData,
        }),
      });

      toast.success('Leave request submitted!');
      setFormData({
        type: 'vacation',
        startDate: '',
        endDate: '',
        reason: '',
      });
      setView('list');
      loadLeaves();
    } catch (error: any) {
      console.error('Error submitting leave request:', error);
      toast.error(error.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (leaveId: string) => {
    if (!confirm('Cancel this leave request?')) return;

    try {
      await apiRequest(`/staff/leave/${leaveId}`, {
        method: 'DELETE',
      });
      toast.success('Leave request cancelled');
      loadLeaves();
    } catch (error: any) {
      console.error('Error cancelling leave:', error);
      toast.error(error.message || 'Failed to cancel request');
    }
  };

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-[#28C76F]" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-[#EA5455]" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-[#B9B9C3]" />;
      default:
        return <Clock className="w-5 h-5 text-[#FF9F43]" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-[#28C76F]/10 text-[#28C76F]';
      case 'rejected':
        return 'bg-[#EA5455]/10 text-[#EA5455]';
      case 'cancelled':
        return 'bg-[#B9B9C3]/10 text-[#B9B9C3]';
      default:
        return 'bg-[#FF9F43]/10 text-[#FF9F43]';
    }
  };

  const filteredLeaves = leaves.filter((leave) => {
    if (activeFilter === 'all') return true;
    return leave.status === activeFilter;
  });

  const leaveCounts = {
    all: leaves.length,
    pending: leaves.filter((l) => l.status === 'pending').length,
    approved: leaves.filter((l) => l.status === 'approved').length,
    rejected: leaves.filter((l) => l.status === 'rejected').length,
  };

  if (view === 'create') {
    return (
      <div className="min-h-dvh bg-[#F8F8F8] pb-[calc(env(safe-area-inset-bottom)+2rem)]">
        {/* Header */}
        <div className="bg-white px-6 sm:px-8 py-4 pt-[calc(1rem+env(safe-area-inset-top))] flex items-center gap-4 border-b border-[#E8E8E8]">
          <button
            onClick={() => setView('list')}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
          >
            <ChevronLeft className="w-6 h-6 text-[#5E5873]" />
          </button>
          <h1 className="text-[#1F1F1F] text-[18px] font-semibold">New Leave Request</h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 pb-24 space-y-4">
          <MobileCard padding="lg">
            <div className="space-y-4">
              {/* Leave Type */}
              <div>
                <label className="text-[#5E5873] text-[14px] font-medium block mb-2">
                  Leave Type
                </label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger className="mobile-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vacation">Vacation</SelectItem>
                    <SelectItem value="sick">Sick Leave</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Start Date */}
              <MobileInput
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />

              {/* End Date */}
              <MobileInput
                label="End Date"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />

              {/* Days Calculation */}
              {formData.startDate && formData.endDate && (
                <div className="p-3 bg-[#7B5FEB]/10 rounded-xl">
                  <p className="text-[#7B5FEB] text-[14px] font-medium">
                    Total: {calculateDays()} {calculateDays() === 1 ? 'day' : 'days'}
                  </p>
                </div>
              )}

              {/* Reason */}
              <div>
                <label className="text-[#5E5873] text-[14px] font-medium block mb-2">
                  Reason
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Provide a reason for your leave request..."
                  className="mobile-input min-h-[100px] resize-none"
                  required
                />
              </div>
            </div>
          </MobileCard>

          <MobileButton type="submit" variant="primary" disabled={submitting}>
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </span>
            ) : (
              'Submit Request'
            )}
          </MobileButton>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#F8F8F8] pb-[calc(env(safe-area-inset-bottom)+2rem)]">
      {/* Header */}
      <div className="bg-white px-6 sm:px-8 py-4 pt-[calc(1rem+env(safe-area-inset-top))] flex items-center gap-4 border-b border-[#E8E8E8]">
        {onBack && (
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
          >
            <ChevronLeft className="w-6 h-6 text-[#5E5873]" />
          </button>
        )}
        <h1 className="text-[#1F1F1F] text-[18px] font-semibold flex-1">Leave Requests</h1>
        <button
          onClick={() => setView('create')}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-primary text-white"
        >
          <CalendarIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 sm:p-8 pb-24">
        {/* Stats */}
        <MobileCard padding="md" className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 text-center">
              <p className="text-[#B9B9C3] text-sm mb-1">Total</p>
              <p className="text-[#1F1F1F] text-[20px] font-bold">{leaveCounts.all}</p>
            </div>
            <div className="w-px h-12 bg-[#E8E8E8]"></div>
            <div className="flex-1 text-center">
              <p className="text-[#B9B9C3] text-sm mb-1">Pending</p>
              <p className="text-[#FF9F43] text-[20px] font-bold">{leaveCounts.pending}</p>
            </div>
            <div className="w-px h-12 bg-[#E8E8E8]"></div>
            <div className="flex-1 text-center">
              <p className="text-[#B9B9C3] text-sm mb-1">Approved</p>
              <p className="text-[#28C76F] text-[20px] font-bold">{leaveCounts.approved}</p>
            </div>
          </div>
        </MobileCard>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 h-[32px] rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeFilter === filter
                  ? 'bg-[#7B5FEB] text-white'
                  : 'bg-white text-[#6E6B7B] border border-[#E8E8E8]'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)} ({leaveCounts[filter]})
            </button>
          ))}
        </div>

        {/* Leave List */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#7B5FEB] mx-auto" />
          </div>
        ) : filteredLeaves.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-[#F3F2F7] rounded-3xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-[#7B5FEB]" />
            </div>
            <h3 className="text-[#1F1F1F] text-[18px] font-semibold mb-2">
              No Leave Requests
            </h3>
            <p className="text-[#B9B9C3] text-[14px] mb-6">
              {activeFilter === 'all'
                ? "You haven't submitted any leave requests yet"
                : `No ${activeFilter} requests`}
            </p>
            <button
              onClick={() => setView('create')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-primary text-white rounded-full font-medium"
            >
              <CalendarIcon className="w-5 h-5" />
              Request Leave
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLeaves.map((leave) => (
              <MobileCard key={leave.id} padding="md">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 bg-[#F3F2F7] rounded-xl flex items-center justify-center flex-shrink-0">
                    {getStatusIcon(leave.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-[#1F1F1F] text-[16px] font-semibold capitalize">
                        {leave.type} Leave
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(leave.status)}`}>
                        {leave.status}
                      </span>
                    </div>
                    <p className="text-[#5E5873] text-sm">
                      {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                    </p>
                    <p className="text-[#B9B9C3] text-sm mt-1">
                      {leave.days} {leave.days === 1 ? 'day' : 'days'}
                    </p>
                  </div>
                </div>

                {leave.reason && (
                  <p className="text-[#5E5873] text-sm mb-3 bg-[#F8F8F8] p-3 rounded-lg">
                    {leave.reason}
                  </p>
                )}

                {leave.status === 'rejected' && leave.rejectionReason && (
                  <div className="p-3 bg-[#EA5455]/10 rounded-lg mb-3">
                    <p className="text-[#EA5455] text-sm font-medium mb-1">Rejection Reason:</p>
                    <p className="text-[#EA5455] text-sm">{leave.rejectionReason}</p>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-[#B9B9C3]">
                  <span>Submitted {formatDate(leave.createdAt)}</span>
                  {leave.status === 'pending' && (
                    <button
                      onClick={() => handleCancel(leave.id)}
                      className="text-[#EA5455] font-medium hover:underline"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </MobileCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
