import React from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Card } from '../common/Card';
import { CustomRangeBar } from './CustomRangeBar';
import { AggregatedChipGroup, FilterMode } from '../../types';
import { FAMILY_COLORS, TIER_COLORS } from '../../constants';

export interface MetricBarChartProps {
  title: string;
  subtitle: string;
  badgeText: string;
  badgeClass?: string;
  data: AggregatedChipGroup[];
  dataKey: string;
  valueFormat: (v: number) => string;
  tooltipRanges: (d: AggregatedChipGroup) => { range: string; avg: string };
  onGroupSelect: (group: string) => void;
  selectedGroup: string | null;
  selectedDevice: string | null;
  filterMode: FilterMode;
}

export const MetricBarChart = React.memo<MetricBarChartProps>(({ 
  title, 
  subtitle, 
  badgeText, 
  badgeClass = "bg-blue-50 text-blue-600",
  data, 
  dataKey, 
  valueFormat, 
  tooltipRanges, 
  onGroupSelect, 
  selectedGroup, 
  selectedDevice, 
  filterMode 
}) => {
  const colorMap = filterMode === 'tier' ? TIER_COLORS : FAMILY_COLORS;
  const groupKey = filterMode === 'family' ? 'family' : 'tier';

  return (
    <Card className="p-3.5 h-[580px] flex flex-col overflow-hidden">
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
            <XAxis type="number" hide domain={[0, (dataMax: number) => Math.round(dataMax * 1.12)]} />
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
