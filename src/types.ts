export type Family = 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6' | string;
export type Tier = 'A-Series' | 'base' | 'pro' | 'max' | 'ultra' | string;

export interface BenchmarkScores {
  single: number;
  multi: number;
  metal: number;
  opencl: number;
  bandwidth: number;
}

export interface AppleSiliconBenchmark {
  id?: string;
  model: string;
  family: Family;
  tier: Tier;
  chip: string;
  year: number;
  device: string;
  cpuCores: number;
  gpuCores: number;
  clock: string;
  single: number;
  multi: number;
  metal: number;
  opencl: number;
  memoryBandwidth: number;
  specs: string;

  // Enriched Architectural Properties
  pCores?: number;
  eCores?: number;
  coreConfig?: string;
  processNode?: string;
  packaging?: string;
  rayTracing?: boolean;
  neuralEngineCores?: number;
  aneTops?: number;
  memoryType?: string;
  memorySpeed?: string;
  busWidthBits?: number;
  memoryBusWidth?: string;
  slcMB?: number;
  systemCache?: string;

  // Processed runtime scores
  scores?: BenchmarkScores;
}

export interface ProcessedItem extends AppleSiliconBenchmark {
  memoryBandwidth: number;
  scores: BenchmarkScores;
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
  [key: string]: any;
}
