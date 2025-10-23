import { useState } from 'react';
import { Plus, Search, Users, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { MobileBottomNav } from '../mobile/MobileBottomNav';
import { MobileStaffCard } from './MobileStaffCard';
import { MobileStaffDetail } from './MobileStaffDetail';
import { toast } from 'sonner';
import { useStaff } from '../../hooks/useDataFetching';
import { PageHeader } from '../shared/PageHeader';
import { DataList } from '../shared/DataList';

interface MobileStaffListProps {
  villas: any[];
  onNavigate?: (view: string) => void;
  onShowClock?: () => void;
  onShowLeave?: () => void;
  villaId?: string;
  onStaffSelect?: (staff: any) => void;
}

export function MobileStaffList({ villas, onNavigate, onShowClock, onShowLeave, villaId, onStaffSelect }: MobileStaffListProps) {
  // Use custom hook for data fetching
  const {
    data: staff,
    isInitialLoad: loading,
    refresh: loadStaff
  } = useStaff();

  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState<'list' | 'detail'>('list');
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'on_leave'>('all');

  const handleStaffClick = (staffMember: any) => {
    setSelectedStaff(staffMember);
    setCurrentView('detail');
    onStaffSelect?.(staffMember);
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

  // Filter staff
  const filteredStaff = staff.filter((member) => {
    const matchesSearch =
      member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || member.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const staffCounts = {
    all: staff.length,
    active: staff.filter((s) => s.status === 'active' || s.status === 'clocked_in').length,
    on_leave: staff.filter((s) => s.status === 'on_leave').length,
  };

  if (currentView === 'detail' && selectedStaff) {
    return (
      <MobileStaffDetail
        staff={selectedStaff}
        onBack={() => {
          setCurrentView('list');
          setSelectedStaff(null);
        }}
        onUpdate={loadStaff}
        onNavigate={handleNavigateTab}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
        <div className="text-[#6E6B7B]">Loading staff...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8] pb-[100px]">
      {/* Header with Custom Stats and Actions */}
      <PageHeader
        title="Staff"
        subtitle="Manage your team here"
        className="relative"
      >
        {/* Custom Action Buttons (Leave & Clock) - positioned in top right */}
        <div className="absolute top-[16px] right-6 flex items-center gap-2">
          <button
            onClick={onShowLeave}
            className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            title="Leave Requests"
            aria-label="View leave requests"
          >
            <CalendarIcon className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={onShowClock}
            className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            title="Clock In/Out"
            aria-label="Clock in or out"
          >
            <Clock className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Stats Card (Custom horizontal layout) */}
        <div className="bg-white rounded-2xl p-4 shadow-lg mt-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-[#B9B9C3] text-sm mb-1">Total Staff</div>
              <div className="text-[#1F1F1F] text-[24px] font-semibold">{staffCounts.all}</div>
            </div>
            <div className="w-px h-12 bg-[#E8E8E8]"></div>
            <div className="flex-1 text-center">
              <div className="text-[#B9B9C3] text-sm mb-1">Active</div>
              <div className="text-[#28C76F] text-[24px] font-semibold">{staffCounts.active}</div>
            </div>
            <div className="w-px h-12 bg-[#E8E8E8]"></div>
            <div className="flex-1 text-right">
              <div className="text-[#B9B9C3] text-sm mb-1">On Leave</div>
              <div className="text-[#FF9F43] text-[24px] font-semibold">{staffCounts.on_leave}</div>
            </div>
          </div>
        </div>
      </PageHeader>

      {/* Search */}
      <div className="px-6 sm:px-8 py-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B9B9C3]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search staff..."
            className="w-full h-[48px] pl-12 pr-4 bg-white border-2 border-[#E8E8E8] rounded-xl text-[15px] placeholder:text-[#B9B9C3] focus:border-[#7B5FEB] focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-6 sm:px-8 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 h-[32px] rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeFilter === 'all'
                ? 'bg-[#7B5FEB] text-white'
                : 'bg-white text-[#6E6B7B] border border-[#E8E8E8]'
            }`}
          >
            All ({staffCounts.all})
          </button>
          <button
            onClick={() => setActiveFilter('active')}
            className={`px-4 h-[32px] rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeFilter === 'active'
                ? 'bg-[#28C76F] text-white'
                : 'bg-white text-[#6E6B7B] border border-[#E8E8E8]'
            }`}
          >
            Active ({staffCounts.active})
          </button>
          <button
            onClick={() => setActiveFilter('on_leave')}
            className={`px-4 h-[32px] rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeFilter === 'on_leave'
                ? 'bg-[#FF9F43] text-white'
                : 'bg-white text-[#6E6B7B] border border-[#E8E8E8]'
            }`}
          >
            On Leave ({staffCounts.on_leave})
          </button>
        </div>
      </div>

      {/* Staff List */}
      <div className="px-6 sm:px-8">
        <DataList
          data={filteredStaff}
          isLoading={false}
          error={null}
          renderItem={(member) => (
            <MobileStaffCard
              staff={member}
              onClick={() => handleStaffClick(member)}
            />
          )}
          keyExtractor={(member) => member.id}
          emptyState={{
            icon: <Users className="w-12 h-12 text-[#B9B9C3]" />,
            title: 'No staff members found',
            description: searchQuery 
              ? 'Try adjusting your search or filters'
              : 'Add your first staff member to get started'
          }}
        />
      </div>

      {/* Bottom Navigation */}
      <MobileBottomNav activeTab="more" onTabChange={handleNavigateTab} />
    </div>
  );
}
