import React, { useState, useRef, useEffect } from 'react';
import { 
  Eye, 
  Edit, 
  Trash2, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  Settings as SettingsIcon,
  Save,
  RotateCcw
} from 'lucide-react';

export interface Column<T> {
  key: keyof T | string;
  label: string;
  width?: number;
  minWidth?: number;
  sortable?: boolean;
  defaultVisible?: boolean;
  render?: (item: T) => React.ReactNode;
}

interface ColumnConfig {
  key: string;
  width: number;
  visible: boolean;
}

interface TableView {
  name: string;
  columns: ColumnConfig[];
  sortKey: string | null;
  sortDirection: 'asc' | 'desc' | null;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  renderAvatar?: (item: T) => React.ReactNode;
  tableId?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns: initialColumns,
  data,
  onView,
  onEdit,
  onDelete,
  renderAvatar,
  tableId = 'default',
}: DataTableProps<T>) {
  const [columnConfigs, setColumnConfigs] = useState<ColumnConfig[]>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem(`table-config-${tableId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return parsed;
        } catch (e) {
          console.error('Failed to parse saved column config:', e);
        }
      }
    }
    return initialColumns.map((col) => ({
      key: String(col.key),
      width: col.width || 150,
      visible: col.defaultVisible !== false,
    }));
  });

  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [resizeStartX, setResizeStartX] = useState(0);
  const [resizeStartWidth, setResizeStartWidth] = useState(0);
  const [savedViews, setSavedViews] = useState<TableView[]>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem(`table-views-${tableId}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse saved views:', e);
        }
      }
    }
    return [];
  });
  const [viewName, setViewName] = useState('');

  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(`table-config-${tableId}`, JSON.stringify(columnConfigs));
      } catch (e) {
        console.error('Failed to save column config:', e);
      }
    }
  }, [columnConfigs, tableId]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(`table-views-${tableId}`, JSON.stringify(savedViews));
      } catch (e) {
        console.error('Failed to save views:', e);
      }
    }
  }, [savedViews, tableId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowColumnSettings(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!resizingColumn) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - resizeStartX;
      const newWidth = Math.max(50, resizeStartWidth + delta);
      
      setColumnConfigs((prev) =>
        prev.map((config) =>
          config.key === resizingColumn
            ? { ...config, width: newWidth }
            : config
        )
      );
    };

    const handleMouseUp = () => {
      setResizingColumn(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingColumn, resizeStartX, resizeStartWidth]);

  const handleSort = (key: string) => {
    const column = initialColumns.find((col) => String(col.key) === key);
    if (!column?.sortable) return;

    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortKey(null);
        setSortDirection(null);
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const handleColumnVisibility = (key: string) => {
    setColumnConfigs((prev) =>
      prev.map((config) =>
        config.key === key ? { ...config, visible: !config.visible } : config
      )
    );
  };

  const handleResetColumns = () => {
    const reset = initialColumns.map((col) => ({
      key: String(col.key),
      width: col.width || 150,
      visible: col.defaultVisible !== false,
    }));
    setColumnConfigs(reset);
    setSortKey(null);
    setSortDirection(null);
  };

  const handleSaveView = () => {
    if (!viewName.trim()) return;

    const newView: TableView = {
      name: viewName,
      columns: JSON.parse(JSON.stringify(columnConfigs)),
      sortKey,
      sortDirection,
    };

    setSavedViews((prev) => [...prev, newView]);
    setViewName('');
  };

  const handleLoadView = (view: TableView) => {
    setColumnConfigs(JSON.parse(JSON.stringify(view.columns)));
    setSortKey(view.sortKey);
    setSortDirection(view.sortDirection);
    setShowColumnSettings(false);
  };

  const handleDeleteView = (viewName: string) => {
    setSavedViews((prev) => prev.filter((v) => v.name !== viewName));
  };

  const handleResizeStart = (key: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const config = columnConfigs.find((c) => c.key === key);
    if (config) {
      setResizingColumn(key);
      setResizeStartX(e.clientX);
      setResizeStartWidth(config.width);
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortKey || !sortDirection) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();

      if (sortDirection === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
  }, [data, sortKey, sortDirection]);

  const visibleColumns = initialColumns.filter((col) => {
    const config = columnConfigs.find((c) => c.key === String(col.key));
    return config?.visible !== false;
  });

  const getColumnWidth = (key: string) => {
    const config = columnConfigs.find((c) => c.key === key);
    return config?.width || 150;
  };

  const getSortIcon = (key: string) => {
    if (sortKey !== key) return <ArrowUpDown size={16} />;
    if (sortDirection === 'asc') return <ArrowUp size={16} />;
    return <ArrowDown size={16} />;
  };

  return (
    <div className="data-table">
      <div className="table-controls">
        <div className="table-controls-left">
          {savedViews.length > 0 && (
            <div className="saved-views">
              <span className="views-label">Saved Views:</span>
              {savedViews.map((view) => (
                <button
                  key={view.name}
                  className="view-btn"
                  onClick={() => handleLoadView(view)}
                  title={`Load ${view.name} view`}
                >
                  {view.name}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="table-controls-right">
          <button
            className="control-btn"
            onClick={() => setShowColumnSettings(!showColumnSettings)}
            title="Column settings"
          >
            <SettingsIcon size={18} />
          </button>
        </div>

        {showColumnSettings && (
          <div className="column-settings-panel" ref={settingsRef}>
            <div className="settings-header">
              <h4>Column Settings</h4>
            </div>

            <div className="settings-section">
              <h5>Visibility</h5>
              <div className="column-list">
                {initialColumns.map((col) => {
                  const config = columnConfigs.find((c) => c.key === String(col.key));
                  return (
                    <label key={String(col.key)} className="column-item">
                      <input
                        type="checkbox"
                        checked={config?.visible !== false}
                        onChange={() => handleColumnVisibility(String(col.key))}
                      />
                      <span>{col.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="settings-section">
              <h5>Save Current View</h5>
              <div className="save-view-form">
                <input
                  type="text"
                  className="view-name-input"
                  placeholder="View name..."
                  value={viewName}
                  onChange={(e) => setViewName(e.target.value)}
                />
                <button
                  className="save-view-btn"
                  onClick={handleSaveView}
                  disabled={!viewName.trim()}
                >
                  <Save size={16} />
                  Save
                </button>
              </div>
            </div>

            {savedViews.length > 0 && (
              <div className="settings-section">
                <h5>Saved Views</h5>
                <div className="saved-views-list">
                  {savedViews.map((view) => (
                    <div key={view.name} className="saved-view-item">
                      <span>{view.name}</span>
                      <button
                        className="delete-view-btn"
                        onClick={() => handleDeleteView(view.name)}
                        title="Delete view"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="settings-actions">
              <button className="reset-btn" onClick={handleResetColumns}>
                <RotateCcw size={16} />
                Reset to Default
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="table-wrapper">
        <div className="table-header">
          {renderAvatar && <div className="header-cell avatar-cell"></div>}
          {visibleColumns.map((column) => {
            const key = String(column.key);
            const width = getColumnWidth(key);
            return (
              <div
                key={key}
                className={`header-cell ${column.sortable ? 'sortable' : ''}`}
                style={{ width: `${width}px`, minWidth: `${column.minWidth || 50}px` }}
                onClick={() => column.sortable && handleSort(key)}
              >
                <span className="header-label">{column.label}</span>
                {column.sortable && (
                  <span className="sort-icon">{getSortIcon(key)}</span>
                )}
                <div
                  className="resize-handle"
                  onMouseDown={(e) => handleResizeStart(key, e)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            );
          })}
          <div className="header-cell action-cell">Action</div>
        </div>

        <div className="table-body">
          {sortedData.map((item, index) => (
            <div key={index} className="table-row">
              {renderAvatar && (
                <div className="table-cell avatar-cell">{renderAvatar(item)}</div>
              )}
              {visibleColumns.map((column) => {
                const key = String(column.key);
                const width = getColumnWidth(key);
                return (
                  <div
                    key={key}
                    className="table-cell"
                    style={{ width: `${width}px`, minWidth: `${column.minWidth || 50}px` }}
                  >
                    {column.render
                      ? column.render(item)
                      : String(item[column.key] || '')}
                  </div>
                );
              })}
              <div className="table-cell action-cell">
                <div className="action-buttons">
                  {onView && (
                    <button
                      className="action-btn"
                      onClick={() => onView(item)}
                      aria-label="View"
                    >
                      <Eye size={20} />
                    </button>
                  )}
                  {onEdit && (
                    <button
                      className="action-btn"
                      onClick={() => onEdit(item)}
                      aria-label="Edit"
                    >
                      <Edit size={20} />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      className="action-btn"
                      onClick={() => onDelete(item)}
                      aria-label="Delete"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .data-table {
          width: 100%;
        }

        .table-controls {
          position: relative;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--desktop-gap-lg) 0;
          margin-bottom: var(--desktop-gap-lg);
        }

        .table-controls-left {
          display: flex;
          gap: var(--desktop-gap-lg);
        }

        .table-controls-right {
          display: flex;
          gap: var(--desktop-gap-lg);
        }

        .saved-views {
          display: flex;
          align-items: center;
          gap: var(--desktop-gap-md);
        }

        .views-label {
          font-size: var(--desktop-body-2);
          font-weight: var(--desktop-weight-light);
          color: var(--desktop-gray-500);
        }

        .view-btn {
          padding: 6px var(--desktop-gap-lg);
          background: var(--desktop-primary-5);
          border: 1px solid var(--desktop-primary-500);
          border-radius: var(--desktop-radius-md);
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-body-2);
          font-weight: var(--desktop-weight-light);
          color: var(--desktop-primary-500);
          cursor: pointer;
          transition: all 0.2s;
        }

        .view-btn:hover {
          background: var(--desktop-primary-500);
          color: var(--desktop-white-500);
        }

        .control-btn {
          display: flex;
          align-items: center;
          gap: var(--desktop-gap-md);
          padding: 8px var(--desktop-gap-lg);
          background: var(--desktop-white-500);
          border: 1px solid var(--desktop-gray-20);
          border-radius: var(--desktop-radius-lg);
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-body-2);
          font-weight: var(--desktop-weight-light);
          color: var(--desktop-dark-500);
          cursor: pointer;
          transition: all 0.2s;
        }

        .control-btn:hover {
          border-color: var(--desktop-gray-500);
        }

        .column-settings-panel {
          position: absolute;
          top: 100%;
          right: 0;
          width: 320px;
          max-height: 500px;
          overflow-y: auto;
          background: var(--desktop-white-500);
          border: 1px solid var(--desktop-gray-20);
          border-radius: var(--desktop-radius-lg);
          box-shadow: var(--desktop-shadow-md);
          padding: var(--desktop-gap-lg);
          z-index: 100;
          margin-top: 8px;
        }

        .settings-header h4 {
          font-size: var(--desktop-body-1);
          font-weight: var(--desktop-weight-semibold);
          color: var(--desktop-dark-500);
          margin: 0 0 var(--desktop-gap-lg) 0;
        }

        .settings-section {
          margin-bottom: var(--desktop-gap-lg);
          padding-bottom: var(--desktop-gap-lg);
          border-bottom: 1px solid var(--desktop-gray-10);
        }

        .settings-section:last-of-type {
          border-bottom: none;
        }

        .settings-section h5 {
          font-size: var(--desktop-body-2);
          font-weight: var(--desktop-weight-semibold);
          color: var(--desktop-dark-500);
          margin: 0 0 var(--desktop-gap-md) 0;
        }

        .column-list {
          display: flex;
          flex-direction: column;
          gap: var(--desktop-gap-md);
        }

        .column-item {
          display: flex;
          align-items: center;
          gap: var(--desktop-gap-md);
          font-size: var(--desktop-body-2);
          font-weight: var(--desktop-weight-light);
          color: var(--desktop-dark-500);
          cursor: pointer;
        }

        .column-item input[type="checkbox"] {
          cursor: pointer;
        }

        .save-view-form {
          display: flex;
          gap: var(--desktop-gap-md);
        }

        .view-name-input {
          flex: 1;
          height: 32px;
          padding: 0 var(--desktop-gap-md);
          background: var(--desktop-white-500);
          border: 1px solid var(--desktop-gray-20);
          border-radius: var(--desktop-radius-md);
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-body-2);
          font-weight: var(--desktop-weight-light);
          color: var(--desktop-dark-500);
          outline: none;
        }

        .view-name-input:focus {
          border-color: var(--desktop-primary-500);
        }

        .save-view-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0 var(--desktop-gap-lg);
          height: 32px;
          background: var(--desktop-primary-500);
          border: none;
          border-radius: var(--desktop-radius-md);
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-body-2);
          font-weight: var(--desktop-weight-semibold);
          color: var(--desktop-white-500);
          cursor: pointer;
          transition: all 0.2s;
        }

        .save-view-btn:hover:not(:disabled) {
          background: var(--desktop-primary-400);
        }

        .save-view-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .saved-views-list {
          display: flex;
          flex-direction: column;
          gap: var(--desktop-gap-md);
        }

        .saved-view-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--desktop-gap-md);
          background: var(--desktop-gray-5);
          border-radius: var(--desktop-radius-md);
          font-size: var(--desktop-body-2);
          font-weight: var(--desktop-weight-light);
          color: var(--desktop-dark-500);
        }

        .delete-view-btn {
          background: none;
          border: none;
          color: #EA5455;
          cursor: pointer;
          padding: 4px;
          transition: opacity 0.2s;
        }

        .delete-view-btn:hover {
          opacity: 0.7;
        }

        .settings-actions {
          padding-top: var(--desktop-gap-lg);
        }

        .reset-btn {
          display: flex;
          align-items: center;
          gap: var(--desktop-gap-md);
          width: 100%;
          padding: var(--desktop-gap-md);
          background: var(--desktop-white-500);
          border: 1px solid var(--desktop-gray-20);
          border-radius: var(--desktop-radius-md);
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-body-2);
          font-weight: var(--desktop-weight-light);
          color: var(--desktop-dark-500);
          cursor: pointer;
          transition: all 0.2s;
          justify-content: center;
        }

        .reset-btn:hover {
          border-color: var(--desktop-gray-500);
        }

        .table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        .table-header {
          display: flex;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid var(--desktop-gray-10);
        }

        .table-body {
          display: flex;
          flex-direction: column;
        }

        .table-row {
          display: flex;
          align-items: center;
          padding: 3px 0;
          border-bottom: 1px solid var(--desktop-gray-10);
          transition: background 0.2s;
        }

        .table-row:hover {
          background: var(--desktop-gray-5);
        }

        .header-cell {
          position: relative;
          padding: 8px 8px 8px 0;
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-body-2);
          font-weight: var(--desktop-weight-light);
          color: var(--desktop-gray-500);
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 6px;
          user-select: none;
        }

        .header-cell.sortable {
          cursor: pointer;
        }

        .header-cell.sortable:hover {
          color: var(--desktop-dark-500);
        }

        .header-label {
          flex: 1;
        }

        .sort-icon {
          display: flex;
          align-items: center;
          color: var(--desktop-gray-500);
        }

        .resize-handle {
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 8px;
          cursor: col-resize;
          z-index: 1;
        }

        .resize-handle:hover {
          background: var(--desktop-primary-500);
        }

        .table-cell {
          padding: 8px 8px 8px 0;
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-body-2);
          font-weight: var(--desktop-weight-light);
          color: var(--desktop-dark-500);
          flex-shrink: 0;
          display: flex;
          align-items: center;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .avatar-cell {
          width: 44px;
          flex-shrink: 0;
          padding-right: 8px;
        }

        .action-cell {
          width: 90px;
          flex-shrink: 0;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          color: var(--desktop-dark-500);
          transition: color 0.2s;
        }

        .action-btn:hover {
          color: var(--desktop-primary-500);
        }
      `}</style>
    </div>
  );
}
