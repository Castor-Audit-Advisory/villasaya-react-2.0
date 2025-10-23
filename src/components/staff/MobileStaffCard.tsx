import { User, Phone, Mail, Clock } from 'lucide-react';

interface MobileStaffCardProps {
  staff: {
    id: string;
    name: string;
    role: string;
    email?: string;
    phone?: string;
    status?: 'active' | 'inactive' | 'on_leave' | 'clocked_in' | 'clocked_out';
  };
  onClick?: () => void;
}

export function MobileStaffCard({ staff, onClick }: MobileStaffCardProps) {
  const statusConfig = {
    active: { color: 'bg-[#28C76F]', label: 'Active' },
    inactive: { color: 'bg-[#EA5455]', label: 'Inactive' },
    on_leave: { color: 'bg-[#FF9F43]', label: 'On Leave' },
    clocked_in: { color: 'bg-[#7B5FEB]', label: 'Clocked In' },
    clocked_out: { color: 'bg-[#B9B9C3]', label: 'Clocked Out' },
  };

  const status = statusConfig[staff.status || 'active'];

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl p-4 mb-3 active:scale-[0.98] transition-transform cursor-pointer"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 bg-gradient-to-br from-[#7B5FEB] to-[#6B4FDB] rounded-full flex items-center justify-center text-white text-[18px] font-semibold">
          {staff.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[#1F1F1F] text-[15px] font-semibold">{staff.name}</h3>
          <p className="text-[#B9B9C3] text-sm capitalize">{staff.role}</p>
        </div>
        <div className={`w-2 h-2 rounded-full ${status.color}`}></div>
      </div>

      <div className="flex items-center gap-4 text-[#6E6B7B] text-sm">
        {staff.email && (
          <div className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5" />
            <span className="truncate">{staff.email}</span>
          </div>
        )}
        {staff.phone && (
          <div className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5" />
            <span>{staff.phone}</span>
          </div>
        )}
      </div>
    </div>
  );
}
