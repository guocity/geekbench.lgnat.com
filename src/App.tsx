import React, { useState, useEffect, useMemo } from 'react';
import { 
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import { 
  Cpu, Activity, Zap, Layers, Search, AlertCircle, RefreshCw, 
  Monitor, Database, LayoutDashboard, ChevronDown, ChevronUp, ArrowUpDown,
  X
} from 'lucide-react';
import { AppleSiliconBenchmark, ProcessedItem, AggregatedChipGroup } from './types';

const FAMILY_COLORS: Record<string, string> = {
  "M1": "#2563eb", // Blue-600
  "M2": "#9333ea", // Purple-600
  "M3": "#e11d48", // Rose-600
  "M4": "#059669", // Emerald-600
  "M5": "#d97706", // Amber-600
  "M6": "#0284c7", // Sky-600
};

const TIER_COLORS: Record<string, string> = {
  "A-Series": "#64748b", // Slate-500
  "base": "#3b82f6",     // Blue-500
  "pro": "#8b5cf6",      // Violet-500
  "max": "#10b981",      // Emerald-500
  "ultra": "#f59e0b"     // Amber-500
};

const TIER_LABELS: Record<string, string> = {
  "A-Series": "A",
  "base": "Base",
  "pro": "Pro",
  "max": "Max",
  "ultra": "Ultra"
};

const DEVICES = ['iPhone', 'iPad', 'Mac mini', 'Mac Studio', 'iMac', 'MacBook Air', 'MacBook Pro', 'Mac Pro'] as const;

const DEVICE_COLORS: Record<string, string> = {
  'iPhone': '#3b82f6', // blue
  'iPad': '#8b5cf6', // purple
  'Mac mini': '#10b981', // emerald
  'Mac Studio': '#14b8a6', // teal
  'iMac': '#06b6d4', // cyan
  'MacBook Air': '#f59e0b', // amber
  'MacBook Pro': '#f97316', // orange
  'Mac Pro': '#ef4444' // red
};

type MetricKey = 'single' | 'multi' | 'metal' | 'opencl' | 'bandwidth';

const METRIC_LABELS: Record<MetricKey, string> = {
  single: 'Single-Core',
  multi: 'Multi-Core',
  metal: 'Metal (GPU)',
  opencl: 'OpenCL',
  bandwidth: 'Memory BW'
};

const formatChipName = (family: string, tierStr: string, chip?: string): string => {
  if (chip) return chip;
  if (tierStr === 'A-Series') {
    const aSeriesMap: Record<string, string> = { 'M0': 'A14', 'M1': 'A15', 'M2': 'A16', 'M3': 'A17 Pro', 'M4': 'A18', 'M5': 'A19', 'M6': 'A20' };
    return aSeriesMap[family] || `${family} A-Series`;
  }
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  if (tierStr.startsWith('base')) {
    const extra = tierStr.replace('base', '').trim();
    return extra ? `${family} ${extra}` : family;
  }
  return `${family} ${capitalize(tierStr)}`;
};

const getChipsetTag = (item: AppleSiliconBenchmark | ProcessedItem): string => {
  return item.chip || formatChipName(item.family, item.tier);
};

// --- Helper Components ---
interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = "", onClick }) => (
  <div onClick={onClick} className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>
    {children}
  </div>
);

interface StatItemProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
}

const StatItem: React.FC<StatItemProps> = ({ label, value, subtext, icon: Icon, colorClass }) => (
  <div className="flex items-center gap-3 p-2.5">
    <div className={`p-2 rounded-xl ${colorClass} bg-opacity-10 shrink-0`}>
      <Icon className={`w-5 h-5 ${colorClass.replace('bg-', 'text-')}`} />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-medium text-slate-500 truncate">{label}</p>
      <div className="flex items-baseline gap-1.5">
        <h3 className="text-xl font-bold text-slate-900 tracking-tight">{value}</h3>
        {subtext && <span className="text-[10px] text-slate-400 font-medium truncate">{subtext}</span>}
      </div>
    </div>
  </div>
);

// --- Sub-Components ---
interface CustomRangeBarProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fill?: string;
  fillOpacity?: number;
  payload?: any;
  dataKey?: string;
  valueFormat?: (v: number) => string;
}

const CustomRangeBar = React.memo<CustomRangeBarProps>((props) => {
  const { 
    x = 0, 
    y = 0, 
    width = 0, 
    height = 0, 
    fill = '#3b82f6', 
    fillOpacity = 1, 
    payload = {}, 
    dataKey = 'maxScore', 
    valueFormat = (v: number) => v.toLocaleString() 
  } = props;
  
  const minKey = dataKey.replace('max', 'min');
  const min = payload[minKey] || 0;
  const max = payload[dataKey] || 0;

  const scale = max > 0 ? width / max : 0;
  const minWidth = min * scale;
  
  const barY = y + 1;
  const barH = Math.max(height - 2, 4);

  return (
    <g opacity={fillOpacity}>
      <rect x={x} y={barY} width={width} height={barH} fill={fill} opacity={0.25} rx={3} />
      {minWidth > 0 && (
        <rect x={x} y={barY} width={minWidth} height={barH} fill={fill} opacity={0.9} rx={3} />
      )}
      <text 
        x={x + width + 5} 
        y={y + height / 2} 
        dy={3} 
        fontSize={8.5} 
        fill="#64748b" 
        fontWeight="600"
      >
        {max > 0 ? valueFormat(payload[dataKey.replace('min', 'max')] ?? max) : '-'}
      </text>
    </g>
  );
});

