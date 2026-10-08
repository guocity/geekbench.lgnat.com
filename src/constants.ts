import { MetricKey, AppleSiliconBenchmark, ProcessedItem } from './types';

export const FAMILY_COLORS: Record<string, string> = {
  "M1": "#2563eb", // Blue-600
  "M2": "#9333ea", // Purple-600
  "M3": "#e11d48", // Rose-600
  "M4": "#059669", // Emerald-600
  "M5": "#d97706", // Amber-600
  "M6": "#0284c7", // Sky-600
};

export const TIER_COLORS: Record<string, string> = {
  "A-Series": "#64748b", // Slate-500
  "base": "#3b82f6",     // Blue-500
  "pro": "#8b5cf6",      // Violet-500
  "max": "#10b981",      // Emerald-500
  "ultra": "#f59e0b"     // Amber-500
};

export const TIER_LABELS: Record<string, string> = {
  "A-Series": "A",
  "base": "Base",
  "pro": "Pro",
  "max": "Max",
  "ultra": "Ultra"
};

export const DEVICES = ['iPhone', 'iPad', 'Mac mini', 'Mac Studio', 'iMac', 'MacBook Air', 'MacBook Pro', 'Mac Pro'] as const;

export const DEVICE_COLORS: Record<string, string> = {
  'iPhone': '#3b82f6', // blue
  'iPad': '#8b5cf6', // purple
  'Mac mini': '#10b981', // emerald
  'Mac Studio': '#14b8a6', // teal
  'iMac': '#06b6d4', // cyan
  'MacBook Air': '#f59e0b', // amber
  'MacBook Pro': '#f97316', // orange
  'Mac Pro': '#ef4444' // red
};

export const METRIC_LABELS: Record<MetricKey, string> = {
  single: 'Single-Core',
  multi: 'Multi-Core',
  metal: 'Metal (GPU)',
  opencl: 'OpenCL',
  bandwidth: 'Memory BW'
};

export const formatChipName = (family: string, tierStr: string, chip?: string): string => {
  if (chip) return chip;
  if (tierStr === 'A-Series') {
    const aSeriesMap: Record<string, string> = { 'M0': 'A14', 'M1': 'A15', 'M2': 'A16', 'M3': 'A17 Pro', 'M4': 'A18', 'M5': 'A19', 'M6': 'A20' };
    return aSeriesMap[family] || `${family} A-Series`;
  }
  const tierFormatted = TIER_LABELS[tierStr] || tierStr;
  return `${family} ${tierFormatted}`.trim();
};

export const getChipsetTag = (item: AppleSiliconBenchmark | ProcessedItem): string => {
  return item.chip || formatChipName(item.family || '', item.tier || '');
};

export const formatReleaseDate = (dateStr?: string): string => {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length >= 2) {
    const year = parts[0];
    const monthNum = parseInt(parts[1], 10);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[monthNum - 1] || parts[1];
    return `${month} ${year}`;
  }
  return dateStr;
};

