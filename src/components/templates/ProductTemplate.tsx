import { motion } from 'framer-motion';
import { useState } from 'react';

interface ProductTemplateProps {
  waitlist: {
    name: string;
    description: string;
    logoUrl?: string;
    primaryColor: string;
    ctaText: string;
    showCounter: boolean;
    features?: Array<{ icon: string; title: string; description: string }>;
    socialLinks?: Array<{ platform: string; url: string }>;
  };
  signupCount: number;
  onSignup: (email: string) => Promise<void>;
}

export function ProductTemplate({ waitlist, signupCount, onSignup }: ProductTemplateProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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
    <div className="min-h-screen bg-white">
      {/* Hero Section with Image */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {waitlist.logoUrl && (
              <img
                src={waitlist.logoUrl}
                alt={waitlist.name}
                className="h-12 mb-8"
              />
            )}

            <h1 className="text-5xl font-bold text-zinc-900 mb-6">
              {waitlist.name}
            </h1>

            <p className="text-xl text-zinc-600 mb-8 leading-relaxed">
              {waitlist.description}
            </p>

            {/* Signup Form */}
            {!success ? (
              <form onSubmit={handleSubmit} className="mb-8">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 px-6 py-4 rounded-lg border-2 border-zinc-200 focus:border-zinc-900 focus:outline-none text-lg"
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-4 rounded-lg font-semibold text-white text-lg transition-all disabled:opacity-50"
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
                className="p-6 bg-green-50 border-2 border-green-200 rounded-lg mb-8"
              >
                <p className="text-green-800 font-semibold text-lg">
                  ✓ You're on the list! Check your email for confirmation.
                </p>
              </motion.div>
            )}

            {waitlist.showCounter && (
              <p className="text-zinc-500 text-sm">
                Join <span className="font-bold text-zinc-900">{signupCount.toLocaleString()}</span> others on the waitlist
              </p>
            )}
          </motion.div>

          {/* Right: Product Image */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
              <div
                className="w-full h-full flex items-center justify-center text-white text-6xl font-bold"
                style={{ backgroundColor: waitlist.primaryColor }}
              >
                {waitlist.name.charAt(0)}
              </div>
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-xl p-6">
              <div className="text-4xl font-bold" style={{ color: waitlist.primaryColor }}>
                {signupCount}+
              </div>
              <div className="text-sm text-zinc-600">Early adopters</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      {waitlist.features && waitlist.features.length > 0 && (
        <div className="bg-zinc-50 py-20">
          <div className="container mx-auto px-4 max-w-7xl">
            <h2 className="text-3xl font-bold text-center text-zinc-900 mb-12">
              What makes us different
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {waitlist.features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div
                    className="text-4xl mb-4 w-14 h-14 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${waitlist.primaryColor}20` }}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-zinc-600 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Social Proof */}
      <div className="py-16 border-t border-zinc-200">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <p className="text-zinc-600 mb-6">Trusted by innovators worldwide</p>
          {waitlist.socialLinks && waitlist.socialLinks.length > 0 && (
            <div className="flex justify-center gap-6">
              {waitlist.socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-400 hover:text-zinc-900 transition-colors"
                >
                  <span className="text-2xl">{getSocialIcon(link.platform)}</span>
                </a>
              ))}
            </div>
          )}
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
