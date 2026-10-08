import React, { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Card } from '../common/Card';
import { MetricKey, ProcessedItem, FilterMode } from '../../types';
import { FAMILY_COLORS, TIER_COLORS, getChipsetTag } from '../../constants';

export interface MetricScatterProps {
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
  filterMode: FilterMode;
}

export const MetricScatter = React.memo<MetricScatterProps>(({ 
  title, 
  metricKey, 
  xKey, 
  xLabel, 
  isYear = false, 
  sortMetric,
  filteredData, 
  onSelectDetail, 
  selectedGroup, 
  filterMode 
}) => {
  const colorMap = filterMode === 'tier' ? TIER_COLORS : FAMILY_COLORS;
  const groupKey = filterMode === 'family' ? 'family' : 'tier';

  const xDomain = useMemo(() => {
    if (isYear) return [2019.5, 2026.5];
    const vals = filteredData.map(d => (d as any)[xKey]).filter(v => v !== undefined && v > 0);
    return vals.length ? [Math.min(...vals) - 1, Math.max(...vals) + 1] : ['auto', 'auto'];
  }, [filteredData, xKey, isYear]);

  return (
    <Card className={`p-3 h-[255px] flex flex-col transition-all ${sortMetric === metricKey ? 'border-blue-400 ring-2 ring-blue-100 bg-blue-50/10' : ''}`}>
      <div className="flex items-center justify-between mb-2 shrink-0">
        <h4 className={`text-xs font-bold tracking-tight ${sortMetric === metricKey ? 'text-blue-600' : 'text-slate-800'}`}>{title}</h4>
        <span className="text-[10px] text-slate-400 font-medium">vs {xLabel}</span>
      </div>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis 
              type="number" 
              dataKey={xKey} 
              domain={xDomain as any} 
              tick={{ fontSize: 9, fill: '#94a3b8' }} 
              axisLine={false} 
              tickLine={false} 
              tickFormatter={(v) => isYear ? `'${v.toString().slice(-2)}` : v}
            />
            <YAxis 
              type="number" 
              dataKey={`scores.${metricKey}`} 
              tick={{ fontSize: 9, fill: '#94a3b8' }} 
              axisLine={false} 
              tickLine={false} 
              tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
              width={38}
            />
            <RechartsTooltip 
              cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload as ProcessedItem;
                  if (d.scores[metricKey] === 0) return null;

                  return (
                    <div className="bg-white/95 backdrop-blur-sm p-2.5 rounded-xl shadow-lg border border-slate-200 text-[11px] z-50 min-w-[170px]">
                      <div className="font-bold text-slate-800 mb-1 flex items-center justify-between gap-2">
                        <span>{d.model}</span>
                        {d.ram && <span className="text-[9px] bg-purple-50 text-purple-700 px-1 py-0.2 rounded font-mono">{d.ram}</span>}
                      </div>
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
                  onClick={(d) => onSelectDetail(d as ProcessedItem)}
                  cursor="pointer"
                  opacity={(selectedGroup && selectedGroup !== key) ? 0.15 : 0.85}
                />
              );
            })}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
});
