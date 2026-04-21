import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Plus, ExternalLink, Users, BarChart3 } from 'lucide-react';
import { api } from '../lib/api';
import DashboardLayout from '../components/DashboardLayout';
import ErrorModal from '../components/ErrorModal';

export default function Dashboard() {
  const [waitlists, setWaitlists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWaitlists();
  }, []);

  async function loadWaitlists() {
    try {
      const data = await api.waitlists.list();
      setWaitlists(data);
    } catch (error: any) {
      setError(error.message || 'Failed to load waitlists');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout currentPage="dashboard">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-zinc-500">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout currentPage="dashboard">
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-8">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-2">Your Waitlists</h1>
            <p className="text-zinc-500">Manage and track your waitlist pages</p>
          </div>
          <a
            href="/create"
            className="bg-zinc-900 text-white px-6 py-3 rounded-full font-medium hover:bg-zinc-800 transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Waitlist
          </a>
        </div>

        {waitlists.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-zinc-400" />
            </div>
            <h3 className="text-2xl font-bold mb-3">No waitlists yet</h3>
            <p className="text-zinc-500 mb-8">Create your first waitlist to start collecting signups</p>
            <a
              href="/create"
              className="inline-flex items-center gap-2 bg-zinc-900 text-white px-8 py-4 rounded-full font-medium hover:bg-zinc-800 transition-all"
            >
              <Plus className="w-5 h-5" />
              Create Your First Waitlist
            </a>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {waitlists.map((waitlist) => (
              <motion.div
                key={waitlist.id}
                whileHover={{ y: -5 }}
                className="bg-white border border-zinc-200 rounded-3xl p-8 hover:shadow-lg transition-all"
              >
                <h3 className="text-xl font-bold mb-3">{waitlist.name}</h3>
                <p className="text-zinc-500 mb-6 line-clamp-2">{waitlist.description}</p>
                
                <div className="flex items-center gap-4 mb-6 text-sm text-zinc-500">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>0 signups</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <a
                    href={`/w/${waitlist.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-zinc-900 text-white py-2 rounded-full text-sm font-medium hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View
                  </a>
                  <a
                    href={`/customize/${waitlist.slug}`}
                    className="flex-1 border border-zinc-200 py-2 rounded-full text-sm font-medium hover:bg-zinc-50 transition-all flex items-center justify-center gap-2"
                  >
                    Customize
                  </a>
                  <a
                    href={`/analytics/${waitlist.slug}`}
                    className="flex-1 border border-zinc-200 py-2 rounded-full text-sm font-medium hover:bg-zinc-50 transition-all flex items-center justify-center gap-2"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Analytics
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
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
