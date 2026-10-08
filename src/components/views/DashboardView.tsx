import React from 'react';
import { MetricScatter } from '../charts/MetricScatter';
import { MetricBarChart } from '../charts/MetricBarChart';
import { MetricKey, ProcessedItem, AggregatedChipGroup, FilterMode } from '../../types';
import { METRIC_LABELS, DEVICES, DEVICE_COLORS } from '../../constants';

export interface DashboardViewProps {
  sortMetric: MetricKey;
  filteredData: ProcessedItem[];
  aggregatedData: AggregatedChipGroup[];
  selectedGroup: string | null;
  selectedDevice: string | null;
  filterMode: FilterMode;
  onGroupSelect: (group: string) => void;
  onSelectDetail: (item: ProcessedItem) => void;
  onFilterModeChange: (mode: FilterMode) => void;
  onSelectDevice: (device: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  sortMetric,
  filteredData,
  aggregatedData,
  selectedGroup,
  selectedDevice,
  filterMode,
  onGroupSelect,
  onSelectDetail,
  onFilterModeChange,
  onSelectDevice,
}) => {
  return (
    <div className="space-y-3">
      {/* 4 Scatter Plots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        <MetricScatter 
          title={METRIC_LABELS[sortMetric]} 
          metricKey={sortMetric} 
          xKey="year" 
          xLabel="Year" 
          isYear={true}
          sortMetric={sortMetric} 
          filteredData={filteredData}
          onGroupSelect={onGroupSelect} 
          onSelectDetail={onSelectDetail} 
          selectedGroup={selectedGroup} 
          selectedDevice={selectedDevice} 
          filterMode={filterMode}
        />
        <MetricScatter 
          title="Multi-Core" 
          metricKey="multi" 
          xKey="cpuCores" 
          xLabel="CPU Cores" 
          sortMetric={sortMetric} 
          filteredData={filteredData}
          onGroupSelect={onGroupSelect} 
          onSelectDetail={onSelectDetail} 
          selectedGroup={selectedGroup} 
          selectedDevice={selectedDevice} 
          filterMode={filterMode}
        />
        <MetricScatter 
          title="Metal (GPU)" 
          metricKey="metal" 
          xKey="gpuCores" 
          xLabel="GPU Cores" 
          sortMetric={sortMetric} 
          filteredData={filteredData}
          onGroupSelect={onGroupSelect} 
          onSelectDetail={onSelectDetail} 
          selectedGroup={selectedGroup} 
          selectedDevice={selectedDevice} 
          filterMode={filterMode}
        />
        <MetricScatter 
          title={sortMetric === 'bandwidth' ? "OpenCL" : "Memory Bandwidth"} 
          metricKey={sortMetric === 'bandwidth' ? "opencl" : "bandwidth"} 
          xKey={sortMetric === 'bandwidth' ? "gpuCores" : "year"} 
          xLabel={sortMetric === 'bandwidth' ? "GPU Cores" : "Year"} 
          isYear={sortMetric !== 'bandwidth'}
          sortMetric={sortMetric} 
          filteredData={filteredData}
          onGroupSelect={onGroupSelect} 
          onSelectDetail={onSelectDetail} 
          selectedGroup={selectedGroup} 
          selectedDevice={selectedDevice} 
          filterMode={filterMode}
        />
      </div>

      {/* 4 Bar Charts Grid (Tall h-[580px] Cards with right margin) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        <MetricBarChart
          title={filterMode === 'tier' ? "Tier Performance" : "Family Performance"} 
          subtitle={`Range & Avg ${METRIC_LABELS[sortMetric]} by ${filterMode === 'tier' ? 'Tier' : 'Chipset'}`}
          badgeText={sortMetric === 'bandwidth' ? "GB/s" : sortMetric} 
          badgeClass="bg-blue-50 text-blue-600"
          data={aggregatedData} 
          dataKey="maxScore" 
          valueFormat={(v) => sortMetric === 'bandwidth' ? `${v.toLocaleString()} GB/s` : v.toLocaleString()}
          tooltipRanges={(d) => ({ 
            range: sortMetric === 'bandwidth' ? `${d.minScore.toLocaleString()} - ${d.maxScore.toLocaleString()} GB/s` : `${d.minScore.toLocaleString()} - ${d.maxScore.toLocaleString()}`, 
            avg: sortMetric === 'bandwidth' ? `${d.avgScore.toLocaleString()} GB/s` : d.avgScore.toLocaleString() 
          })}
          onGroupSelect={onGroupSelect} 
          selectedGroup={selectedGroup} 
          selectedDevice={selectedDevice} 
          filterMode={filterMode}
        />
        <MetricBarChart
          title="Core Efficiency" 
          subtitle={`Range & Avg ${sortMetric === 'bandwidth' ? 'Multi-Core' : METRIC_LABELS[sortMetric]} Score Per Core`}
          badgeText="Score / Core" 
          badgeClass="bg-amber-50 text-amber-600"
          data={aggregatedData} 
          dataKey="maxEff" 
          valueFormat={(v) => v.toLocaleString()}
          tooltipRanges={(d) => ({ range: `${d.minEff} - ${d.maxEff}`, avg: d.avgEff.toLocaleString() })}
          onGroupSelect={onGroupSelect} 
          selectedGroup={selectedGroup} 
          selectedDevice={selectedDevice} 
          filterMode={filterMode}
        />
        <MetricBarChart
          title="Clock Frequencies" 
          subtitle="Peak Boost Clock per Architecture (GHz)"
          badgeText="GHz" 
          badgeClass="bg-purple-50 text-purple-600"
          data={aggregatedData} 
          dataKey="maxGhz" 
          valueFormat={(v) => `${v.toFixed(2)} GHz`}
          tooltipRanges={(d) => ({ range: `${d.minGhz.toFixed(2)} - ${d.maxGhz.toFixed(2)} GHz`, avg: `${d.avgGhz.toFixed(2)} GHz` })}
          onGroupSelect={onGroupSelect} 
          selectedGroup={selectedGroup} 
          selectedDevice={selectedDevice} 
          filterMode={filterMode}
        />
        <MetricBarChart
          title="IPC / Frequency Efficiency" 
          subtitle="Performance Normalized per GHz"
          badgeText="Score / GHz" 
          badgeClass="bg-emerald-50 text-emerald-600"
          data={aggregatedData} 
          dataKey="maxGhzEff" 
          valueFormat={(v) => v.toLocaleString()}
          tooltipRanges={(d) => ({ range: `${d.minGhzEff.toLocaleString()} - ${d.maxGhzEff.toLocaleString()}`, avg: d.avgGhzEff.toLocaleString() })}
          onGroupSelect={onGroupSelect} 
          selectedGroup={selectedGroup} 
          selectedDevice={selectedDevice} 
          filterMode={filterMode}
        />
      </div>

      {/* Quick Filters Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Highlight:</span>
          {(['family', 'tier'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => onFilterModeChange(mode)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${filterMode === mode ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {mode === 'family' ? 'Family (M1-M6)' : 'Tiers (Base, Pro, Max)'}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Devices:</span>
          {DEVICES.map(device => (
            <button
              key={device}
              onClick={() => onSelectDevice(device)}
              className={`flex items-center gap-1.5 text-[11px] font-medium transition-opacity ${selectedDevice && selectedDevice !== device ? 'opacity-40' : 'opacity-100'}`}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: DEVICE_COLORS[device] }}></span>
              {device}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
