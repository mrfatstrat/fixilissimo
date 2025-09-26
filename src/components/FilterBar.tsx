import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, X, ChevronDown, CheckCircle } from 'lucide-react';

interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

interface FilterGroup {
  id: string;
  label: string;
  options: FilterOption[];
  selected: string[];
}

interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filterGroups: FilterGroup[];
  onFiltersChange: (filters: Record<string, string[]>) => void;
  placeholder?: string;
  className?: string;
}

const FilterBar: React.FC<FilterBarProps> = ({
  searchValue,
  onSearchChange,
  filterGroups,
  onFiltersChange,
  placeholder = "Search...",
  className = ""
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  const totalSelectedFilters = filterGroups.reduce(
    (sum, group) => sum + group.selected.length,
    0
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFilterToggle = (groupId: string, optionId: string) => {
    const updatedFilters: Record<string, string[]> = {};

    filterGroups.forEach(group => {
      if (group.id === groupId) {
        const isSelected = group.selected.includes(optionId);
        updatedFilters[groupId] = isSelected
          ? group.selected.filter(id => id !== optionId)
          : [...group.selected, optionId];
      } else {
        updatedFilters[group.id] = group.selected;
      }
    });

    onFiltersChange(updatedFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters: Record<string, string[]> = {};
    filterGroups.forEach(group => {
      clearedFilters[group.id] = [];
    });
    onFiltersChange(clearedFilters);
  };

  const clearFilterGroup = (groupId: string) => {
    const updatedFilters: Record<string, string[]> = {};
    filterGroups.forEach(group => {
      updatedFilters[group.id] = group.id === groupId ? [] : group.selected;
    });
    onFiltersChange(updatedFilters);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Filter Controls */}
      <div className="flex gap-3">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 bg-white/90 backdrop-blur-sm"
          />
        </div>

        {/* Filter Button */}
        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 px-4 py-3 border rounded-xl font-medium transition-colors duration-200 ${
              totalSelectedFilters > 0 || isFilterOpen
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white/90 text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            aria-expanded={isFilterOpen}
            aria-haspopup="true"
          >
            <Filter size={20} />
            <span>Filters</span>
            {totalSelectedFilters > 0 && (
              <span className="bg-white/20 rounded-full px-2 py-0.5 text-xs font-semibold min-w-[20px] text-center">
                {totalSelectedFilters}
              </span>
            )}
            <ChevronDown
              size={16}
              className={`transition-transform duration-200 ${
                isFilterOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Filter Dropdown */}
          {isFilterOpen && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 animate-fadeIn">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Filters</h3>
                  {totalSelectedFilters > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {filterGroups.map((group) => (
                  <div key={group.id} className="border-b border-gray-100 last:border-b-0">
                    <button
                      onClick={() => setOpenDropdown(
                        openDropdown === group.id ? null : group.id
                      )}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-900">{group.label}</span>
                        {group.selected.length > 0 && (
                          <span className="bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 text-xs font-semibold">
                            {group.selected.length}
                          </span>
                        )}
                      </div>
                      <ChevronDown
                        size={16}
                        className={`text-gray-400 transition-transform duration-200 ${
                          openDropdown === group.id ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {openDropdown === group.id && (
                      <div className="px-4 pb-4">
                        {group.selected.length > 0 && (
                          <button
                            onClick={() => clearFilterGroup(group.id)}
                            className="text-xs text-gray-500 hover:text-gray-700 mb-2"
                          >
                            Clear {group.label.toLowerCase()}
                          </button>
                        )}
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {group.options.map((option) => {
                            const isSelected = group.selected.includes(option.id);
                            return (
                              <label
                                key={option.id}
                                className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleFilterToggle(group.id, option.id)}
                                  className="sr-only"
                                />
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                  isSelected
                                    ? 'bg-blue-500 border-blue-500 text-white'
                                    : 'border-gray-300'
                                }`}>
                                  {isSelected && <CheckCircle size={14} />}
                                </div>
                                <span className="flex-1 text-sm text-gray-700">
                                  {option.label}
                                </span>
                                {option.count !== undefined && (
                                  <span className="text-xs text-gray-400">
                                    {option.count}
                                  </span>
                                )}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active Filters */}
      {totalSelectedFilters > 0 && (
        <div className="flex flex-wrap gap-2">
          {filterGroups.map(group =>
            group.selected.map(selectedId => {
              const option = group.options.find(opt => opt.id === selectedId);
              if (!option) return null;

              return (
                <span
                  key={`${group.id}-${selectedId}`}
                  className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                >
                  <span className="text-xs text-blue-600">{group.label}:</span>
                  {option.label}
                  <button
                    onClick={() => handleFilterToggle(group.id, selectedId)}
                    className="text-blue-600 hover:text-blue-800"
                    aria-label={`Remove ${option.label} filter`}
                  >
                    <X size={14} />
                  </button>
                </span>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default FilterBar;