import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchReports, fetchSummary } from '../api/reports';
import { useStore } from '../store/store';
import MetricCard from '../components/ui/MetricCard';
import SiteBadge from '../components/ui/SiteBadge';
import WeeklyTrendChart from '../components/charts/WeeklyTrendChart';

export default function Dashboard() {
  const selectedSiteId = useStore((state) => state.selectedSiteId);
  const setSelectedSiteId = useStore((state) => state.setSelectedSiteId);
  const clearSelectedSite = useStore((state) => state.clearSelectedSite);

  // Pagination & Sorting state
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('week_number');
  const [sortDirection, setSortDirection] = useState('desc');

  const { data: summary, isLoading: summaryLoading, isError: summaryError, error: sumErr } = useQuery({
    queryKey: ['summary'],
    queryFn: fetchSummary,
  });

  const { data: reports = [], isLoading: reportsLoading, isError: reportsError, error: repErr } = useQuery({
    queryKey: ['reports'],
    queryFn: fetchReports,
  });

  // Calculate stats for current selected site or overall
  const displayOverall = useMemo(() => {
    if (!summary) return { total_items: 0, total_kits: 0, total_funds: 0, total_hours: 0, total_reports: 0 };
    if (!selectedSiteId) return summary.overall;
    
    // Find the bySite stats for the selected site
    const siteObj = summary.by_site.find(s => s.site_name === selectedSiteId);
    if (!siteObj) return summary.overall;
    return {
      total_items: siteObj.total_items || 0,
      total_kits: siteObj.total_kits || 0,
      total_funds: siteObj.total_funds || 0,
      total_hours: siteObj.total_hours || 0,
      total_reports: siteObj.report_count || 0,
    };
  }, [summary, selectedSiteId]);

  // Filtered reports
  const filteredReports = useMemo(() => {
    if (!selectedSiteId) return reports;
    return reports.filter(r => r.site_name === selectedSiteId);
  }, [reports, selectedSiteId]);

  // Sorted reports
  const sortedReports = useMemo(() => {
    return [...filteredReports].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'submitted_at') {
        valA = new Date(a.submitted_at).getTime();
        valB = new Date(b.submitted_at).getTime();
      }

      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      if (typeof valA === 'string') {
        return sortDirection === 'asc' 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      }

      return sortDirection === 'asc' ? valA - valB : valB - valA;
    });
  }, [filteredReports, sortField, sortDirection]);

  // Paginated reports
  const paginatedReports = useMemo(() => {
    const startIndex = (currentPage - 1) * 10;
    return sortedReports.slice(startIndex, startIndex + 10);
  }, [sortedReports, currentPage]);

  const totalPages = Math.ceil(sortedReports.length / 10);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  const handleSiteClick = (siteName) => {
    if (selectedSiteId === siteName) {
      clearSelectedSite();
    } else {
      setSelectedSiteId(siteName);
    }
    setCurrentPage(1);
  };

  if (summaryLoading || reportsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] font-mono">
        <div className="flex items-center space-x-2 text-textMuted uppercase text-xs tracking-widest">
          <span className="w-1.5 h-1.5 bg-accent animate-ping rounded-full" />
          <span>SYNCHRONIZING TERMINAL DATA...</span>
        </div>
      </div>
    );
  }

  if (summaryError || reportsError) {
    return (
      <div className="border border-danger/40 bg-danger/10 p-6 font-mono text-danger">
        <h4 className="font-bold text-sm uppercase tracking-wider mb-2">SYSTEM SYNCHRONIZATION ERROR</h4>
        <p className="text-xs">{sumErr?.message || repErr?.message || 'Failed to establish connection to the remote API.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-borderColor pb-6 gap-4">
        <div>
          <span className="text-[10px] text-accent uppercase tracking-widest font-bold block mb-1">
            CONTROL CENTER
          </span>
          <h2 className="font-sans font-bold text-3xl uppercase tracking-tight text-textPrimary">
            OPERATIONAL OVERVIEW
          </h2>
        </div>
        <div className="text-xs text-textMuted font-mono">
          FILTER: {selectedSiteId ? (
            <span className="text-accent font-semibold uppercase">
              {selectedSiteId} SITE <button onClick={clearSelectedSite} className="ml-1 text-[10px] text-danger underline hover:text-white uppercase font-bold">[CLEAR]</button>
            </span>
          ) : (
            'ALL LOCATIONS'
          )}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="TOTAL ITEMS COLLECTED" value={displayOverall.total_items} />
        <MetricCard label="TOTAL KITS ASSEMBLED" value={displayOverall.total_kits} />
        <MetricCard label="TOTAL FUNDS RAISED" value={displayOverall.total_funds} unit="$" />
        <MetricCard label="TOTAL VOLUNTEER HOURS" value={displayOverall.total_hours} unit="hrs" />
      </div>

      {/* Site Performance Grid */}
      <div>
        <h4 className="text-[10px] text-textMuted uppercase tracking-widest font-semibold mb-4">
          LOCATIONS GRID (CLICK CARD TO FILTER)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {(summary?.by_site || []).map((site, index) => {
            const isSelected = selectedSiteId === site.site_name;
            return (
              <div
                key={site.site_name}
                onClick={() => handleSiteClick(site.site_name)}
                style={{ animationDelay: `${index * 0.05}s` }}
                className={`bg-surface border p-5 cursor-pointer flex flex-col justify-between transition-all duration-300 select-none animate-fade-in-up ${
                  isSelected 
                    ? 'border-accent ring-1 ring-accent' 
                    : 'border-borderColor hover:border-textMuted'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-sans font-bold text-textPrimary tracking-tight uppercase text-sm">
                      {site.site_name}
                    </span>
                    <SiteBadge state={site.location} />
                  </div>
                  <div className="text-xs text-textMuted uppercase tracking-wider mb-4">
                    REPORTS: <span className="font-bold text-textPrimary font-mono">{site.report_count}</span>
                  </div>
                </div>
                <div className="border-t border-borderColor/60 pt-3 mt-1">
                  <span className="text-[9px] text-textMuted uppercase block mb-1">Items Collected</span>
                  <span className="font-mono text-sm font-bold text-textPrimary">
                    {Number(site.total_items || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 gap-6">
        <WeeklyTrendChart data={filteredReports} />
      </div>

      {/* Reports Table Section */}
      <div className="bg-surface border border-borderColor p-6 flex flex-col font-mono">
        <div className="flex justify-between items-center mb-6">
          <div>
            <span className="text-textMuted uppercase text-[10px] tracking-widest font-semibold block mb-1">
              DATA LOGS
            </span>
            <h3 className="font-sans font-bold text-lg text-textPrimary uppercase">
              WEEKLY SUBMISSIONS
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-borderColor text-textMuted uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold cursor-pointer hover:text-textPrimary" onClick={() => handleSort('site_name')}>
                  SITE {sortField === 'site_name' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="py-3 px-4 font-semibold cursor-pointer hover:text-textPrimary text-center" onClick={() => handleSort('week_number')}>
                  WEEK {sortField === 'week_number' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="py-3 px-4 font-semibold cursor-pointer hover:text-textPrimary text-right" onClick={() => handleSort('items_collected')}>
                  ITEMS {sortField === 'items_collected' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="py-3 px-4 font-semibold cursor-pointer hover:text-textPrimary text-right" onClick={() => handleSort('kits_assembled')}>
                  KITS {sortField === 'kits_assembled' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="py-3 px-4 font-semibold cursor-pointer hover:text-textPrimary text-right" onClick={() => handleSort('funds_raised')}>
                  FUNDS {sortField === 'funds_raised' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="py-3 px-4 font-semibold cursor-pointer hover:text-textPrimary text-right" onClick={() => handleSort('volunteer_hours')}>
                  HOURS {sortField === 'volunteer_hours' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="py-3 px-4 font-semibold cursor-pointer hover:text-textPrimary text-right hidden sm:table-cell" onClick={() => handleSort('submitted_at')}>
                  SUBMITTED {sortField === 'submitted_at' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-textMuted uppercase border-b border-borderColor/40">
                    NO LOG ENTRIES RECORDED FOR THIS SELECTION
                  </td>
                </tr>
              ) : (
                paginatedReports.map((report, idx) => (
                  <tr
                    key={report.id}
                    className={`border-b border-borderColor/40 hover:bg-darkBg/30 animate-fade-in-up stagger-${(idx % 10) + 1}`}
                  >
                    <td className="py-3 px-4 font-sans font-bold text-textPrimary uppercase">
                      {report.site_name} <span className="text-[10px] text-textMuted font-mono font-normal">({report.location})</span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-accent">W{report.week_number}</td>
                    <td className="py-3 px-4 text-right">{report.items_collected?.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">{report.kits_assembled?.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">${report.funds_raised?.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">{report.volunteer_hours?.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-textMuted hidden sm:table-cell">
                      {new Date(report.submitted_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-borderColor">
            <span className="text-[10px] text-textMuted uppercase">
              PAGE {currentPage} OF {totalPages} ({sortedReports.length} ENTRIES)
            </span>
            <div className="flex space-x-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-borderColor hover:bg-darkBg disabled:opacity-30 disabled:hover:bg-transparent text-[10px] font-bold"
              >
                PREV
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-borderColor hover:bg-darkBg disabled:opacity-30 disabled:hover:bg-transparent text-[10px] font-bold"
              >
                NEXT
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
