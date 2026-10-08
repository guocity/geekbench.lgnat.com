import React, { useState, useMemo } from 'react';
import { 
  Cpu, 
  Layers, 
  Table, 
  Sparkles, 
  Search, 
  Zap, 
  Activity, 
  Image as ImageIcon, 
  ExternalLink, 
  X, 
  Flame, 
  Grid3X3,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  Gauge,
  Calendar
} from 'lucide-react';
import { Card } from '../common/Card';
import { ProcessorDetail, ProcessedItem, FilterMode } from '../../types';
import { FAMILY_COLORS, TIER_COLORS, TIER_LABELS, formatReleaseDate } from '../../constants';
import { ProcessorCard, ProcessorBenchmarkStats } from '../silicon/ProcessorCard';
import { DieFloorplanVisual } from '../silicon/DieFloorplanVisual';
import { DieShotGallery } from '../gallery/DieShotGallery';

export interface ProcessorsMatrixViewProps {
  filteredProcessors: ProcessorDetail[];
  allProcessors?: ProcessorDetail[];
  processedData?: ProcessedItem[];
  searchTerm: string;
  onSearchTermChange?: (term: string) => void;
  selectedGroup?: string | null;
  onGroupSelect?: (group: string) => void;
  filterMode?: FilterMode;
  onFilterModeChange?: (mode: FilterMode) => void;
  onSelectProcessor: (processor: ProcessorDetail) => void;
  onFilterDevices?: (chip: string) => void;
}

type DisplayLayout = 'cards' | 'floorplan' | 'table';
type SortBy = 'releaseDate' | 'multi' | 'single' | 'metal' | 'bandwidth' | 'dieSize' | 'cpuCores';