interface MetricScatterProps {
  title: string;
  metricKey: MetricKey;
  xKey: string;
  xLabel: string;
  isYear?: boolean;
  sortMetric: MetricKey;
  filteredData: ProcessedItem[];
  onGroupSelect: (group: string) => void;
  onSelectDetail: (item: ProcessedItem) => void;
  selectedGroup: string | null;
  selectedDevice: string | null;
  filterMode: 'family' | 'tier';
}

const MetricScatter = React.memo<MetricScatterProps>(({ 
  title, 
  metricKey, 
  xKey, 
  xLabel, 
  isYear = false, 
  sortMetric, 
  filteredData, 
  onGroupSelect, 
  onSelectDetail, 
  selectedGroup, 
  selectedDevice, 
  filterMode 
}) => {
  const colorMap = filterMode === 'family' ? FAMILY_COLORS : TIER_COLORS;
  const groupKey = filterMode === 'family' ? 'family' : 'tier';

  return (
    <div className={`flex flex-col h-[255px] transition-colors duration-200 p-2.5 rounded-2xl border shadow-sm ${sortMetric === metricKey ? 'border-blue-400 bg-blue-50/20 ring-2 ring-blue-50' : 'border-slate-200 bg-white'}`}>
      <div className="flex justify-between items-center mb-1 px-1.5 shrink-0">
        <div>
          <h3 className={`font-bold text-sm ${sortMetric === metricKey ? 'text-blue-600' : 'text-slate-700'}`}>{title}</h3>
          <p className="text-[10px] text-slate-400">Score vs {xLabel}</p>
        </div>
      </div>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="#f1f5f9" vertical={false} />
            <XAxis 
              type="number" 
              dataKey={xKey} 
              name={xLabel} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              domain={isYear ? [2020, 2026] : ['auto', 'auto']}
              ticks={isYear ? [2020, 2021, 2022, 2023, 2024, 2025, 2026] : undefined}
              allowDecimals={false}
              dy={2}
            />
            <YAxis 
              type="number" 
              dataKey={`scores.${metricKey}`} 
              name="Score" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              tickFormatter={(val: number) => val >= 1000 ? `${(val/1000).toFixed(0)}k` : `${val}`}
              width={38}
            />
            <RechartsTooltip 
              cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload as ProcessedItem;
                  if (d.scores[metricKey] === 0) return null;

                  return (
                    <div className="bg-white/95 backdrop-blur-sm p-2 rounded-lg shadow-lg border border-slate-200 text-[11px] z-50">
                      <div className="font-bold text-slate-800 mb-1">{d.model}</div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-slate-600">
                        <span className="capitalize">{metricKey === 'bandwidth' ? 'Bandwidth' : metricKey}:</span> 
                        <span className="text-right font-mono font-bold text-emerald-600">
                          {metricKey === 'bandwidth' ? `${d.scores[metricKey]} GB/s` : d.scores[metricKey].toLocaleString()}
                        </span>
                        <span>{xLabel}:</span> <span className="text-right font-mono">{(d as any)[xKey]}</span>
                        <span>Chip:</span> <span className="text-right font-medium text-blue-600">{getChipsetTag(d)}</span>
                        <span>Memory BW:</span> <span className="text-right font-mono text-purple-600 font-semibold">{d.memoryBandwidth || d.scores.bandwidth || '-'} GB/s</span>
                        <span>Clock:</span> <span className="text-right font-mono text-slate-500">{d.clock} {d.clock !== '-' && 'GHz'}</span>
                        {d.processNode && <><span>Process:</span> <span className="text-right font-medium text-slate-500">{d.processNode}</span></>}
                      </div>
                      <div className="mt-1.5 pt-1 border-t border-slate-100 text-[9.5px] text-blue-500 text-center font-medium">Click point to view full specs</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            {Object.keys(colorMap).map(key => {
              const scatterData = filteredData.filter(d => (d as any)[groupKey] === key && d.scores[metricKey] > 0 && (d as any)[xKey] > 0);
              return (
                <Scatter 
                  key={key} 
                  name={key} 
                  data={scatterData} 
                  fill={colorMap[key]} 
                  stroke="none"
                  shape="circle"
                  isAnimationActive={false}
                  onClick={(entry: any) => {
                    if (entry && entry.payload) {
                      onSelectDetail(entry.payload as ProcessedItem);
                    } else {
                      onGroupSelect(key);
                    }
                  }}
                  cursor="pointer"
                >
                  {scatterData.map((entry, index) => {
                    const isGroupFaded = selectedGroup && selectedGroup !== key;
                    const isDeviceFaded = selectedDevice && entry.device !== selectedDevice;
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fillOpacity={isGroupFaded || isDeviceFaded ? 0.1 : 1} 
                      />
                    );
                  })}
                </Scatter>
              );
            })}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

interface MetricBarChartProps {
  title: string;
  subtitle: string;
  badgeText: string;
  badgeClass: string;
  data: AggregatedChipGroup[];
  dataKey: string;
  tooltipRanges: (d: AggregatedChipGroup) => { range: string; avg: string };
  valueFormat: (v: number) => string;
  onGroupSelect: (group: string) => void;
  selectedGroup: string | null;
  selectedDevice: string | null;
  filterMode: 'family' | 'tier';
}

const MetricBarChart = React.memo<MetricBarChartProps>(({ 
  title, 
  subtitle, 
  badgeText, 
  badgeClass, 
  data, 
  dataKey, 
  tooltipRanges, 
  valueFormat, 
  onGroupSelect, 
  selectedGroup, 
  selectedDevice, 
  filterMode 
}) => {
  const colorMap = filterMode === 'family' ? FAMILY_COLORS : TIER_COLORS;
  const groupKey = filterMode === 'family' ? 'family' : 'tier';

  return (
    <Card className="p-3.5 h-[520px] flex flex-col overflow-hidden">
      <div className="flex justify-between items-start mb-2 shrink-0">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
          <p className="text-[10px] text-slate-500">{subtitle}</p>
        </div>
        <div className={`text-[9px] font-semibold px-2 py-1 rounded uppercase tracking-wide ${badgeClass}`}>
          {badgeText}
        </div>
      </div>
      <div className="flex-1 w-full min-h-0 overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={data} 
              layout="vertical" 
              margin={{ left: -5, right: 65, top: 0, bottom: 0 }}
              barCategoryGap="8%"
            >
              <CartesianGrid horizontal={true} vertical={false} stroke="#f1f5f9" />
              <XAxis type="number" hide />
              <YAxis 
                type="category" 
                dataKey="displayName" 
                width={65} 
                tick={({ x, y, payload }: any) => (
                  <text 
                    x={x} 
                    y={y} 
                    dy={3} 
                    textAnchor="end" 
                    fill="#64748b" 
                    fontSize={8.5} 
                    fontWeight={500}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    {payload.value}
                  </text>
                )}
                axisLine={false} 
                tickLine={false}
                interval={0}
              />
            <RechartsTooltip 
              cursor={{fill: '#f8fafc'}} 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload as AggregatedChipGroup;
                  const { range, avg } = tooltipRanges(d);
                  return (
                    <div className="bg-white/95 backdrop-blur-sm p-2 rounded-lg shadow-lg border border-slate-200 text-[11px] z-50 min-w-[140px]">
                      <div className="font-bold text-slate-800 mb-1">{d.displayName}</div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-slate-600">
                        <span>Range:</span> <span className="text-right font-mono font-medium text-slate-900">{range}</span>
                        <span>Average:</span> <span className="text-right font-mono font-bold text-slate-900">{avg}</span>
                        {d.bandwidthStr && <><span>Bandwidth:</span> <span className="text-right font-mono text-purple-600 font-semibold">{d.bandwidthStr}</span></>}
                        <span>Cores:</span> <span className="text-right font-mono text-slate-500">{d.coreCountsStr}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar 
              dataKey={dataKey} 
              shape={(props: any) => <CustomRangeBar {...props} valueFormat={valueFormat} />}
              isAnimationActive={false}
              onClick={(d: any) => onGroupSelect(d[groupKey])}
              cursor="pointer"
            >
              {data.map((entry, idx) => {
                const isGroupFaded = selectedGroup && selectedGroup !== (entry as any)[groupKey];
                const isDeviceFaded = selectedDevice && !entry.devices.has(selectedDevice);
                return (
                  <Cell 
                    key={idx} 
                    fill={colorMap[(entry as any)[groupKey]]} 
                    fillOpacity={isGroupFaded || isDeviceFaded ? 0.1 : 1}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
});

// Device Details Modal
interface DeviceDetailModalProps {
  item: ProcessedItem | null;
  onClose: () => void;
}

const DeviceDetailModal: React.FC<DeviceDetailModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                {item.chip || item.family}
              </span>
              <span className="text-xs font-medium text-slate-400">
                {item.year}
              </span>
              {item.rayTracing && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Hardware RT
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-slate-900">{item.model}</h3>
            <p className="text-xs text-slate-500">{item.device} · {item.tier} tier</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Specs Grid */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Key Scores Section */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-blue-50/60 p-2.5 rounded-xl border border-blue-100/60">
              <span className="text-[10px] uppercase font-bold text-blue-600 block">Single-Core</span>
              <span className="text-lg font-extrabold text-slate-900 font-mono">
                {item.scores?.single ? item.scores.single.toLocaleString() : (item.single ? item.single.toLocaleString() : '-')}
              </span>
            </div>
            <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100/60">
              <span className="text-[10px] uppercase font-bold text-emerald-600 block">Multi-Core</span>
              <span className="text-lg font-extrabold text-slate-900 font-mono">
                {item.scores?.multi ? item.scores.multi.toLocaleString() : (item.multi ? item.multi.toLocaleString() : '-')}
              </span>
            </div>
            <div className="bg-purple-50/60 p-2.5 rounded-xl border border-purple-100/60">
              <span className="text-[10px] uppercase font-bold text-purple-600 block">Metal GPU</span>
              <span className="text-lg font-extrabold text-slate-900 font-mono">
                {item.scores?.metal > 0 ? item.scores.metal.toLocaleString() : (item.metal > 0 ? item.metal.toLocaleString() : '-')}
              </span>
            </div>
            <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-100/60">
              <span className="text-[10px] uppercase font-bold text-amber-600 block">OpenCL</span>
              <span className="text-lg font-extrabold text-slate-900 font-mono">
                {item.scores?.opencl > 0 ? item.scores.opencl.toLocaleString() : (item.opencl > 0 ? item.opencl.toLocaleString() : '-')}
              </span>
            </div>
          </div>

          {/* Architecture Specifications */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Silicon Architecture</h4>
            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[11px]">Process Node</span>
                <span className="font-semibold text-slate-800">{item.processNode || 'TSMC Process'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Packaging</span>
                <span className="font-semibold text-slate-800">{item.packaging || 'Apple SiP'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">CPU Configuration</span>
                <span className="font-semibold text-slate-800">
                  {item.coreConfig ? `${item.coreConfig} (${item.cpuCores} total)` : `${item.cpuCores} cores`}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">GPU Cores</span>
                <span className="font-semibold text-slate-800">{item.gpuCores} cores</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Peak Clock</span>
                <span className="font-semibold text-slate-800 font-mono">{item.clock} {item.clock !== '-' && 'GHz'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Neural Engine (NPU)</span>
                <span className="font-semibold text-slate-800">
                  {item.aneTops ? `${item.neuralEngineCores || 16}-core (${item.aneTops} TOPS)` : '16-core ANE'}
                </span>
              </div>
            </div>
          </div>

          {/* Memory Architecture */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Memory & Subsystem</h4>
            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[11px]">Memory Bandwidth</span>
                <span className="font-semibold text-purple-700 font-mono">{item.memoryBandwidth || item.scores?.bandwidth || '-'} GB/s</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Bus Width</span>
                <span className="font-semibold text-slate-800 font-mono">{item.memoryBusWidth || (item.busWidthBits ? `${item.busWidthBits}-bit` : '-')}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Memory Tech</span>
                <span className="font-semibold text-slate-800">{item.memoryType || 'Unified Memory'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">System-Level Cache (SLC)</span>
                <span className="font-semibold text-slate-800">{item.systemCache || (item.slcMB ? `${item.slcMB} MB` : '-')}</span>
              </div>
            </div>
          </div>

          {/* Summary String */}
          {item.specs && (
            <div className="text-[11px] text-slate-500 bg-slate-100/70 p-2.5 rounded-lg border border-slate-200">
              <span className="font-medium text-slate-700 block mb-0.5">Specifications Summary:</span>
              {item.specs}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Application ---
export default function App() {
  const [rawData, setRawData] = useState<AppleSiliconBenchmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [sortMetric, setSortMetric] = useState<MetricKey>('multi'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'dashboard' | 'list'>('dashboard');
  
  const [filterMode, setFilterMode] = useState<'family' | 'tier'>('family');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null); 
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState<ProcessedItem | null>(null);

  // Table Sorting State
  const [tableSortConfig, setTableSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'scores.multi', direction: 'desc' });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      let data: AppleSiliconBenchmark[] | null = null;
      const paths = [
        './data.json',
        'data.json',
        './geekbench-data.json',
        '/data.json',
        './do-not-edit-json-in-this-folder/geekbench-data.json',
        '/do-not-edit-json-in-this-folder/geekbench-data.json'
      ];

      for (const p of paths) {
        try {
          const res = await fetch(p);
          if (res.ok) {
            data = await res.json();
            if (Array.isArray(data) && data.length > 0) break;
          }
        } catch {
          // Fallback to next path
        }
      }

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("Failed to load /data.json or benchmark dataset");
      }

      setRawData(data);
    } catch (err) {
      console.error("Data load failed:", err);
      setError("Unable to load benchmark dataset. Please ensure data.json is present in the root or public folder.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const processedData = useMemo<ProcessedItem[]>(() => {
    if (!rawData.length) return [];
    return rawData
      .filter(item => item.family !== "Unknown" && (item.single > 0 || item.multi > 0 || item.metal > 0 || (item.memoryBandwidth || 0) > 0))
      .map(item => ({
        ...item,
        memoryBandwidth: item.memoryBandwidth || 0,
        scores: { 
          single: item.single || 0, 
          multi: item.multi || 0, 
          metal: item.metal || 0, 
          opencl: item.opencl || 0,
          bandwidth: item.memoryBandwidth || 0
        }
      }))
      .sort((a, b) => (b.scores[sortMetric] || 0) - (a.scores[sortMetric] || 0));
  }, [rawData, sortMetric]);

  const filteredData = useMemo<ProcessedItem[]>(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return processedData;
    return processedData.filter(item => 
      (item.model?.toLowerCase().includes(q) || 
       item.specs?.toLowerCase().includes(q) ||
       item.chip?.toLowerCase().includes(q) ||
       item.processNode?.toLowerCase().includes(q) ||
       item.device?.toLowerCase().includes(q) ||
       item.coreConfig?.toLowerCase().includes(q) ||
       item.memoryType?.toLowerCase().includes(q))
    );
  }, [processedData, searchTerm]);

  const activeData = useMemo<ProcessedItem[]>(() => {
    const groupKey = filterMode === 'family' ? 'family' : 'tier';
    return filteredData.filter(item => 
      (!selectedGroup || (item as any)[groupKey] === selectedGroup) &&
      (!selectedDevice || item.device === selectedDevice)
    );
  }, [filteredData, selectedGroup, selectedDevice, filterMode]);

  const aggregatedData = useMemo<AggregatedChipGroup[]>(() => {
    const groups: Record<string, AggregatedChipGroup> = {};
    const groupKey = filterMode === 'family' ? 'family' : 'tier';
    
    filteredData.forEach(item => {
      const key = item.chip || `${item.family} ${item.tier}`;
      
      if (!groups[key]) {
        groups[key] = { 
          displayName: item.chip || formatChipName(item.family, item.tier),
          family: item.family,
          tier: item.tier,
          [groupKey]: (item as any)[groupKey],
          gpuCores: item.gpuCores,
          scores: [], effs: [], clocks: [], ghzEffs: [], bandwidths: [], cores: new Set(), devices: new Set(),
          minScore: 0, maxScore: 0, avgScore: 0,
          minEff: 0, maxEff: 0, avgEff: 0,
          minGhz: 0, maxGhz: 0, avgGhz: 0,
          minGhzEff: 0, maxGhzEff: 0, avgGhzEff: 0,
          minBw: 0, maxBw: 0, avgBw: 0,
          bandwidthStr: '', coreCountsStr: ''
        };
      }
      
      groups[key].devices.add(item.device);
      if (item.memoryBandwidth || item.scores.bandwidth) {
        groups[key].bandwidths.push(item.memoryBandwidth || item.scores.bandwidth);
      }

      const currentScore = item.scores[sortMetric] || 0;
      let activeCores = 0;
      if (sortMetric === 'multi') activeCores = item.cpuCores;
      else if (sortMetric === 'single') activeCores = item.cpuCores > 0 ? 1 : 0;
      else if (sortMetric === 'metal' || sortMetric === 'opencl') activeCores = item.gpuCores;

      if (currentScore > 0) {
        groups[key].scores.push(currentScore);
        if (activeCores > 0) groups[key].cores.add(activeCores);
      }

      const effMetric = sortMetric === 'bandwidth' ? 'multi' : sortMetric;
      const effScore = item.scores[effMetric] || 0;
      const effCores = effMetric === 'single' ? 1 : effMetric === 'multi' ? item.cpuCores : item.gpuCores;
      if (effCores > 0 && effScore > 0) {
        groups[key].effs.push(effScore / effCores);
      }

      const clockNum = parseFloat(item.clock);
      const ghzScore = sortMetric === 'bandwidth' ? (item.scores.multi || 0) : currentScore;
      if (!isNaN(clockNum) && clockNum > 0 && ghzScore > 0) {
        groups[key].clocks.push(clockNum);
        groups[key].ghzEffs.push(ghzScore / clockNum);
      }
    });

    return Object.values(groups)
      .filter(g => g.scores.length > 0)
      .map(g => {
        const minScore = Math.min(...g.scores);
        const maxScore = Math.max(...g.scores);
        const avgScore = Math.round(g.scores.reduce((a, b) => a + b, 0) / g.scores.length);

        const minEff = Math.min(...g.effs);
        const maxEff = Math.max(...g.effs);
        const avgEff = Math.round(g.effs.reduce((a, b) => a + b, 0) / g.effs.length);

        const minGhz = g.clocks.length ? Math.min(...g.clocks) : 0;
        const maxGhz = g.clocks.length ? Math.max(...g.clocks) : 0;
        const avgGhz = g.clocks.length ? g.clocks.reduce((a, b) => a + b, 0) / g.clocks.length : 0;

        const minGhzEff = g.ghzEffs.length ? Math.min(...g.ghzEffs) : 0;
        const maxGhzEff = g.ghzEffs.length ? Math.max(...g.ghzEffs) : 0;
        const avgGhzEff = g.ghzEffs.length ? Math.round(g.ghzEffs.reduce((a, b) => a + b, 0) / g.ghzEffs.length) : 0;

        const minBw = g.bandwidths.length ? Math.min(...g.bandwidths) : 0;
        const maxBw = g.bandwidths.length ? Math.max(...g.bandwidths) : 0;
        const avgBw = g.bandwidths.length ? Math.round((g.bandwidths.reduce((a, b) => a + b, 0) / g.bandwidths.length) * 10) / 10 : 0;

        return {
          ...g,
          minScore, maxScore, avgScore,
          minEff: Math.round(minEff), maxEff: Math.round(maxEff), avgEff,
          minGhz, maxGhz, avgGhz,
          minGhzEff: Math.round(minGhzEff), maxGhzEff: Math.round(maxGhzEff), avgGhzEff,
          minBw, maxBw, avgBw,
          bandwidthStr: avgBw > 0 ? `${avgBw} GB/s` : '-',
          coreCountsStr: Array.from(g.cores).sort((a,b)=>a-b).join(', ') || '-'
        };
      })
      .sort((a, b) => {
        const getAOrder = (name: string) => {
          const m = name.match(/A(\d+)([XZ])?(?:\s+(Pro))?/i);
          if (m) {
            let val = parseInt(m[1], 10);
            if (m[2]?.toUpperCase() === 'X') val += 0.1;
            if (m[2]?.toUpperCase() === 'Z') val += 0.2;
            if (m[3]) val += 0.5;
            return val;
          }
          return 0;
        };

        const tierRank: Record<string, number> = { "A-Series": 0, "base": 1, "pro": 2, "max": 3, "ultra": 4 };

        if (filterMode === 'tier') {
          const tierDiff = (tierRank[a.tier] ?? 5) - (tierRank[b.tier] ?? 5);
          if (tierDiff !== 0) return tierDiff;
          if (a.tier === 'A-Series') {
            return getAOrder(a.displayName) - getAOrder(b.displayName);
          }
          return (a.family || '').localeCompare(b.family || '');
        } else {
          const famDiff = (a.family || '').localeCompare(b.family || '');
          if (famDiff !== 0) return famDiff;
          const rankDiff = (tierRank[a.tier] ?? 5) - (tierRank[b.tier] ?? 5);
          if (rankDiff !== 0) return rankDiff;
          if (a.tier === 'A-Series') {
            return getAOrder(a.displayName) - getAOrder(b.displayName);
          }
          return (a.gpuCores || 0) - (b.gpuCores || 0);
        }
      });
  }, [filteredData, sortMetric, filterMode]);

  const sortedTableData = useMemo<ProcessedItem[]>(() => {
    let sortableItems = [...activeData];
    sortableItems.sort((a, b) => {
      let aVal: any = a;
      let bVal: any = b;
      
      const keys = tableSortConfig.key.split('.');
      for (let k of keys) {
        aVal = aVal?.[k];
        bVal = bVal?.[k];
      }

      if (tableSortConfig.key === 'clock') {
        aVal = parseFloat(a.clock) || 0;
        bVal = parseFloat(b.clock) || 0;
      }

      if (aVal === bVal) return 0;
      
      if (typeof aVal === 'string') {
        return tableSortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      
      return tableSortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
    });
    return sortableItems;
  }, [activeData, tableSortConfig]);

  const familyStats = useMemo(() => new Set(processedData.map(d => d.family)).size, [processedData]);
  
  const handleFilterModeChange = (mode: 'family' | 'tier') => {
    setFilterMode(mode);
    setSelectedGroup(null);
  };
  const handleGroupSelect = (key: string) => setSelectedGroup(prev => prev === key ? null : key);
  const handleDeviceSelect = (dev: string) => setSelectedDevice(prev => prev === dev ? null : dev);

  const handleTableSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'desc';
    if (tableSortConfig.key === key && tableSortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setTableSortConfig({ key, direction });
    
    if (key.startsWith('scores.')) {
      setSortMetric(key.split('.')[1] as MetricKey);
    }
  };

  const SortIcon: React.FC<{ columnKey: string }> = ({ columnKey }) => {
    if (tableSortConfig.key !== columnKey) return <ArrowUpDown className="w-3 h-3 inline ml-1 text-slate-300 opacity-50" />;
    return tableSortConfig.direction === 'asc' 
      ? <ChevronUp className="w-4 h-4 inline ml-0.5 text-blue-600" />
      : <ChevronDown className="w-4 h-4 inline ml-0.5 text-blue-600" />;
  };

  const activeColorMap = filterMode === 'family' ? FAMILY_COLORS : TIER_COLORS;
  const getGroupLabel = (key: string) => filterMode === 'tier' ? TIER_LABELS[key] || key : key;

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
      <h2 className="text-xl font-semibold text-slate-700 mb-2">Fetching Benchmark Data...</h2>
      <p className="text-sm text-slate-400">Loading metrics for Mac & iOS architectures</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center border-red-100">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Unable to Load Data</h2>
        <p className="text-slate-600 mb-6">{error}</p>
        <button onClick={fetchData} className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4" /> Retry Connection
        </button>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 pb-0">
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="w-full mx-auto px-2 xl:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 md:gap-4">
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <div className="bg-slate-900 text-white p-1.5 sm:p-2 rounded-lg shadow-sm">
              <Cpu className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="hidden md:block font-bold text-lg tracking-tight">Silicon<span className="text-slate-400 font-normal">Bench</span></span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 md:gap-3 flex-1 justify-end min-w-0">
            {/* Desktop Full Chipset / Mode Bar (shown when enough space: xl+) */}
            <div className="hidden xl:flex items-center shrink-0">
              <div className="flex bg-slate-200/60 p-1 rounded-xl items-center gap-1 mr-2">
                <button 
                  onClick={() => handleFilterModeChange('family')} 
                  className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all ${filterMode === 'family' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Gen
                </button>
                <button 
                  onClick={() => handleFilterModeChange('tier')} 
                  className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all ${filterMode === 'tier' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Tier
                </button>
              </div>

              <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                {Object.keys(activeColorMap).map(key => (
                  <button
                    key={key}
                    onClick={() => handleGroupSelect(key)}
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
                        onClick={() => handleFilterModeChange('family')} 
                        className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all ${filterMode === 'family' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        Gen
                      </button>
                      <button 
                        onClick={() => handleFilterModeChange('tier')} 
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
                            handleGroupSelect(key);
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
                  onClick={() => setSortMetric(key)}
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
                    onClick={() => setSortMetric(key)}
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
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-100 focus:bg-white border border-transparent focus:border-blue-500 pl-8 pr-3 py-1.5 rounded-xl text-xs transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
             <div className="bg-slate-100 p-1 rounded-lg flex shrink-0">
                <button 
                  onClick={() => setViewMode('dashboard')}
                  title="Dashboard View"
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'dashboard' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  title="Table View"
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <Database className="w-4 h-4" />
                </button>
             </div>
          </div>
        </div>
      </div>

      <main className="w-full px-2 xl:px-8 py-3 pb-8 space-y-3">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          <Card>
            <StatItem label="Models" value={activeData.length} icon={Monitor} colorClass="bg-blue-500" />
          </Card>
          <Card>
            <StatItem 
              label={`Top ${METRIC_LABELS[sortMetric].split(' ')[0]}`}
              value={activeData.length > 0 ? (sortMetric === 'bandwidth' ? `${activeData[0].scores[sortMetric]} GB/s` : activeData[0].scores[sortMetric].toLocaleString()) : '-'}
              subtext={activeData.length > 0 ? activeData[0].model : ''}
              icon={Activity} 
              colorClass="bg-emerald-500" 
            />
          </Card>
          <Card>
            <StatItem 
              label={sortMetric === 'bandwidth' ? "Avg Bandwidth" : "Avg Efficiency"} 
              value={activeData.length > 0 ? (
                sortMetric === 'bandwidth' 
                  ? `${Math.round(activeData.reduce((acc, curr) => acc + (curr.scores.bandwidth || 0), 0) / (activeData.filter(d => (d.scores.bandwidth || 0) > 0).length || 1))} GB/s`
                  : Math.round(activeData.reduce((acc, curr) => acc + (curr.scores[sortMetric] / (sortMetric === 'single' ? 1 : sortMetric === 'multi' ? curr.cpuCores : curr.gpuCores || 1)), 0) / (activeData.filter(d => d.scores[sortMetric] > 0).length || 1)).toLocaleString()
              ) : '-'}
              subtext={sortMetric === 'bandwidth' ? "Bandwidth (GB/s)" : "Score / Core"}
              icon={Zap} 
              colorClass="bg-amber-500" 
            />
          </Card>
          <Card>
            <StatItem 
              label="Generations" 
              value={`${familyStats}`} 
              subtext="M1 – M6 & A-Series"
              icon={Layers} 
              colorClass="bg-purple-500" 
            />
          </Card>
        </div>

        {viewMode === 'dashboard' ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
              <MetricScatter 
                title={METRIC_LABELS[sortMetric]} metricKey={sortMetric} xKey="year" xLabel="Year" isYear={true}
                sortMetric={sortMetric} filteredData={filteredData}
                onGroupSelect={handleGroupSelect} onSelectDetail={setSelectedDetailItem} selectedGroup={selectedGroup} selectedDevice={selectedDevice} filterMode={filterMode}
              />
              <MetricScatter 
                title="Multi-Core" metricKey="multi" xKey="cpuCores" xLabel="CPU Cores" 
                sortMetric={sortMetric} filteredData={filteredData}
                onGroupSelect={handleGroupSelect} onSelectDetail={setSelectedDetailItem} selectedGroup={selectedGroup} selectedDevice={selectedDevice} filterMode={filterMode}
              />
              <MetricScatter 
                title="Metal (GPU)" metricKey="metal" xKey="gpuCores" xLabel="GPU Cores" 
                sortMetric={sortMetric} filteredData={filteredData}
                onGroupSelect={handleGroupSelect} onSelectDetail={setSelectedDetailItem} selectedGroup={selectedGroup} selectedDevice={selectedDevice} filterMode={filterMode}
              />
              <MetricScatter 
                title={sortMetric === 'bandwidth' ? "OpenCL" : "Memory Bandwidth"} 
                metricKey={sortMetric === 'bandwidth' ? "opencl" : "bandwidth"} 
                xKey={sortMetric === 'bandwidth' ? "gpuCores" : "year"} 
                xLabel={sortMetric === 'bandwidth' ? "GPU Cores" : "Year"} 
                isYear={sortMetric !== 'bandwidth'}
                sortMetric={sortMetric} filteredData={filteredData}
                onGroupSelect={handleGroupSelect} onSelectDetail={setSelectedDetailItem} selectedGroup={selectedGroup} selectedDevice={selectedDevice} filterMode={filterMode}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
              <MetricBarChart
                title={filterMode === 'tier' ? "Tier Performance" : "Family Performance"} subtitle={`Range & Avg ${METRIC_LABELS[sortMetric]} by ${filterMode === 'tier' ? 'Tier' : 'Chipset'}`}
                badgeText={sortMetric === 'bandwidth' ? "GB/s" : sortMetric} badgeClass="bg-blue-50 text-blue-600"
                data={aggregatedData} dataKey="maxScore" valueFormat={(v) => sortMetric === 'bandwidth' ? `${v.toLocaleString()} GB/s` : v.toLocaleString()}
                tooltipRanges={(d) => ({ 
                  range: sortMetric === 'bandwidth' ? `${d.minScore.toLocaleString()} - ${d.maxScore.toLocaleString()} GB/s` : `${d.minScore.toLocaleString()} - ${d.maxScore.toLocaleString()}`, 
                  avg: sortMetric === 'bandwidth' ? `${d.avgScore.toLocaleString()} GB/s` : d.avgScore.toLocaleString() 
                })}
                onGroupSelect={handleGroupSelect} selectedGroup={selectedGroup} selectedDevice={selectedDevice} filterMode={filterMode}
              />
              <MetricBarChart
                title="Core Efficiency" 
                subtitle={`Range & Avg ${sortMetric === 'bandwidth' ? 'Multi-Core' : METRIC_LABELS[sortMetric]} Score Per Core`}
                badgeText="Score / Core" badgeClass="bg-amber-50 text-amber-600"
                data={aggregatedData} dataKey="maxEff" valueFormat={(v) => v.toLocaleString()}
                tooltipRanges={(d) => ({ 
                  range: `${d.minEff.toLocaleString()} - ${d.maxEff.toLocaleString()}`, 
                  avg: d.avgEff.toLocaleString() 
                })}
                onGroupSelect={handleGroupSelect} selectedGroup={selectedGroup} selectedDevice={selectedDevice} filterMode={filterMode}
              />
              <MetricBarChart
                title="Clock Speed" subtitle={`Range & Avg GHz by ${filterMode === 'tier' ? 'Tier' : 'Chipset'}`}
                badgeText="GHz" badgeClass="bg-emerald-50 text-emerald-600"
                data={aggregatedData} dataKey="maxGhz" valueFormat={(v) => v.toFixed(2)}
                tooltipRanges={(d) => ({ range: `${d.minGhz.toFixed(2)} - ${d.maxGhz.toFixed(2)}`, avg: d.avgGhz.toFixed(2) })}
                onGroupSelect={handleGroupSelect} selectedGroup={selectedGroup} selectedDevice={selectedDevice} filterMode={filterMode}
              />
              <MetricBarChart
                title="GHz Efficiency" subtitle={`Range & Avg ${METRIC_LABELS[sortMetric]} Score Per GHz`}
                badgeText="Score / GHz" badgeClass="bg-purple-50 text-purple-600"
                data={aggregatedData} dataKey="maxGhzEff" valueFormat={(v) => v.toLocaleString()}
                tooltipRanges={(d) => ({ range: `${d.minGhzEff.toLocaleString()} - ${d.maxGhzEff.toLocaleString()}`, avg: d.avgGhzEff.toLocaleString() })}
                onGroupSelect={handleGroupSelect} selectedGroup={selectedGroup} selectedDevice={selectedDevice} filterMode={filterMode}
              />
            </div>

            <div className="flex justify-center mt-2 mb-0">
              <div className="flex flex-wrap gap-2.5 sm:gap-3 items-center justify-center bg-white px-4 sm:px-5 py-2 rounded-full border border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-1">Models</span>
                {DEVICES.map(device => (
                  <button 
                    key={device}
                    onClick={() => handleDeviceSelect(device)}
                    className={`flex items-center gap-1.5 text-[11px] font-medium transition-opacity ${selectedDevice && selectedDevice !== device ? 'opacity-40' : 'opacity-100'}`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: DEVICE_COLORS[device] }}></span>
                    {device}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-900 font-semibold border-b border-slate-200 whitespace-nowrap select-none">
                  <tr>
                    <th onClick={() => handleTableSort('model')} className="px-4 py-3 pl-6 w-1/4 cursor-pointer hover:bg-slate-100 transition-colors">
                      Model <SortIcon columnKey="model" />
                    </th>
                    <th onClick={() => handleTableSort('year')} className="px-4 py-3 w-20 cursor-pointer hover:bg-slate-100 transition-colors">
                      Year <SortIcon columnKey="year" />
                    </th>
                    <th onClick={() => handleTableSort(filterMode === 'tier' ? 'tier' : 'family')} className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors">
                      {filterMode === 'tier' ? 'Tier' : 'Chipset'} <SortIcon columnKey={filterMode === 'tier' ? 'tier' : 'family'} />
                    </th>
                    <th onClick={() => handleTableSort('clock')} className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors">
                      GHz <SortIcon columnKey="clock" />
                    </th>
                    <th onClick={() => handleTableSort('cpuCores')} className="px-4 py-3 text-right cursor-pointer hover:bg-slate-100 transition-colors">
                      Cores (C/G) <SortIcon columnKey="cpuCores" />
                    </th>
                    
                    <th onClick={() => handleTableSort('scores.bandwidth')} className={`px-4 py-3 text-right cursor-pointer hover:bg-slate-100 transition-colors ${sortMetric === 'bandwidth' ? 'text-blue-600 bg-blue-50' : ''}`}>
                      Memory BW <SortIcon columnKey="scores.bandwidth" />
                    </th>
                    <th onClick={() => handleTableSort('scores.single')} className={`px-4 py-3 text-right cursor-pointer hover:bg-slate-100 transition-colors ${sortMetric === 'single' ? 'text-blue-600 bg-blue-50' : ''}`}>
                      Single <SortIcon columnKey="scores.single" />
                    </th>
                    <th onClick={() => handleTableSort('scores.multi')} className={`px-4 py-3 text-right cursor-pointer hover:bg-slate-100 transition-colors ${sortMetric === 'multi' ? 'text-blue-600 bg-blue-50' : ''}`}>
                      Multi <SortIcon columnKey="scores.multi" />
                    </th>
                    <th onClick={() => handleTableSort('scores.metal')} className={`px-4 py-3 text-right cursor-pointer hover:bg-slate-100 transition-colors ${sortMetric === 'metal' ? 'text-blue-600 bg-blue-50' : ''}`}>
                      Metal <SortIcon columnKey="scores.metal" />
                    </th>
                    <th onClick={() => handleTableSort('scores.opencl')} className={`px-4 py-3 text-right pr-6 cursor-pointer hover:bg-slate-100 transition-colors ${sortMetric === 'opencl' ? 'text-blue-600 bg-blue-50' : ''}`}>
                      OpenCL <SortIcon columnKey="scores.opencl" />
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedTableData.map((item, idx) => (
                    <tr 
                      key={item.id || idx} 
                      onClick={() => setSelectedDetailItem(item)}
                      title="Click to view detailed architecture specs"
                      className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                    >
                      <td className="px-4 py-2 pl-6 font-medium text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{item.model}</span>
                          {item.rayTracing && (
                            <span className="text-[9px] px-1 py-0.2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded font-medium">RT</span>
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
        )}
      </main>

      {/* Architecture Detail Modal */}
      <DeviceDetailModal 
        item={selectedDetailItem} 
        onClose={() => setSelectedDetailItem(null)} 
      />
    </div>
  );
}
