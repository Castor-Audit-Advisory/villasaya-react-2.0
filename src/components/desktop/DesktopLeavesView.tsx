import React, { useState, useEffect, useRef } from 'react';
import { Filter, Calendar } from 'lucide-react';
import { DataTable, Column } from './DataTable';
import { apiRequest } from '../../utils/api';
import { useApp } from '../../contexts/AppContext';

interface LeaveRequest {
  id: string;
  staffName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
}

export const DesktopLeavesView: React.FC = () => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { selectedVilla, villas, loadVillas, villasLoading } = useApp();
  const [activeVillaId, setActiveVillaId] = useState<string | null>(null);
  const profileCache = useRef(new Map<string, { id: string; name: string; email?: string }>());

  useEffect(() => {
    if (!villasLoading && villas.length === 0) {
      void loadVillas();
    }
  }, [loadVillas, villas.length, villasLoading]);

  useEffect(() => {
    if (selectedVilla?.id) {
      setActiveVillaId(selectedVilla.id);
      return;
    }

    if (villas.length > 0) {
      setActiveVillaId(villas[0].id);
    }
  }, [selectedVilla, villas]);

  useEffect(() => {
    const targetVillaId = activeVillaId || null;
    void fetchLeaves(targetVillaId);
  }, [activeVillaId]);

  const fetchLeaves = async (villaId: string | null) => {
    setLoading(true);
    try {
      const endpoint = villaId ? `/villas/${villaId}/leave` : '/staff/leave';
      const response = await apiRequest<{ leaves?: any[] }>(endpoint);
      const rawLeaves = Array.isArray(response) ? response : response?.leaves || [];

      const userIds = Array.from(new Set(rawLeaves.map((leave: any) => leave?.userId).filter(Boolean)));

      await Promise.all(
        userIds.map(async (userId) => {
          if (profileCache.current.has(userId)) {
            return;
          }

          try {
            const profile = await apiRequest<{ id: string; name: string; email?: string }>(`/users/${userId}`);
            if (profile?.id) {
              profileCache.current.set(userId, profile);
            }
          } catch (error) {
            console.error('Failed to load leave requester profile', userId, error);
            profileCache.current.set(userId, { id: userId, name: 'Team Member' });
          }
        }),
      );

      const mappedLeaves: LeaveRequest[] = rawLeaves.map((leave: any) => {
        const profile = leave?.userId ? profileCache.current.get(leave.userId) : null;
        const startDate = leave?.startDate || leave?.createdAt || new Date().toISOString();
        const endDate = leave?.endDate || startDate;
        const days = typeof leave?.days === 'number'
          ? leave.days
          : Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1);

        return {
          id: leave?.id || Math.random().toString(36).slice(2),
          staffName: profile?.name || 'Team Member',
          leaveType: (leave?.type || 'Vacation') as string,
          startDate,
          endDate,
          days,
          reason: leave?.reason || '—',
          status: (leave?.status || 'pending') as LeaveRequest['status'],
          submittedDate: leave?.createdAt || startDate,
        };
      });

      setLeaves(mappedLeaves);
    } catch (error) {
      console.error('Error fetching leaves:', error);
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await apiRequest(`/staff/leave/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'approved' }),
      });
      void fetchLeaves(activeVillaId);
    } catch (error) {
      console.error('Error approving leave:', error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await apiRequest(`/staff/leave/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'rejected' }),
      });
      void fetchLeaves(activeVillaId);
    } catch (error) {
      console.error('Error rejecting leave:', error);
    }
  };

  const columns: Column<LeaveRequest>[] = [
    { key: 'staffName', label: 'Employee', width: 180, sortable: true },
    {
      key: 'leaveType',
      label: 'Leave Type',
      width: 140,
      sortable: true,
      render: (item) => (
        <span className={`leave-type-badge ${item.leaveType.toLowerCase()}`}>
          {item.leaveType}
        </span>
      ),
    },
    {
      key: 'startDate',
      label: 'Duration',
      width: 220,
      sortable: true,
      render: (item) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={12} style={{ color: 'var(--desktop-gray-500)' }} />
            <span style={{ fontSize: '13px' }}>
              {new Date(item.startDate).toLocaleDateString()} -{' '}
              {new Date(item.endDate).toLocaleDateString()}
            </span>
          </div>
          <span
            style={{
              fontSize: '12px',
              color: 'var(--desktop-gray-500)',
            }}
          >
            {item.days} {item.days === 1 ? 'day' : 'days'}
          </span>
        </div>
      ),
    },
    {
      key: 'reason',
      label: 'Reason',
      width: 200,
      render: (item) => (
        <div
          style={{
            maxWidth: '200px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {item.reason}
        </div>
      ),
    },
    {
      key: 'submittedDate',
      label: 'Submitted',
      width: 130,
      sortable: true,
      render: (item) => new Date(item.submittedDate).toLocaleDateString(),
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
  ];

  const filteredLeaves =
    statusFilter === 'all'
      ? leaves
      : leaves.filter((l) => l.status === statusFilter);

  const renderAvatar = (item: LeaveRequest) => (
    <div className="leave-avatar">
      {item.staffName?.[0]?.toUpperCase() || 'L'}
    </div>
  );

  const handleMoreFilters = () => {
    alert('More Filters functionality will be implemented');
  };

  return (
    <div className="desktop-leaves-view">
      <div className="leaves-content">
        <div className="leaves-toolbar">
          <div className="filter-tabs">
            <button
              className={`filter-tab ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              All Requests
            </button>
            <button
              className={`filter-tab ${
                statusFilter === 'pending' ? 'active' : ''
              }`}
              onClick={() => setStatusFilter('pending')}
            >
              Pending
            </button>
            <button
              className={`filter-tab ${
                statusFilter === 'approved' ? 'active' : ''
              }`}
              onClick={() => setStatusFilter('approved')}
            >
              Approved
            </button>
            <button
              className={`filter-tab ${
                statusFilter === 'rejected' ? 'active' : ''
              }`}
              onClick={() => setStatusFilter('rejected')}
            >
              Rejected
            </button>
          </div>

          <div className="toolbar-actions">
            <button className="filter-btn" onClick={handleMoreFilters}>
              <Filter size={20} />
              <span>More Filters</span>
            </button>
          </div>
        </div>

        <div className="leaves-table-container">
          {loading ? (
            <div className="loading-state">Loading leave requests...</div>
          ) : (
            <DataTable
              tableId="leaves-table"
              columns={columns}
              data={filteredLeaves}
              renderAvatar={renderAvatar}
              onView={(item) => console.log('View', item)}
              onEdit={(item) => console.log('Edit', item)}
              onDelete={(item) => console.log('Delete', item)}
            />
          )}
        </div>
      </div>

      <style>{`
        .desktop-leaves-view {
          width: 100%;
          height: 100%;
        }

        .leaves-content {
          padding: 0 20px 20px 20px;
        }

        .leaves-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--desktop-gap-lg);
          margin-bottom: var(--desktop-gap-2xl);
        }

        .filter-tabs {
          display: flex;
          gap: var(--desktop-gap-md);
          padding: var(--desktop-gap-xs);
          background: var(--desktop-gray-5);
          border-radius: var(--desktop-radius-lg);
        }

        .filter-tab {
          padding: 12px 20px;
          background: transparent;
          border: none;
          border-radius: var(--desktop-radius-md);
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-body-2);
          font-weight: var(--desktop-weight-light);
          color: var(--desktop-gray-500);
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-tab:hover {
          color: var(--desktop-dark-500);
        }

        .filter-tab.active {
          background: var(--desktop-white-500);
          color: var(--desktop-dark-500);
          font-weight: var(--desktop-weight-semibold);
          box-shadow: var(--desktop-shadow-sm);
        }

        .toolbar-actions {
          display: flex;
          gap: var(--desktop-gap-lg);
        }

        .filter-btn {
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

        .filter-btn:hover {
          border-color: var(--desktop-gray-500);
        }

        .leaves-table-container {
          background: var(--desktop-gray-5);
          border-radius: var(--desktop-radius-lg);
          overflow: hidden;
        }

        .loading-state {
          padding: 60px;
          text-align: center;
          color: var(--desktop-gray-500);
        }

        .leave-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--desktop-primary-500);
          color: var(--desktop-white-500);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: var(--desktop-weight-semibold);
        }

        .leave-type-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: var(--desktop-radius-md);
          font-size: var(--desktop-caption);
          font-weight: var(--desktop-weight-semibold);
          text-transform: capitalize;
        }

        .leave-type-badge.sick {
          background: #FFEBEE;
          color: #C62828;
        }

        .leave-type-badge.vacation {
          background: #E3F2FD;
          color: #1565C0;
        }

        .leave-type-badge.personal {
          background: #F3E5F5;
          color: #6A1B9A;
        }

        .status-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: var(--desktop-radius-md);
          font-size: var(--desktop-caption);
          font-weight: var(--desktop-weight-semibold);
          text-transform: capitalize;
        }

        .status-pending {
          background: #FFF3E0;
          color: #F57C00;
        }

        .status-approved {
          background: #E8F5E9;
          color: #2E7D32;
        }

        .status-rejected {
          background: #FFEBEE;
          color: #C62828;
        }
      `}</style>
    </div>
  );
};
