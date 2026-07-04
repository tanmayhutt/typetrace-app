import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Zap, Clock, TrendingUp } from 'lucide-react';

export function Dashboard({ stats, chartData }: { stats: any, chartData: any[] }) {
  // Calculate average WPM over the session
  const avgWpm = chartData.length > 0 
    ? Math.round(chartData.reduce((acc, curr) => acc + curr.wpm, 0) / chartData.length)
    : 0;

  return (
    <>
      <div className="metrics-grid">
        <div className="glass-card metric-card premium-card-1">
          <div className="metric-header text-subtle">
            <Activity size={18} />
            LIVE SPEED
          </div>
          <div className="metric-value">{stats.currentWPM} <span className="text-sm">WPM</span></div>
          <div className="metric-trend text-subtle">Real-time tracking</div>
        </div>

        <div className="glass-card metric-card premium-card-2">
          <div className="metric-header text-subtle">
            <Zap size={18} />
            PEAK BURST
          </div>
          <div className="metric-value">{stats.fastestWPM} <span className="text-sm">WPM</span></div>
          <div className="metric-trend text-subtle">All-time record</div>
        </div>

        <div className="glass-card metric-card premium-card-3">
          <div className="metric-header text-subtle">
            <Clock size={18} />
            ACTIVE KEYS
          </div>
          <div className="metric-value">{stats.totalKeystrokes}</div>
          <div className="metric-trend text-subtle">Last 60 seconds</div>
        </div>
        
        <div className="glass-card metric-card premium-card-4">
          <div className="metric-header text-subtle">
            <TrendingUp size={18} />
            AVERAGE (1M)
          </div>
          <div className="metric-value">{avgWpm} <span className="text-sm">WPM</span></div>
          <div className="metric-trend text-subtle">Session average</div>
        </div>
      </div>

      <div className="glass-card chart-container">
        <div className="chart-header">
          <h2>Performance History</h2>
          <div className="chart-legend">
            <span className="legend-dot"></span>
            Words Per Minute
          </div>
        </div>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorWpm" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis 
                dataKey="time" 
                stroke="#64748b" 
                fontSize={12} 
                tickMargin={10} 
                minTickGap={30}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={12} 
                tickFormatter={(val) => `${val}`} 
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.8)', 
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.1)', 
                  borderRadius: '12px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                }}
                itemStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
              />
              <Area 
                type="monotone" 
                dataKey="wpm" 
                stroke="url(#lineGradient)" 
                strokeWidth={4}
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
