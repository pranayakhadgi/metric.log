import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useStore } from '../../store/store';

export default function PageShell({ children }) {
  const location = useLocation();
  const activeWeek = useStore((state) => state.activeWeek);

  // System health status query
  const { data: healthData, isError } = useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const res = await fetch('/api/health');
      if (!res.ok) throw new Error('Unhealthy');
      return res.json();
    },
    refetchInterval: 15000, // check every 15s
    retry: 1,
  });

  const isOperational = !isError && healthData?.status === 'ok';

  const navItems = [
    { name: 'DASHBOARD', path: '/' },
    { name: 'WEEKLY VIEW', path: `/week/${activeWeek}` },
    { name: 'SUBMIT REPORT', path: '/submit' },
  ];

  return (
    <div className="min-h-screen bg-darkBg text-textPrimary flex flex-col md:flex-row font-mono select-none">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-borderColor bg-[#0A0A0C] flex flex-col justify-between shrink-0">
        <div>
          {/* Logo Brand Header */}
          <div className="p-6 border-b border-borderColor flex items-center space-x-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 64 64" fill="none">
              <rect width="64" height="64" rx="12" fill="#141418"/>
              <rect x="12" y="36" width="8" height="16" fill="#C8F135"/>
              <rect x="24" y="24" width="8" height="28" fill="#C8F135" opacity="0.7"/>
              <rect x="36" y="16" width="8" height="36" fill="#C8F135" opacity="0.5"/>
              <rect x="48" y="28" width="8" height="24" fill="#C8F135" opacity="0.3"/>
              <circle cx="16" cy="32" r="3" fill="#F0EFE9"/>
              <circle cx="28" cy="20" r="3" fill="#F0EFE9"/>
              <circle cx="40" cy="12" r="3" fill="#F0EFE9"/>
              <circle cx="52" cy="24" r="3" fill="#F0EFE9"/>
              <polyline points="16,32 28,20 40,12 52,24" stroke="#F0EFE9" stroke-width="1.5" fill="none" stroke-dasharray="3 2"/>
            </svg>
            <div>
              <h1 className="font-sans font-extrabold tracking-tight text-sm text-textPrimary leading-none">VOLUNTEER</h1>
              <span className="text-[10px] text-textMuted uppercase tracking-widest leading-none">METRICS TRACKER</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              // Exact match for dashboard, prefix match for others (e.g. /week/1 matches /week)
              const isActive = item.path === '/' 
                ? location.pathname === '/' 
                : location.pathname.startsWith(item.path.split('/').slice(0, 2).join('/'));

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`block px-4 py-3 text-xs tracking-widest font-semibold transition-all duration-200 border-l-2 ${
                    isActive
                      ? 'bg-surface border-accent text-accent'
                      : 'border-transparent text-textMuted hover:text-textPrimary hover:bg-surface/50'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info */}
        <div className="p-6 border-t border-borderColor hidden md:block">
          <div className="flex items-center space-x-2 text-[10px] text-textMuted">
            <span className={`w-2 h-2 rounded-full ${isOperational ? 'bg-success animate-pulse' : 'bg-danger'}`} />
            <span>API {isOperational ? 'OPERATIONAL' : 'OFFLINE'}</span>
          </div>
          <p className="text-[9px] text-textMuted/50 mt-2 font-mono uppercase tracking-widest">
            v1.0.0 // DB_CONNECTED
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TopBar */}
        <header className="h-14 border-b border-borderColor bg-[#0A0A0C] px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-4">
            <span className="text-xs text-textMuted uppercase tracking-wider font-semibold">
              FIELD OPERATIONS TERMINAL
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-[10px] bg-surface border border-borderColor px-2 py-1 text-textMuted font-mono">
              SYS_TIME: {new Date().toLocaleTimeString(undefined, { hour12: false })}
            </span>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-darkBg">
          {children}
        </main>
      </div>
    </div>
  );
}
