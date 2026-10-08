import React from 'react';

export interface ChipIconSvgProps {
  chip: string;
  size?: number | string;
  className?: string;
}

interface ChipStyleConfig {
  mainText: string;
  glow?: string[];
  sub?: string;
  subColor?: string;
  isUltra?: boolean;
}

const CHIP_CONFIGS: Record<string, ChipStyleConfig> = {
  // M1 Series
  'M1': { mainText: 'M1' },
  'M1 Pro': { mainText: 'M1', sub: 'PRO', subColor: '#38bdf8' },
  'M1 Max': { mainText: 'M1', sub: 'MAX', subColor: '#c084fc' },
  'M1 Ultra': { mainText: 'M1', sub: 'ULTRA', isUltra: true },

  // M2 Series
  'M2': { mainText: 'M2' },
  'M2 Pro': { mainText: 'M2', sub: 'PRO', subColor: '#2dd4bf' },
  'M2 Max': { mainText: 'M2', sub: 'MAX', subColor: '#c084fc' },
  'M2 Ultra': { mainText: 'M2', sub: 'ULTRA', isUltra: true },

  // M3 Series
  'M3': { mainText: 'M3', glow: ['#06b6d4', '#10b981'] },
  'M3 Pro': { mainText: 'M3', glow: ['#2563eb', '#38bdf8'], sub: 'PRO', subColor: '#38bdf8' },
  'M3 Max': { mainText: 'M3', glow: ['#7c3aed', '#c084fc'], sub: 'MAX', subColor: '#c084fc' },
  'M3 Ultra': { mainText: 'M3', glow: ['#ec4899', '#f59e0b', '#6366f1'], sub: 'ULTRA', isUltra: true },

  // M4 Series
  'M4': { mainText: 'M4', glow: ['#10b981', '#06b6d4'] },
  'M4 Pro': { mainText: 'M4', glow: ['#1d4ed8', '#60a5fa'], sub: 'PRO', subColor: '#60a5fa' },
  'M4 Max': { mainText: 'M4', glow: ['#8b5cf6', '#d946ef'], sub: 'MAX', subColor: '#e879f9' },

  // M5 Series
  'M5': { mainText: 'M5', glow: ['#0284c7', '#14b8a6'] },
  'M5 Pro': { mainText: 'M5', glow: ['#1e40af', '#38bdf8'], sub: 'PRO', subColor: '#38bdf8' },
  'M5 Max': { mainText: 'M5', glow: ['#7e22ce', '#f43f5e'], sub: 'MAX', subColor: '#c084fc' },
  'M5 Ultra': { mainText: 'M5', glow: ['#e11d48', '#8b5cf6', '#f59e0b'], sub: 'ULTRA', isUltra: true },

  // M6 Series
  'M6': { mainText: 'M6', glow: ['#059669', '#06b6d4'] },

  // A-Series
  'A15 Bionic': { mainText: 'A15', sub: 'BIONIC', subColor: '#94a3b8' },
  'A16 Bionic': { mainText: 'A16', glow: ['#7c3aed', '#6366f1'], sub: 'BIONIC', subColor: '#c084fc' },
  'A17 Pro': { mainText: 'A17', glow: ['#d97706', '#f59e0b'], sub: 'PRO', subColor: '#fbbf24' },
  'A18': { mainText: 'A18', glow: ['#059669', '#10b981'] },
  'A18 Pro': { mainText: 'A18', glow: ['#d97706', '#fbbf24'], sub: 'PRO', subColor: '#fbbf24' },
  'A19': { mainText: 'A19', glow: ['#2563eb', '#38bdf8'] },
  'A19 Pro': { mainText: 'A19', glow: ['#4f46e5', '#818cf8'], sub: 'PRO', subColor: '#818cf8' },
  'A20': { mainText: 'A20', glow: ['#0d9488', '#2dd4bf'] },
  'A20 Pro': { mainText: 'A20', glow: ['#0284c7', '#f59e0b'], sub: 'PRO', subColor: '#fbbf24' },
};

const APPLE_LOGO_PATH = "M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z";

