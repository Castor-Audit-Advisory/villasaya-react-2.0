import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Download, Filter } from 'lucide-react';
import { DataTable, Column } from './DataTable';
import { apiRequest } from '../../utils/api';

interface AttendanceRecord {
  id: string;
  staffName: string;
  date: string;
  clockIn: string;
  clockOut: string;
  totalHours: number;
  status: 'present' | 'late' | 'absent' | 'leave';
  location?: string;
}

export const DesktopAttendanceView: React.FC = () => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  const fetchAttendance = async () => {
    try {
      const data = await apiRequest<AttendanceRecord[]>(
        `/attendance?date=${selectedDate}`
      );
      setAttendance(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching attendance:', error);
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

        .status-late {
          background: #FFF3E0;
          color: #F57C00;
        }

        .status-absent {
          background: #FFEBEE;
          color: #C62828;
        }

        .status-leave {
          background: var(--desktop-primary-5);
          color: var(--desktop-primary-500);
        }
      `}</style>
    </div>
  );
};
