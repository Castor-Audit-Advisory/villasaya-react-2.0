import React, { useState, useEffect } from 'react';
import { Plus, Filter, Search } from 'lucide-react';
import { DataTable, Column } from './DataTable';
import { apiRequest } from '../../utils/api';

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedBy: string;
  villa?: string;
}

export const DesktopExpensesView: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const data = await apiRequest<any[]>('/expenses');
      const formatted = (data || []).map((exp) => ({
        id: exp.id,
        description: exp.description || 'Expense',
        amount: exp.amount || 0,
        category: exp.category || 'Other',
        date: exp.date || new Date().toISOString(),
        status: exp.status || 'pending',
        submittedBy: exp.submittedBy || 'Unknown',
        villa: exp.villaId || '',
      }));
      setExpenses(Array.isArray(formatted) ? formatted : []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns: Column<Expense>[] = [
    {
      key: 'description',
      label: 'Description',
      width: 250,
      sortable: true,
    },
    {
      key: 'category',
      label: 'Category',
      width: 150,
      sortable: true,
      render: (item) => (
        <span style={{ textTransform: 'capitalize' }}>{item.category}</span>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      width: 130,
      sortable: true,
      render: (item) => <span>${item.amount.toFixed(2)}</span>,
    },
    {
      key: 'date',
      label: 'Date',
      width: 130,
      sortable: true,
      render: (item) => (
        <span>{new Date(item.date).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'submittedBy',
      label: 'Submitted By',
      width: 160,
      sortable: true,
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

  const filteredExpenses = expenses.filter((e) =>
    e.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddExpense = () => {
    alert('Add New Expense functionality will be implemented');
  };

  const handleFilter = () => {
    setShowFilter(!showFilter);
  };

  return (
    <div className="desktop-expenses-view">
      <div className="expenses-toolbar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search expenses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="toolbar-actions">
          <button className="filter-btn" onClick={handleFilter}>
            <Filter size={20} />
            <span>Filter</span>
          </button>
          <button className="add-btn" onClick={handleAddExpense}>
            <Plus size={20} />
            <span>Add New Expense</span>
          </button>
        </div>
      </div>

      <div className="expenses-table-container">
        {loading ? (
          <div className="loading-state">Loading expenses...</div>
        ) : (
          <DataTable
            tableId="expenses-table"
            columns={columns}
            data={filteredExpenses}
            onView={(item) => console.log('View', item)}
            onEdit={(item) => console.log('Edit', item)}
            onDelete={(item) => console.log('Delete', item)}
          />
        )}
      </div>

      <style>{`
        .desktop-expenses-view {
          width: 100%;
          height: 100%;
        }

        .expenses-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--desktop-gap-lg);
          padding: var(--desktop-gap-lg);
          margin-bottom: 20px;
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

        .expenses-table-container {
          background: var(--desktop-gray-5);
          border: none;
          border-radius: var(--desktop-radius-lg);
          padding: var(--desktop-gap-lg);
          margin: 0 20px 20px 20px;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 3px 8px;
          border-radius: var(--desktop-radius-sm);
          font-size: var(--desktop-caption);
          font-weight: var(--desktop-weight-light);
          line-height: 18px;
          text-transform: capitalize;
        }

        .status-badge.status-pending {
          background: #FFF3E0;
          color: #F57C00;
        }

        .status-badge.status-approved {
          background: #E8F5E9;
          color: #2E7D32;
        }

        .status-badge.status-rejected {
          background: #FFEBEE;
          color: #C62828;
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
