import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, CheckCircle2, Zap, Shield, TrendingUp, Users as UsersIcon } from 'lucide-react';

interface StartupTemplateProps {
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

export default function StartupTemplate({ waitlist, onSignup, preview = false }: StartupTemplateProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const features = [
    { icon: Zap, title: 'Lightning Fast', description: 'Built for speed and performance' },
    { icon: Shield, title: 'Secure by Default', description: 'Your data is always protected' },
    { icon: TrendingUp, title: 'Scale with Ease', description: 'Grows with your business' },
  ];

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
          className="max-w-lg w-full text-center bg-white rounded-3xl p-12 shadow-2xl"
        >
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: waitlist.primary_color }}
          >
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Welcome aboard!</h2>
          <p className="text-xl text-zinc-600">
            You're now on the waitlist. We'll notify you when we launch.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen px-4 py-16"
      style={{ backgroundColor: waitlist.background_value }}
    >
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          {waitlist.logo_url && (
            <img 
              src={waitlist.logo_url} 
              alt={waitlist.name}
              className="w-16 h-16 mx-auto mb-8 rounded-2xl object-cover"
            />
          )}
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            {waitlist.name}
          </h1>
          
          <p className="text-xl md:text-2xl text-zinc-600 mb-12 max-w-3xl mx-auto">
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
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-zinc-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-opacity-20 transition-all text-lg"
                  style={{ focusRingColor: waitlist.primary_color }}
                  required
                  disabled={preview}
                />
              </div>
              <button
                type="submit"
                disabled={loading || preview}
                className="px-8 py-4 rounded-xl font-bold text-lg text-white transition-all disabled:opacity-50 hover:opacity-90 whitespace-nowrap shadow-lg"
                style={{ backgroundColor: waitlist.primary_color }}
              >
                {loading ? 'Joining...' : waitlist.cta_text}
              </button>
            </div>
          </form>

          {waitlist.show_counter && (
            <div className="flex items-center justify-center gap-2 text-zinc-500">
              <UsersIcon className="w-5 h-5" />
              <span className="font-medium">
                Join {waitlist.signupCount.toLocaleString()}+ people on the waitlist
              </span>
            </div>
          )}
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                style={{ backgroundColor: `${waitlist.primary_color}20` }}
              >
                <feature.icon 
                  className="w-6 h-6" 
                  style={{ color: waitlist.primary_color }}
                />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-zinc-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <p className="text-zinc-500 mb-6">Trusted by innovative teams</p>
          <div className="flex justify-center items-center gap-8 opacity-50">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-24 h-8 bg-zinc-200 rounded"></div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
