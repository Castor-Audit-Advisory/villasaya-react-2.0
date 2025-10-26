import React, { useState, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, Download, Filter } from 'lucide-react';
import { DataTable, Column } from './DataTable';
import { apiRequest } from '../../utils/api';
import { useApp } from '../../contexts/AppContext';

type AttendanceStatus = 'present' | 'in-progress' | 'absent' | 'incomplete';

interface AttendanceRecord {
  id: string;
  staffName: string;
  date: string;
  clockIn: string;
  clockOut: string;
  totalHours: number;
  status: AttendanceStatus;
  location?: string;
}

interface ClockRecord {
  id: string;
  timestamp: string;
  action: 'in' | 'out';
  date?: string;
  location?: string | null;
  villaId?: string | null;
}

const createDeterministicId = (date: string, records: ClockRecord[]) => {
  if (!records.length) {
    return `attendance-${date}`;
  }

  const key = `${date}|${records
    .map((record) => `${record.action}:${record.timestamp}`)
    .join('|')}`;

  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }

  return `attendance-${hash.toString(36)}`;
};

const buildAttendanceRecord = (
  date: string,
  recordsForDate: ClockRecord[],
  staffName: string,
): AttendanceRecord => {
  const sortedRecords = [...recordsForDate].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  const sessions: Array<{ in: ClockRecord; out: ClockRecord }> = [];
  let pendingIn: ClockRecord | null = null;
  let hasUnpairedOut = false;
  let hasExtraIn = false;

  sortedRecords.forEach((record) => {
    if (record.action === 'in') {
      if (pendingIn) {
        hasExtraIn = true;
      }
      pendingIn = record;
      return;
    }

    if (pendingIn) {
      sessions.push({ in: pendingIn, out: record });
      pendingIn = null;
    } else {
      hasUnpairedOut = true;
    }
  });

  const totalMs = sessions.reduce((sum, session) => {
    const clockInTime = new Date(session.in.timestamp).getTime();
    const clockOutTime = new Date(session.out.timestamp).getTime();
    return sum + Math.max(0, clockOutTime - clockInTime);
  }, 0);

  const hasClockIn = sortedRecords.some((record) => record.action === 'in');
  const hasClockOut = sortedRecords.some((record) => record.action === 'out');

  let status: AttendanceStatus;
  if (!hasClockIn && !hasClockOut) {
    status = 'absent';
  } else if (!hasClockIn && hasClockOut) {
    status = 'incomplete';
  } else if (pendingIn) {
    status = 'in-progress';
  } else if (hasUnpairedOut || hasExtraIn) {
    status = 'incomplete';
  } else {
    status = 'present';
  }

  const firstClockIn = sortedRecords.find((record) => record.action === 'in');
  const lastClockOut = [...sortedRecords]
    .reverse()
    .find((record) => record.action === 'out');

  const hours = totalMs / (1000 * 60 * 60);
  const totalHours = Number.isFinite(hours) ? hours : 0;

  return {
    id: createDeterministicId(date, sortedRecords),
    staffName,
    date,
    clockIn: firstClockIn ? firstClockIn.timestamp : '',
    clockOut: lastClockOut ? lastClockOut.timestamp : '',
    totalHours,
    status,
    location: firstClockIn?.location ?? lastClockOut?.location ?? undefined,
  };
};

