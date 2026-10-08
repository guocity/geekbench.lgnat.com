import React from 'react';
import { X, Zap } from 'lucide-react';
import { ProcessedItem, ProcessorDetail } from '../../types';
import { DieShotGallery } from '../gallery/DieShotGallery';

export interface DeviceDetailModalProps {
  item: ProcessedItem | null;
  processor?: ProcessorDetail;
  onClose: () => void;
}

export const DeviceDetailModal: React.FC<DeviceDetailModalProps> = ({ item, processor, onClose }) => {
  if (!item) return null;
  const pInfo = processor || item.processor;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                {item.chip || item.family}
              </span>
              {item.ram && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-mono">
                  {item.ram}
                </span>
              )}
              <span className="text-xs font-medium text-slate-400">
                {item.year}
              </span>
              {item.rayTracing && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Hardware RT
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-slate-900">{item.model}</h3>
            <p className="text-xs text-slate-500">{item.device} · {item.tier} tier</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Specs Grid */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Key Scores Section */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-blue-50/60 p-2.5 rounded-xl border border-blue-100/60">
              <span className="text-[10px] uppercase font-bold text-blue-600 block">Single-Core</span>
              <span className="text-lg font-extrabold text-slate-900 font-mono">
                {item.scores?.single ? item.scores.single.toLocaleString() : (item.single ? item.single.toLocaleString() : '-')}
              </span>
            </div>
            <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100/60">
              <span className="text-[10px] uppercase font-bold text-emerald-600 block">Multi-Core</span>
              <span className="text-lg font-extrabold text-slate-900 font-mono">
                {item.scores?.multi ? item.scores.multi.toLocaleString() : (item.multi ? item.multi.toLocaleString() : '-')}
              </span>
            </div>
            <div className="bg-purple-50/60 p-2.5 rounded-xl border border-purple-100/60">
              <span className="text-[10px] uppercase font-bold text-purple-600 block">Metal GPU</span>
              <span className="text-lg font-extrabold text-slate-900 font-mono">
                {item.scores?.metal > 0 ? item.scores.metal.toLocaleString() : (item.metal > 0 ? item.metal.toLocaleString() : '-')}
              </span>
            </div>
            <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-100/60">
              <span className="text-[10px] uppercase font-bold text-amber-600 block">OpenCL</span>
              <span className="text-lg font-extrabold text-slate-900 font-mono">
                {item.scores?.opencl > 0 ? item.scores.opencl.toLocaleString() : (item.opencl > 0 ? item.opencl.toLocaleString() : '-')}
              </span>
            </div>
          </div>

          {/* RAM Configurations & Scaling Card */}
          {pInfo?.ramConfigurations && pInfo.ramConfigurations.length > 0 && (
            <div className="bg-purple-50/70 border border-purple-200/80 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-purple-600" />
                  RAM Configurations & Memory Speed (from processor.json)
                </span>
                <span className="text-[10px] text-purple-700 font-mono bg-purple-100 px-1.5 py-0.5 rounded">
                  {item.memoryBusWidth || pInfo.memoryBusWidth || '128-bit'} Bus
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {pInfo.ramConfigurations.map((rc, idx) => {
                  const isCurrent = item.ram ? (item.ram === rc.ram || rc.ram.includes(item.ram.replace(' RAM', '').trim())) : false;
                  return (
                    <div 
                      key={idx} 
                      className={`p-2.5 rounded-lg border transition-all ${
                        isCurrent 
                          ? 'bg-white border-purple-400 shadow-sm ring-1 ring-purple-400' 
                          : 'bg-white/80 border-purple-100/80'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          {rc.ram}
                          {isCurrent && <span className="text-[9px] bg-purple-100 text-purple-700 px-1 rounded font-semibold">Current Spec</span>}
                        </span>
                        <span className="font-mono font-bold text-purple-700 text-xs">{rc.memoryBandwidth} GB/s</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono flex justify-between">
                        <span>{rc.memoryType}</span>
                        <span>{rc.memorySpeed}</span>
                      </div>
                      {rc.description && (
                        <div className="text-[10px] text-slate-600 mt-1.5 pt-1 border-t border-slate-100 leading-tight">
                          {rc.description}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Die Shot Gallery */}
          <DieShotGallery dieShots={pInfo?.dieShots} chipName={item.chip || item.family} />

          {/* Architecture Specifications */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Silicon Architecture</h4>
            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[11px]">Process Node</span>
                <span className="font-semibold text-slate-800">{item.processNode || pInfo?.processNode || 'TSMC Process'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Transistor Tech</span>
                <span className="font-semibold text-slate-800">{item.transistorTech || pInfo?.transistorTech || 'Advanced FinFET'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Packaging</span>
                <span className="font-semibold text-slate-800">{item.packaging || pInfo?.packaging || 'Apple SiP'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Die Area</span>
                <span className="font-semibold text-slate-800">
                  {(item.dieSizeMm2 || pInfo?.dieSizeMm2) ? `${item.dieSizeMm2 || pInfo?.dieSizeMm2} mm²` : 'Undisclosed'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">CPU Configuration</span>
                <span className="font-semibold text-slate-800">
                  {item.coreConfig || pInfo?.coreConfig || `${item.cpuCores} cores`}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">GPU Cores</span>
                <span className="font-semibold text-slate-800">{item.gpuCores} cores</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Peak Clock</span>
                <span className="font-semibold text-slate-800 font-mono">{item.clock} {item.clock !== '-' && 'GHz'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Neural Engine (NPU)</span>
                <span className="font-semibold text-slate-800">
                  {(pInfo?.neuralEngineCores || item.neuralEngineCores) 
                    ? `${pInfo?.neuralEngineCores || item.neuralEngineCores}-core (${pInfo?.aneTops || item.aneTops || 45} TOPS)` 
                    : '16-core ANE'}
                </span>
              </div>
            </div>
          </div>

          {/* Memory Architecture */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Memory & Subsystem</h4>
            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[11px]">Memory Bandwidth</span>
                <span className="font-semibold text-purple-700 font-mono">{item.memoryBandwidth || item.scores?.bandwidth || '-'} GB/s</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Bus Width</span>
                <span className="font-semibold text-slate-800 font-mono">{item.memoryBusWidth || (item.busWidthBits ? `${item.busWidthBits}-bit` : '-')}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Memory Tech</span>
                <span className="font-semibold text-slate-800">{item.memoryType || pInfo?.memoryType || 'Unified Memory'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Memory Speed</span>
                <span className="font-semibold text-slate-800 font-mono">{item.memorySpeed || pInfo?.memorySpeed || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">System-Level Cache (SLC)</span>
                <span className="font-semibold text-slate-800">{item.systemCache || pInfo?.systemCache || (item.slcMB ? `${item.slcMB} MB` : '-')}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">L2 Shared Cache</span>
                <span className="font-semibold text-slate-800">{item.l2Cache || pInfo?.l2Cache || '-'}</span>
              </div>
            </div>
          </div>

          {/* Summary String */}
          {item.specs && (
            <div className="text-[11px] text-slate-500 bg-slate-100/70 p-2.5 rounded-lg border border-slate-200">
              <span className="font-medium text-slate-700 block mb-0.5">Specifications Summary:</span>
              {item.specs}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
