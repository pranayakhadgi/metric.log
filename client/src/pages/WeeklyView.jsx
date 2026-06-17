import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchReportsByWeek } from '../api/reports';
import { useStore } from '../store/store';
import WeekSelector from '../components/ui/WeekSelector';
import SiteBadge from '../components/ui/SiteBadge';
import SiteComparisonChart from '../components/charts/SiteComparisonChart';

const SEEDED_SITES = [
  { id: 1, name: 'Charlotte', location: 'NC' },
  { id: 2, name: 'Auburn Hills', location: 'MI' },
  { id: 3, name: 'Miami', location: 'FL' },
  { id: 4, name: 'Houston', location: 'TX' },
  { id: 5, name: 'Itasca', location: 'IL' },
];

export default function WeeklyView() {
  const { weekNumber } = useParams();
  const navigate = useNavigate();
  const setActiveWeek = useStore((state) => state.setActiveWeek);

  // Validate and parse week number
  const weekVal = parseInt(weekNumber, 10);
  // David changes (start)
  const isValidWeek = !isNaN(weekVal) && weekVal >= 23 && weekVal <= 32;
  // David changes (end)
  const currentWeek = isValidWeek ? weekVal : useStore.getState().activeWeek;

  // Sync route param with store state
  useEffect(() => {
    if (!isValidWeek) {
      navigate(`/week/${currentWeek}`, { replace: true });
    } else {
      setActiveWeek(currentWeek);
    }
  }, [weekNumber, isValidWeek, currentWeek, navigate, setActiveWeek]);

  // Query reports for the selected week
  const { data: reports = [], isLoading, isError, error } = useQuery({
    queryKey: ['reportsByWeek', currentWeek],
    queryFn: () => fetchReportsByWeek(currentWeek),
    enabled: isValidWeek,
  });

  const handleWeekChange = (newWeek) => {
    navigate(`/week/${newWeek}`);
  };

  const hasReports = reports && reports.length > 0;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] font-mono">
        <div className="flex items-center space-x-2 text-textMuted uppercase text-xs tracking-widest">
          <span className="w-1.5 h-1.5 bg-accent animate-ping rounded-full" />
          <span>COMPILING WEEKLY LOGS...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="border border-danger/40 bg-danger/10 p-6 font-mono text-danger">
        <h4 className="font-bold text-sm uppercase tracking-wider mb-2">QUERY FAILURE</h4>
        <p className="text-xs">{error?.message || 'Failed to fetch report data for the selected week.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-borderColor pb-6 gap-4">
        <div>
          <span className="text-[10px] text-accent uppercase tracking-widest font-bold block mb-1">
            WEEKLY LOGS REVIEW
          </span>
          <h2 className="font-sans font-bold text-3xl uppercase tracking-tight text-textPrimary">
            WEEKLY SUMMARY
          </h2>
        </div>
        <WeekSelector week={currentWeek} onChange={handleWeekChange} />
      </div>

      {/* Main content or empty state */}
      {!hasReports ? (
        <div className="border border-dashed border-borderColor/60 p-12 flex flex-col items-center justify-center text-center font-mono min-h-[300px]">
          <span className="text-6xl font-extrabold text-borderColor mb-4 block leading-none select-none">
            W{currentWeek}
          </span>
          <p className="text-sm text-textPrimary uppercase font-semibold mb-1">
            NO RECORDED REPORTS FOUND
          </p>
          <p className="text-xs text-textMuted max-w-sm uppercase tracking-wider">
            No team has submitted metrics for this week yet. Use the Submit Report tab to record data for any team or site.
          </p>
        </div>
      ) : (
        <>
          {/* Grouped Comparison Chart */}
          <SiteComparisonChart data={reports} sites={SEEDED_SITES} />

          {/* Table Breakdown */}
          <div className="bg-surface border border-borderColor p-6 flex flex-col font-mono">
            <div className="mb-6">
              <span className="text-textMuted uppercase text-[10px] tracking-widest font-semibold block mb-1">
                LOCATION ANALYSIS
              </span>
              <h3 className="font-sans font-bold text-lg text-textPrimary uppercase">
                SITE METRICS BREAKDOWN
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-borderColor text-textMuted uppercase tracking-wider">
                    <th className="py-3 px-4 font-semibold">SITE</th>
                    <th className="py-3 px-4 font-semibold">TEAM</th>
                        <th className="py-3 px-4 font-semibold text-right">KITS</th>
                    <th className="py-3 px-4 font-semibold text-right">FUNDS</th>
                    <th className="py-3 px-4 font-semibold text-right">HOURS</th>
                    <th className="py-3 px-4 font-semibold hidden md:table-cell">SUBMITTED ON</th>
                    <th className="py-3 px-4 font-semibold">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {SEEDED_SITES.map((site, sIdx) => {
                    const reportsForSite = reports.filter((r) => r.site_id === site.id);

                    if (!reportsForSite.length) {
                      return (
                        <tr
                          key={`site-missing-${site.id}`}
                          className={`border-b border-borderColor/40 hover:bg-darkBg/30 animate-fade-in-up stagger-${sIdx + 1}`}
                        >
                          <td className="py-3 px-4 font-sans font-bold text-textPrimary uppercase">
                            {site.name} <span className="text-[10px] text-textMuted font-mono font-normal">({site.location})</span>
                          </td>
                          <td className="py-3 px-4 text-textMuted/60">—</td>
                          <td className="py-3 px-4 text-right text-textMuted/40">—</td>
                          <td className="py-3 px-4 text-right text-textMuted/40">—</td>
                          <td className="py-3 px-4 text-right text-textMuted/40">—</td>
                          <td className="py-3 px-4 text-right text-textMuted/40">—</td>
                          <td className="py-3 px-4 text-textMuted hidden md:table-cell">—</td>
                          <td className="py-3 px-4">
                            <span className="text-textMuted/60 font-medium tracking-widest text-[10px] uppercase">MISSING</span>
                          </td>
                        </tr>
                      );
                    }

                    return reportsForSite.map((report, rIdx) => {
                      const key = report.id ? `report-${report.id}` : `report-${site.id}-${rIdx}`;

                      return (
                        <tr
                          key={key}
                          className={`border-b border-borderColor/40 hover:bg-darkBg/30 animate-fade-in-up stagger-${sIdx + 1}`}
                        >
                          <td className="py-3 px-4 font-sans font-bold text-textPrimary uppercase">
                            {rIdx === 0 ? (
                              <>
                                {site.name} <span className="text-[10px] text-textMuted font-mono font-normal">({site.location})</span>
                              </>
                            ) : (
                              <span className="text-[10px] text-textMuted">&nbsp;</span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono text-[12px] text-textMuted uppercase">{report.team || '—'}</td>
                          <td className={`py-3 px-4 text-right ${!report && 'text-textMuted/40'}`}>
                            {report.kits_assembled != null ? report.kits_assembled.toLocaleString() : '—'}
                          </td>
                          <td className={`py-3 px-4 text-right ${!report && 'text-textMuted/40'}`}>
                            {report.funds_raised != null ? `$${report.funds_raised.toLocaleString()}` : '—'}
                          </td>
                          <td className={`py-3 px-4 text-right ${!report && 'text-textMuted/40'}`}>
                            {report.volunteer_hours != null ? report.volunteer_hours.toLocaleString() : '—'}
                          </td>
                          <td className="py-3 px-4 text-textMuted hidden md:table-cell">
                            {report.submitted_at ? new Date(report.submitted_at).toLocaleString() : '—'}
                          </td>
                          <td className="py-3 px-4">
                            {report ? (
                              <span className="text-success font-semibold tracking-widest text-[10px] uppercase">
                                COMPLETED
                              </span>
                            ) : (
                              <span className="text-textMuted/60 font-medium tracking-widest text-[10px] uppercase">MISSING</span>
                            )}
                          </td>
                        </tr>
                      );
                    });
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
