import { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

const METRIC_DEFS = {
  kits_assembled: { name: 'Backpacks', color: '#3DCC7E' },
  funds_raised: { name: 'Funds ($)', color: '#60A5FA' },
  volunteer_hours: { name: 'Hours (hrs)', color: '#F0EFE9' },
};

export default function SiteComparisonChart({ data = [], sites = [] }) {
  const [selectedMetric, setSelectedMetric] = useState('all');

  // Map each site to its metrics for this week
  const chartData = sites.map((site) => {
    const report = data.find((r) => r.site_id === site.id) || {};
    return {
      site_name: site.name,
      kits_assembled: report.kits_assembled || 0,
      funds_raised: report.funds_raised || 0,
      volunteer_hours: report.volunteer_hours || 0,
    };
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#141418] border border-borderColor p-4 font-mono shadow-xl text-xs">
          <p className="text-textMuted uppercase mb-2 tracking-wider font-semibold">
            {payload[0].payload.site_name}
          </p>
          <div className="space-y-1">
            {payload.map((p) => {
              const valueFormatted = p.name.includes('$') 
                ? `$${Number(p.value).toLocaleString()}` 
                : Number(p.value).toLocaleString();
              return (
                <div key={p.name} className="flex justify-between space-x-6">
                  <span style={{ color: p.color }} className="font-semibold uppercase">{p.name}:</span>
                  <span className="text-textPrimary font-bold">{valueFormatted}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-surface border border-borderColor p-6 flex flex-col font-mono h-[400px]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <span className="text-textMuted uppercase text-[10px] tracking-widest font-semibold block mb-1">
            CROSS-SITE ANALYSIS
          </span>
          <h3 className="font-sans font-bold text-lg text-textPrimary uppercase">
            SITE PERFORMANCE COMPARISON
          </h3>
        </div>

        {/* View Toggle */}
        <div className="flex border border-borderColor p-0.5 bg-darkBg">
          <button
            onClick={() => setSelectedMetric('all')}
            className={`px-3 py-1.5 text-[10px] font-bold uppercase transition-all duration-150 ${
              selectedMetric === 'all'
                ? 'bg-[#1D1D24] text-accent font-semibold border-b border-accent'
                : 'text-textMuted hover:text-textPrimary'
            }`}
          >
            COMPARE ALL
          </button>
          {Object.entries(METRIC_DEFS).map(([key, def]) => (
            <button
              key={key}
              onClick={() => setSelectedMetric(key)}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase transition-all duration-150 ${
                selectedMetric === key
                  ? 'bg-[#1D1D24] text-accent font-semibold border-b border-accent'
                  : 'text-textMuted hover:text-textPrimary'
              }`}
            >
              {def.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="#1F1F27" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="site_name"
              stroke="#6B6B7A"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#1F1F27' }}
            />
            <YAxis
              stroke="#6B6B7A"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#1F1F27' }}
              tickFormatter={(value) => 
                value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value
              }
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(31, 31, 39, 0.3)' }} />
            

            {selectedMetric === 'all' || selectedMetric === 'kits_assembled' ? (
              <Bar
                name="Backpacks"
                dataKey="kits_assembled"
                fill={METRIC_DEFS.kits_assembled.color}
                maxBarSize={40}
                animationDuration={500}
              />
            ) : null}

            {selectedMetric === 'all' || selectedMetric === 'funds_raised' ? (
              <Bar
                name="Funds ($)"
                dataKey="funds_raised"
                fill={METRIC_DEFS.funds_raised.color}
                maxBarSize={40}
                animationDuration={500}
              />
            ) : null}

            {selectedMetric === 'all' || selectedMetric === 'volunteer_hours' ? (
              <Bar
                name="Hours (hrs)"
                dataKey="volunteer_hours"
                fill={METRIC_DEFS.volunteer_hours.color}
                maxBarSize={40}
                animationDuration={500}
              />
            ) : null}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
