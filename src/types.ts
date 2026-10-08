export type Family = 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6' | string;
export type Tier = 'A-Series' | 'base' | 'pro' | 'max' | 'ultra' | string;
export type MetricKey = 'single' | 'multi' | 'metal' | 'opencl' | 'bandwidth';
export type ViewMode = 'dashboard' | 'list' | 'processors';
export type FilterMode = 'family' | 'tier';

export interface BenchmarkScores {
  single: number;
  multi: number;
  metal: number;
  opencl: number;
  bandwidth: number;
}

export interface RAMConfiguration {
  ram: string;
  memoryBandwidth: number;
  memoryType: string;
  memorySpeed: string;
  busWidthBits?: number;
  description?: string;
}

export interface DieShot {
  url: string;
  originalUrl?: string;
  caption: string;
}

export interface ProcessorDetail {
  chip: string;
  name: string;
  family: Family;
  tier: Tier;
  processNode: string;
  transistorTech?: string;
  dieSizeMm2?: number;
  packaging: string;
  cpuCores: number | number[];
  superCores?: number;
  pCores?: number;
  eCores?: number;
  coreConfig?: string;
  clock: string;
  gpuCores: number | number[];
  rayTracing?: boolean;
  neuralEngineCores?: number;
  aneTops?: number;
  l2CacheMB?: number;
  l2Cache?: string;
  slcMB?: number;
  systemCache?: string;
  busWidthBits?: number;
  memoryBusWidth?: string;
  memoryType?: string;
  memorySpeed?: string;
  memoryBandwidth: number;
  memoryBandwidthMin?: number;
  memoryBandwidthMax?: number;
  ramConfigurations?: RAMConfiguration[];
  dieShots?: DieShot[];
  releaseDate?: string;
  specs: string;
}

export interface AppleSiliconBenchmark {
  id?: string;
  model: string;
  device: string;
  year: number;
  chip: string;
  ram?: string;
  cpuCores: number;
  gpuCores: number;
  clock: string;
  single: number;
  multi: number;
  metal: number;
  opencl: number;

  // Optional overrides (inherited from processor.json if omitted)
  family?: Family;
  tier?: Tier;
  memoryBandwidth?: number;
  specs?: string;
  superCores?: number;
  pCores?: number;
  eCores?: number;
  coreConfig?: string;
  processNode?: string;
  transistorTech?: string;
  dieSizeMm2?: number;
  packaging?: string;
  rayTracing?: boolean;
  neuralEngineCores?: number;
  aneTops?: number;
  l2CacheMB?: number;
  l2Cache?: string;
  memoryType?: string;
  memorySpeed?: string;
  busWidthBits?: number;
  memoryBusWidth?: string;
  slcMB?: number;
  systemCache?: string;
  ramConfigurations?: RAMConfiguration[];
  releaseDate?: string;

  // Processed runtime scores
  scores?: BenchmarkScores;
  processor?: ProcessorDetail;
}

export interface ProcessedItem extends AppleSiliconBenchmark {
  family: Family;
  tier: Tier;
  memoryBandwidth: number;
  specs: string;
  scores: BenchmarkScores;
  processor?: ProcessorDetail;
}

export interface AggregatedChipGroup {
  displayName: string;
  family: string;
  tier: string;
  gpuCores?: number;
  devices: Set<string>;
  bandwidths: number[];
  scores: number[];
  effs: number[];
  clocks: number[];
  ghzEffs: number[];
  cores: Set<number>;

  minScore: number;
  maxScore: number;
  avgScore: number;

  minEff: number;
  maxEff: number;
  avgEff: number;

  minGhz: number;
  maxGhz: number;
  avgGhz: number;

  minGhzEff: number;
  maxGhzEff: number;
  avgGhzEff: number;

  minBw: number;
  maxBw: number;
  avgBw: number;

  bandwidthStr: string;
  coreCountsStr: string;
  processor?: ProcessorDetail;
  [key: string]: any;
}