export const ChipIconSvg: React.FC<ChipIconSvgProps> = ({
  chip,
  size = 120,
  className = '',
}) => {
  const config = CHIP_CONFIGS[chip] || {
    mainText: chip.split(' ')[0],
    sub: chip.includes('Pro') ? 'PRO' : chip.includes('Max') ? 'MAX' : chip.includes('Ultra') ? 'ULTRA' : undefined,
    subColor: chip.includes('Pro') ? '#38bdf8' : chip.includes('Max') ? '#c084fc' : chip.includes('Ultra') ? undefined : '#94a3b8',
    isUltra: chip.includes('Ultra'),
  };

  const isASeries = config.mainText.startsWith('A');
  const hasSub = Boolean(config.sub);
  const idPrefix = chip.toLowerCase().replace(/[^a-z0-9]/g, '-');

  // Positioning
  const appleW = hasSub ? 18 : 19.5;
  const appleH = hasSub ? 24 : 26;
  const appleX = isASeries ? (hasSub ? 25 : 26) : (hasSub ? 29 : 30);
  const appleY = hasSub ? (isASeries ? 36 : 35) : (isASeries ? 47 : 46);
  const textX = isASeries ? 49 : 53;
  const textY = hasSub ? 56 : 67;
  const fontSize = isASeries ? 23 : 25;

  const subFontSize = config.sub === 'ULTRA' ? 12 : config.sub === 'BIONIC' ? 11 : 13.5;
  const subLetterSpacing = config.sub === 'ULTRA' ? '2.5' : config.sub === 'BIONIC' ? '2.2' : '3.5';
  const subFill = config.isUltra ? `url(#ultra-${idPrefix})` : (config.subColor || '#ffffff');

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 120 120" 
      width={size} 
      height={size}
      className={`select-none shrink-0 ${className}`}
      aria-label={`Apple ${chip} chip icon`}
    >
      <defs>
        {/* Base dark brushed silicon package background */}
        <linearGradient id={`base-${idPrefix}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1a1e24" />
          <stop offset="50%" stopColor="#111419" />
          <stop offset="100%" stopColor="#0a0c0f" />
        </linearGradient>

        {/* Ultra multi-stop chromatic linear gradient */}
        {config.isUltra && (
          <linearGradient id={`ultra-${idPrefix}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f472b6" />
            <stop offset="33%" stopColor="#c084fc" />
            <stop offset="66%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        )}

        {/* Dynamic corner nebula glow */}
        {config.glow && (
          <radialGradient id={`glow-${idPrefix}`} cx="12%" cy="88%" r={config.glow.length > 2 ? "82%" : "78%"}>
            <stop offset="0%" stopColor={config.glow[0]} stopOpacity="0.95" />
            <stop offset={config.glow.length > 2 ? "35%" : "40%"} stopColor={config.glow[1]} stopOpacity={config.glow.length > 2 ? "0.65" : "0.55"} />
            {config.glow.length > 2 && (
              <stop offset="70%" stopColor={config.glow[2]} stopOpacity="0.35" />
            )}
            <stop offset="100%" stopColor={config.glow[config.glow.length - 1]} stopOpacity="0" />
          </radialGradient>
        )}
      </defs>

      {/* Package Substrate Base */}
      <rect 
        width="120" 
        height="120" 
        rx="22" 
        fill={`url(#base-${idPrefix})`} 
        stroke="#262f3a" 
        strokeWidth="1.5" 
      />

      {/* Corner Glow Overlay (if configured) */}
      {config.glow && (
        <rect 
          width="120" 
          height="120" 
          rx="22" 
          fill={`url(#glow-${idPrefix})`} 
        />
      )}

      {/* Chamfer Specular Edge Highlight */}
      <rect 
        x="1" 
        y="1" 
        width="118" 
        height="118" 
        rx="21" 
        fill="none" 
        stroke="rgba(255,255,255,0.08)" 
        strokeWidth="1" 
      />

      {/* Apple Logo Icon with exact W3C standard path & viewBox */}
      <svg 
        x={appleX} 
        y={appleY} 
        width={appleW} 
        height={appleH} 
        viewBox="0 0 384 512"
      >
        <path d={APPLE_LOGO_PATH} fill="#ffffff" />
      </svg>

      {/* Main Processor Generation Text */}
      <text 
        x={textX} 
        y={textY} 
        fill="#ffffff" 
        fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif" 
        fontSize={fontSize} 
        fontWeight="800" 
        letterSpacing="-0.5"
      >
        {config.mainText}
      </text>

      {/* Subtitle Tier (PRO, MAX, ULTRA, BIONIC) */}
      {hasSub && (
        <text 
          x="60" 
          y="86" 
          textAnchor="middle" 
          fill={subFill} 
          fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif" 
          fontSize={subFontSize} 
          fontWeight="800" 
          letterSpacing={subLetterSpacing}
        >
          {config.sub}
        </text>
      )}
    </svg>
  );
};
