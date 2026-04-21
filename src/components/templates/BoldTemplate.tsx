import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

interface BoldTemplateProps {
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

export default function BoldTemplate({ waitlist, onSignup, preview = false }: BoldTemplateProps) {
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
        style={{ background: waitlist.background_value }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full text-center text-white"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-32 h-32 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mx-auto mb-8"
          >
            <CheckCircle2 className="w-16 h-16 text-white" />
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black mb-6">You're In! 🎉</h1>
          <p className="text-2xl md:text-3xl text-white/80 mb-8">
            Get ready for something amazing
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: waitlist.background_value }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute -top-1/2 -right-1/2 w-full h-full bg-white/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-white/5 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full text-center relative z-10"
      >
        {waitlist.logo_url && (
          <motion.img 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
            src={waitlist.logo_url} 
            alt={waitlist.name}
            className="w-24 h-24 mx-auto mb-8 rounded-3xl object-cover shadow-2xl"
          />
        )}
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-xl text-white text-sm font-bold mb-8"
        >
          <Sparkles className="w-4 h-4" />
          Coming Soon
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-6xl md:text-8xl font-black mb-8 leading-none text-white"
        >
          {waitlist.name}
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-2xl md:text-3xl text-white/90 mb-16 max-w-2xl mx-auto font-medium"
        >
          {waitlist.description}
        </motion.p>

        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onSubmit={handleSubmit} 
          className="max-w-xl mx-auto mb-12"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/50 w-6 h-6" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full pl-14 pr-6 py-5 bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-2xl focus:outline-none focus:border-white/40 transition-colors text-lg text-white placeholder-white/50"
                required
                disabled={preview}
              />
            </div>
            <button
              type="submit"
              disabled={loading || preview}
              className="px-10 py-5 bg-white text-zinc-900 rounded-2xl font-black text-lg transition-all disabled:opacity-50 hover:scale-105 flex items-center justify-center gap-3 shadow-2xl"
            >
              {loading ? 'Joining...' : waitlist.cta_text}
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </motion.form>

        {waitlist.show_counter && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-white/70 text-lg font-medium"
          >
            <span className="text-3xl font-black text-white">{waitlist.signupCount.toLocaleString()}</span> people already joined
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
