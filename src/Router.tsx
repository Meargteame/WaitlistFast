import React, { useEffect, useState } from 'react';
import App from './App';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateWaitlist from './pages/CreateWaitlist';
import WaitlistPage from './pages/WaitlistPage';
import Analytics from './pages/Analytics';

export default function Router() {
  const [route, setRoute] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setRoute(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Route matching
  if (route === '/') return <App />;
  if (route === '/login') return <Login />;
  if (route === '/dashboard') return <Dashboard />;
  if (route === '/create') return <CreateWaitlist />;
  if (route.startsWith('/w/')) return <WaitlistPage />;
  if (route.startsWith('/analytics/')) return <Analytics />;

  // 404
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <p className="text-zinc-500 mb-6">Page not found</p>
        <a href="/" className="text-zinc-900 font-medium hover:underline">
          Go home
        </a>
      </div>
    </div>
  );
}
