import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Users, CheckCircle2 } from 'lucide-react';

interface MinimalTemplateProps {
  waitlist: {
    name: string;
    description: string;
    logo_url?: string;
    primary_color: string;
    background_value: string;
    cta_text: string;
    show_counter: boolean;
    signupCount: number;
  };
  onSignup: (email: string) => Promise<void>;
  preview?: boolean;
}

export default function MinimalTemplate({ waitlist, onSignup, preview = false }: MinimalTemplateProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (preview) return;
    
    setLoading(true);
    try {
      await onSignup(email);
      setSuccess(true);
    } catch (error) {
      alert('Failed to join waitlist');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: waitlist.background_value }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: waitlist.primary_color }}
          >
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-4">You're on the list!</h1>
          <p className="text-xl text-zinc-600 mb-8">
            We'll email you when we launch.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ backgroundColor: waitlist.background_value }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full text-center"
      >
        {waitlist.logo_url && (
          <img 
            src={waitlist.logo_url} 
            alt={waitlist.name}
            className="w-20 h-20 mx-auto mb-8 rounded-2xl object-cover"
          />
        )}
        
        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          {waitlist.name}
        </h1>
        
        <p className="text-xl md:text-2xl text-zinc-600 mb-12 max-w-xl mx-auto">
          {waitlist.description}
        </p>

        <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-zinc-200 rounded-xl focus:outline-none focus:border-zinc-900 transition-colors text-lg"
                required
                disabled={preview}
              />
            </div>
            <button
              type="submit"
              disabled={loading || preview}
              className="px-8 py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-50 whitespace-nowrap"
              style={{ 
                backgroundColor: waitlist.primary_color,
                color: '#ffffff'
              }}
            >
              {loading ? 'Joining...' : waitlist.cta_text}
            </button>
          </div>
        </form>

        {waitlist.show_counter && (
          <div className="flex items-center justify-center gap-2 text-zinc-500">
            <Users className="w-5 h-5" />
            <span className="font-medium">
              {waitlist.signupCount.toLocaleString()} people on the waitlist
            </span>
          </div>
        )}
      </motion.div>
    </div>
  );
}
