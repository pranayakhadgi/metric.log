import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { submitReport } from '../api/reports';
import { useStore } from '../store/store';

const SEEDED_SITES = [
  { id: 1, name: 'Charlotte', location: 'NC' },
  { id: 2, name: 'Auburn Hills', location: 'MI' },
  { id: 3, name: 'Miami', location: 'FL' },
  { id: 4, name: 'Houston', location: 'TX' },
  { id: 5, name: 'Itasca', location: 'IL' },
];

// David changes (start)
const TEAM_OPTIONS = [
  'Research',
  'Site Coordinators',
  'Data and Impact Analytics',
  'Finance and Procurement',
  'Operations and Kit Design',
  'Communications and Branding',
];

const WEEKS_DATA = [
  { week: 23, startDate: new Date(2026, 5, 1), endDate: new Date(2026, 5, 7) },
  { week: 24, startDate: new Date(2026, 5, 8), endDate: new Date(2026, 5, 14) },
  { week: 25, startDate: new Date(2026, 5, 15), endDate: new Date(2026, 5, 21) },
  { week: 26, startDate: new Date(2026, 5, 22), endDate: new Date(2026, 5, 28) },
  { week: 27, startDate: new Date(2026, 5, 29), endDate: new Date(2026, 6, 5) },
  { week: 28, startDate: new Date(2026, 6, 6), endDate: new Date(2026, 6, 12) },
  { week: 29, startDate: new Date(2026, 6, 13), endDate: new Date(2026, 6, 19) },
  { week: 30, startDate: new Date(2026, 6, 20), endDate: new Date(2026, 6, 26) },
  { week: 31, startDate: new Date(2026, 6, 27), endDate: new Date(2026, 7, 2) },
  { week: 32, startDate: new Date(2026, 7, 3), endDate: new Date(2026, 7, 9) },
];

const formatWeekDisplay = (weekData) => {
  const startStr = weekData.startDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  const endStr = weekData.endDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  return `${weekData.week} - ${startStr} to ${endStr}`;
};
// David changes (end)

// David changes (start)
const METRIC_TEAMS = [
  'Finance and Procurement',
  'Data and Impact Analytics',
  'Operations and Kit Design',
];

const isMetricTeam = (team) => METRIC_TEAMS.includes(team);

const metricLabel = (base, team) => {
  if (team === 'Data and Impact Analytics') return `${base} (by Proxy)`;
  return base;
};
// David changes (end)

// David changes (start)
const labelClass = (enabled) => `text-[10px] ${enabled ? 'text-accent' : 'text-textMuted'} uppercase tracking-wider mb-2 font-bold`;

const inputEnabledClass = 'bg-surface border border-accent/20 text-textPrimary text-xs focus:outline-none focus:border-accent p-3 w-full font-mono ring-1 ring-accent/20';
const inputDisabledClass = 'bg-surface border border-borderColor text-textMuted text-xs p-3 w-full font-mono cursor-not-allowed opacity-50';
const selectEnabledClass = 'bg-surface border border-accent/20 text-textPrimary text-xs focus:outline-none focus:border-accent p-3 w-full font-mono uppercase ring-1 ring-accent/20';
const selectDisabledClass = 'bg-surface border border-borderColor text-textMuted text-xs p-3 w-full font-mono uppercase cursor-not-allowed opacity-50';
// David changes (end)

