import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PageShell from './components/layout/PageShell';
import Dashboard from './pages/Dashboard';
import WeeklyView from './pages/WeeklyView';
import SubmitReport from './pages/SubmitReport';

// Create TanStack query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <PageShell>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/week/:weekNumber" element={<WeeklyView />} />
            <Route path="/submit" element={<SubmitReport />} />
          </Routes>
        </PageShell>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
