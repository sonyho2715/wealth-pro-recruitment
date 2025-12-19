'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, ChevronDown, X, Building2, CheckCircle, AlertCircle } from 'lucide-react';

export interface IndustryOption {
  id: string;
  naicsCode: string;
  title: string;
  shortTitle?: string | null;
  level: number;
  parentCode?: string | null;
  hasBenchmark?: boolean;
}

interface IndustrySelectorProps {
  industries: IndustryOption[];
  selectedIndustryId: string | null;
  onSelect: (industry: IndustryOption | null) => void;
  disabled?: boolean;
  showBenchmarkIndicator?: boolean;
  placeholder?: string;
}

export default function IndustrySelector({
  industries,
  selectedIndustryId,
  onSelect,
  disabled = false,
  showBenchmarkIndicator = true,
  placeholder = 'Select your industry...',
}: IndustrySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSectors, setExpandedSectors] = useState<Set<string>>(new Set());

  // Find selected industry
  const selectedIndustry = useMemo(
    () => industries.find((i) => i.id === selectedIndustryId) || null,
    [industries, selectedIndustryId]
  );

  // Organize industries by hierarchy
  const { sectors, industriesByParent } = useMemo(() => {
    const sectorList = industries.filter((i) => i.level === 2);
    const byParent: Record<string, IndustryOption[]> = {};

    industries.forEach((industry) => {
      if (industry.parentCode) {
        if (!byParent[industry.parentCode]) {
          byParent[industry.parentCode] = [];
        }
        byParent[industry.parentCode].push(industry);
      }
    });

    // Sort children by NAICS code
    Object.keys(byParent).forEach((key) => {
      byParent[key].sort((a, b) => a.naicsCode.localeCompare(b.naicsCode));
    });

    return { sectors: sectorList.sort((a, b) => a.naicsCode.localeCompare(b.naicsCode)), industriesByParent: byParent };
  }, [industries]);

  // Filter industries based on search
  const filteredIndustries = useMemo(() => {
    if (!searchQuery.trim()) return null;

    const query = searchQuery.toLowerCase();
    return industries.filter(
      (i) =>
        i.title.toLowerCase().includes(query) ||
        i.naicsCode.includes(query) ||
        (i.shortTitle && i.shortTitle.toLowerCase().includes(query))
    );
  }, [industries, searchQuery]);

  // Auto-expand sector when searching
  useEffect(() => {
    if (filteredIndustries && filteredIndustries.length > 0) {
      const parentCodes = new Set(filteredIndustries.map((i) => i.parentCode).filter(Boolean) as string[]);
      setExpandedSectors((prev) => new Set([...prev, ...parentCodes]));
    }
  }, [filteredIndustries]);

  const toggleSector = (naicsCode: string) => {
    setExpandedSectors((prev) => {
      const next = new Set(prev);
      if (next.has(naicsCode)) {
        next.delete(naicsCode);
      } else {
        next.add(naicsCode);
      }
      return next;
    });
  };

  const handleSelect = (industry: IndustryOption) => {
    onSelect(industry);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = () => {
    onSelect(null);
    setSearchQuery('');
  };

  return (
    <div className="relative">
      {/* Selected Display / Trigger */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between gap-3 px-4 py-3
          bg-white border rounded-xl text-left transition-all
          ${isOpen ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200 hover:border-slate-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'cursor-pointer'}
        `}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Building2 className="w-5 h-5 text-slate-400 flex-shrink-0" />
          {selectedIndustry ? (
            <div className="min-w-0">
              <div className="font-medium text-slate-900 truncate">
                {selectedIndustry.shortTitle || selectedIndustry.title}
              </div>
              <div className="text-xs text-slate-500">
                NAICS {selectedIndustry.naicsCode}
                {showBenchmarkIndicator && selectedIndustry.hasBenchmark && (
                  <span className="ml-2 text-emerald-600">• Has benchmarks</span>
                )}
              </div>
            </div>
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {selectedIndustry && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="p-1 hover:bg-slate-100 rounded-full transition"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
          <ChevronDown
            className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />

          {/* Dropdown Panel */}
          <div className="absolute z-20 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
            {/* Search */}
            <div className="p-3 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or NAICS code..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  autoFocus
                />
              </div>
            </div>

            {/* Industry List */}
            <div className="max-h-80 overflow-y-auto">
              {filteredIndustries ? (
                // Search Results
                <div className="p-2">
                  {filteredIndustries.length === 0 ? (
                    <div className="px-4 py-8 text-center text-slate-500">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p className="text-sm">No industries match your search</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {filteredIndustries.map((industry) => (
                        <IndustryItem
                          key={industry.id}
                          industry={industry}
                          isSelected={industry.id === selectedIndustryId}
                          showBenchmarkIndicator={showBenchmarkIndicator}
                          onSelect={handleSelect}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Hierarchical View
                <div className="p-2">
                  {sectors.map((sector) => (
                    <div key={sector.id} className="mb-1">
                      {/* Sector Header */}
                      <button
                        type="button"
                        onClick={() => toggleSector(sector.naicsCode)}
                        className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-50 rounded-lg transition"
                      >
                        <div className="flex items-center gap-2">
                          <ChevronDown
                            className={`w-4 h-4 text-slate-400 transition-transform ${
                              expandedSectors.has(sector.naicsCode) ? '' : '-rotate-90'
                            }`}
                          />
                          <span className="font-medium text-slate-700">{sector.title}</span>
                          <span className="text-xs text-slate-400">({sector.naicsCode})</span>
                        </div>
                        {industriesByParent[sector.naicsCode] && (
                          <span className="text-xs text-slate-400">
                            {industriesByParent[sector.naicsCode].length} industries
                          </span>
                        )}
                      </button>

                      {/* Sector Children */}
                      {expandedSectors.has(sector.naicsCode) && industriesByParent[sector.naicsCode] && (
                        <div className="ml-6 mt-1 space-y-1">
                          {industriesByParent[sector.naicsCode].map((industry) => (
                            <IndustryItem
                              key={industry.id}
                              industry={industry}
                              isSelected={industry.id === selectedIndustryId}
                              showBenchmarkIndicator={showBenchmarkIndicator}
                              onSelect={handleSelect}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Helper Text */}
            {showBenchmarkIndicator && (
              <div className="px-4 py-2 bg-slate-50 border-t border-slate-100">
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <CheckCircle className="w-3 h-3 text-emerald-500" />
                  Industries with benchmarks provide more accurate calibration
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Individual Industry Item
interface IndustryItemProps {
  industry: IndustryOption;
  isSelected: boolean;
  showBenchmarkIndicator: boolean;
  onSelect: (industry: IndustryOption) => void;
}

function IndustryItem({ industry, isSelected, showBenchmarkIndicator, onSelect }: IndustryItemProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(industry)}
      className={`
        w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition
        ${isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50'}
      `}
    >
      <div className="min-w-0">
        <div className={`text-sm ${isSelected ? 'text-blue-700 font-medium' : 'text-slate-700'} truncate`}>
          {industry.shortTitle || industry.title}
        </div>
        <div className="text-xs text-slate-400">NAICS {industry.naicsCode}</div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {showBenchmarkIndicator && industry.hasBenchmark && (
          <CheckCircle className="w-4 h-4 text-emerald-500" />
        )}
        {isSelected && <CheckCircle className="w-4 h-4 text-blue-600" />}
      </div>
    </button>
  );
}

// Compact version for space-constrained layouts
interface IndustrySelectorCompactProps {
  industries: IndustryOption[];
  selectedIndustryId: string | null;
  onSelect: (industry: IndustryOption | null) => void;
  disabled?: boolean;
}

export function IndustrySelectorCompact({
  industries,
  selectedIndustryId,
  onSelect,
  disabled = false,
}: IndustrySelectorCompactProps) {
  const selectedIndustry = industries.find((i) => i.id === selectedIndustryId);

  return (
    <select
      value={selectedIndustryId || ''}
      onChange={(e) => {
        const industry = industries.find((i) => i.id === e.target.value);
        onSelect(industry || null);
      }}
      disabled={disabled}
      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-50 disabled:bg-slate-50"
    >
      <option value="">Select industry...</option>
      {industries
        .filter((i) => i.level > 2)
        .sort((a, b) => a.title.localeCompare(b.title))
        .map((industry) => (
          <option key={industry.id} value={industry.id}>
            {industry.title} ({industry.naicsCode})
          </option>
        ))}
    </select>
  );
}
