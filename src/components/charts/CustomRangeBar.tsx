import React from 'react';

export interface CustomRangeBarProps {
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

export const CustomRangeBar = React.memo<CustomRangeBarProps>((props) => {
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
