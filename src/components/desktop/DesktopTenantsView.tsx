import React, { useState, useEffect } from 'react';
import { Plus, Filter, Search, Phone, Mail } from 'lucide-react';
import { DataTable, Column } from './DataTable';
import { apiRequest } from '../../utils/api';

interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  villaName: string;
  leaseStart: string;
  leaseEnd: string;
  monthlyRent: number;
  status: 'active' | 'expiring' | 'expired';
}

export const DesktopTenantsView: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const data = await apiRequest<Tenant[]>('/tenants');
      setTenants(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns: Column<Tenant>[] = [
    { key: 'name', label: 'Tenant Name', width: 180, sortable: true },
    {
      key: 'email',
      label: 'Contact',
      width: 220,
      render: (item) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Mail size={12} style={{ color: 'var(--desktop-gray-500)' }} />
            <span style={{ fontSize: '13px' }}>{item.email}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Phone size={12} style={{ color: 'var(--desktop-gray-500)' }} />
            <span style={{ fontSize: '13px' }}>{item.phone}</span>
          </div>
        </div>
      ),
    },
    { key: 'villaName', label: 'Villa', width: 160, sortable: true },
    {
      key: 'leaseStart',
      label: 'Lease Period',
      width: 200,
      sortable: true,
      render: (item) => (
        <div>
          {new Date(item.leaseStart).toLocaleDateString()} -{' '}
          {new Date(item.leaseEnd).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: 'monthlyRent',
      label: 'Monthly Rent',
      width: 140,
      sortable: true,
      render: (item) => `$${item.monthlyRent.toLocaleString()}`,
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

  const filteredTenants = tenants.filter(
    (t) =>
      t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.villaName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderAvatar = (item: Tenant) => (
    <div className="tenant-avatar">{item.name?.[0]?.toUpperCase() || 'T'}</div>
  );

  const handleAddTenant = () => {
    alert('Add New Tenant functionality will be implemented');
  };

  const handleFilter = () => {
    alert('Filter functionality will be implemented');
  };

  return (
    <div className="desktop-tenants-view">
      <div className="tenants-content">
        <div className="tenants-toolbar">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search tenants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="toolbar-actions">
            <button className="filter-btn" onClick={handleFilter}>
              <Filter size={20} />
              <span>Filter</span>
            </button>
            <button className="add-btn" onClick={handleAddTenant}>
              <Plus size={20} />
              <span>Add New Tenant</span>
            </button>
          </div>
        </div>

        <div className="tenants-table-container">
          {loading ? (
            <div className="loading-state">Loading tenants...</div>
          ) : (
            <DataTable
              tableId="tenants-table"
              columns={columns}
              data={filteredTenants}
              renderAvatar={renderAvatar}
              onView={(item) => console.log('View', item)}
              onEdit={(item) => console.log('Edit', item)}
              onDelete={(item) => console.log('Delete', item)}
            />
          )}
        </div>
      </div>

      <style>{`
        .desktop-tenants-view {
          width: 100%;
          height: 100%;
        }

        .tenants-content {
          padding: 0 20px 20px 20px;
        }

        .tenants-toolbar {
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

        .tenants-table-container {
          background: var(--desktop-gray-5);
          border-radius: var(--desktop-radius-lg);
          overflow: hidden;
        }

        .loading-state {
          padding: 60px;
          text-align: center;
          color: var(--desktop-gray-500);
        }

        .tenant-avatar {
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

        .status-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: var(--desktop-radius-md);
          font-size: var(--desktop-caption);
          font-weight: var(--desktop-weight-semibold);
          text-transform: capitalize;
        }

        .status-active {
          background: #E8F5E9;
          color: #2E7D32;
        }

        .status-expiring {
          background: #FFF3E0;
          color: #F57C00;
        }

        .status-expired {
          background: #FFEBEE;
          color: #C62828;
        }
      `}</style>
    </div>
  );
};
