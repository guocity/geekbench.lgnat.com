import React from 'react';
import { Cpu, Search, ChevronDown, ArrowUpDown, LayoutDashboard, Database } from 'lucide-react';
import { MetricKey, ViewMode, FilterMode } from '../types';
import { FAMILY_COLORS, TIER_COLORS, TIER_LABELS, METRIC_LABELS } from '../constants';

export interface HeaderProps {
  filterMode: FilterMode;
  onFilterModeChange: (mode: FilterMode) => void;
  selectedGroup: string | null;
  onGroupSelect: (group: string) => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (open: boolean) => void;
  sortMetric: MetricKey;
  onSortMetricChange: (metric: MetricKey) => void;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export const Header: React.FC<HeaderProps> = ({
  filterMode,
  onFilterModeChange,
  selectedGroup,
  onGroupSelect,
  isFilterOpen,
  setIsFilterOpen,
  sortMetric,
  onSortMetricChange,
  searchTerm,
  onSearchTermChange,
  viewMode,
  onViewModeChange,
}) => {
  const activeColorMap = filterMode === 'family' ? FAMILY_COLORS : TIER_COLORS;
  const getGroupLabel = (key: string) => filterMode === 'tier' ? TIER_LABELS[key] || key : key;

  return (
    <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="w-full mx-auto px-2 xl:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 md:gap-4">
        {/* Brand */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <div className="bg-slate-900 text-white p-1.5 sm:p-2 rounded-lg shadow-sm">
            <Cpu className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="hidden md:block font-bold text-lg tracking-tight">
            Silicon<span className="text-slate-400 font-normal">Bench</span>
          </span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 md:gap-3 flex-1 justify-end min-w-0">
          {/* Desktop Full Chipset / Mode Bar (shown when enough space: xl+) */}
          <div className="hidden xl:flex items-center shrink-0">
            <div className="flex bg-slate-200/60 p-1 rounded-xl items-center gap-1 mr-2">
              <button 
                onClick={() => onFilterModeChange('family')} 
                className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all ${filterMode === 'family' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Gen
              </button>
              <button 
                onClick={() => onFilterModeChange('tier')} 
                className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all ${filterMode === 'tier' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Tier
              </button>
            </div>

            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              {Object.keys(activeColorMap).map(key => (
                <button
                  key={key}
                  onClick={() => onGroupSelect(key)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                    selectedGroup === key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  } ${selectedGroup && selectedGroup !== key ? 'opacity-50' : 'opacity-100'}`}
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: activeColorMap[key] }}></span>
                  {getGroupLabel(key)}
                </button>
              ))}
            </div>
          </div>

          {/* Processor Filter Dropdown (shown when space is tight: <xl) */}
          <div className="xl:hidden relative shrink-0">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                selectedGroup 
                  ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm' 
                  : 'bg-slate-100 text-slate-700 border-transparent hover:bg-slate-200'
              }`}
            >
              {selectedGroup && (
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: activeColorMap[selectedGroup] }}></span>
              )}
              <span className="whitespace-nowrap">
                {selectedGroup ? getGroupLabel(selectedGroup) : (filterMode === 'family' ? 'Chipset' : 'Tier')}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>

            {isFilterOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
                <div className="absolute top-full left-0 mt-1.5 w-48 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50">
                  <div className="flex bg-slate-100 p-1 rounded-lg mb-2">
                    <button 
                      onClick={() => onFilterModeChange('family')} 
                      className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all ${filterMode === 'family' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Gen
                    </button>
                    <button 
                      onClick={() => onFilterModeChange('tier')} 
                      className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all ${filterMode === 'tier' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Tier
                    </button>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-400 px-2 py-1">
                    Select {filterMode === 'family' ? 'Generation' : 'Tier'}
                  </div>
                  <div className="space-y-0.5 max-h-56 overflow-y-auto">
                    {Object.keys(activeColorMap).map(key => (
                      <button
                        key={key}
                        onClick={() => {
                          onGroupSelect(key);
                          setIsFilterOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg hover:bg-slate-50 flex items-center justify-between transition-colors ${
                          selectedGroup === key ? 'bg-blue-50 font-bold text-blue-700' : 'text-slate-700'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: activeColorMap[key] }}></span>
                          {getGroupLabel(key)}
                        </span>
                        {selectedGroup === key && <span className="text-blue-600 text-[10px]">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="h-6 w-px bg-slate-200 shrink-0 hidden sm:block"></div>

          {/* Metrics Selection Tabs */}
          <div className="hidden md:flex bg-slate-100 p-1 rounded-xl items-center shrink-0">
            {(Object.keys(METRIC_LABELS) as MetricKey[]).map((key) => (
              <button
                key={key}
                onClick={() => onSortMetricChange(key)}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                  sortMetric === key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {METRIC_LABELS[key]}
              </button>
            ))}
          </div>
          
          {/* Mobile Metric Selector */}
          <div className="md:hidden relative group shrink-0">
            <button className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1.5 rounded-lg text-xs font-medium">
              <ArrowUpDown className="w-3 h-3 text-slate-500" /> 
              <span className="whitespace-nowrap">{METRIC_LABELS[sortMetric].split(' ')[0]}</span>
            </button>
            <div className="absolute top-full right-0 mt-1.5 w-40 bg-white rounded-xl shadow-xl border border-slate-200 p-1 hidden group-hover:block z-50">
              {(Object.keys(METRIC_LABELS) as MetricKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => onSortMetricChange(key)}
                  className={`w-full text-left px-3 py-1.5 text-xs rounded-lg ${
                    sortMetric === key ? 'bg-slate-100 font-bold' : 'hover:bg-slate-50'
                  }`}
                >
                  {METRIC_LABELS[key]}
                </button>
              ))}
            </div>
          </div>

          {/* Search Input */}
          <div className="relative shrink min-w-[70px] sm:min-w-[120px] max-w-[160px] sm:max-w-[200px] w-full">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search specs, chip, model..." 
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              className="w-full bg-slate-100 focus:bg-white border border-transparent focus:border-blue-500 pl-8 pr-3 py-1.5 rounded-xl text-xs transition-all outline-none"
            />
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="bg-slate-100 p-1 rounded-lg flex shrink-0">
            <button 
              onClick={() => onViewModeChange('dashboard')}
              title="Dashboard View"
              className={`p-1.5 rounded-md transition-all ${viewMode === 'dashboard' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutDashboard className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onViewModeChange('list')}
              title="Table View"
              className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Database className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onViewModeChange('processors')}
              title="Processors Matrix (processor.json)"
              className={`p-1.5 rounded-md transition-all ${viewMode === 'processors' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Cpu className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
