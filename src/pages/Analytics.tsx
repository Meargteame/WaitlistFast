import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { BarChart3, Users, Eye, TrendingUp, Download, Globe, Mail } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
      ['Email', 'Position', 'Joined Date', 'Joined Time', 'Referral Code'],
      ...signups.map((s) => [
        s.email,
        s.position,
        new Date(s.created_at).toLocaleDateString(),
        new Date(s.created_at).toLocaleTimeString(),
        s.referral_code || '',
      ]),
    ]
      .map((row) => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug}-signups-${Date.now()}.csv`;
    a.click();
  }

  function exportJSON() {
    const data = {
      waitlist: slug,
      exportedAt: new Date().toISOString(),
      totalSignups: signups.length,
      signups: signups.map(s => ({
        email: s.email,
        position: s.position,
        referralCode: s.referral_code,
        joinedAt: new Date(s.created_at).toISOString(),
      })),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug}-signups-${Date.now()}.json`;
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

  if (error || !analytics || !signups) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-zinc-500 mb-4">{error || 'Failed to load analytics'}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-zinc-900 font-medium hover:underline"
            >
              Try again
            </button>
          </div>
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
              href={`/campaigns/${slug}`}
              className="flex items-center gap-2 border border-zinc-200 px-6 py-3 rounded-full font-medium hover:bg-zinc-50 transition-all"
            >
              <Mail className="w-4 h-4" />
              Email Campaigns
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

        {/* Time Series Chart */}
        {analytics.timeSeriesData && analytics.timeSeriesData.length > 0 && (
          <div className="bg-white border border-zinc-200 rounded-3xl p-8 mb-12">
            <h2 className="text-2xl font-bold mb-6">Signups Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#71717a"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#71717a"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e4e4e7',
                    borderRadius: '12px',
                    padding: '12px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="views" 
                  stroke="#71717a" 
                  strokeWidth={2}
                  dot={{ fill: '#71717a', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="signups" 
                  stroke="#18181b" 
                  strokeWidth={2}
                  dot={{ fill: '#18181b', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Traffic Sources */}
        {analytics.trafficSources && analytics.trafficSources.length > 0 && (
          <div className="bg-white border border-zinc-200 rounded-3xl p-8 mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-6 h-6 text-zinc-900" />
              <h2 className="text-2xl font-bold">Traffic Sources</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={analytics.trafficSources}
                    dataKey="count"
                    nameKey="source"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                  >
                    {analytics.trafficSources.map((entry: any, index: number) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={['#18181b', '#52525b', '#71717a', '#a1a1aa', '#d4d4d8', '#e4e4e7'][index % 6]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col justify-center">
                {analytics.trafficSources.map((source: any, index: number) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-zinc-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ 
                          backgroundColor: ['#18181b', '#52525b', '#71717a', '#a1a1aa', '#d4d4d8', '#e4e4e7'][index % 6] 
                        }}
                      />
                      <span className="font-medium">{source.source}</span>
                    </div>
                    <span className="text-zinc-500">{source.count} signups</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white border border-zinc-200 rounded-3xl p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Email Signups</h2>
            <div className="flex gap-3">
              <button
                onClick={exportJSON}
                className="flex items-center gap-2 border border-zinc-200 px-6 py-3 rounded-full font-medium hover:bg-zinc-50 transition-all"
              >
                <Download className="w-4 h-4" />
                Export JSON
              </button>
              <button
                onClick={exportCSV}
                className="flex items-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-full font-medium hover:bg-zinc-800 transition-all"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
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
