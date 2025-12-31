import { SortBy, SortOrder, ViewMode } from '../types';
import { useState } from 'react';

interface SortBarProps {
  sortBy: SortBy;
  sortOrder: SortOrder;
  onSort: (field: SortBy) => void;
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
  onLoadMockData?: () => void;
  autoProgressEnabled?: boolean;
  onToggleAutoProgress?: () => void;
}

export default function SortBar({
  sortBy,
  onSort,
  viewMode,
  onViewChange,
  onLoadMockData,
  autoProgressEnabled = false,
  onToggleAutoProgress
}: SortBarProps) {
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [viewDropdownOpen, setViewDropdownOpen] = useState(false);

  const getSortLabel = () => {
    if (!sortBy) return 'Order';
    return sortBy.charAt(0).toUpperCase() + sortBy.slice(1);
  };

  const getViewLabel = () => {
    return viewMode.charAt(0).toUpperCase() + viewMode.slice(1);
  };

  return (
    <div className="bg-black text-white px-4 py-3 flex items-center justify-between sticky top-0 z-10">
      {/* Left side - Sort and View dropdowns */}
      <div className="flex items-center gap-16">
        {/* Sort dropdown */}
        <div className="relative">
          <button
            onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white transition-colors"
          >
            {getSortLabel()}
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <path d="M6 8L2 4h8z" />
            </svg>
          </button>
        
        {sortDropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-20"
              onClick={() => setSortDropdownOpen(false)}
            />
            <div className="absolute left-0 top-full mt-1 bg-gray-800 rounded shadow-lg border border-gray-700 py-1 min-w-[120px] z-30">
              <button
                onClick={() => {
                  onSort(null);
                  setSortDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-700 transition-colors ${
                  !sortBy ? 'text-blue-400' : 'text-gray-300'
                }`}
              >
                Order
              </button>
              <button
                onClick={() => {
                  onSort('importance');
                  setSortDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-700 transition-colors ${
                  sortBy === 'importance' ? 'text-blue-400' : 'text-gray-300'
                }`}
              >
                Importance
              </button>
              <button
                onClick={() => {
                  onSort('urgency');
                  setSortDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-700 transition-colors ${
                  sortBy === 'urgency' ? 'text-blue-400' : 'text-gray-300'
                }`}
              >
                Urgency
              </button>
            </div>
          </>
        )}
        </div>

        {/* View dropdown */}
        <div className="relative">
        <button
          onClick={() => setViewDropdownOpen(!viewDropdownOpen)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white transition-colors"
        >
          {getViewLabel()}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M6 8L2 4h8z" />
          </svg>
        </button>
        
        {viewDropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-20"
              onClick={() => setViewDropdownOpen(false)}
            />
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 bg-gray-800 rounded shadow-lg border border-gray-700 py-1 min-w-[100px] z-30">
              {(['daily', 'weekly', 'monthly'] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    onViewChange(mode);
                    setViewDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-700 transition-colors ${
                    viewMode === mode ? 'text-blue-400' : 'text-gray-300'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      </div>

      {/* Right side - Controls */}
      <div className="flex items-center gap-2">
        {onToggleAutoProgress && (
          <button
            onClick={() => {
              console.log('Toggling auto-progress, current state:', autoProgressEnabled);
              onToggleAutoProgress();
            }}
            className={`px-3 py-1 rounded text-xs transition-colors ${
              autoProgressEnabled
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
            title={autoProgressEnabled ? "Disable auto-progress" : "Enable auto-progress"}
          >
            {autoProgressEnabled ? "⚡ Auto" : "Manual"}
          </button>
        )}
        {onLoadMockData && (
          <button
            onClick={onLoadMockData}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs transition-colors"
            title="Reload mock data"
          >
            🔄 Reload Mock Data
          </button>
        )}
      </div>
    </div>
  );
}

