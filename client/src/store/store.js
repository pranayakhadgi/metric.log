import { create } from 'zustand';

// Calculate current week number based on date
const getTodayWeekNumber = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now - start + (start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const currentWeek = Math.ceil((dayOfYear + 1) / 7);
  return Math.min(Math.max(currentWeek, 1), 52);
};

export const useStore = create((set) => ({
  selectedSiteId: null,
  activeWeek: getTodayWeekNumber(),
  
  setSelectedSiteId: (siteId) => set({ selectedSiteId: siteId }),
  setActiveWeek: (week) => set({ activeWeek: Math.min(Math.max(Number(week), 1), 52) }),
  clearSelectedSite: () => set({ selectedSiteId: null }),
}));
