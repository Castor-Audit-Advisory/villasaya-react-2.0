import { useState } from 'react';
import { Mail, Phone, MapPin, Calendar, Clock, LogIn, LogOut } from 'lucide-react';
import { PageHeader } from '../shared/PageHeader';
import { apiRequest } from '../../utils/api';
import { toast } from 'sonner';

interface MobileStaffDetailProps {
  staff: any;
  onBack: () => void;
  onUpdate: () => void;
  onNavigate?: (tab: string) => void;
}

export function MobileStaffDetail({ staff, onBack, onUpdate, onNavigate }: MobileStaffDetailProps) {
  const [loading, setLoading] = useState(false);

  const handleClockIn = async () => {
    setLoading(true);
    try {
      await apiRequest('/staff/clock', {
        method: 'POST',
        body: JSON.stringify({ 
          villaId: staff.villaId,
          action: 'in',
          location: null
        }),
      });
      toast.success('Clocked in successfully!');
      onUpdate();
    } catch (error) {
      console.error('Error clocking in:', error);
      toast.error('Failed to clock in');
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    setLoading(true);
    try {
      await apiRequest('/staff/clock', {
        method: 'POST',
        body: JSON.stringify({ 
          villaId: staff.villaId,
          action: 'out',
          location: null
        }),
      });
      toast.success('Clocked out successfully!');
      onUpdate();
    } catch (error) {
      console.error('Error clocking out:', error);
      toast.error('Failed to clock out');
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    active: { color: 'bg-[#28C76F]', text: 'text-[#28C76F]', label: 'Active' },
    on_leave: { color: 'bg-[#FF9F43]', text: 'text-[#FF9F43]', label: 'On Leave' },
    clocked_in: { color: 'bg-[#7B5FEB]', text: 'text-[#7B5FEB]', label: 'Clocked In' },
    clocked_out: { color: 'bg-[#B9B9C3]', text: 'text-[#B9B9C3]', label: 'Clocked Out' },
  };

  const status = statusConfig[staff.status || 'active'];

  return (
    <div className="min-h-dvh bg-[#F8F8F8] pb-[calc(env(safe-area-inset-bottom)+2rem)]">
      <PageHeader
        title="Staff Details"
        variant="white"
        onBack={onBack}
        className="mb-4"
      />

      {/* Content */}
      <div className="px-6 sm:px-8 pb-24">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-6 mb-3 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-[#7B5FEB] to-[#6B4FDB] rounded-full flex items-center justify-center text-white text-[36px] font-semibold mx-auto mb-4">
            {staff.name.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-[#1F1F1F] text-[20px] font-semibold mb-1">{staff.name}</h2>
          <p className="text-[#6E6B7B] text-[15px] capitalize mb-3">{staff.role}</p>
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${status.color}/10 ${status.text} text-sm font-medium`}>
            <div className={`w-2 h-2 rounded-full ${status.color}`}></div>
            {status.label}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-2xl p-4 mb-3">
          <h3 className="text-[#1F1F1F] text-[16px] font-semibold mb-4">Contact Information</h3>
          <div className="space-y-4">
            {staff.email && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#7B5FEB]/10 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-[#7B5FEB]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[#B9B9C3] text-sm">Email</div>
                  <div className="text-[#5E5873] text-[15px] truncate">{staff.email}</div>
                </div>
              </div>
            )}
            {staff.phone && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#28C76F]/10 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-[#28C76F]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[#B9B9C3] text-sm">Phone</div>
                  <div className="text-[#5E5873] text-[15px]">{staff.phone}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Clock In/Out Actions */}
        {staff.status === 'clocked_out' && (
          <button
            onClick={handleClockIn}
            disabled={loading}
            className="w-full h-[56px] bg-gradient-to-r from-[#28C76F] to-[#20B561] text-white rounded-full font-semibold text-[16px] shadow-lg shadow-[#28C76F]/30 active:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-50 px-6"
          >
            <LogIn className="w-5 h-5" />
            Clock In
          </button>
        )}
        {staff.status === 'clocked_in' && (
          <button
            onClick={handleClockOut}
            disabled={loading}
            className="w-full h-[56px] bg-gradient-to-r from-[#EA5455] to-[#DC4546] text-white rounded-full font-semibold text-[16px] shadow-lg shadow-[#EA5455]/30 active:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-50 px-6"
          >
            <LogOut className="w-5 h-5" />
            Clock Out
          </button>
        )}
      </div>
    </div>
  );
}
