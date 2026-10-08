import React from 'react';
import { X, Zap, ExternalLink } from 'lucide-react';
import { ProcessorDetail } from '../../types';
import { DieShotGallery } from '../gallery/DieShotGallery';

export interface ProcessorDetailModalProps {
  processor: ProcessorDetail | null;
  onClose: () => void;
  onFilterDevices?: (chip: string) => void;
}

export const ProcessorDetailModal: React.FC<ProcessorDetailModalProps> = ({ processor, onClose, onFilterDevices }) => {
  if (!processor) return null;

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
                {processor.chip}
              </span>
              <span className="text-xs font-medium text-slate-400">
                {processor.family} · {processor.tier} tier
              </span>
              {processor.rayTracing && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Hardware RT
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-slate-900">{processor.name}</h3>
            <p className="text-xs text-slate-500">{processor.processNode} {processor.transistorTech ? `· ${processor.transistorTech}` : ''}</p>
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
          {/* RAM Configurations & Scaling Card */}
          {processor.ramConfigurations && processor.ramConfigurations.length > 0 && (
            <div className="bg-purple-50/70 border border-purple-200/80 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-purple-600" />
                  RAM Configurations & Memory Bandwidth
                </span>
                <span className="text-[10px] text-purple-700 font-mono bg-purple-100 px-1.5 py-0.5 rounded">
                  {processor.memoryBusWidth || '128-bit'} Bus
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {processor.ramConfigurations.map((rc, idx) => (
                  <div key={idx} className="bg-white p-2.5 rounded-lg border border-purple-200">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-800">{rc.ram}</span>
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
                ))}
              </div>
            </div>
          )}

          {/* Die Shot Gallery */}
          <DieShotGallery dieShots={processor.dieShots} chipName={processor.name} />

          {/* Architecture Specifications */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Silicon Specifications</h4>
            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[11px]">Process Node</span>
                <span className="font-semibold text-slate-800">{processor.processNode}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Transistor Architecture</span>
                <span className="font-semibold text-slate-800">{processor.transistorTech || 'Advanced FinFET'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Die Size</span>
                <span className="font-semibold text-slate-800">{processor.dieSizeMm2 ? `${processor.dieSizeMm2} mm²` : 'Undisclosed'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Packaging</span>
                <span className="font-semibold text-slate-800">{processor.packaging}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">CPU Configuration</span>
                <span className="font-semibold text-slate-800">{processor.coreConfig || `${processor.cpuCores} cores`}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Peak Clock</span>
                <span className="font-semibold text-slate-800 font-mono">{processor.clock} GHz</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">GPU Cores</span>
                <span className="font-semibold text-slate-800">
                  {Array.isArray(processor.gpuCores) ? processor.gpuCores.join(' / ') : processor.gpuCores} cores
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Neural Engine (NPU)</span>
                <span className="font-semibold text-slate-800">
                  {processor.neuralEngineCores}-core ({processor.aneTops} TOPS)
                </span>
              </div>
            </div>
          </div>

          {/* Memory Architecture */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Memory & Cache Subsystem</h4>
            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[11px]">Memory Bandwidth</span>
                <span className="font-semibold text-purple-700 font-mono">
                  {processor.memoryBandwidthMin ? `${processor.memoryBandwidthMin} – ${processor.memoryBandwidthMax} GB/s` : `${processor.memoryBandwidth} GB/s`}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Bus Width</span>
                <span className="font-semibold text-slate-800 font-mono">{processor.memoryBusWidth}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Memory Tech</span>
                <span className="font-semibold text-slate-800">{processor.memoryType}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Memory Speed</span>
                <span className="font-semibold text-slate-800 font-mono">{processor.memorySpeed}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">System-Level Cache (SLC)</span>
                <span className="font-semibold text-slate-800">{processor.systemCache || `${processor.slcMB} MB`}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">L2 Shared Cache</span>
                <span className="font-semibold text-slate-800">{processor.l2Cache || '-'}</span>
              </div>
            </div>
          </div>

          {/* Summary String */}
          {processor.specs && (
            <div className="text-[11px] text-slate-500 bg-slate-100/70 p-2.5 rounded-lg border border-slate-200">
              <span className="font-medium text-slate-700 block mb-0.5">Specifications Summary:</span>
              {processor.specs}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
          {onFilterDevices && (
            <button
              onClick={() => {
                onFilterDevices(processor.chip);
                onClose();
              }}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View Devices with this Chip</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-auto px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