export const DesktopAttendanceView: React.FC = () => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const { currentUser, selectedVilla } = useApp();

  const staffDisplayName = useMemo(() => {
    if (currentUser?.name) {
      return currentUser.name;
    }
    if (currentUser?.email) {
      return currentUser.email.split('@')[0];
    }
    return 'Team Member';
  }, [currentUser]);

  useEffect(() => {
    setLoading(true);
    fetchAttendance();
  }, [selectedDate, selectedVilla?.id]);

  const fetchAttendance = async () => {
    try {
      const params = new URLSearchParams({
        startDate: selectedDate,
        endDate: selectedDate,
      });

      if (selectedVilla?.id) {
        params.set('villaId', selectedVilla.id);
      }

      const response = await apiRequest<{ clockRecords?: ClockRecord[] }>(
        `/staff/clock?${params.toString()}`
      );
      const clockRecords = Array.isArray(response)
        ? (response as unknown as ClockRecord[])
        : response?.clockRecords || [];

      const grouped = new Map<string, ClockRecord[]>();

      clockRecords.forEach((record) => {
        const recordDate = record.date || record.timestamp.split('T')[0];
        if (!grouped.has(recordDate)) {
          grouped.set(recordDate, []);
        }
        grouped.get(recordDate)!.push(record);
      });

      const records: AttendanceRecord[] = Array.from(grouped.entries()).map(
        ([date, recordsForDate]) =>
          buildAttendanceRecord(date, recordsForDate, staffDisplayName),
      );

      setAttendance(
        records.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        ),
      );
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    alert('Filter functionality will be implemented');
  };

  const handleExport = () => {
    alert('Export Report functionality will be implemented');
  };

  const columns: Column<AttendanceRecord>[] = [
    { key: 'staffName', label: 'Staff Name', width: 200, sortable: true },
    {
      key: 'clockIn',
      label: 'Clock In',
      width: 120,
      sortable: true,
      render: (item) => item.clockIn || '—',
    },
    {
      key: 'clockOut',
      label: 'Clock Out',
      width: 120,
      sortable: true,
      render: (item) => item.clockOut || '—',
    },
    {
      key: 'totalHours',
      label: 'Total Hours',
      width: 130,
      sortable: true,
      render: (item) =>
        item.totalHours ? `${item.totalHours.toFixed(1)}h` : '—',
    },
    {
      key: 'status',
      label: 'Status',
      width: 110,
      sortable: true,
      render: (item) => (
        <span className={`status-badge status-${item.status}`}>
          {item.status}
        </span>
      ),
    },
    {
      key: 'location',
      label: 'Location',
      width: 160,
      sortable: true,
      render: (item) => item.location || '—',
    },
  ];

  return (
    <div className="desktop-attendance-view">
      <div className="attendance-content">
        <div className="attendance-toolbar">
          <div className="date-picker">
            <CalendarIcon size={20} />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div className="toolbar-actions">
            <button className="filter-btn" onClick={handleFilter}>
              <Filter size={20} />
              <span>Filter</span>
            </button>
            <button className="export-btn" onClick={handleExport}>
              <Download size={20} />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        <div className="attendance-table-container">
          {loading ? (
            <div className="loading-state">Loading attendance...</div>
          ) : (
            <DataTable
              tableId="attendance-table"
              columns={columns}
              data={attendance}
              onView={(item) => console.log('View', item)}
              onEdit={(item) => console.log('Edit', item)}
            />
          )}
        </div>
      </div>

      <style>{`
        .desktop-attendance-view {
          width: 100%;
          height: 100%;
        }

        .attendance-content {
          padding: 0 20px 20px 20px;
        }

        .attendance-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--desktop-gap-lg);
          margin-bottom: var(--desktop-gap-2xl);
        }

        .date-picker {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px var(--desktop-gap-lg);
          height: 38px;
          background: var(--desktop-white-500);
          border: 1px solid var(--desktop-gray-10);
          border-radius: var(--desktop-radius-lg);
        }

        .date-picker input {
          border: none;
          outline: none;
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-body-1);
          font-weight: var(--desktop-weight-light);
          color: var(--desktop-dark-500);
          background: transparent;
          cursor: pointer;
        }

        .toolbar-actions {
          display: flex;
          gap: var(--desktop-gap-lg);
        }

        .filter-btn,
        .export-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: var(--desktop-gap-lg);
          height: 38px;
          background: var(--desktop-white-500);
          border: 1px solid var(--desktop-gray-20);
          border-radius: var(--desktop-radius-lg);
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-body-1);
          font-weight: var(--desktop-weight-light);
          color: var(--desktop-dark-500);
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-btn:hover,
        .export-btn:hover {
          border-color: var(--desktop-gray-500);
        }

        .attendance-table-container {
          background: var(--desktop-gray-5);
          border-radius: var(--desktop-radius-lg);
          overflow: hidden;
        }

        .loading-state {
          padding: 60px;
          text-align: center;
          color: var(--desktop-gray-500);
        }

        .status-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: var(--desktop-radius-md);
          font-size: var(--desktop-caption);
          font-weight: var(--desktop-weight-semibold);
          text-transform: capitalize;
        }

        .status-present {
          background: #E8F5E9;
          color: #2E7D32;
        }

        .status-in-progress {
          background: #FFF8E1;
          color: #F9A825;
        }

        .status-absent {
          background: #FFEBEE;
          color: #C62828;
        }

        .status-incomplete {
          background: #E3F2FD;
          color: #1565C0;
        }
      `}</style>
    </div>
  );
};
