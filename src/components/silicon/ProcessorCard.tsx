import React from 'react';
import { ProcessorDetail, ProcessedItem } from '../../types';
import { SiliconChipVisual } from './SiliconChipVisual';
import { FAMILY_COLORS, TIER_COLORS, TIER_LABELS, formatReleaseDate } from '../../constants';
import { 
  Zap, 
  Cpu, 
  Activity, 
  Sparkles, 
  Database, 
  ChevronRight, 
  Layers, 
  CheckCircle2, 
  Gauge, 
  Monitor,
  Flame,
  Calendar
} from 'lucide-react';

export interface ProcessorBenchmarkStats {
  count: number;
  maxSingle: number;
  maxMulti: number;
  maxMetal: number;
  devices: string[];
}

export interface ProcessorCardProps {
  processor: ProcessorDetail;
  stats?: ProcessorBenchmarkStats;
  globalMaxSingle: number;
  globalMaxMulti: number;
  globalMaxMetal: number;
  globalMaxBandwidth: number;
  onSelectProcessor: (processor: ProcessorDetail) => void;
  onFilterDevices?: (chip: string) => void;
  onOpenDieShotLightbox?: (dieShot: { url: string; caption: string }) => void;
}

export const ProcessorCard: React.FC<ProcessorCardProps> = ({
  processor,
  stats,
  globalMaxSingle,
  globalMaxMulti,
  globalMaxMetal,
  globalMaxBandwidth,
  onSelectProcessor,
  onFilterDevices,
  onOpenDieShotLightbox,
}) => {
  const familyColor = FAMILY_COLORS[processor.family] || TIER_COLORS[processor.tier] || '#64748b';
  const tierFormatted = TIER_LABELS[processor.tier] || processor.tier;
  const isM6 = processor.chip === 'M6';
  const isUltra = processor.tier === 'ultra';

  // Compute performance percentage relative to global peaks
  const singlePct = stats && globalMaxSingle > 0 ? Math.round((stats.maxSingle / globalMaxSingle) * 100) : 0;
  const multiPct = stats && globalMaxMulti > 0 ? Math.round((stats.maxMulti / globalMaxMulti) * 100) : 0;
  const metalPct = stats && globalMaxMetal > 0 ? Math.round((stats.maxMetal / globalMaxMetal) * 100) : 0;
  const bwPct = globalMaxBandwidth > 0 ? Math.round((processor.memoryBandwidth / globalMaxBandwidth) * 100) : 0;

  return (
    <div 
      className={`rounded-2xl border bg-white shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group ${
        isM6 ? 'border-sky-300 ring-1 ring-sky-200' : isUltra ? 'border-amber-300 ring-1 ring-amber-100' : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Top Header Card */}
      <div className="p-4 sm:p-5 pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span 
                className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-sm flex items-center gap-1"
                style={{ backgroundColor: familyColor }}
              >
                {processor.chip}
              </span>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {processor.family} · {tierFormatted}
              </span>
              {processor.releaseDate && (
                <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                  <Calendar className="w-2.5 h-2.5 text-slate-400" />
                  {formatReleaseDate(processor.releaseDate)}
                </span>
              )}
              {processor.rayTracing && (
                <span className="text-[9.5px] font-bold px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md flex items-center gap-0.5">
                  <Flame className="w-2.5 h-2.5 text-amber-600" />
                  Ray Tracing
                </span>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1 tracking-tight flex items-center gap-1.5">
              {processor.name}
              {isM6 && (
                <span className="text-[10px] bg-gradient-to-r from-sky-500 to-blue-600 text-white font-extrabold px-1.5 py-0.5 rounded-md shadow-sm">
                  NEXT-GEN 2NM
                </span>
              )}
            </h3>
          </div>

          <div className="text-right shrink-0">
            <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-mono font-bold">
              {processor.processNode}
            </span>
            {processor.transistorTech && (
              <div className="text-[9.5px] font-mono text-slate-400 mt-0.5">
                {processor.transistorTech}
              </div>
            )}
          </div>
        </div>

        {/* Silicon Visual Component */}
        <SiliconChipVisual 
          processor={processor} 
          onOpenDieShotLightbox={onOpenDieShotLightbox} 
        />
      </div>

      {/* Specifications Grid */}
      <div className="px-4 sm:px-5 py-3 bg-slate-50/70 border-t border-b border-slate-100 space-y-2.5">
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* CPU Spec */}
          <div className="bg-white p-2 rounded-xl border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Cpu className="w-3 h-3 text-sky-600" />
              CPU Architecture
            </span>
            <div className="font-bold text-slate-800 text-[12px] mt-0.5">
              {processor.coreConfig || `${processor.cpuCores} Cores`}
            </div>
            <div className="text-[10px] font-mono text-slate-500 mt-0.5">
              Peak {processor.clock} GHz Clock
            </div>
          </div>

          {/* GPU Spec */}
          <div className="bg-white p-2 rounded-xl border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3 h-3 text-violet-600" />
              Graphics Engine
            </span>
            <div className="font-bold text-slate-800 text-[12px] mt-0.5">
              {Array.isArray(processor.gpuCores) ? processor.gpuCores.join(' / ') : processor.gpuCores} GPU Cores
            </div>
            <div className="text-[10px] font-mono text-slate-500 mt-0.5">
              {processor.rayTracing ? 'Hardware Ray Tracing' : 'Rasterization Engine'}
            </div>
          </div>

          {/* Neural Engine */}
          <div className="bg-white p-2 rounded-xl border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-600" />
              Neural Engine
            </span>
            <div className="font-bold text-slate-800 text-[12px] mt-0.5">
              {processor.neuralEngineCores}-Core NPU
            </div>
            <div className="text-[10px] font-mono text-slate-500 mt-0.5">
              {processor.aneTops ? `${processor.aneTops} TOPS` : 'Apple Intelligence'}
            </div>
          </div>

          {/* Memory Bandwidth */}
          <div className="bg-white p-2 rounded-xl border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Gauge className="w-3 h-3 text-emerald-600" />
              Memory Bandwidth
            </span>
            <div className="font-bold text-purple-700 text-[12px] mt-0.5">
              {processor.memoryBandwidthMin ? `${processor.memoryBandwidthMin} – ${processor.memoryBandwidthMax} GB/s` : `${processor.memoryBandwidth} GB/s`}
            </div>
            <div className="text-[10px] font-mono text-slate-500 mt-0.5">
              {processor.memoryBusWidth} · {processor.memoryType ? processor.memoryType.split(' ')[0] : 'Unified'}
            </div>
          </div>
        </div>

        {/* Real Geekbench 6 Performance Benchmarks */}
        {stats && stats.count > 0 && (
          <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-xs space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <Activity className="w-3 h-3 text-blue-600" />
                Geekbench 6 Peak Scores
              </span>
              <span className="font-mono text-slate-400">{stats.count} Tested Device{stats.count > 1 ? 's' : ''}</span>
            </div>

            {/* Score Bars Grid */}
            <div className="space-y-1 text-[11px]">
              {/* Single Core */}
              <div>
                <div className="flex justify-between items-center text-slate-700">
                  <span className="text-[10px] font-medium text-slate-500">Single-Core</span>
                  <span className="font-mono font-bold text-slate-900">{stats.maxSingle.toLocaleString()}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-0.5">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.max(singlePct, 5)}%` }} 
                  />
                </div>
              </div>

              {/* Multi Core */}
              <div>
                <div className="flex justify-between items-center text-slate-700">
                  <span className="text-[10px] font-medium text-slate-500">Multi-Core</span>
                  <span className="font-mono font-bold text-slate-900">{stats.maxMulti.toLocaleString()}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-0.5">
                  <div 
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.max(multiPct, 5)}%` }} 
                  />
                </div>
              </div>

              {/* Metal GPU */}
              {stats.maxMetal > 0 && (
                <div>
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="text-[10px] font-medium text-slate-500">Metal (GPU)</span>
                    <span className="font-mono font-bold text-slate-900">{stats.maxMetal.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-0.5">
                    <div 
                      className="h-full bg-violet-500 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.max(metalPct, 5)}%` }} 
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tested Devices Pills */}
        {stats && stats.devices && stats.devices.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
              <Monitor className="w-3 h-3 text-slate-400" />
              Equipped in:
            </span>
            {stats.devices.slice(0, 4).map((d, i) => (
              <span key={i} className="text-[9.5px] px-1.5 py-0.5 bg-slate-200/60 text-slate-700 rounded-md font-medium">
                {d}
              </span>
            ))}
            {stats.devices.length > 4 && (
              <span className="text-[9.5px] text-slate-400 font-medium">
                +{stats.devices.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Actions Footer */}
      <div className="p-3 sm:p-4 bg-white flex items-center justify-between gap-2 border-t border-slate-100">
        <button
          onClick={() => onSelectProcessor(processor)}
          className="flex-1 py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs"
        >
          <Layers className="w-3.5 h-3.5" />
          Full Architecture Specs
        </button>

        {onFilterDevices && (
          <button
            onClick={() => onFilterDevices(processor.chip)}
            className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1 shrink-0"
            title={`View ${processor.chip} benchmarks in devices table`}
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Devices</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
