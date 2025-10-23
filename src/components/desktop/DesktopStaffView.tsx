import React, { useState, useEffect } from 'react';
import { Plus, Filter, Search } from 'lucide-react';
import { DataTable, Column } from './DataTable';
import { AddEmployeeModal } from './AddEmployeeModal';
import { apiRequest } from '../../utils/api';
import { StaffMember } from '../../types';

export const DesktopStaffView: React.FC = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const data = await apiRequest<StaffMember[]>('/staff');
      setStaff(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching staff:', error);
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  const columns: Column<StaffMember>[] = [
    {
      key: 'name',
      label: 'Employee Name',
      width: 250,
      sortable: true,
    },
    {
      key: 'employee_id',
      label: 'Employee ID',
      width: 130,
      sortable: true,
    },
    {
      key: 'villaId',
      label: 'Villa',
      width: 170,
      sortable: true,
    },
    {
      key: 'role',
      label: 'Role',
      width: 160,
      sortable: true,
      render: (item) => (
        <span style={{ textTransform: 'capitalize' }}>{item.role}</span>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      width: 200,
      sortable: true,
    },
    {
      key: 'status',
      label: 'Status',
      width: 110,
      sortable: true,
      render: (item) => (
        <span className="status-badge">
          {item.status === 'active' ? 'Permanent' : item.status}
        </span>
      ),
    },
  ];

  const renderAvatar = (item: StaffMember) => (
    <div className="staff-avatar">
      {item.name?.[0]?.toUpperCase() || 'S'}
    </div>
  );

  const filteredStaff = Array.isArray(staff) 
    ? staff.filter((s) => s.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const handleAddEmployee = (data: any) => {
    console.log('Adding employee:', data);
    fetchStaff();
  };

  const handleFilter = () => {
    alert('Filter functionality will be implemented');
  };

  return (
    <div className="desktop-staff-view">
      <div className="staff-content">
        <div className="staff-toolbar">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search anything here..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="toolbar-actions">
            <button className="filter-btn" onClick={handleFilter}>
              <Filter size={20} />
              <span>Filter</span>
            </button>
            <button className="add-btn" onClick={() => setIsAddModalOpen(true)}>
              <Plus size={20} />
              <span>Add New Employee</span>
            </button>
          </div>
        </div>

        <div className="staff-table-container">
          {loading ? (
            <div className="loading-state">Loading staff...</div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredStaff}
              renderAvatar={renderAvatar}
              tableId="staff-table"
              onView={(item) => console.log('View', item)}
              onEdit={(item) => console.log('Edit', item)}
              onDelete={(item) => console.log('Delete', item)}
            />
          )}
        </div>
      </div>

      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddEmployee}
      />

      <style>{`
        .desktop-staff-view {
          width: 100%;
          height: 100%;
        }

        .staff-content {
          padding: var(--desktop-gap-lg) 20px 0 20px;
        }

        .staff-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--desktop-gap-lg);
          margin-bottom: var(--desktop-gap-2xl);
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px var(--desktop-gap-lg);
          width: 330px;
          height: 38px;
          background: var(--desktop-white-500);
          border: 1px solid var(--desktop-gray-10);
          border-radius: var(--desktop-radius-lg);
        }

        .search-box input {
          flex: 1;
          border: none;
          outline: none;
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-body-1);
          font-weight: var(--desktop-weight-light);
          color: var(--desktop-dark-500);
          background: transparent;
        }

        .search-box input::placeholder {
          color: var(--desktop-dark-20);
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

        .add-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: var(--desktop-gap-lg);
          height: 38px;
          background: var(--desktop-primary-500);
          border: none;
          border-radius: var(--desktop-radius-lg);
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-body-1);
          font-weight: var(--desktop-weight-light);
          color: var(--desktop-white-500);
          cursor: pointer;
          transition: all 0.2s;
        }

        .add-btn:hover {
          background: var(--desktop-primary-400);
        }

        .staff-table-container {
          background: var(--desktop-gray-5);
          border: none;
          border-radius: var(--desktop-radius-lg);
          padding: var(--desktop-gap-lg);
        }

        .staff-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--desktop-primary-500);
          color: var(--desktop-white-500);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: var(--desktop-weight-semibold);
          font-size: var(--desktop-body-2);
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 3px 8px;
          background: var(--desktop-primary-10);
          color: var(--desktop-primary-500);
          border-radius: var(--desktop-radius-sm);
          font-size: var(--desktop-caption);
          font-weight: var(--desktop-weight-light);
          line-height: 18px;
          text-transform: capitalize;
        }

        .loading-state {
          padding: 40px;
          text-align: center;
          color: var(--desktop-gray-500);
          font-family: var(--desktop-font-family);
        }
      `}</style>
    </div>
  );
};