export default function SubmitReport() {
  const queryClient = useQueryClient();
  const activeWeek = useStore((state) => state.activeWeek);

  // Form states
  const [siteId, setSiteId] = useState('1');
  // David changes (start)
  const [team, setTeam] = useState('');
  // David changes (end)
  const [weekNumber, setWeekNumber] = useState(activeWeek || 23);
  const [itemsCollected, setItemsCollected] = useState('');
  const [kitsAssembled, setKitsAssembled] = useState('');
  const [fundsRaised, setFundsRaised] = useState('');
  const [volunteerHours, setVolunteerHours] = useState('');
  const [notes, setNotes] = useState('');

  // UI status states
  const [formErrors, setFormErrors] = useState({});
  const [notification, setNotification] = useState(null);

  // Sync initial week from store if activeWeek changes
  useEffect(() => {
    if (activeWeek) {
      setWeekNumber(activeWeek);
    }
  }, [activeWeek]);

  // Dismiss notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const mutation = useMutation({
    mutationFn: submitReport,
    onSuccess: (data) => {
      // Invalidate queries so dashboards/views update
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['reportsByWeek'] });

      // Show action notification
      setNotification({
        type: 'success',
        message: `Report successfully ${data.action === 'updated' ? 'updated' : 'created'}.`,
        action: data.action,
      });

      // Clear non-identifying inputs
      setItemsCollected('');
      setKitsAssembled('');
      setFundsRaised('');
      setVolunteerHours('');
      setNotes('');
      setTeam('');
      setFormErrors({});
    },
    onError: (err) => {
      setNotification({
        type: 'error',
        message: err.message || 'Submission failed. Please check your parameters.',
      });
    },
  });

  const validate = () => {
    const errors = {};
    
    if (!team) errors.team = 'Team selection is required';
    if (!siteId) errors.site_id = 'Site selection is required';
    
    // David changes (start)
    const weekNum = Number(weekNumber);
    if (!weekNumber || isNaN(weekNum) || weekNum < 23 || weekNum > 32) {
      errors.week_number = 'Week number must be between 23 and 32';
    }
    // David changes (end)

    // David changes (start)
    if (isMetricTeam(team)) {
      if (itemsCollected !== '' && (isNaN(Number(itemsCollected)) || Number(itemsCollected) < 0)) {
        errors.items_collected = 'Must be a valid positive integer';
      }

      if (kitsAssembled !== '' && (isNaN(Number(kitsAssembled)) || Number(kitsAssembled) < 0)) {
        errors.kits_assembled = 'Must be a valid positive integer';
      }

      if (fundsRaised !== '' && (isNaN(Number(fundsRaised)) || Number(fundsRaised) < 0)) {
        errors.funds_raised = 'Must be a valid positive number';
      }
    } else {
      // Ensure non-applicable fields don't block submission
      delete errors.items_collected;
      delete errors.kits_assembled;
      delete errors.funds_raised;
    }
    // David changes (end)

    if (volunteerHours !== '' && (isNaN(Number(volunteerHours)) || Number(volunteerHours) < 0)) {
      errors.volunteer_hours = 'Must be a valid positive number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // David changes (start)
    mutation.mutate({
      site_id: siteId,
      week_number: weekNumber,
      team: team,
      items_collected: itemsCollected,
      kits_assembled: kitsAssembled,
      funds_raised: fundsRaised,
      volunteer_hours: volunteerHours,
      notes: notes,
    });
    // David changes (end)
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in-up font-mono">
      {/* Header */}
      <div className="border-b border-borderColor pb-6">
        <span className="text-[10px] text-accent uppercase tracking-widest font-bold block mb-1">
          METRIC ENTRY SYSTEM
        </span>
        <h2 className="font-sans font-bold text-3xl uppercase tracking-tight text-textPrimary">
          SUBMIT WEEKLY REPORT
        </h2>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-4 border transition-all duration-300 ${
            notification.type === 'success'
              ? 'bg-success/10 border-success/30 text-success'
              : 'bg-danger/10 border-danger/30 text-danger'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider">
              {notification.type === 'success' ? 'SYSTEM CONFIRMATION' : 'SUBMISSION ERROR'}
            </span>
            <button onClick={() => setNotification(null)} className="text-[10px] uppercase underline font-bold opacity-75 hover:opacity-100">
              [DISMISS]
            </button>
          </div>
          <p className="text-xs mt-1 uppercase tracking-wide">{notification.message}</p>
        </div>
      )}

      {/* Main Submission Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* David changes (start) */}
        <div className="flex justify-center">
          <div className="w-full max-w-xl">
            <label className={labelClass(true)}>
              1. SELECT TEAM *
            </label>
            <select
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              className={selectEnabledClass}
            >
              <option value="" disabled>
                Select team...
              </option>
              {TEAM_OPTIONS.map((teamOption) => (
                <option key={teamOption} value={teamOption}>
                  {teamOption}
                </option>
              ))}
            </select>
            {formErrors.team && (
              <span className="text-[10px] text-danger mt-1 uppercase font-bold">
                {formErrors.team}
              </span>
            )}
          </div>
        </div>
        {/* David changes (end) */}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Site Selection */}
          <div className="flex flex-col">
            <label className={labelClass(true)}>
              2. REPORTING LOCATION *
            </label>
            <select
              value={siteId}
              onChange={(e) => setSiteId(e.target.value)}
              className={selectEnabledClass}
            >
              {SEEDED_SITES.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name} ({site.location})
                </option>
              ))}
            </select>
            {formErrors.site_id && (
              <span className="text-[10px] text-danger mt-1 uppercase font-bold">{formErrors.site_id}</span>
            )}
          </div>

          {/* Week Number */}
          {/* David changes (start) */}
          <div className="flex flex-col">
            <label className={labelClass(true)}>
              3. CALENDAR WEEK (23-32) *
            </label>
            <select
              value={weekNumber}
              onChange={(e) => setWeekNumber(e.target.value)}
              className={selectEnabledClass}
              required
            >
              <option value="" disabled>
                Select week...
              </option>
              {WEEKS_DATA.map((week) => (
                <option key={week.week} value={week.week}>
                  {formatWeekDisplay(week)}
                </option>
              ))}
            </select>
            {formErrors.week_number && (
              <span className="text-[10px] text-danger mt-1 uppercase font-bold">{formErrors.week_number}</span>
            )}
          </div>
          {/* David changes (end) */}
        </div>

        <div className="border-t border-borderColor/50 my-6" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Items Collected */}
          <div className="flex flex-col">
            <label className={labelClass(isMetricTeam(team))}>
              { /* David changes (start) */ }
              {isMetricTeam(team) ? metricLabel('ITEMS COLLECTED', team) : 'ITEMS COLLECTED'}
              { /* David changes (end) */ }
            </label>
            {isMetricTeam(team) ? (
              <input
                type="number"
                value={itemsCollected}
                onChange={(e) => setItemsCollected(e.target.value)}
                placeholder="e.g. 150"
                className={inputEnabledClass}
              />
            ) : (
              <input
                type="text"
                value=""
                placeholder="N/A"
                disabled
                className={inputDisabledClass}
              />
            )}
            {formErrors.items_collected && (
              <span className="text-[10px] text-danger mt-1 uppercase font-bold">{formErrors.items_collected}</span>
            )}
          </div>

          {/* Kits Assembled */}
          <div className="flex flex-col">
            <label className={labelClass(isMetricTeam(team))}>
              { /* David changes (start) */ }
              {isMetricTeam(team) ? metricLabel('KITS ASSEMBLED', team) : 'KITS ASSEMBLED'}
              { /* David changes (end) */ }
            </label>
            {isMetricTeam(team) ? (
              <input
                type="number"
                value={kitsAssembled}
                onChange={(e) => setKitsAssembled(e.target.value)}
                placeholder="e.g. 40"
                className={inputEnabledClass}
              />
            ) : (
              <input
                type="text"
                value=""
                placeholder="N/A"
                disabled
                className={inputDisabledClass}
              />
            )}
            {formErrors.kits_assembled && (
              <span className="text-[10px] text-danger mt-1 uppercase font-bold">{formErrors.kits_assembled}</span>
            )}
          </div>

          {/* Funds Raised */}
          <div className="flex flex-col">
            <label className={labelClass(isMetricTeam(team))}>
              { /* David changes (start) */ }
              {isMetricTeam(team) ? metricLabel('FUNDS RAISED ($)', team) : 'FUNDS RAISED ($)'}
              { /* David changes (end) */ }
            </label>
            {isMetricTeam(team) ? (
              <input
                type="number"
                step="0.01"
                value={fundsRaised}
                onChange={(e) => setFundsRaised(e.target.value)}
                placeholder="e.g. 1250.00"
                className={inputEnabledClass}
              />
            ) : (
              <input
                type="text"
                value=""
                placeholder="N/A"
                disabled
                className={inputDisabledClass}
              />
            )}
            {formErrors.funds_raised && (
              <span className="text-[10px] text-danger mt-1 uppercase font-bold">{formErrors.funds_raised}</span>
            )}
          </div>

          {/* Volunteer Hours */}
          <div className="flex flex-col">
            <label className={labelClass(true)}>
              VOLUNTEER HOURS (HRS)
            </label>
            <input
              type="number"
              step="0.1"
              value={volunteerHours}
              onChange={(e) => setVolunteerHours(e.target.value)}
              placeholder="e.g. 35.5"
              className={inputEnabledClass}
            />
            {formErrors.volunteer_hours && (
              <span className="text-[10px] text-danger mt-1 uppercase font-bold">{formErrors.volunteer_hours}</span>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="flex flex-col">
          <label className={labelClass(true)}>
            NOTES / REMARKS (OPTIONAL)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Log any anomalies, coordinator notes, milestones or additional information here..."
            rows={4}
            className={`${inputEnabledClass} resize-none`}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full bg-accent border border-accent hover:bg-transparent hover:text-accent text-darkBg font-bold transition-all duration-200 text-xs uppercase py-4 tracking-widest disabled:opacity-50"
        >
          {mutation.isPending ? 'SUBMITTING...' : 'TRANSMIT METRIC LOG'}
        </button>
      </form>
    </div>
  );
}
