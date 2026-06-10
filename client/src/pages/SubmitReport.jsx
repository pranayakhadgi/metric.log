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

export default function SubmitReport() {
  const queryClient = useQueryClient();
  const activeWeek = useStore((state) => state.activeWeek);

  // Form states
  const [siteId, setSiteId] = useState('1');
  const [weekNumber, setWeekNumber] = useState(activeWeek || 1);
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
    
    if (!siteId) errors.site_id = 'Site selection is required';
    
    const weekNum = Number(weekNumber);
    if (!weekNumber || isNaN(weekNum) || weekNum < 1 || weekNum > 52) {
      errors.week_number = 'Week number must be between 1 and 52';
    }

    if (itemsCollected !== '' && (isNaN(Number(itemsCollected)) || Number(itemsCollected) < 0)) {
      errors.items_collected = 'Must be a valid positive integer';
    }

    if (kitsAssembled !== '' && (isNaN(Number(kitsAssembled)) || Number(kitsAssembled) < 0)) {
      errors.kits_assembled = 'Must be a valid positive integer';
    }

    if (fundsRaised !== '' && (isNaN(Number(fundsRaised)) || Number(fundsRaised) < 0)) {
      errors.funds_raised = 'Must be a valid positive number';
    }

    if (volunteerHours !== '' && (isNaN(Number(volunteerHours)) || Number(volunteerHours) < 0)) {
      errors.volunteer_hours = 'Must be a valid positive number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    mutation.mutate({
      site_id: siteId,
      week_number: weekNumber,
      items_collected: itemsCollected,
      kits_assembled: kitsAssembled,
      funds_raised: fundsRaised,
      volunteer_hours: volunteerHours,
      notes: notes,
    });
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Site Selection */}
          <div className="flex flex-col">
            <label className="text-[10px] text-textMuted uppercase tracking-wider mb-2 font-bold">
              1. REPORTING LOCATION *
            </label>
            <select
              value={siteId}
              onChange={(e) => setSiteId(e.target.value)}
              className="bg-surface border border-borderColor text-textPrimary text-xs focus:outline-none focus:border-accent p-3 w-full font-mono uppercase"
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
          <div className="flex flex-col">
            <label className="text-[10px] text-textMuted uppercase tracking-wider mb-2 font-bold">
              2. CALENDAR WEEK (1-52) *
            </label>
            <input
              type="number"
              min="1"
              max="52"
              value={weekNumber}
              onChange={(e) => setWeekNumber(e.target.value)}
              placeholder="e.g. 24"
              className="bg-surface border border-borderColor text-textPrimary text-xs focus:outline-none focus:border-accent p-3 w-full font-mono"
              required
            />
            {formErrors.week_number && (
              <span className="text-[10px] text-danger mt-1 uppercase font-bold">{formErrors.week_number}</span>
            )}
          </div>
        </div>

        <div className="border-t border-borderColor/50 my-6" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Items Collected */}
          <div className="flex flex-col">
            <label className="text-[10px] text-textMuted uppercase tracking-wider mb-2 font-bold">
              ITEMS COLLECTED
            </label>
            <input
              type="number"
              value={itemsCollected}
              onChange={(e) => setItemsCollected(e.target.value)}
              placeholder="e.g. 150"
              className="bg-surface border border-borderColor text-textPrimary text-xs focus:outline-none focus:border-accent p-3 w-full font-mono"
            />
            {formErrors.items_collected && (
              <span className="text-[10px] text-danger mt-1 uppercase font-bold">{formErrors.items_collected}</span>
            )}
          </div>

          {/* Kits Assembled */}
          <div className="flex flex-col">
            <label className="text-[10px] text-textMuted uppercase tracking-wider mb-2 font-bold">
              KITS ASSEMBLED
            </label>
            <input
              type="number"
              value={kitsAssembled}
              onChange={(e) => setKitsAssembled(e.target.value)}
              placeholder="e.g. 40"
              className="bg-surface border border-borderColor text-textPrimary text-xs focus:outline-none focus:border-accent p-3 w-full font-mono"
            />
            {formErrors.kits_assembled && (
              <span className="text-[10px] text-danger mt-1 uppercase font-bold">{formErrors.kits_assembled}</span>
            )}
          </div>

          {/* Funds Raised */}
          <div className="flex flex-col">
            <label className="text-[10px] text-textMuted uppercase tracking-wider mb-2 font-bold">
              FUNDS RAISED ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={fundsRaised}
              onChange={(e) => setFundsRaised(e.target.value)}
              placeholder="e.g. 1250.00"
              className="bg-surface border border-borderColor text-textPrimary text-xs focus:outline-none focus:border-accent p-3 w-full font-mono"
            />
            {formErrors.funds_raised && (
              <span className="text-[10px] text-danger mt-1 uppercase font-bold">{formErrors.funds_raised}</span>
            )}
          </div>

          {/* Volunteer Hours */}
          <div className="flex flex-col">
            <label className="text-[10px] text-textMuted uppercase tracking-wider mb-2 font-bold">
              VOLUNTEER HOURS (HRS)
            </label>
            <input
              type="number"
              step="0.1"
              value={volunteerHours}
              onChange={(e) => setVolunteerHours(e.target.value)}
              placeholder="e.g. 35.5"
              className="bg-surface border border-borderColor text-textPrimary text-xs focus:outline-none focus:border-accent p-3 w-full font-mono"
            />
            {formErrors.volunteer_hours && (
              <span className="text-[10px] text-danger mt-1 uppercase font-bold">{formErrors.volunteer_hours}</span>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="flex flex-col">
          <label className="text-[10px] text-textMuted uppercase tracking-wider mb-2 font-bold">
            NOTES / REMARKS (OPTIONAL)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Log any anomalies, coordinator notes, or milestones here..."
            rows={4}
            className="bg-surface border border-borderColor text-textPrimary text-xs focus:outline-none focus:border-accent p-3 w-full font-mono resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full bg-accent border border-accent hover:bg-transparent hover:text-accent text-darkBg font-bold transition-all duration-200 text-xs uppercase py-4 tracking-widest disabled:opacity-50"
        >
          {mutation.isPending ? 'SUBMITTING...' : 'TRANSMIT METRICS LOG'}
        </button>
      </form>
    </div>
  );
}
