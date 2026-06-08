import StatCounter from './StatCounter';

export default function MetricCard({ label, value, unit, trend }) {
  const isPositive = trend ? !trend.startsWith('-') : true;

  return (
    <div className="bg-surface border border-borderColor p-6 flex flex-col justify-between font-mono animate-fade-in-up">
      <div>
        <span className="text-textMuted uppercase text-xs tracking-wider font-sans block mb-2">{label}</span>
        <div className="text-3xl font-bold text-textPrimary tracking-tight flex items-baseline">
          {unit === '$' && <span className="mr-1 text-2xl text-accent font-sans">$</span>}
          <StatCounter value={value} />
          {unit && unit !== '$' && <span className="ml-1.5 text-sm text-textMuted">{unit}</span>}
        </div>
      </div>
      {trend && (
        <div className={`mt-4 text-xs font-semibold ${isPositive ? 'text-success' : 'text-danger'}`}>
          {trend}
        </div>
      )}
    </div>
  );
}
