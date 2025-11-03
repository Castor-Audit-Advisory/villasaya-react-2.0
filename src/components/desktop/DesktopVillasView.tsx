import React, { useState, useEffect } from "react";
import { Plus, Filter, Search, MapPin } from "lucide-react";
import { DataTable, Column } from "./DataTable";
import { apiRequest } from "../../utils/api";
import { useStaticStyles } from "../../hooks/useStaticStyles";

const VILLAS_VIEW_STYLES = `
        .desktop-villas-view {
          width: 100%;
          height: 100%;
        }

        .villas-content {
          padding: var(--desktop-gap-lg) 20px 0 20px;
        }

        .villas-toolbar {
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
          width: 400px;
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
          font-weight: var(--desktop-weight-medium);
          color: var(--desktop-white-500);
          cursor: pointer;
          transition: all 0.2s;
        }

        .add-btn:hover {
          background: var(--desktop-primary-400);
        }

        .villas-table-container {
          background: var(--desktop-gray-5);
          border-radius: var(--desktop-radius-lg);
          padding: var(--desktop-gap-lg);
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

        .status-badge.status-available {
          background: #E3FCEC;
          color: #0F9D58;
        }

        .status-badge.status-occupied {
          background: #FFF4E5;
          color: #F2994A;
        }

        .status-badge.status-maintenance {
          background: #FEEAEA;
          color: #EB5757;
        }
      `;

interface Villa {
  id: string;
  name: string;
  location: string;
  bedrooms: number;
  status: "available" | "occupied" | "maintenance";
  monthlyRent: number;
  tenantName?: string;
}

export const DesktopVillasView: React.FC = () => {
  const [villas, setVillas] = useState<Villa[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useStaticStyles("desktop-villas-view-styles", VILLAS_VIEW_STYLES);

  useEffect(() => {
    fetchVillas();
  }, []);

  const fetchVillas = async () => {
    try {
      const response = await apiRequest<{ villas?: Villa[] }>("/villas");
      const villaList = Array.isArray(response) ? response : response?.villas;
      setVillas(Array.isArray(villaList) ? villaList : []);
    } catch (error) {
      console.error("Error fetching villas:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns: Column<Villa>[] = [
    { key: "name", label: "Villa Name", width: 200, sortable: true },
    {
      key: "location",
      label: "Location",
      width: 200,
      sortable: true,
      render: (item) => (
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <MapPin size={14} style={{ color: "var(--desktop-gray-500)" }} />
          <span>{item.location}</span>
        </div>
      ),
    },
    {
      key: "bedrooms",
      label: "Bedrooms",
      width: 110,
      sortable: true,
      render: (item) => `${item.bedrooms} BR`,
    },
    {
      key: "status",
      label: "Status",
      width: 120,
      sortable: true,
      render: (item) => (
        <span className={`status-badge status-${item.status}`}>
          {item.status}
        </span>
      ),
    },
    {
      key: "monthlyRent",
      label: "Monthly Rent",
      width: 140,
      sortable: true,
      render: (item) => `$${item.monthlyRent.toLocaleString()}`,
    },
    {
      key: "tenantName",
      label: "Current Tenant",
      width: 160,
      sortable: true,
      render: (item) => item.tenantName || "—",
    },
  ];

  const filteredVillas = villas.filter(
    (v) =>
      v.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.location?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleAddVilla = () => {
    alert("Add New Villa functionality will be implemented");
  };

  const handleFilter = () => {
    alert("Filter functionality will be implemented");
  };

  return (
    <div className="desktop-villas-view">
      <div className="villas-content">
        <div className="villas-toolbar">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search villas by name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="toolbar-actions">
            <button className="filter-btn" onClick={handleFilter}>
              <Filter size={20} />
              <span>Filter</span>
            </button>
            <button className="add-btn" onClick={handleAddVilla}>
              <Plus size={20} />
              <span>Add New Villa</span>
            </button>
          </div>
        </div>

        <div className="villas-table-container">
          {loading ? (
            <div className="loading-state">Loading villas...</div>
          ) : (
            <DataTable
              tableId="villas-table"
              columns={columns}
              data={filteredVillas}
              onView={(item) => console.log("View", item)}
              onEdit={(item) => console.log("Edit", item)}
              onDelete={(item) => console.log("Delete", item)}
            />
          )}
        </div>
      </div>
    </div>
  );
};
