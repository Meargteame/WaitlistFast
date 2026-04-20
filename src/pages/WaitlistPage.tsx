import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Users, CheckCircle2, Zap } from 'lucide-react';
import { api } from '../lib/api';

export default function WaitlistPage() {
  const [waitlist, setWaitlist] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [position, setPosition] = useState<number | null>(null);

  const slug = window.location.pathname.split('/w/')[1];

  useEffect(() => {
    loadWaitlist();
  }, []);

  async function loadWaitlist() {
    try {
      const data = await api.waitlists.get(slug);
      setWaitlist(data);
    } catch (error) {
      console.error('Failed to load waitlist:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const result = await api.waitlists.signup(slug, email);
      setPosition(result.position);
      setSuccess(true);
    } catch (error: any) {
      alert(error.message);
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="text-zinc-500">Loading...</div>
      </div>
    );
  }

  if (!waitlist) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Waitlist not found</h1>
          <p className="text-zinc-500">This waitlist doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-4">You're on the list!</h1>
          <p className="text-xl text-zinc-600 mb-8">
            You're #{position} in line. We'll email you when we launch.
          </p>
          <div className="bg-white border border-zinc-200 rounded-2xl p-6">
            <p className="text-sm text-zinc-500 mb-2">Your email</p>
            <p className="font-medium">{email}</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full"
      >
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-zinc-200">
            <Zap className="text-white w-10 h-10 fill-current" />
          </div>
          <h1 className="text-5xl font-bold mb-4">{waitlist.name}</h1>
          <p className="text-xl text-zinc-600 mb-8">{waitlist.description}</p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-3xl p-12">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 w-6 h-6" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full pl-14 pr-6 py-5 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-zinc-100 transition-all text-lg"
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-zinc-900 text-white py-5 rounded-2xl font-bold text-xl shadow-xl shadow-zinc-200 hover:bg-zinc-800 transition-all disabled:opacity-50"
            >
              {submitting ? 'Joining...' : 'Join the waitlist'}
            </button>
          </form>

          <div className="flex items-center justify-center gap-3 text-zinc-500 font-medium mt-6">
            <Users className="w-5 h-5" />
            <span>{waitlist.signupCount} people on the waitlist</span>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-zinc-400">
            Powered by <a href="/" className="text-zinc-600 hover:text-zinc-900 font-medium">WaitlistFast</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