export const ProcessorsMatrixView: React.FC<ProcessorsMatrixViewProps> = ({
  filteredProcessors,
  allProcessors = [],
  processedData = [],
  searchTerm,
  onSearchTermChange,
  selectedGroup,
  onGroupSelect,
  filterMode = 'family',
  onFilterModeChange,
  onSelectProcessor,
  onFilterDevices,
}) => {
  const [displayLayout, setDisplayLayout] = useState<DisplayLayout>('cards');
  const [sortBy, setSortBy] = useState<SortBy>('releaseDate');
  const [activeDieShotLightbox, setActiveDieShotLightbox] = useState<{ url: string; caption: string } | null>(null);

  // Compute benchmark statistics per processor from runtime benchmark dataset
  const processorStatsMap = useMemo<Record<string, ProcessorBenchmarkStats>>(() => {
    const map: Record<string, ProcessorBenchmarkStats> = {};
    for (const item of processedData) {
      if (!map[item.chip]) {
        map[item.chip] = {
          count: 0,
          maxSingle: 0,
          maxMulti: 0,
          maxMetal: 0,
          devices: []
        };
      }
      const s = map[item.chip];
      s.count++;
      if ((item.scores?.single || 0) > s.maxSingle) s.maxSingle = item.scores.single;
      if ((item.scores?.multi || 0) > s.maxMulti) s.maxMulti = item.scores.multi;
      if ((item.scores?.metal || 0) > s.maxMetal) s.maxMetal = item.scores.metal;
      if (item.device && !s.devices.includes(item.device)) {
        s.devices.push(item.device);
      }
    }
    return map;
  }, [processedData]);

  // Compute Global Benchmark Peaks for relative gauges
  const { globalMaxSingle, globalMaxMulti, globalMaxMetal, globalMaxBandwidth } = useMemo(() => {
    let maxSingle = 0;
    let maxMulti = 0;
    let maxMetal = 0;
    let maxBw = 0;

    for (const p of filteredProcessors) {
      if (p.memoryBandwidth > maxBw) maxBw = p.memoryBandwidth;
      const s = processorStatsMap[p.chip];
      if (s) {
        if (s.maxSingle > maxSingle) maxSingle = s.maxSingle;
        if (s.maxMulti > maxMulti) maxMulti = s.maxMulti;
        if (s.maxMetal > maxMetal) maxMetal = s.maxMetal;
      }
    }
    return {
      globalMaxSingle: maxSingle || 4689,
      globalMaxMulti: maxMulti || 51984,
      globalMaxMetal: maxMetal || 304648,
      globalMaxBandwidth: maxBw || 1365.3
    };
  }, [filteredProcessors, processorStatsMap]);

  // Sort Processors based on active sort selector
  const sortedProcessors = useMemo(() => {
    const list = [...filteredProcessors];

    list.sort((a, b) => {
      const statsA = processorStatsMap[a.chip];
      const statsB = processorStatsMap[b.chip];

      if (sortBy === 'multi') {
        return (statsB?.maxMulti || 0) - (statsA?.maxMulti || 0);
      }
      if (sortBy === 'single') {
        return (statsB?.maxSingle || 0) - (statsA?.maxSingle || 0);
      }
      if (sortBy === 'metal') {
        return (statsB?.maxMetal || 0) - (statsA?.maxMetal || 0);
      }
      if (sortBy === 'bandwidth') {
        return (b.memoryBandwidth || 0) - (a.memoryBandwidth || 0);
      }
      if (sortBy === 'dieSize') {
        return (b.dieSizeMm2 || 0) - (a.dieSizeMm2 || 0);
      }
      if (sortBy === 'cpuCores') {
        const cA = Array.isArray(a.cpuCores) ? a.cpuCores[a.cpuCores.length - 1] : a.cpuCores;
        const cB = Array.isArray(b.cpuCores) ? b.cpuCores[b.cpuCores.length - 1] : b.cpuCores;
        return cB - cA;
      }

      // Default: Release Date (Latest First) sort desc
      const dateA = a.releaseDate || '2020-01';
      const dateB = b.releaseDate || '2020-01';
      const dateDiff = dateB.localeCompare(dateA);
      if (dateDiff !== 0) return dateDiff;
      const tierRank: Record<string, number> = { "ultra": 5, "max": 4, "pro": 3, "base": 2, "A-Series": 1 };
      const tA = tierRank[a.tier] || 0;
      const tB = tierRank[b.tier] || 0;
      if (tB !== tA) return tB - tA;
      const aIsPro = a.chip.includes("Pro") ? 1 : 0;
      const bIsPro = b.chip.includes("Pro") ? 1 : 0;
      if (bIsPro !== aIsPro) return bIsPro - aIsPro;
      return a.name.localeCompare(b.name);
    });

    return list;
  }, [filteredProcessors, sortBy, processorStatsMap]);

  return (
    <div className="space-y-4">
      {/* Hero Silicon Architecture Visual Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-[#101726] to-slate-900 border border-slate-800 text-white p-5 sm:p-6 shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.18),rgba(255,255,255,0))] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-blue-400" />
                Apple Silicon Visual Showcase
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {filteredProcessors.length} Processors Loaded
              </span>
            </div>
            
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Cpu className="w-6 h-6 text-sky-400" />
              Apple Silicon Processor Gallery
            </h2>
            
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Explore the complete physical packaging, microarchitecture floorplans, TSMC fabrication nodes (2nm GAA Nanosheet to 5nm FinFET), unified memory topologies, and verified 4K microscope die shots across M1 through M6 and A-Series.
            </p>
          </div>

          {/* Quick Hardware Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 shrink-0">
            <div className="bg-slate-800/60 backdrop-blur border border-slate-700/60 rounded-xl p-2.5 text-center">
              <span className="text-[10px] text-slate-400 font-mono block">FABRICATION</span>
              <span className="text-xs sm:text-sm font-bold text-sky-400 font-mono">2nm GAA to 5nm</span>
            </div>
            <div className="bg-slate-800/60 backdrop-blur border border-slate-700/60 rounded-xl p-2.5 text-center">
              <span className="text-[10px] text-slate-400 font-mono block">PEAK BANDWIDTH</span>
              <span className="text-xs sm:text-sm font-bold text-purple-400 font-mono">1,365 GB/s</span>
            </div>
            <div className="bg-slate-800/60 backdrop-blur border border-slate-700/60 rounded-xl p-2.5 text-center col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-400 font-mono block">REAL 4K DIE SHOTS</span>
              <span className="text-xs sm:text-sm font-bold text-emerald-400 font-mono">M6 · A20 · A20 Pro</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control & Filter Navigation Bar */}
      <Card className="p-3 bg-white/95 backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Left: View Mode Layout Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setDisplayLayout('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                displayLayout === 'cards' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Grid3X3 className="w-3.5 h-3.5 text-blue-600" />
              <span>Visual Chip Cards</span>
            </button>

            <button
              onClick={() => setDisplayLayout('floorplan')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                displayLayout === 'floorplan' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>Die Floorplans</span>
            </button>

            <button
              onClick={() => setDisplayLayout('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                displayLayout === 'table' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Table className="w-3.5 h-3.5 text-purple-600" />
              <span>Specs Matrix Table</span>
            </button>
          </div>

          {/* Right: Sort Options & Generation Quick Filters */}
          <div className="flex items-center gap-2 flex-wrap justify-between lg:justify-end">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <span>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="bg-slate-100 hover:bg-slate-200 border-none rounded-lg text-xs font-semibold text-slate-800 px-2.5 py-1.5 outline-none cursor-pointer"
              >
                <option value="releaseDate">Release Date (Latest First)</option>
                <option value="multi">Multi-Core Geekbench</option>
                <option value="single">Single-Core Geekbench</option>
                <option value="metal">Metal GPU Score</option>
                <option value="bandwidth">Memory Bandwidth</option>
                <option value="cpuCores">CPU Core Count</option>
                <option value="dieSize">Die Area (mm²)</option>
              </select>
            </div>

            <span className="text-xs text-slate-400 font-medium">
              Showing {sortedProcessors.length} of 29 chips
            </span>
          </div>

        </div>
      </Card>

      {/* 1. VISUAL CHIP CARDS GALLERY */}
      {displayLayout === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sortedProcessors.map((processor) => (
            <ProcessorCard
              key={processor.chip}
              processor={processor}
              stats={processorStatsMap[processor.chip]}
              globalMaxSingle={globalMaxSingle}
              globalMaxMulti={globalMaxMulti}
              globalMaxMetal={globalMaxMetal}
              globalMaxBandwidth={globalMaxBandwidth}
              onSelectProcessor={onSelectProcessor}
              onFilterDevices={onFilterDevices}
              onOpenDieShotLightbox={(dieShot) => setActiveDieShotLightbox(dieShot)}
            />
          ))}
          {sortedProcessors.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              <Cpu className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-600">No processors match current filters</p>
              <p className="text-xs text-slate-400 mt-1">Try resetting the search or generation filter</p>
            </div>
          )}
        </div>
      )}

      {/* 2. SILICON DIE FLOORPLAN GALLERY (Architectural Blueprint Comparison) */}
      {displayLayout === 'floorplan' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sortedProcessors.map((processor) => {
            const stats = processorStatsMap[processor.chip];
            const familyColor = FAMILY_COLORS[processor.family] || TIER_COLORS[processor.tier] || '#3b82f6';
            return (
              <div 
                key={processor.chip}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition space-y-3 cursor-pointer group"
                onClick={() => onSelectProcessor(processor)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span 
                      className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white shadow-xs"
                      style={{ backgroundColor: familyColor }}
                    >
                      {processor.chip}
                    </span>
                    <span className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition">
                      {processor.name}
                    </span>
                    {processor.releaseDate && (
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded flex items-center gap-1 font-medium">
                        <Calendar className="w-2.5 h-2.5 text-slate-400" />
                        {formatReleaseDate(processor.releaseDate)}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-semibold text-slate-600">
                      {processor.dieSizeMm2 ? `${processor.dieSizeMm2} mm²` : processor.processNode}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950 rounded-xl p-2 border border-slate-800">
                  <DieFloorplanVisual processor={processor} />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">CPU Config</span>
                    <span className="font-bold text-slate-800 font-mono">{processor.coreConfig || `${processor.cpuCores} Cores`}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">GPU Array</span>
                    <span className="font-bold text-slate-800 font-mono">{Array.isArray(processor.gpuCores) ? processor.gpuCores.join('/') : processor.gpuCores} Cores</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">Bandwidth</span>
                    <span className="font-bold text-purple-700 font-mono">{processor.memoryBandwidth} GB/s</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. DETAILED SPECS MATRIX TABLE */}
      {displayLayout === 'table' && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-900 font-semibold border-b border-slate-200 whitespace-nowrap select-none">
                <tr>
                  <th className="px-4 py-3 pl-6">Processor</th>
                  <th className="px-4 py-3">Release Date</th>
                  <th className="px-4 py-3">Process Node & Tech</th>
                  <th className="px-4 py-3">Die Area</th>
                  <th className="px-4 py-3">CPU Cores & Split</th>
                  <th className="px-4 py-3">Peak Clock</th>
                  <th className="px-4 py-3">GPU Cores</th>
                  <th className="px-4 py-3">Neural Engine</th>
                  <th className="px-4 py-3 text-right">Memory Bandwidth</th>
                  <th className="px-4 py-3">Memory Speed & Tech</th>
                  <th className="px-4 py-3">Cache (SLC / L2)</th>
                  <th className="px-4 py-3 pr-6 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedProcessors.map((p) => {
                  const isM6 = p.chip === 'M6';
                  return (
                    <tr 
                      key={p.chip}
                      onClick={() => onSelectProcessor(p)}
                      className={`hover:bg-blue-50/40 transition-colors group cursor-pointer ${isM6 ? 'bg-sky-50/30' : ''}`}
                    >
                      <td className="px-4 py-3 pl-6 font-medium text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span 
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium text-white shadow-sm"
                            style={{ backgroundColor: FAMILY_COLORS[p.family] || TIER_COLORS[p.tier] || '#64748b' }}
                          >
                            {p.chip}
                          </span>
                          <span className="font-bold text-slate-900">{p.name}</span>
                          {p.rayTracing && (
                            <span className="text-[9px] px-1 py-0.2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded font-medium">RT</span>
                          )}
                          {p.dieShots && p.dieShots.length > 0 && (
                            <span className="text-[9px] px-1.5 py-0.2 bg-purple-50 text-purple-700 border border-purple-200 rounded font-medium flex items-center gap-0.5" title="4K Die shot available">
                              <ImageIcon className="w-2.5 h-2.5" /> 4K Die Shot
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap font-mono text-[11px] text-slate-700">
                        {formatReleaseDate(p.releaseDate)}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-medium text-slate-800">{p.processNode}</div>
                        {p.transistorTech && (
                          <div className="text-[10px] text-slate-400 font-mono">{p.transistorTech}</div>
                        )}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap font-mono text-[11px] text-slate-700">
                        {p.dieSizeMm2 ? `${p.dieSizeMm2} mm²` : '-'}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-semibold text-slate-800">{p.coreConfig || `${p.cpuCores} cores`}</span>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap font-mono text-[11px] text-slate-700">
                        {p.clock} GHz
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap font-mono text-[11px] text-slate-700">
                        {Array.isArray(p.gpuCores) ? p.gpuCores.join(' / ') : p.gpuCores} cores
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-[11px]">
                        <span className="font-semibold text-slate-800">{p.neuralEngineCores}-core</span>
                        {p.aneTops && <span className="text-slate-400 ml-1">({p.aneTops} TOPS)</span>}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-right font-mono text-[11px]">
                        {p.ramConfigurations && p.ramConfigurations.length > 0 ? (
                          <div className="space-y-0.5">
                            {p.ramConfigurations.map((rc, idx) => (
                              <div key={idx} className="flex items-center justify-end gap-1.5">
                                <span className="text-[9.5px] text-slate-500 font-medium">{rc.ram}:</span>
                                <span className="font-bold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded">
                                  {rc.memoryBandwidth} GB/s
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                            {p.memoryBandwidthMin ? `${p.memoryBandwidthMin} – ${p.memoryBandwidthMax} GB/s` : `${p.memoryBandwidth} GB/s`}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-[11px]">
                        <div className="font-medium text-slate-800">{p.memoryType}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{p.memorySpeed} · {p.memoryBusWidth}</div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-[11px] text-slate-700">
                        <div>SLC: <span className="font-semibold">{p.systemCache || `${p.slcMB} MB`}</span></div>
                        {p.l2Cache && <div className="text-[10px] text-slate-400 font-mono">L2: {p.l2Cache}</div>}
                      </td>

                      <td className="px-4 py-3 pr-6 text-center whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectProcessor(p);
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Global 4K Die Shot Lightbox */}
      {activeDieShotLightbox && (
        <div 
          className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in"
          onClick={() => setActiveDieShotLightbox(null)}
        >
          <div 
            className="relative max-w-4xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 px-4 border-b border-slate-800 flex items-center justify-between bg-slate-900 text-white">
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white">{activeDieShotLightbox.caption}</h4>
                <p className="text-[10px] text-slate-400">Microscopic Silicon Floorplan & Die Architecture</p>
              </div>
              <button 
                onClick={() => setActiveDieShotLightbox(null)} 
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 overflow-auto flex items-center justify-center bg-black/80 max-h-[75vh]">
              <img 
                src={activeDieShotLightbox.url} 
                alt={activeDieShotLightbox.caption} 
                className="max-h-[72vh] max-w-full object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
