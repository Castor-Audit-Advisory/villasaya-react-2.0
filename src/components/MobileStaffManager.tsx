import { useState } from 'react';
import { MobileStaffList } from './staff/MobileStaffList';
import { MobileClockInOut } from './staff/MobileClockInOut';
import { MobileLeaveRequest } from './staff/MobileLeaveRequest';

interface MobileStaffManagerProps {
  villas: any[];
  onNavigate?: (view: string) => void;
}

export function MobileStaffManager({ villas, onNavigate }: MobileStaffManagerProps) {
  const [activeView, setActiveView] = useState<'list' | 'clock' | 'leave'>('list');
  const [selectedVilla] = useState(villas[0]?.id || null);

  if (activeView === 'clock' && selectedVilla) {
    return (
      <MobileClockInOut
        villaId={selectedVilla}
        onBack={() => setActiveView('list')}
      />
    );
  }

  if (activeView === 'leave' && selectedVilla) {
    return (
      <MobileLeaveRequest
        villaId={selectedVilla}
        onBack={() => setActiveView('list')}
      />
    );
  }

  return (
    <MobileStaffList
      villas={villas}
      onNavigate={onNavigate}
      onShowClock={() => setActiveView('clock')}
      onShowLeave={() => setActiveView('leave')}
      villaId={selectedVilla}
    />
  );
}
