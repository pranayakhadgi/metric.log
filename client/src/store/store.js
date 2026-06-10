import { create } from 'zustand';

// David changes (start)
// Calculate current week number for the 23-32 week range
const getTodayWeekNumber = () => {
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
  
  const now = new Date();
  const currentWeek = WEEKS_DATA.find(w => now >= w.startDate && now <= w.endDate);
  return currentWeek ? currentWeek.week : 23;
};
// David changes (end)

export const useStore = create((set) => ({
  selectedSiteId: null,
  activeWeek: getTodayWeekNumber(),
  
  setSelectedSiteId: (siteId) => set({ selectedSiteId: siteId }),
  // David changes (start)
  setActiveWeek: (week) => set({ activeWeek: Math.min(Math.max(Number(week), 23), 32) }),
  // David changes (end)
  clearSelectedSite: () => set({ selectedSiteId: null }),
}));
