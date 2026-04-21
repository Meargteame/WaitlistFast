import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface ComingSoonTemplateProps {
  waitlist: {
    name: string;
    description: string;
    logoUrl?: string;
    primaryColor: string;
    ctaText: string;
    showCounter: boolean;
    socialLinks?: Array<{ platform: string; url: string }>;
  };
  signupCount: number;
  onSignup: (email: string) => Promise<void>;
}

export function ComingSoonTemplate({ waitlist, signupCount, onSignup }: ComingSoonTemplateProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Countdown timer (example: 30 days from now)
  const [timeLeft, setTimeLeft] = useState({
    days: 30,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 30);

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || loading) return;

    setLoading(true);
    try {
      await onSignup(email);
      setSuccess(true);
      setEmail('');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${waitlist.primaryColor}15 0%, ${waitlist.primaryColor}05 100%)`,
      }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute w-96 h-96 rounded-full opacity-20"
          style={{ 
            backgroundColor: waitlist.primaryColor,
            top: '10%', 
            left: '10%' 
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute w-64 h-64 rounded-full opacity-20"
          style={{ 
            backgroundColor: waitlist.primaryColor,
            bottom: '10%', 
            right: '10%' 
          }}
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Logo */}
          {waitlist.logoUrl && (
            <motion.img
              src={waitlist.logoUrl}
              alt={waitlist.name}
              className="h-16 mx-auto mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            />
          )}

          {/* Title */}
          <motion.h1
            className="text-6xl md:text-7xl font-bold text-zinc-900 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {waitlist.name}
          </motion.h1>

          {/* Description */}
          <motion.p
            className="text-xl md:text-2xl text-zinc-600 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {waitlist.description}
          </motion.p>

          {/* Countdown Timer */}
          <motion.div
            className="grid grid-cols-4 gap-4 md:gap-8 mb-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {[
              { label: 'Days', value: timeLeft.days },
              { label: 'Hours', value: timeLeft.hours },
              { label: 'Minutes', value: timeLeft.minutes },
              { label: 'Seconds', value: timeLeft.seconds },
            ].map((item, index) => (
              <div
                key={item.label}
                className="bg-white rounded-2xl shadow-lg p-6 md:p-8"
              >
                <div
                  className="text-4xl md:text-5xl font-bold mb-2"
                  style={{ color: waitlist.primaryColor }}
                >
                  {String(item.value).padStart(2, '0')}
                </div>
                <div className="text-sm md:text-base text-zinc-600 uppercase tracking-wide">
                  {item.label}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Signup Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {!success ? (
              <form onSubmit={handleSubmit} className="mb-8">
                <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 px-6 py-4 rounded-xl border-2 border-zinc-200 focus:border-zinc-900 focus:outline-none text-lg bg-white"
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-4 rounded-xl font-semibold text-white text-lg transition-all disabled:opacity-50 hover:scale-105"
                    style={{ backgroundColor: waitlist.primaryColor }}
                  >
                    {loading ? 'Joining...' : waitlist.ctaText}
                  </button>
                </div>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 bg-white border-2 rounded-xl mb-8 max-w-xl mx-auto"
                style={{ borderColor: waitlist.primaryColor }}
              >
                <p className="font-semibold text-lg" style={{ color: waitlist.primaryColor }}>
                  ✓ You're in! We'll notify you when we launch.
                </p>
              </motion.div>
            )}

            {waitlist.showCounter && (
              <p className="text-zinc-600">
                <span className="font-bold text-zinc-900 text-2xl">{signupCount.toLocaleString()}</span>
                {' '}people waiting
              </p>
            )}
          </motion.div>

          {/* Social Links */}
          {waitlist.socialLinks && waitlist.socialLinks.length > 0 && (
            <motion.div
              className="flex justify-center gap-6 mt-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              {waitlist.socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-zinc-600 hover:text-white transition-all hover:scale-110"
                  style={{
                    '--hover-bg': waitlist.primaryColor,
                  } as any}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = waitlist.primaryColor;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  <span className="text-xl">{getSocialIcon(link.platform)}</span>
                </a>
              ))}
            </motion.div>
          )}

          {/* Mystery teaser */}
          <motion.div
            className="mt-16 text-zinc-500 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            Something amazing is coming...
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function getSocialIcon(platform: string): string {
  const icons: Record<string, string> = {
    twitter: '𝕏',
    linkedin: 'in',
    facebook: 'f',
    instagram: '📷',
    github: '⚡',
  };
  return icons[platform] || '🔗';
}
