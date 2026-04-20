import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { BarChart3, Users, Eye, TrendingUp, Download } from 'lucide-react';
import { api } from '../lib/api';
import DashboardLayout from '../components/DashboardLayout';
import ErrorModal from '../components/ErrorModal';

export default function Analytics() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [signups, setSignups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const slug = window.location.pathname.split('/analytics/')[1];

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [analyticsData, signupsData] = await Promise.all([
        api.waitlists.getAnalytics(slug),
        api.waitlists.getSignups(slug),
      ]);
      setAnalytics(analyticsData);
      setSignups(signupsData);
    } catch (error: any) {
      setError(error.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }

  function exportCSV() {
    const csv = [
      ['Email', 'Position', 'Joined Date'],
      ...signups.map((s) => [
        s.email,
        s.position,
        new Date(s.created_at).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug}-signups.csv`;
    a.click();
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-zinc-500">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-8">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-2">Analytics</h1>
            <p className="text-zinc-500">Track your waitlist performance</p>
          </div>
          <div className="flex gap-3">
            <a
              href="/dashboard"
              className="border border-zinc-200 px-6 py-3 rounded-full font-medium hover:bg-zinc-50 transition-all"
            >
              Back to Dashboard
            </a>
            <a
              href={`/w/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-zinc-900 text-white px-6 py-3 rounded-full font-medium hover:bg-zinc-800 transition-all"
            >
              View Page
            </a>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-zinc-200 rounded-3xl p-8"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-zinc-900" />
              </div>
              <div>
                <p className="text-sm text-zinc-500 font-medium">Total Views</p>
                <p className="text-3xl font-bold">{analytics.views}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border border-zinc-200 rounded-3xl p-8"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-zinc-500 font-medium">Total Signups</p>
                <p className="text-3xl font-bold">{analytics.signups}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white border border-zinc-200 rounded-3xl p-8"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-zinc-500 font-medium">Conversion Rate</p>
                <p className="text-3xl font-bold">{analytics.conversionRate}%</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-3xl p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Email Signups</h2>
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-full font-medium hover:bg-zinc-800 transition-all"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>

          {signups.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              No signups yet. Share your waitlist to start collecting emails!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-200">
                    <th className="text-left py-4 px-4 font-bold text-sm text-zinc-500">Position</th>
                    <th className="text-left py-4 px-4 font-bold text-sm text-zinc-500">Email</th>
                    <th className="text-left py-4 px-4 font-bold text-sm text-zinc-500">Joined Date</th>
                  </tr>
                </thead>
                <tbody>
                  {signups.map((signup) => (
                    <tr key={signup.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                      <td className="py-4 px-4 font-medium">#{signup.position}</td>
                      <td className="py-4 px-4">{signup.email}</td>
                      <td className="py-4 px-4 text-zinc-500">
                        {new Date(signup.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
      <ErrorModal
        isOpen={!!error}
        onClose={() => setError(null)}
        message={error || ''}
      />
    </DashboardLayout>
  );
}
