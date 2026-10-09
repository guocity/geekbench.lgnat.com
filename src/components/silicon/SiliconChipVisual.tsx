import React, { useState } from 'react';
import { DieShot, ProcessorDetail } from '../../types';
import { AppleLogo } from './AppleLogo';
import { DieFloorplanVisual } from './DieFloorplanVisual';
import { FAMILY_COLORS, TIER_COLORS, formatReleaseDate } from '../../constants';
import { Layers, Cpu, Eye, Image as ImageIcon, ZoomIn, Sparkles } from 'lucide-react';

export interface SiliconChipVisualProps {
  processor: ProcessorDetail;
  onOpenDieShotLightbox?: (dieShot: DieShot, allDieShots?: DieShot[], chipName?: string) => void;
  initialMode?: 'package' | 'floorplan' | 'dieshot';
}

export const SiliconChipVisual: React.FC<SiliconChipVisualProps> = ({ 
  processor, 
  onOpenDieShotLightbox,
  initialMode = 'package' 
}) => {
  const [visualMode, setVisualMode] = useState<'package' | 'floorplan' | 'dieshot'>(
    initialMode === 'dieshot' && processor.dieShots && processor.dieShots.length > 0 
      ? 'dieshot' 
      : initialMode
  );
  const [isDieShotHovered, setIsDieShotHovered] = useState(false);
  const [dieShotHoverCoord, setDieShotHoverCoord] = useState<{ x: number; y: number }>({ x: 50, y: 50 });

  const hasDieShots = processor.dieShots && processor.dieShots.length > 0;
  const isUltra = processor.tier === 'ultra' || processor.packaging?.includes('UltraFusion');
  const isMax = processor.tier === 'max';
  const isPro = processor.tier === 'pro';
  const isASeries = processor.tier === 'A-Series';
  const accentColor = FAMILY_COLORS[processor.family] || TIER_COLORS[processor.tier] || '#3b82f6';

  // Determine memory packages count and layout
  const memoryModulesCount = isUltra ? 8 : isMax ? 4 : isPro ? 3 : isASeries ? 0 : 2;

  // Single memory package visual
  const renderMemoryChip = (key: string | number, label?: string) => (
    <div 
      key={key} 
      className="bg-gradient-to-b from-[#1c222b] via-[#151920] to-[#0f1217] border border-slate-700/80 rounded-[4px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] p-1.5 flex flex-col justify-between items-center text-center select-none min-h-[38px] min-w-[54px] relative overflow-hidden"
    >
      {/* Solder lead accents */}
      <div className="absolute top-0 inset-x-1 h-[1.5px] bg-slate-600/40 rounded-full" />
      <div className="absolute bottom-0 inset-x-1 h-[1.5px] bg-slate-600/40 rounded-full" />
      
      <div className="text-[7.5px] font-mono font-semibold tracking-wider text-slate-400 uppercase">
        {processor.memoryType ? processor.memoryType.split(' ')[0] : 'LPDDR5'}
      </div>
      <div className="text-[7px] font-mono text-purple-300 font-bold">
        {label || (processor.memoryBusWidth ? `${processor.busWidthBits ? Math.round(processor.busWidthBits / (memoryModulesCount || 2)) : 64}b` : 'DRAM')}
      </div>
      <div className="text-[6.5px] text-slate-500 font-mono">
        {processor.memorySpeed ? processor.memorySpeed.split(' ')[0] : 'Unified'}
      </div>
    </div>
  );

  return (
    <div className="w-full space-y-2 select-none">
      {/* Visual Substrate / Enclosure Frame */}
      <div className="relative rounded-2xl bg-gradient-to-b from-[#181d24] via-[#12161c] to-[#0c0e12] p-2.5 sm:p-3 border border-[#2b333e] shadow-xl overflow-hidden group">
        
        {/* Subtle Silicon Glow Accent */}
        <div 
          className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none transition-opacity group-hover:opacity-35"
          style={{ backgroundColor: accentColor }}
        />

        {/* Top Control Switcher Bar */}
        <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-800/80 text-[10px] relative z-20">
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
            <span className="font-mono text-[9.5px] tracking-wider text-slate-300 uppercase">
              {processor.packaging || 'Apple SiP'}
            </span>
            {processor.releaseDate && (
              <>
                <span className="text-slate-600">·</span>
                <span className="text-slate-400 font-mono text-[9px]">
                  {formatReleaseDate(processor.releaseDate)}
                </span>
              </>
            )}
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center bg-slate-900/90 rounded-lg p-0.5 border border-slate-800">
            <button
              onClick={() => setVisualMode('package')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[9.5px] font-semibold transition-all ${
                visualMode === 'package' 
                  ? 'bg-slate-800 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-2.5 h-2.5 text-blue-400" />
              Package
            </button>
            <button
              onClick={() => setVisualMode('floorplan')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[9.5px] font-semibold transition-all ${
                visualMode === 'floorplan' 
                  ? 'bg-slate-800 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-2.5 h-2.5 text-emerald-400" />
              Floorplan
            </button>
            {hasDieShots && (
              <button
                onClick={() => setVisualMode('dieshot')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[9.5px] font-semibold transition-all ${
                  visualMode === 'dieshot' 
                    ? 'bg-purple-900/60 text-purple-200 shadow-sm border border-purple-500/40' 
                    : 'text-purple-400 hover:text-purple-300'
                }`}
              >
                <ImageIcon className="w-2.5 h-2.5 text-purple-400" />
                Die Shot
              </button>
            )}
          </div>
        </div>

        {/* 1. PACKAGE VIEW (Realistic Silicon Substrate + SoC Die + On-Package Memory) */}
        {visualMode === 'package' && (
          <div className="relative min-h-[175px] sm:min-h-[190px] flex flex-col justify-center items-center py-2 px-1">
            {/* Corner Gold Fiducial Alignment Markers */}
            <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-amber-400/80 ring-1 ring-amber-500/40" title="Fiducial Mark" />
            <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400/80 ring-1 ring-amber-500/40" />
            <div className="absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full bg-amber-400/80 ring-1 ring-amber-500/40" />
            <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400/80 ring-1 ring-amber-500/40" />
            
            {/* Top-Left Pin 1 Golden Index Triangle */}
            <div className="absolute top-3 left-3 w-0 h-0 border-t-[5px] border-t-amber-400/90 border-r-[5px] border-r-transparent" />

            {/* Substrate Circuit Interconnect Traces (SVG overlay) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" xmlns="http://www.w3.org/2000/svg">
              <pattern id={`trace-${processor.chip.replace(/\s+/g, '-')}`} width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M 0 12 L 24 12 M 12 0 L 12 24" fill="none" stroke="#d4af37" strokeWidth="0.5" strokeDasharray="2 4" />
              </pattern>
              <rect width="100%" height="100%" fill={`url(#trace-${processor.chip.replace(/\s+/g, '-')})`} />
            </svg>

            {/* Layout Arrangement based on Tier */}
            {isUltra ? (
              /* Ultra Layout: Dual SoC Dies + UltraFusion Interconnect + 8 Memory Dies */
              <div className="w-full flex flex-col items-center gap-2 relative z-10">
                {/* Top Memory Row */}
                <div className="flex gap-1 sm:gap-2">
                  {Array.from({ length: 4 }).map((_, i) => renderMemoryChip(`top-${i}`))}
                </div>

                {/* Central Dual SoC Dies & UltraFusion */}
                <div className="flex items-center gap-1.5 sm:gap-2 w-full justify-center">
                  {/* Die 0 */}
                  <div className="flex-1 max-w-[130px] sm:max-w-[150px] aspect-[1/1] bg-gradient-to-br from-[#1f2631] via-[#14181f] to-[#0c0f13] rounded-lg border border-slate-600/80 shadow-2xl p-2.5 flex flex-col items-center justify-between relative overflow-hidden group/die">
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
                    <AppleLogo className="w-4 h-4 text-slate-300" />
                    <div className="text-center">
                      <div className="text-[12px] sm:text-[13px] font-black tracking-tight text-white font-mono">
                        {processor.chip}
                      </div>
                      <div className="text-[8px] font-mono text-cyan-300 font-semibold">DIE 0</div>
                    </div>
                    <div className="text-[7.5px] font-mono text-slate-400">{processor.processNode.split(' ')[0]}</div>
                  </div>

                  {/* UltraFusion Interconnect Golden Bridge */}
                  <div className="w-6 sm:w-8 py-2 bg-gradient-to-b from-cyan-950 via-cyan-800 to-cyan-950 border border-cyan-400/60 rounded flex flex-col items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse mb-1" />
                    <span className="text-[6.5px] font-extrabold text-cyan-200 [writing-mode:vertical-lr] tracking-wider uppercase">
                      UltraFusion™
                    </span>
                    <span className="text-[6px] font-mono text-cyan-300 mt-1">2.5TB/s</span>
                  </div>

                  {/* Die 1 */}
                  <div className="flex-1 max-w-[130px] sm:max-w-[150px] aspect-[1/1] bg-gradient-to-br from-[#1f2631] via-[#14181f] to-[#0c0f13] rounded-lg border border-slate-600/80 shadow-2xl p-2.5 flex flex-col items-center justify-between relative overflow-hidden group/die">
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
                    <AppleLogo className="w-4 h-4 text-slate-300" />
                    <div className="text-center">
                      <div className="text-[12px] sm:text-[13px] font-black tracking-tight text-white font-mono">
                        {processor.chip}
                      </div>
                      <div className="text-[8px] font-mono text-cyan-300 font-semibold">DIE 1</div>
                    </div>
                    <div className="text-[7.5px] font-mono text-slate-400">{processor.processNode.split(' ')[0]}</div>
                  </div>
                </div>

                {/* Bottom Memory Row */}
                <div className="flex gap-1 sm:gap-2">
                  {Array.from({ length: 4 }).map((_, i) => renderMemoryChip(`bot-${i}`))}
                </div>
              </div>
            ) : isMax ? (
              /* Max Layout: Large Central Die Flanked by 4 Memory Dies (2 on each side) */
              <div className="flex items-center justify-center gap-2 sm:gap-3 w-full relative z-10">
                {/* Left Memory Dies */}
                <div className="flex flex-col gap-1.5">
                  {renderMemoryChip('left-0', '128-bit')}
                  {renderMemoryChip('left-1', '128-bit')}
                </div>

                {/* Central Max Die */}
                <div className="w-[130px] sm:w-[155px] aspect-[1/1] bg-gradient-to-br from-[#222a36] via-[#151921] to-[#0c0f13] rounded-xl border border-slate-500/80 shadow-2xl p-3 flex flex-col items-center justify-between relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
                  <div className="flex items-center gap-1">
                    <AppleLogo className="w-4 h-4 text-slate-200" />
                    <span className="text-[10px] font-extrabold text-slate-300 uppercase tracking-widest font-mono">Silicon</span>
                  </div>
                  <div className="text-center my-1">
                    <div className="text-[15px] sm:text-[16px] font-black tracking-tight text-white font-mono drop-shadow">
                      {processor.chip}
                    </div>
                    <div className="text-[8.5px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                      MAX ARCHITECTURE
                    </div>
                  </div>
                  <div className="w-full flex justify-between items-center text-[7.5px] font-mono text-slate-400 border-t border-slate-700/60 pt-1">
                    <span>{processor.processNode.split(' ')[0]}</span>
                    <span>{processor.dieSizeMm2 ? `${processor.dieSizeMm2} mm²` : 'TSMC 3nm'}</span>
                  </div>
                </div>

                {/* Right Memory Dies */}
                <div className="flex flex-col gap-1.5">
                  {renderMemoryChip('right-0', '128-bit')}
                  {renderMemoryChip('right-1', '128-bit')}
                </div>
              </div>
            ) : isASeries ? (
              /* A-Series Layout: Compact Package-on-Package (PoP) mobile SoC */
              <div className="relative z-10 flex flex-col items-center justify-center">
                {/* PoP Substrate with Golden BGA perimeter */}
                <div className="w-[145px] sm:w-[165px] aspect-[1/1] bg-gradient-to-br from-[#1d232c] via-[#14181f] to-[#0c0f13] rounded-xl border-2 border-slate-600/80 shadow-2xl p-3 flex flex-col items-center justify-between relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
                  
                  {/* Gold Corner Balls Indicator */}
                  <div className="absolute top-1 inset-x-2 flex justify-between text-[6px] text-amber-400/80 font-mono">
                    <span>●●●</span>
                    <span>●●●</span>
                  </div>

                  <div className="flex items-center gap-1 mt-1">
                    <AppleLogo className="w-4 h-4 text-slate-200" />
                    <span className="text-[10px] font-bold text-slate-300 font-mono">Bionic</span>
                  </div>

                  <div className="text-center my-1">
                    <div className="text-[17px] sm:text-[18px] font-black tracking-tight text-white font-mono drop-shadow">
                      {processor.chip}
                    </div>
                    <div className="text-[8.5px] font-mono text-sky-400 font-semibold">
                      PACKAGE-ON-PACKAGE
                    </div>
                  </div>

                  <div className="w-full flex justify-between items-center text-[8px] font-mono text-slate-400 border-t border-slate-700/60 pt-1">
                    <span>{processor.processNode.split(' ')[0]}</span>
                    <span className="text-amber-400 font-bold">{processor.clock} GHz</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Base & Pro Layout: Central Die with 2 or 3 Unified Memory Chips to the right */
              <div className="flex items-center justify-center gap-3 w-full relative z-10">
                {/* Central SoC Die */}
                <div className="w-[130px] sm:w-[150px] aspect-[1/1] bg-gradient-to-br from-[#202732] via-[#151920] to-[#0c0f14] rounded-xl border border-slate-600/90 shadow-2xl p-3 flex flex-col items-center justify-between relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
                  
                  <div className="flex items-center gap-1">
                    <AppleLogo className="w-4 h-4 text-slate-200" />
                    <span className="text-[10px] font-bold text-slate-300 tracking-wider font-mono">Apple</span>
                  </div>

                  <div className="text-center my-1">
                    <div className="text-[16px] sm:text-[18px] font-black tracking-tight text-white font-mono drop-shadow">
                      {processor.chip}
                    </div>
                    <div className="text-[8.5px] font-mono font-bold text-blue-400 tracking-wide uppercase">
                      {isPro ? 'PRO SILICON' : 'APPLE SILICON'}
                    </div>
                  </div>

                  <div className="w-full flex justify-between items-center text-[7.5px] font-mono text-slate-400 border-t border-slate-700/60 pt-1">
                    <span>{processor.processNode.split(' ')[0]}</span>
                    <span>{processor.dieSizeMm2 ? `${processor.dieSizeMm2} mm²` : `${processor.cpuCores} Cores`}</span>
                  </div>
                </div>

                {/* On-Package Memory Modules */}
                <div className="flex flex-col gap-1.5">
                  {Array.from({ length: memoryModulesCount }).map((_, i) => 
                    renderMemoryChip(i, `${processor.memoryBusWidth || '128-bit'}`)
                  )}
                </div>
              </div>
            )}

            {/* Bottom Specs Ticker on Package View */}
            <div className="mt-2.5 w-full flex items-center justify-between text-[9px] font-mono text-slate-400 bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-800 relative z-10">
              <span className="text-slate-300 font-semibold">{processor.processNode}</span>
              <span className="text-purple-300 font-bold">{processor.memoryBandwidth} GB/s BW</span>
              <span className="text-sky-300 font-semibold">{processor.clock} GHz Peak</span>
            </div>
          </div>
        )}

        {/* 2. FLOORPLAN VIEW (Microarchitecture Functional Schematic) */}
        {visualMode === 'floorplan' && (
          <div className="py-1">
            <DieFloorplanVisual processor={processor} />
            <div className="mt-2 text-[9px] text-slate-400 flex items-center justify-between bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-800">
              <span className="font-mono text-emerald-400">Silicon Micro-Architecture</span>
              <span className="font-mono">{processor.coreConfig || `${processor.cpuCores} CPU Cores`}</span>
              <span className="font-mono text-purple-300">{processor.slcMB ? `${processor.slcMB} MB SLC` : 'Integrated Cache'}</span>
            </div>
          </div>
        )}

        {/* 3. REAL DIE SHOT VIEW (High Resolution Microscope Die Photo) */}
        {visualMode === 'dieshot' && hasDieShots && (
          <div className="py-1 space-y-1.5">
            <div 
              className="relative rounded-xl overflow-hidden border border-purple-500/40 bg-slate-950 aspect-[16/10] cursor-pointer group/shot shadow-lg"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
                const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
                setIsDieShotHovered(true);
                setDieShotHoverCoord({ x, y });
              }}
              onMouseLeave={() => setIsDieShotHovered(false)}
              onClick={() => onOpenDieShotLightbox && onOpenDieShotLightbox(processor.dieShots![0], processor.dieShots, processor.name)}
            >
              <img 
                src={processor.dieShots![0].url} 
                alt={processor.dieShots![0].caption}
                style={
                  isDieShotHovered
                    ? {
                        transformOrigin: `${dieShotHoverCoord.x}% ${dieShotHoverCoord.y}%`,
                        transform: 'scale(2.5)',
                        transition: 'transform 0.08s ease-out',
                      }
                    : {
                        transformOrigin: 'center center',
                        transform: 'scale(1)',
                        transition: 'transform 0.3s ease-out',
                      }
                }
                className="w-full h-full object-cover pointer-events-none"
                loading="lazy"
              />
              {isDieShotHovered && (
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-purple-950/90 text-purple-200 border border-purple-500/70 text-[9px] font-mono flex items-center gap-1 shadow-lg pointer-events-none z-10 backdrop-blur">
                  <ZoomIn className="w-3 h-3 text-purple-300" />
                  <span>Hover to zoom • Click for full screen</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end justify-between p-2 pointer-events-none">
                <span className="text-[10px] text-white font-medium line-clamp-1">{processor.dieShots![0].caption}</span>
                <span className="px-2 py-0.5 rounded bg-purple-600/90 text-white text-[9px] font-bold flex items-center gap-1 shadow shrink-0">
                  <ZoomIn className="w-3 h-3" />
                  Inspect Die Shot
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 bg-purple-950/40 px-2 py-1 rounded-lg border border-purple-900/50">
              <span className="text-purple-300 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-purple-400" />
                Verified Microscope Die Photo
              </span>
              <span>{processor.dieSizeMm2 ? `${processor.dieSizeMm2} mm²` : 'TSMC Advanced'}</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
