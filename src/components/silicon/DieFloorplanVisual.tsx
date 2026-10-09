import React from 'react';
import { ProcessorDetail } from '../../types';
import { Cpu, Zap, Activity, Shield, Sparkles } from 'lucide-react';

export interface DieFloorplanVisualProps {
  processor: ProcessorDetail;
  className?: string;
}

export const DieFloorplanVisual: React.FC<DieFloorplanVisualProps> = ({ processor, className = '' }) => {
  const isUltra = processor.tier === 'ultra' || processor.packaging?.includes('UltraFusion');
  const gpuCount = Array.isArray(processor.gpuCores) ? processor.gpuCores[processor.gpuCores.length - 1] : processor.gpuCores;
  const cpuCount = Array.isArray(processor.cpuCores) ? processor.cpuCores[processor.cpuCores.length - 1] : processor.cpuCores;

  const superCount = processor.superCores ?? 0;
  const pCount = processor.pCores !== undefined 
    ? processor.pCores 
    : (processor.superCores ? 0 : Math.ceil(cpuCount * 0.6));
  const eCount = processor.eCores !== undefined 
    ? processor.eCores 
    : Math.floor(cpuCount * 0.4);
  const totalPerfSuper = superCount + pCount;

  let perfLabel = 'PERF CORES';
  let perfBadge = `${pCount}P`;
  if (superCount > 0 && pCount > 0) {
    perfLabel = 'SUPER + P-CORES';
    perfBadge = `${superCount}S + ${pCount}P`;
  } else if (superCount > 0 && pCount === 0) {
    perfLabel = 'SUPER CORES';
    perfBadge = `${superCount}S`;
  }
  
  // Single Die Floorplan representation
  const renderDie = (dieIndex = 0) => (
    <div className="flex-1 bg-gradient-to-br from-[#0f141c] via-[#0b0e14] to-[#080a0e] rounded-lg p-2 sm:p-2.5 border border-slate-700/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] flex flex-col justify-between gap-1.5 relative overflow-hidden select-none">
      {/* Background Silicon Grid Accent */}
      <div 
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px), radial-gradient(#818cf8 1px, transparent 1px)',
          backgroundSize: '16px 16px',
          backgroundPosition: '0 0, 8px 8px'
        }}
      />

      {/* Top Section: CPU Cluster & Neural Engine */}
      <div className="grid grid-cols-12 gap-1.5 relative z-10">
        {/* CPU Cluster */}
        <div className="col-span-8 bg-slate-900/90 rounded-md p-1.5 border border-sky-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[9px] font-bold text-sky-400 mb-1">
            <span className="flex items-center gap-1">
              <Cpu className="w-2.5 h-2.5 text-sky-400" />
              CPU CLUSTER ({cpuCount} Cores @ {processor.clock} GHz)
            </span>
            <span className="text-slate-400 font-mono text-[8.5px]">{processor.coreConfig || `${cpuCount} Cores`}</span>
          </div>

          <div className="grid grid-cols-2 gap-1">
            {/* Performance / Super Cores */}
            <div className="bg-sky-950/60 rounded p-1 border border-sky-500/20">
              <div className="text-[8px] font-semibold text-sky-300 flex items-center justify-between">
                <span>{perfLabel}</span>
                <span className="font-mono text-sky-400">{perfBadge}</span>
              </div>
              <div className="mt-1 flex flex-wrap gap-0.5">
                {Array.from({ length: totalPerfSuper }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-2 flex-1 min-w-[7px] rounded-sm ${i < superCount ? 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)]' : 'bg-sky-400'}`} 
                    title={i < superCount ? "Super Core" : "Performance Core"}
                  />
                ))}
              </div>
            </div>

            {/* Efficiency Cores */}
            {eCount > 0 ? (
              <div className="bg-emerald-950/60 rounded p-1 border border-emerald-500/20">
                <div className="text-[8px] font-semibold text-emerald-300 flex items-center justify-between">
                  <span>EFFICIENCY CORES</span>
                  <span className="font-mono text-emerald-400">{eCount}E</span>
                </div>
                <div className="mt-1 flex flex-wrap gap-0.5">
                  {Array.from({ length: eCount }).map((_, i) => (
                    <div key={i} className="h-2 flex-1 min-w-[6px] rounded-sm bg-emerald-400" title="Efficiency Core" />
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/60 rounded p-1 border border-slate-700/40 flex flex-col justify-between">
                <div className="text-[8px] font-semibold text-slate-400 flex items-center justify-between">
                  <span>EFFICIENCY CORES</span>
                  <span className="font-mono text-slate-400">0E</span>
                </div>
                <div className="mt-1 flex items-center justify-center py-0.5">
                  <span className="text-[7.5px] text-slate-400 font-mono tracking-tight text-center">
                    Pure-Perf Design (No E-Cores)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* L2 Cache Bar */}
          <div className="mt-1 bg-slate-800/80 rounded px-1.5 py-0.5 border border-slate-700/50 flex items-center justify-between text-[8px] text-slate-300">
            <span className="text-slate-400">Shared L2 Cache</span>
            <span className="font-mono font-bold text-sky-300">{processor.l2Cache || `${processor.l2CacheMB || 16} MB`}</span>
          </div>
        </div>

        {/* Neural Engine (NPU) */}
        <div className="col-span-4 bg-purple-950/70 rounded-md p-1.5 border border-purple-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[9px] font-bold text-purple-300 mb-0.5">
              <span className="flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-purple-400" />
                NEURAL ENGINE
              </span>
            </div>
            <div className="text-[8px] text-purple-200 font-mono">
              {processor.neuralEngineCores || 16}-Core NPU
            </div>
          </div>
          <div className="bg-purple-900/60 rounded px-1 py-0.5 text-center mt-1 border border-purple-500/20">
            <span className="text-[8.5px] font-bold text-purple-200 font-mono">
              {processor.aneTops ? `${processor.aneTops} TOPS` : 'High-Perf ANE'}
            </span>
          </div>
        </div>
      </div>

      {/* Middle Section: GPU Array & Hardware Ray Tracing */}
      <div className="bg-violet-950/60 rounded-md p-1.5 border border-violet-500/30 relative z-10 flex flex-col justify-between">
        <div className="flex items-center justify-between text-[9px] font-bold text-violet-300 mb-1">
          <span className="flex items-center gap-1">
            <Zap className="w-2.5 h-2.5 text-violet-400" />
            GPU SHADER CLUSTERS ({gpuCount} CORES)
          </span>
          <div className="flex items-center gap-1">
            {processor.rayTracing && (
              <span className="text-[7.5px] font-bold bg-amber-500/20 text-amber-300 px-1 rounded border border-amber-500/30">
                RAY TRACING
              </span>
            )}
            <span className="text-[8px] text-violet-400 font-mono">Dynamic Caching</span>
          </div>
        </div>

        {/* GPU Core Grid Bars */}
        <div className="grid grid-cols-6 sm:grid-cols-10 gap-0.5 py-0.5">
          {Array.from({ length: Math.min(gpuCount, 40) }).map((_, i) => (
            <div 
              key={i} 
              className="h-2 rounded-sm bg-gradient-to-t from-violet-600 to-indigo-400 opacity-90 hover:opacity-100 transition-opacity" 
              title={`GPU Core ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Bottom Section: System-Level Cache (SLC), Media Engine, & Memory Controller */}
      <div className="grid grid-cols-12 gap-1.5 relative z-10">
        {/* SLC (System Level Cache) */}
        <div className="col-span-4 bg-amber-950/60 rounded-md p-1 border border-amber-500/30 flex flex-col justify-between">
          <span className="text-[8px] font-bold text-amber-300">SYSTEM CACHE</span>
          <div className="font-mono text-[9px] font-bold text-amber-200">
            {processor.systemCache || `${processor.slcMB || 16} MB SLC`}
          </div>
        </div>

        {/* Media Engine & Secure Enclave */}
        <div className="col-span-4 bg-slate-900/80 rounded-md p-1 border border-slate-700/60 flex flex-col justify-between text-[8px]">
          <span className="font-bold text-slate-300 flex items-center gap-0.5">
            <Activity className="w-2.5 h-2.5 text-emerald-400" />
            MEDIA ENGINE
          </span>
          <span className="text-[7.5px] text-slate-400">ProRes · AV1 · HEVC</span>
        </div>

        {/* Memory Bus Interface / Controllers */}
        <div className="col-span-4 bg-purple-950/70 rounded-md p-1 border border-purple-500/30 flex flex-col justify-between">
          <span className="text-[8px] font-bold text-purple-300">MEMORY PHY</span>
          <div className="font-mono text-[8.5px] font-bold text-purple-200">
            {processor.memoryBusWidth || `${processor.busWidthBits || 128}-bit`}
          </div>
        </div>
      </div>

      {/* Fusion Architecture Dual-Die Indicator for Pro/Max */}
      {processor.packaging?.includes('Fusion') && !isUltra && (
        <div className="text-[8px] text-center font-mono text-indigo-300 bg-indigo-950/70 rounded py-0.5 border border-indigo-500/30">
          Dual-Die Chiplet (Apple Fusion Architecture: Dedicated CPU + GPU Dies)
        </div>
      )}

      {/* UltraFusion Die Indicator for Ultra */}
      {isUltra && (
        <div className="text-[8px] text-center font-mono text-cyan-400 bg-cyan-950/70 rounded py-0.5 border border-cyan-500/30">
          Die {dieIndex + 1} of 2 (UltraFusion™ Fabric Connected)
        </div>
      )}
    </div>
  );

  return (
    <div className={`w-full ${className}`}>
      {isUltra ? (
        <div className="flex flex-col sm:flex-row items-stretch gap-1.5 bg-[#07090d] p-1.5 rounded-xl border border-cyan-900/60">
          {renderDie(0)}
          
          {/* Central UltraFusion Interconnect Bridge */}
          <div className="sm:w-10 bg-gradient-to-b from-cyan-950 via-cyan-900 to-cyan-950 border border-cyan-500/50 rounded-lg flex sm:flex-col items-center justify-center p-1 text-center shrink-0 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
            <span className="text-[8px] font-extrabold text-cyan-300 tracking-wider [writing-mode:horizontal-tb] sm:[writing-mode:vertical-lr] uppercase">
              UltraFusion™ 2.5 TB/s
            </span>
          </div>

          {renderDie(1)}
        </div>
      ) : (
        renderDie(0)
      )}
    </div>
  );
};
