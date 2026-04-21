import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mail, Send, Users, CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { api } from '../lib/api';
import ErrorModal from '../components/ErrorModal';

export function EmailCampaigns() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [signups, setSignups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showComposer, setShowComposer] = useState(false);
  
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  
  const slug = window.location.pathname.split('/campaigns/')[1];

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [campaignsData, signupsData] = await Promise.all([
        api.campaigns.list(slug),
        api.waitlists.getSignups(slug),
      ]);
      setCampaigns(campaignsData);
      setSignups(signupsData);
    } catch (error: any) {
      setError(error.message || 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  }

  async function handleSend() {
    if (!subject.trim() || !message.trim()) {
      setError('Subject and message are required');
      return;
    }

    if (signups.length === 0) {
      setError('No signups to send to');
      return;
    }

    setSending(true);
    try {
      await api.campaigns.send(slug, subject, message);
      setSubject('');
      setMessage('');
      setShowComposer(false);
      await loadData();
    } catch (error: any) {
      setError(error.message || 'Failed to send campaign');
    } finally {
      setSending(false);
    }
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
              <h1 className="text-4xl font-bold mb-2">Email Campaigns</h1>
              <p className="text-zinc-500">Send updates to your {signups.length} subscribers</p>
            </div>
            <div className="flex gap-3">
              <a
                href={`/analytics/${slug}`}
                className="flex items-center gap-2 border border-zinc-200 px-6 py-3 rounded-full font-medium hover:bg-zinc-50 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Analytics
              </a>
              {!showComposer && (
                <button
                  onClick={() => setShowComposer(true)}
                  className="flex items-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-full font-medium hover:bg-zinc-800 transition-all"
                >
                  <Mail className="w-4 h-4" />
                  New Campaign
                </button>
              )}
            </div>
          </div>

          {/* Composer */}
          {showComposer && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-zinc-200 rounded-3xl p-8 mb-12"
            >
              <h2 className="text-2xl font-bold mb-6">Compose Campaign</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Your product is launching soon!"
                    className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    maxLength={100}
                  />
                  <p className="text-sm text-zinc-500 mt-1">{subject.length}/100 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Hi there! We're excited to announce..."
                    rows={10}
                    className="w-full px-4 py-3 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none"
                  />
                  <p className="text-sm text-zinc-500 mt-1">
                    Plain text only. HTML support coming soon.
                  </p>
                </div>

                <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-sm text-zinc-600">
                    <Users className="w-4 h-4" />
                    <span>This will be sent to {signups.length} subscribers</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSend}
                    disabled={sending || !subject.trim() || !message.trim()}
                    className="flex items-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-full font-medium hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? (
                      <>
                        <Clock className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Campaign
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowComposer(false);
                      setSubject('');
                      setMessage('');
                    }}
                    className="border border-zinc-200 px-6 py-3 rounded-full font-medium hover:bg-zinc-50 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Campaign History */}
          <div className="bg-white border border-zinc-200 rounded-3xl p-8">
            <h2 className="text-2xl font-bold mb-6">Campaign History</h2>

            {campaigns.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
                <p className="text-zinc-500 mb-4">No campaigns sent yet</p>
                <button
                  onClick={() => setShowComposer(true)}
                  className="text-zinc-900 font-medium hover:underline"
                >
                  Send your first campaign
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="border border-zinc-200 rounded-2xl p-6 hover:border-zinc-300 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold mb-1">{campaign.subject}</h3>
                        <p className="text-sm text-zinc-500">
                          Sent {new Date(campaign.sent_at).toLocaleDateString()} at{' '}
                          {new Date(campaign.sent_at).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        campaign.status === 'sent' 
                          ? 'bg-emerald-50 text-emerald-700'
                          : campaign.status === 'sending'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-red-50 text-red-700'
                      }`}>
                        {campaign.status}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <div>
                          <p className="text-sm text-zinc-500">Delivered</p>
                          <p className="font-bold">{campaign.delivered_count}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <div>
                          <p className="text-sm text-zinc-500">Failed</p>
                          <p className="font-bold">{campaign.failed_count}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-zinc-600" />
                        <div>
                          <p className="text-sm text-zinc-500">Total</p>
                          <p className="font-bold">{campaign.sent_count}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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
