import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const ThermodynamicMonitor = () => {
  const [data, setData] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    cpuTemp: 45,
    gpuTemp: 62,
    power: 1450,
    eta: 22 // 10^-22
  });

  useEffect(() => {
    // Simulation loop
    const interval = setInterval(() => {
      setMetrics(prev => {
        const load = Math.random();
        const newCpuTemp = Math.min(90, Math.max(40, prev.cpuTemp + (load - 0.5) * 5));
        const newGpuTemp = Math.min(95, Math.max(50, prev.gpuTemp + (load - 0.5) * 8));
        const newPower = Math.max(800, prev.power + (load - 0.5) * 200);
        
        setData(currentData => {
          const newData = [...currentData, { 
            time: new Date().toLocaleTimeString(), 
            power: newPower,
            limit: 2000 // 2kW limit
          }];
          return newData.slice(-30); // Keep last 30 points
        });

        return {
          cpuTemp: newCpuTemp,
          gpuTemp: newGpuTemp,
          power: newPower,
          eta: 22
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-panel rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-mono text-emerald-400 flex items-center gap-2">
          <Icons.Activity className="w-4 h-4" /> HARDWARE TELEMETRY (LIVE)
        </h3>
        <div className="flex gap-2 text-xs">
           <span className="px-2 py-1 rounded bg-slate-900 text-slate-400">RAPL: ACTIVE</span>
           <span className="px-2 py-1 rounded bg-slate-900 text-slate-400">IPMI: ACTIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-900/50 p-4 rounded border border-slate-800 relative group cursor-help">
            <span className="text-slate-500 text-xs block mb-1 border-b border-dotted border-slate-600 w-max">CPU Thermal</span>
            <div className="flex items-end gap-2">
                <span className={`text-2xl font-mono font-bold ${metrics.cpuTemp > 80 ? 'text-red-500' : 'text-slate-200'}`}>
                    {metrics.cpuTemp.toFixed(1)}°C
                </span>
            </div>
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-950 border border-slate-700 text-xs text-slate-300 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                Core package temperature monitored via RAPL sensors. Throttling triggers at 95°C to preserve hardware integrity.
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-700"></div>
            </div>
        </div>

        <div className="bg-slate-900/50 p-4 rounded border border-slate-800 relative group cursor-help">
            <span className="text-slate-500 text-xs block mb-1 border-b border-dotted border-slate-600 w-max">GPU Junction</span>
            <div className="flex items-end gap-2">
                <span className={`text-2xl font-mono font-bold ${metrics.gpuTemp > 85 ? 'text-red-500' : 'text-slate-200'}`}>
                    {metrics.gpuTemp.toFixed(1)}°C
                </span>
            </div>
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-950 border border-slate-700 text-xs text-slate-300 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                NVIDIA-SMI hot spot telemetry. High variance indicates intense tensor contraction operations on the decision manifold.
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-700"></div>
            </div>
        </div>

        <div className="bg-slate-900/50 p-4 rounded border border-slate-800 relative group cursor-help">
            <span className="text-slate-500 text-xs block mb-1 border-b border-dotted border-slate-600 w-max">Total Power</span>
            <div className="flex items-end gap-2">
                <span className="text-2xl font-mono font-bold text-amber-400">
                    {metrics.power.toFixed(0)} W
                </span>
            </div>
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-950 border border-slate-700 text-xs text-slate-300 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                Aggregate real-time energy consumption. Minimizing this metric directly extends the mission survival horizon.
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-700"></div>
            </div>
        </div>
      </div>

      <div className="h-48 w-full bg-slate-900/30 rounded border border-slate-800 overflow-hidden relative">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <AreaChart data={data}>
                <defs>
                    <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <XAxis dataKey="time" hide />
                <YAxis domain={[0, 2500]} hide />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
                    itemStyle={{ color: '#fbbf24' }}
                />
                <Area type="monotone" dataKey="power" stroke="#fbbf24" fillOpacity={1} fill="url(#colorPower)" isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="absolute top-2 right-2 text-xs font-mono text-amber-500/50">POWER DRAW (W)</div>
      </div>
    </div>
  );
};