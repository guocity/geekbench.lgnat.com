import React from 'react';
import { Database, Image, ChevronDown, ChevronUp, ArrowUpDown } from 'lucide-react';
import { Card } from '../common/Card';
import { ProcessedItem, MetricKey, FilterMode } from '../../types';
import { FAMILY_COLORS, TIER_COLORS, getChipsetTag } from '../../constants';

export interface DevicesTableViewProps {
  sortedTableData: ProcessedItem[];
  searchTerm: string;
  sortMetric: MetricKey;
  filterMode: FilterMode;
  tableSortConfig: { key: string; direction: 'asc' | 'desc' };
  onTableSort: (key: string) => void;
  onSelectDetailItem: (item: ProcessedItem) => void;
}

export const DevicesTableView: React.FC<DevicesTableViewProps> = ({
  sortedTableData,
  searchTerm,
  sortMetric,
  filterMode,
  tableSortConfig,
  onTableSort,
  onSelectDetailItem,
}) => {
  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (tableSortConfig.key !== columnKey) return <ArrowUpDown className="w-3 h-3 text-slate-300 inline ml-1" />;
    return tableSortConfig.direction === 'desc' 
      ? <ChevronDown className="w-3.5 h-3.5 text-blue-600 inline ml-1 font-bold" />
      : <ChevronUp className="w-3.5 h-3.5 text-blue-600 inline ml-1 font-bold" />;
  };

  return (
    <Card className="overflow-hidden">
      <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-bold text-slate-900">Apple Silicon Device Benchmarks (devices.json)</h3>
          <span className="text-[10px] text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded-full font-medium">
            {sortedTableData.length} configurations
          </span>
        </div>
        <div className="text-[11px] text-slate-500">
          Linked dynamically to processor.json with zero redundant architectural storage
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-900 font-semibold border-b border-slate-200 whitespace-nowrap select-none">
            <tr>
              <th onClick={() => onTableSort('model')} className="px-4 py-3 pl-6 w-1/4 cursor-pointer hover:bg-slate-100 transition-colors">
                Model <SortIcon columnKey="model" />
              </th>
              <th onClick={() => onTableSort('year')} className="px-4 py-3 w-20 cursor-pointer hover:bg-slate-100 transition-colors">
                Year <SortIcon columnKey="year" />
              </th>
              <th onClick={() => onTableSort(filterMode === 'tier' ? 'tier' : 'family')} className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors">
                {filterMode === 'tier' ? 'Tier' : 'Chipset'} <SortIcon columnKey={filterMode === 'tier' ? 'tier' : 'family'} />
              </th>
              <th onClick={() => onTableSort('clock')} className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors">
                GHz <SortIcon columnKey="clock" />
              </th>
              <th onClick={() => onTableSort('cpuCores')} className="px-4 py-3 text-right cursor-pointer hover:bg-slate-100 transition-colors">
                Cores (C/G) <SortIcon columnKey="cpuCores" />
              </th>
              
              <th onClick={() => onTableSort('scores.bandwidth')} className={`px-4 py-3 text-right cursor-pointer hover:bg-slate-100 transition-colors ${sortMetric === 'bandwidth' ? 'text-blue-600 bg-blue-50' : ''}`}>
                Memory BW <SortIcon columnKey="scores.bandwidth" />
              </th>
              <th onClick={() => onTableSort('scores.single')} className={`px-4 py-3 text-right cursor-pointer hover:bg-slate-100 transition-colors ${sortMetric === 'single' ? 'text-blue-600 bg-blue-50' : ''}`}>
                Single <SortIcon columnKey="scores.single" />
              </th>
              <th onClick={() => onTableSort('scores.multi')} className={`px-4 py-3 text-right cursor-pointer hover:bg-slate-100 transition-colors ${sortMetric === 'multi' ? 'text-blue-600 bg-blue-50' : ''}`}>
                Multi <SortIcon columnKey="scores.multi" />
              </th>
              <th onClick={() => onTableSort('scores.metal')} className={`px-4 py-3 text-right cursor-pointer hover:bg-slate-100 transition-colors ${sortMetric === 'metal' ? 'text-blue-600 bg-blue-50' : ''}`}>
                Metal <SortIcon columnKey="scores.metal" />
              </th>
              <th onClick={() => onTableSort('scores.opencl')} className={`px-4 py-3 text-right pr-6 cursor-pointer hover:bg-slate-100 transition-colors ${sortMetric === 'opencl' ? 'text-blue-600 bg-blue-50' : ''}`}>
                OpenCL <SortIcon columnKey="scores.opencl" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedTableData.map((item, idx) => (
              <tr 
                key={item.id || idx} 
                onClick={() => onSelectDetailItem(item)}
                title="Click to view detailed architecture specs & die shots"
                className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
              >
                <td className="px-4 py-2 pl-6 font-medium text-slate-900 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <span>{item.model}</span>
                    {item.ram && (
                      <span className="text-[10px] px-1.5 py-0.2 bg-purple-50 text-purple-700 border border-purple-200 rounded font-mono font-medium">
                        {item.ram}
                      </span>
                    )}
                    {item.rayTracing && (
                      <span className="text-[9px] px-1 py-0.2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded font-medium">RT</span>
                    )}
                    {item.processor?.dieShots && item.processor.dieShots.length > 0 && (
                      <span className="text-[9px] px-1 py-0.2 bg-sky-50 text-sky-600 border border-sky-100 rounded font-medium flex items-center gap-0.5" title="Die shot available">
                        <Image className="w-2.5 h-2.5" /> Die
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-2 text-slate-500">{item.year}</td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium text-white shadow-sm" style={{ backgroundColor: filterMode === 'tier' ? TIER_COLORS[item.tier] : FAMILY_COLORS[item.family] || '#94a3b8' }}>
                    {getChipsetTag(item)}
                  </span>
                </td>
                <td className="px-4 py-2 text-slate-500 font-mono text-[11px]">{item.clock}</td>
                <td className="px-4 py-2 text-right font-mono text-[11px]">
                  {item.cpuCores > 0 ? item.cpuCores : '-'} <span className="text-slate-300">/</span> {item.gpuCores > 0 ? item.gpuCores : '-'}
                </td>
                
                <td className={`px-4 py-2 text-right font-mono text-[11px] ${sortMetric === 'bandwidth' ? 'font-bold text-slate-900 bg-blue-50/50' : 'text-slate-600'}`}>
                  <span className="font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                    {item.scores.bandwidth ? `${item.scores.bandwidth} GB/s` : '-'}
                  </span>
                </td>
                <td className={`px-4 py-2 text-right font-mono text-[11px] ${sortMetric === 'single' ? 'font-bold text-slate-900 bg-blue-50/50' : 'text-slate-500'}`}>
                  {item.scores.single > 0 ? item.scores.single.toLocaleString() : '-'}
                </td>
                <td className={`px-4 py-2 text-right font-mono text-[11px] ${sortMetric === 'multi' ? 'font-bold text-slate-900 bg-blue-50/50' : 'text-slate-500'}`}>
                  {item.scores.multi > 0 ? item.scores.multi.toLocaleString() : '-'}
                </td>
                <td className={`px-4 py-2 text-right font-mono text-[11px] ${sortMetric === 'metal' ? 'font-bold text-slate-900 bg-blue-50/50' : 'text-slate-500'}`}>
                  {item.scores.metal > 0 ? item.scores.metal.toLocaleString() : '-'}
                </td>
                <td className={`px-4 py-2 text-right pr-6 font-mono text-[11px] ${sortMetric === 'opencl' ? 'font-bold text-slate-900 bg-blue-50/50' : 'text-slate-500'}`}>
                  {item.scores.opencl > 0 ? item.scores.opencl.toLocaleString() : '-'}
                </td>
              </tr>
            ))}
            {sortedTableData.length === 0 && (
              <tr>
                <td colSpan={10} className="p-12 text-center text-slate-400">
                  No results found for "{searchTerm}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
