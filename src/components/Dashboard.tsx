import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Zap, Clock } from 'lucide-react';

export function Dashboard({ stats, chartData }: { stats: any, chartData: any[] }) {
  return (
    <>
      <div className="metrics-grid">
        <div className="glass-card metric-card">
          <div className="metric-header text-subtle">
            <Activity size={18} />
            CURRENT WPM
          </div>
          <div className="metric-value">{stats.currentWPM}</div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-header text-subtle">
            <Zap size={18} />
            FASTEST WPM
          </div>
          <div className="metric-value">{stats.fastestWPM}</div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-header text-subtle">
            <Clock size={18} />
            LAST MINUTE KEYS
          </div>
          <div className="metric-value" style={{ background: '#f8fafc', WebkitBackgroundClip: 'text', textShadow: 'none' }}>
            {stats.totalKeystrokes}
          </div>
        </div>
      </div>

      <div className="glass-card chart-container">
        <div className="header" style={{ marginBottom: 0 }}>
          <h2 style={{ fontSize: '1.2rem' }}>Live Speed (Last 60s)</h2>
        </div>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorWpm" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickMargin={10} minTickGap={30} />
              <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `${val}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                itemStyle={{ color: '#60a5fa' }}
              />
              <Area 
                type="monotone" 
                dataKey="wpm" 
                stroke="#3b82f6" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorWpm)" 
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
