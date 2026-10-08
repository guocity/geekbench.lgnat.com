import React from 'react';
import { Cpu, Image } from 'lucide-react';
import { Card } from '../common/Card';
import { ProcessorDetail } from '../../types';
import { FAMILY_COLORS, TIER_COLORS } from '../../constants';

export interface ProcessorsMatrixViewProps {
  filteredProcessors: ProcessorDetail[];
  searchTerm: string;
  onSelectProcessor: (processor: ProcessorDetail) => void;
}

export const ProcessorsMatrixView: React.FC<ProcessorsMatrixViewProps> = ({
  filteredProcessors,
  searchTerm,
  onSelectProcessor,
}) => {
  return (
    <Card className="overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-600" />
            Apple Silicon Processor Architecture Matrix (processor.json)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Authoritative silicon specifications: TSMC fabrication processes, GAA transistor tech, die floorplans, caches, and linked 4K die shots ({filteredProcessors.length} processors)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Click chip to inspect full silicon specs & die shots</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-900 font-semibold border-b border-slate-200 whitespace-nowrap select-none">
            <tr>
              <th className="px-4 py-3 pl-6">Processor</th>
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
            {filteredProcessors.map((p) => {
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
                          <Image className="w-2.5 h-2.5" /> Die Shot
                        </span>
                      )}
                    </div>
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
            {filteredProcessors.length === 0 && (
              <tr>
                <td colSpan={11} className="p-12 text-center text-slate-400">
                  No processors match "{searchTerm}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
