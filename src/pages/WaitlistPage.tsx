import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
import { api } from '../lib/api';
import { MinimalTemplate } from '../components/templates/MinimalTemplate';
import { StartupTemplate } from '../components/templates/StartupTemplate';
import { BoldTemplate } from '../components/templates/BoldTemplate';
import { ProductTemplate } from '../components/templates/ProductTemplate';
import { ComingSoonTemplate } from '../components/templates/ComingSoonTemplate';

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

  async function handleSubmit(email: string) {
    setSubmitting(true);

    try {
      const result = await api.waitlists.signup(slug, email);
      setPosition(result.position);
      setSuccess(true);
      setEmail(email);
    } catch (error: any) {
      alert(error.message);
      setSubmitting(false);
      throw error;
    }
  }

  const renderTemplate = () => {
    if (!waitlist || !waitlist.waitlist) return null;

    const w = waitlist.waitlist;
    const templateProps = {
      waitlist: {
        name: w.name,
        description: w.description,
        logoUrl: w.logo_url,
        primaryColor: w.primary_color || '#18181b',
        ctaText: w.cta_text || 'Join the waitlist',
        showCounter: w.show_counter !== 0,
        features: w.features_json ? JSON.parse(w.features_json) : [],
        socialLinks: w.social_links_json ? JSON.parse(w.social_links_json) : [],
      },
      signupCount: waitlist.signupCount || 0,
      onSignup: handleSubmit,
    };

    const template = w.template || 'minimal';

    switch (template) {
      case 'startup':
        return <StartupTemplate {...templateProps} />;
      case 'bold':
        return <BoldTemplate {...templateProps} />;
      case 'product':
        return <ProductTemplate {...templateProps} />;
      case 'comingSoon':
        return <ComingSoonTemplate {...templateProps} />;
      default:
        return <MinimalTemplate {...templateProps} />;
    }
  };

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

  return renderTemplate();
}
