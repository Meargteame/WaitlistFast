import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Zap } from 'lucide-react';
import { api, setSession } from '../lib/api';
import ErrorModal from '../components/ErrorModal';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = isLogin
        ? await api.auth.login(email, password)
        : await api.auth.signup(email, password);

      setSession(result.sessionId);
      window.location.href = '/dashboard';
    } catch (error: any) {
      setError(error.message || 'Authentication failed');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-zinc-200">
            <Zap className="text-white w-8 h-8 fill-current" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {isLogin ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-zinc-500">
            {isLogin ? 'Sign in to your account' : 'Start validating your ideas'}
          </p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-3xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-zinc-100 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-zinc-100 transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-zinc-900 text-white py-3 rounded-xl font-bold hover:bg-zinc-800 transition-all disabled:opacity-50"
            >
              {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>

        <div className="text-center mt-6">
          <a href="/" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
            ← Back to home
          </a>
        </div>
      </motion.div>
      <ErrorModal
        isOpen={!!error}
        onClose={() => setError(null)}
        title="Authentication Error"
        message={error || ''}
      />
    </div>
  );
}
