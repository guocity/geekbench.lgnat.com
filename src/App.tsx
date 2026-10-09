import React, { useState, useEffect, useMemo } from 'react';
import { Activity, Zap, Layers, Monitor, RefreshCw, AlertCircle } from 'lucide-react';
import { 
  AppleSiliconBenchmark, 
  ProcessedItem, 
  AggregatedChipGroup, 
  ProcessorDetail, 
  MetricKey, 
  ViewMode, 
  FilterMode 
} from './types';
import { METRIC_LABELS } from './constants';
import { Card } from './components/common/Card';
import { StatItem } from './components/common/StatItem';
import { Header } from './components/Header';
import { DashboardView } from './components/views/DashboardView';
import { DevicesTableView } from './components/views/DevicesTableView';
import { ProcessorsMatrixView } from './components/views/ProcessorsMatrixView';
import { DeviceDetailModal } from './components/modals/DeviceDetailModal';
import { ProcessorDetailModal } from './components/modals/ProcessorDetailModal';

export default function App() {
  const [rawData, setRawData] = useState<AppleSiliconBenchmark[]>([]);
  const [processors, setProcessors] = useState<Record<string, ProcessorDetail>>({});
  const [processorList, setProcessorList] = useState<ProcessorDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const getInitialViewMode = (): ViewMode => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('processor')) return 'processors';
      if (hash.includes('device') || hash.includes('list') || hash.includes('table')) return 'list';
      if (hash.includes('dashboard')) return 'dashboard';
      const params = new URLSearchParams(window.location.search);
      const v = params.get('view');
      if (v === 'processors' || v === 'list' || v === 'dashboard') return v;
    }
    return 'dashboard';
  };

  const [sortMetric, setSortMetric] = useState<MetricKey>('multi'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>(getInitialViewMode);
  
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    if (typeof window !== 'undefined') {
      const targetHash = mode === 'dashboard' ? '' : `#${mode}`;
      if (window.location.hash !== targetHash) {
        history.replaceState(null, '', targetHash || window.location.pathname);
      }
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('processor')) setViewMode('processors');
      else if (hash.includes('device') || hash.includes('list') || hash.includes('table')) setViewMode('list');
      else if (hash.includes('dashboard') || hash === '' || hash === '#') setViewMode('dashboard');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const [filterMode, setFilterMode] = useState<FilterMode>('family');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null); 
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState<ProcessedItem | null>(null);
  const [selectedProcessorModal, setSelectedProcessorModal] = useState<ProcessorDetail | null>(null);

  // Table Sorting State
  const [tableSortConfig, setTableSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ 
    key: 'scores.multi', 
    direction: 'desc' 
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const loadJson = async (filename: string) => {
        const base = (import.meta.env.BASE_URL || './').replace(/\/$/, '');
        const paths = [
          `${base}/${filename}`,
          `./${filename}`,
          `/${filename}`,
          filename
        ];
        for (const p of paths) {
          try {
            const res = await fetch(p);
            if (res.ok) {
              const data = await res.json();
              if (Array.isArray(data) && data.length > 0) return data;
            }
          } catch {
            // try next candidate
          }
        }
        return null;
      };

      const [devicesData, procData] = await Promise.all([
        loadJson('devices.json') as Promise<AppleSiliconBenchmark[] | null>,
        loadJson('processor.json') as Promise<ProcessorDetail[] | null>
      ]);

      if (!Array.isArray(devicesData) || devicesData.length === 0) {
        throw new Error("Failed to load devices.json dataset");
      }

      if (procData && Array.isArray(procData)) {
        const pMap: Record<string, ProcessorDetail> = {};
        for (const p of procData) {
          pMap[p.chip] = p;
        }
        setProcessors(pMap);
        setProcessorList(procData);
      }

      setRawData(devicesData);
    } catch (err) {
      console.error("Data load failed:", err);
      setError("Unable to load benchmark dataset. Please ensure devices.json and processor.json are present.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Dynamic In-Memory Relational Join: devices.json + processor.json
  const processedData = useMemo<ProcessedItem[]>(() => {
    return rawData
      .map(item => {
        const proc = processors[item.chip];

        // 1. Resolve Memory Bandwidth
        let memoryBandwidth = item.memoryBandwidth || 0;
        let memoryType = item.memoryType || proc?.memoryType || 'Unified Memory';
        let memorySpeed = item.memorySpeed || proc?.memorySpeed || '';
        let busWidthBits = item.busWidthBits || proc?.busWidthBits;
        let memoryBusWidth = item.memoryBusWidth || proc?.memoryBusWidth || (busWidthBits ? `${busWidthBits}-bit` : '');

        if (proc?.ramConfigurations && proc.ramConfigurations.length > 0) {
          let matched = null;
          if (item.ram) {
            const cleanRam = item.ram.replace(' RAM', '').trim();
            matched = proc.ramConfigurations.find(rc => 
              rc.ram === item.ram || 
              rc.ram.includes(cleanRam)
            );
          }
          if (!matched && item.cpuCores) {
            matched = proc.ramConfigurations.find(rc => 
              rc.ram.includes(`${item.cpuCores}-core`)
            );
          }
          if (!matched && proc.ramConfigurations.length > 0) {
            matched = proc.ramConfigurations[0];
          }

          if (matched) {
            memoryBandwidth = matched.memoryBandwidth;
            memoryType = matched.memoryType || memoryType;
            memorySpeed = matched.memorySpeed || memorySpeed;
            if (matched.busWidthBits) {
              busWidthBits = matched.busWidthBits;
              memoryBusWidth = `${matched.busWidthBits}-bit`;
            }
          } else if (!memoryBandwidth && proc.memoryBandwidth) {
            memoryBandwidth = proc.memoryBandwidth;
          }
        } else if (!memoryBandwidth && proc?.memoryBandwidth) {
          memoryBandwidth = proc.memoryBandwidth;
        }

        // 2. Resolve architecture fields from processor
        const family = item.family || proc?.family || 'Unknown';
        const tier = item.tier || proc?.tier || 'base';
        const processNode = item.processNode || proc?.processNode || 'TSMC Advanced';
        const transistorTech = item.transistorTech || proc?.transistorTech;
        const dieSizeMm2 = item.dieSizeMm2 || proc?.dieSizeMm2;
        const packaging = item.packaging || proc?.packaging || 'Apple SiP';
        const rayTracing = item.rayTracing !== undefined ? item.rayTracing : (proc?.rayTracing || false);
        const neuralEngineCores = item.neuralEngineCores || proc?.neuralEngineCores || 16;
        const aneTops = item.aneTops || proc?.aneTops;
        const l2Cache = item.l2Cache || proc?.l2Cache;
        const l2CacheMB = item.l2CacheMB || proc?.l2CacheMB;
        const slcMB = item.slcMB || proc?.slcMB;
        const systemCache = item.systemCache || proc?.systemCache || (slcMB ? `${slcMB} MB` : '');
        let superCores = item.superCores !== undefined ? item.superCores : proc?.superCores;
        let pCores = item.pCores !== undefined ? item.pCores : proc?.pCores;
        let eCores = item.eCores !== undefined ? item.eCores : proc?.eCores;
        let coreConfig = item.coreConfig;

        if (!coreConfig) {
          if (proc) {
            if (proc.chip === 'M5 Pro' && item.cpuCores === 15) {
              superCores = 5;
              pCores = 10;
              eCores = 0;
              coreConfig = '5 Super + 10P';
            } else if (proc.chip === 'M5 Ultra' && item.cpuCores === 30) {
              superCores = 10;
              pCores = 20;
              eCores = 0;
              coreConfig = '10 Super + 20P';
            } else {
              coreConfig = proc.coreConfig;
            }
          }
          if (!coreConfig) {
            coreConfig = `${item.cpuCores} cores`;
          }
        }
        
        const ramStr = item.ram ? `, ${item.ram} RAM` : '';
        const specs = item.specs || (
          `Apple ${item.chip} @ ${item.clock} GHz (${coreConfig} CPU cores, ${item.gpuCores} GPU cores, ${systemCache} SLC, ${memoryBusWidth} ${memoryType}${ramStr}), ${memoryBandwidth} GB/s, ${processNode}`
        );

        return {
          ...item,
          family,
          tier,
          processNode,
          transistorTech,
          dieSizeMm2,
          packaging,
          rayTracing,
          neuralEngineCores,
          aneTops,
          l2Cache,
          l2CacheMB,
          slcMB,
          systemCache,
          busWidthBits,
          memoryBusWidth,
          memoryType,
          memorySpeed,
          superCores,
          pCores,
          eCores,
          coreConfig,
          specs,
          memoryBandwidth,
          releaseDate: item.releaseDate || proc?.releaseDate,
          processor: proc,
          scores: {
            single: item.single || 0,
            multi: item.multi || 0,
            metal: item.metal || 0,
            opencl: item.opencl || 0,
            bandwidth: memoryBandwidth
          }
        };
      })
      .filter(item => item.family !== "Unknown" && (item.scores.single > 0 || item.scores.multi > 0 || item.scores.metal > 0 || item.scores.bandwidth > 0))
      .sort((a, b) => (b.scores[sortMetric] || 0) - (a.scores[sortMetric] || 0));
  }, [rawData, processors, sortMetric]);

  const filteredData = useMemo<ProcessedItem[]>(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return processedData;
    return processedData.filter(item => 
      (item.model?.toLowerCase().includes(q) || 
       item.specs?.toLowerCase().includes(q) ||
       item.chip?.toLowerCase().includes(q) ||
       item.processNode?.toLowerCase().includes(q) ||
       item.device?.toLowerCase().includes(q) ||
       item.coreConfig?.toLowerCase().includes(q) ||
       item.memoryType?.toLowerCase().includes(q) ||
       item.ram?.toLowerCase().includes(q))
    );
  }, [processedData, searchTerm]);

  const activeData = useMemo<ProcessedItem[]>(() => {
    const groupKey = filterMode === 'family' ? 'family' : 'tier';
    return filteredData.filter(item => {
      const matchGroup = !selectedGroup || (item as any)[groupKey] === selectedGroup;
      const matchDevice = !selectedDevice || item.device === selectedDevice;
      return matchGroup && matchDevice;
    });
  }, [filteredData, selectedGroup, selectedDevice, filterMode]);

  const aggregatedData = useMemo<AggregatedChipGroup[]>(() => {
    const groupKey = filterMode === 'family' ? 'family' : 'tier';
    const groups: Record<string, AggregatedChipGroup> = {};

    filteredData.forEach(item => {
      const gKey = item.chip || (item as any)[groupKey] || 'Unknown';

      if (!groups[gKey]) {
        groups[gKey] = {
          displayName: gKey,
          family: item.family,
          tier: item.tier,
          gpuCores: item.gpuCores,
          devices: new Set(),
          bandwidths: [],
          scores: [],
          effs: [],
          clocks: [],
          ghzEffs: [],
          cores: new Set(),
          minScore: 0,
          maxScore: 0,
          avgScore: 0,
          minEff: 0,
          maxEff: 0,
          avgEff: 0,
          minGhz: 0,
          maxGhz: 0,
          avgGhz: 0,
          minGhzEff: 0,
          maxGhzEff: 0,
          avgGhzEff: 0,
          minBw: 0,
          maxBw: 0,
          avgBw: 0,
          bandwidthStr: '-',
          coreCountsStr: '-',
          processor: item.processor || processors[item.chip]
        };
      }

      const g = groups[gKey];
      if (item.device) g.devices.add(item.device);
      if (item.cpuCores) g.cores.add(item.cpuCores);

      const score = item.scores[sortMetric] || 0;
      if (score > 0) {
        g.scores.push(score);
        if (sortMetric === 'metal' || sortMetric === 'opencl') {
          if (item.gpuCores > 0) {
            g.effs.push(score / item.gpuCores);
          }
        } else if (sortMetric === 'multi') {
          if (item.cpuCores > 0) {
            g.effs.push(score / item.cpuCores);
          }
        }
      }

      const clockNum = parseFloat(item.clock);
      if (!isNaN(clockNum) && clockNum > 0) {
        g.clocks.push(clockNum);
        if (score > 0) {
          g.ghzEffs.push(score / clockNum);
        }
      }

      if (item.scores.bandwidth > 0) {
        g.bandwidths.push(item.scores.bandwidth);
      }
    });

    return Object.values(groups)
      .filter(g => g.scores.length > 0)
      .map(g => {
        const minScore = Math.min(...g.scores);
        const maxScore = Math.max(...g.scores);
        const avgScore = Math.round(g.scores.reduce((a, b) => a + b, 0) / g.scores.length);

        const minEff = g.effs.length ? Math.min(...g.effs) : 0;
        const maxEff = g.effs.length ? Math.max(...g.effs) : 0;
        const avgEff = g.effs.length ? Math.round(g.effs.reduce((a, b) => a + b, 0) / g.effs.length) : 0;

        const minGhz = g.clocks.length ? Math.min(...g.clocks) : 0;
        const maxGhz = g.clocks.length ? Math.max(...g.clocks) : 0;
        const avgGhz = g.clocks.length ? g.clocks.reduce((a, b) => a + b, 0) / g.clocks.length : 0;

        const minGhzEff = g.ghzEffs.length ? Math.min(...g.ghzEffs) : 0;
        const maxGhzEff = g.ghzEffs.length ? Math.max(...g.ghzEffs) : 0;
        const avgGhzEff = g.ghzEffs.length ? Math.round(g.ghzEffs.reduce((a, b) => a + b, 0) / g.ghzEffs.length) : 0;

        const minBw = g.bandwidths.length ? Math.min(...g.bandwidths) : 0;
        const maxBw = g.bandwidths.length ? Math.max(...g.bandwidths) : 0;
        const avgBw = g.bandwidths.length ? Math.round((g.bandwidths.reduce((a, b) => a + b, 0) / g.bandwidths.length) * 10) / 10 : 0;

        return {
          ...g,
          minScore, maxScore, avgScore,
          minEff: Math.round(minEff), maxEff: Math.round(maxEff), avgEff,
          minGhz, maxGhz, avgGhz,
          minGhzEff: Math.round(minGhzEff), maxGhzEff: Math.round(maxGhzEff), avgGhzEff,
          minBw, maxBw, avgBw,
          bandwidthStr: avgBw > 0 ? `${avgBw} GB/s` : '-',
          coreCountsStr: Array.from(g.cores).sort((a,b)=>a-b).join(', ') || '-'
        };
      })
      .sort((a, b) => {
        const getAOrder = (name: string) => {
          const m = name.match(/A(\d+)([XZ])?(?:\s+(Pro))?/i);
          if (m) {
            let val = parseInt(m[1], 10);
            if (m[2]?.toUpperCase() === 'X') val += 0.1;
            if (m[2]?.toUpperCase() === 'Z') val += 0.2;
            if (m[3]) val += 0.5;
            return val;
          }
          return 0;
        };

        const tierRank: Record<string, number> = { "A-Series": 0, "base": 1, "pro": 2, "max": 3, "ultra": 4 };

        if (filterMode === 'tier') {
          const tierDiff = (tierRank[a.tier] ?? 5) - (tierRank[b.tier] ?? 5);
          if (tierDiff !== 0) return tierDiff;
          if (a.tier === 'A-Series') {
            return getAOrder(a.displayName) - getAOrder(b.displayName);
          }
          return (a.family || '').localeCompare(b.family || '');
        } else {
          const famDiff = (a.family || '').localeCompare(b.family || '');
          if (famDiff !== 0) return famDiff;
          const rankDiff = (tierRank[a.tier] ?? 5) - (tierRank[b.tier] ?? 5);
          if (rankDiff !== 0) return rankDiff;
          if (a.tier === 'A-Series') {
            return getAOrder(a.displayName) - getAOrder(b.displayName);
          }
          return (a.gpuCores || 0) - (b.gpuCores || 0);
        }
      });
  }, [filteredData, processors, sortMetric, filterMode]);

  const sortedTableData = useMemo<ProcessedItem[]>(() => {
    const sortable = [...activeData];
    sortable.sort((a, b) => {
      let aVal: any = a;
      let bVal: any = b;
      
      const keys = tableSortConfig.key.split('.');
      for (const k of keys) {
        aVal = aVal?.[k];
        bVal = bVal?.[k];
      }

      if (tableSortConfig.key === 'clock') {
        aVal = parseFloat(a.clock) || 0;
        bVal = parseFloat(b.clock) || 0;
      }

      if (typeof aVal === 'string') {
        return tableSortConfig.direction === 'asc' 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      }

      return tableSortConfig.direction === 'asc' 
        ? (aVal || 0) - (bVal || 0) 
        : (bVal || 0) - (aVal || 0);
    });
    return sortable;
  }, [activeData, tableSortConfig]);

  const filteredProcessors = useMemo<ProcessorDetail[]>(() => {
    const q = searchTerm.toLowerCase().trim();
    return processorList.filter(p => {
      const matchSearch = !q || (
        p.name.toLowerCase().includes(q) ||
        p.chip.toLowerCase().includes(q) ||
        p.processNode.toLowerCase().includes(q) ||
        (p.transistorTech && p.transistorTech.toLowerCase().includes(q)) ||
        (p.coreConfig && p.coreConfig.toLowerCase().includes(q))
      );
      const groupKey = filterMode === 'family' ? 'family' : 'tier';
      const matchGroup = !selectedGroup || (p as any)[groupKey] === selectedGroup;
      return matchSearch && matchGroup;
    });
  }, [processorList, searchTerm, filterMode, selectedGroup]);

  const handleTableSort = (key: string) => {
    setTableSortConfig(curr => ({
      key,
      direction: curr.key === key && curr.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const handleFilterModeChange = (mode: FilterMode) => {
    setFilterMode(mode);
    setSelectedGroup(null);
  };

  const handleGroupSelect = (group: string) => {
    setSelectedGroup(prev => prev === group ? null : group);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mb-4" />
        <h2 className="text-slate-700 font-semibold text-sm">Loading Geekbench Matrix...</h2>
        <p className="text-slate-400 text-xs mt-1">Reading devices.json & processor.json</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mb-3" />
        <h2 className="text-slate-800 font-bold text-base mb-1">Failed to Load Dataset</h2>
        <p className="text-slate-500 text-xs text-center max-w-sm mb-4">{error}</p>
        <button onClick={fetchData} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition">
          Retry Loading
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 pb-0">
      {/* Top Header Bar */}
      <Header
        filterMode={filterMode}
        onFilterModeChange={handleFilterModeChange}
        selectedGroup={selectedGroup}
        onGroupSelect={handleGroupSelect}
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        sortMetric={sortMetric}
        onSortMetricChange={setSortMetric}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
      />

      <main className="w-full px-2 xl:px-8 py-3 pb-8 space-y-3">
        {/* Metric Quick Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          <Card>
            <StatItem 
              label={`Top ${METRIC_LABELS[sortMetric]}`} 
              value={activeData.length > 0 ? (sortMetric === 'bandwidth' ? `${activeData[0].scores[sortMetric]} GB/s` : activeData[0].scores[sortMetric].toLocaleString()) : '-'} 
              subtext={activeData.length > 0 ? activeData[0].model : ''}
              icon={Activity} 
              colorClass="bg-blue-500" 
            />
          </Card>
          <Card>
            <StatItem 
              label={sortMetric === 'bandwidth' ? "Avg Bandwidth" : "Avg Efficiency"} 
              value={
                sortMetric === 'bandwidth' 
                  ? `${Math.round(activeData.reduce((acc, curr) => acc + (curr.scores.bandwidth || 0), 0) / (activeData.filter(d => (d.scores.bandwidth || 0) > 0).length || 1))} GB/s`
                  : `${Math.round(activeData.reduce((acc, curr) => acc + (curr.scores[sortMetric] || 0) / (curr.cpuCores || 1), 0) / (activeData.length || 1))} pts/core`
              } 
              subtext={sortMetric === 'bandwidth' ? "Bandwidth (GB/s)" : "Score / Core"}
              icon={Zap} 
              colorClass="bg-amber-500" 
            />
          </Card>
          <Card>
            <StatItem 
              label="Tested Devices" 
              value={activeData.length} 
              subtext="Mac, iPad & iPhone models"
              icon={Monitor} 
              colorClass="bg-emerald-500" 
            />
          </Card>
          <Card>
            <StatItem 
              label="Apple Silicon Generations" 
              value={`${processorList.length} Processors`}
              subtext="M1 – M6 & A-Series (processor.json)"
              icon={Layers} 
              colorClass="bg-purple-500" 
            />
          </Card>
        </div>

        {/* View Mode Router */}
        {viewMode === 'dashboard' ? (
          <DashboardView
            sortMetric={sortMetric}
            filteredData={filteredData}
            aggregatedData={aggregatedData}
            selectedGroup={selectedGroup}
            selectedDevice={selectedDevice}
            filterMode={filterMode}
            onGroupSelect={handleGroupSelect}
            onSelectDetail={setSelectedDetailItem}
            onFilterModeChange={handleFilterModeChange}
            onSelectDevice={(dev) => setSelectedDevice(prev => prev === dev ? null : dev)}
          />
        ) : viewMode === 'list' ? (
          <DevicesTableView
            sortedTableData={sortedTableData}
            searchTerm={searchTerm}
            sortMetric={sortMetric}
            filterMode={filterMode}
            tableSortConfig={tableSortConfig}
            onTableSort={handleTableSort}
            onSelectDetailItem={setSelectedDetailItem}
          />
        ) : (
          <ProcessorsMatrixView
            filteredProcessors={filteredProcessors}
            allProcessors={processorList}
            processedData={processedData}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            selectedGroup={selectedGroup}
            onGroupSelect={handleGroupSelect}
            filterMode={filterMode}
            onFilterModeChange={handleFilterModeChange}
            onSelectProcessor={setSelectedProcessorModal}
            onFilterDevices={(chip) => {
              setSearchTerm(chip);
              handleViewModeChange('list');
            }}
          />
        )}
      </main>

      {/* Device Architecture Detail Modal */}
      <DeviceDetailModal 
        item={selectedDetailItem} 
        processor={selectedDetailItem?.chip ? processors[selectedDetailItem.chip] : undefined}
        onClose={() => setSelectedDetailItem(null)} 
      />

      {/* Processor Specs Detail Modal */}
      <ProcessorDetailModal
        processor={selectedProcessorModal}
        onClose={() => setSelectedProcessorModal(null)}
        onFilterDevices={(chip) => {
          setSearchTerm(chip);
          handleViewModeChange('list');
        }}
      />
    </div>
  );
}
