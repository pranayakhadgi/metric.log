import { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const METRIC_DEFS = {
  items_collected: { name: 'Items Collected', color: '#C8F135' },
  kits_assembled: { name: 'Kits Assembled', color: '#3DCC7E' },
  funds_raised: { name: 'Funds Raised ($)', color: '#60A5FA' },
  volunteer_hours: { name: 'Volunteer Hours', color: '#F0EFE9' },
};

export default function WeeklyTrendChart({ data = [] }) {
  const [activeMetric, setActiveMetric] = useState('items_collected');

  // Group and sort data by week_number
  const weeklyData = data.reduce((acc, curr) => {
    const week = curr.week_number;
    if (!acc[week]) {
      acc[week] = {
        week: `Week ${week}`,
        week_number: week,
        items_collected: 0,
        kits_assembled: 0,
        funds_raised: 0,
        volunteer_hours: 0,
        count: 0,
      };
    }
    acc[week].items_collected += curr.items_collected || 0;
    acc[week].kits_assembled += curr.kits_assembled || 0;
    acc[week].funds_raised += curr.funds_raised || 0;
    acc[week].volunteer_hours += curr.volunteer_hours || 0;
    acc[week].count += 1;
    return acc;
  }, {});

  const chartData = Object.values(weeklyData).sort((a, b) => a.week_number - b.week_number);

  const activeDef = METRIC_DEFS[activeMetric];

  // Custom Tooltip component matching dark editorial style
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-[#141418] border border-borderColor p-4 font-mono shadow-xl">
          <p className="text-xs text-textMuted uppercase mb-2 tracking-wider">{dataPoint.week}</p>
          {payload.map((p) => (
            <div key={p.name} className="flex items-center justify-between space-x-6 text-xs">
              <span style={{ color: p.color }} className="font-semibold uppercase">{p.name}:</span>
              <span className="text-textPrimary font-bold">
                {p.name.includes('$') ? `$${Number(p.value).toLocaleString()}` : Number(p.value).toLocaleString()}
              </span>
            </div>
          ))}
          {dataPoint.count > 1 && (
            <p className="text-[10px] text-textMuted mt-2 font-mono">Based on {dataPoint.count} site reports</p>
          )}
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
            TREND ANALYSIS
          </span>
          <h3 className="font-sans font-bold text-lg text-textPrimary uppercase">
            WEEKLY PROGRESS METRICS
          </h3>
        </div>

        {/* Tab switcher for metrics */}
        <div className="flex flex-wrap border border-borderColor p-0.5 bg-darkBg">
          {Object.entries(METRIC_DEFS).map(([key, def]) => (
            <button
              key={key}
              onClick={() => setActiveMetric(key)}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase transition-all duration-150 ${
                activeMetric === key
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
        {chartData.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center border border-dashed border-borderColor/60 text-xs text-textMuted uppercase">
            NO SUFFICIENT DATA POINTS FOR CHARTING
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#1F1F27" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="week"
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
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#1F1F27', strokeWidth: 1 }} />
              <Line
                name={activeDef.name}
                type="monotone"
                dataKey={activeMetric}
                stroke={activeDef.color}
                strokeWidth={2}
                dot={{ stroke: activeDef.color, strokeWidth: 1, r: 3, fill: '#141418' }}
                activeDot={{ r: 5, stroke: activeDef.color, strokeWidth: 2, fill: activeDef.color }}
                animationDuration={600}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
