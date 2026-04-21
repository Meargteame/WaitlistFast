import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { api } from '../lib/api';
import DashboardLayout from '../components/DashboardLayout';
import ErrorModal from '../components/ErrorModal';

export default function CreateWaitlist() {
  const [step, setStep] = useState(1);
  const [productName, setProductName] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<any>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setGenerating(true);
    setError(null);

    try {
      const content = await api.waitlists.generate(productName, shortDescription);
      setGenerated(content);
      setStep(2);
    } catch (error: any) {
      // If AI generation fails, create a simple slug and move to step 2
      console.warn('AI generation failed, using fallback:', error);
      const slug = productName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      
      setGenerated({
        tagline: productName,
        description: shortDescription,
        slug: slug
      });
      setStep(2);
    } finally {
      setGenerating(false);
    }
  }

  async function handleCreate() {
    setCreating(true);
    setError(null);

    try {
      await api.waitlists.create(productName, generated.description, generated.slug);
      window.location.href = '/dashboard';
    } catch (error: any) {
      setError(error.message || 'Failed to create waitlist');
      setCreating(false);
    }
  }

  return (
    <DashboardLayout currentPage="create">
      <div className="py-12">
        <div className="max-w-3xl mx-auto px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">Create Your Waitlist</h1>
          <p className="text-zinc-500">Tell us about your product and we'll generate a beautiful page</p>
        </div>

        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-zinc-200 rounded-3xl p-12"
          >
            <form onSubmit={handleGenerate} className="space-y-8">
              <div>
                <label className="block text-sm font-bold mb-3">Product Name</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g., StudyAI"
                  className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-zinc-100 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-3">Short Description</label>
                <textarea
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="e.g., AI that summarizes university lectures in real-time"
                  rows={4}
                  className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-zinc-100 transition-all resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={generating}
                className="w-full bg-zinc-900 text-white py-5 rounded-2xl font-bold text-lg hover:bg-zinc-800 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {generating ? (
                  'Generating with AI...'
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate with AI
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}

        {step === 2 && generated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white border border-zinc-200 rounded-3xl p-12">
              <h2 className="text-2xl font-bold mb-8">Review Your Waitlist</h2>
              
              <div className="space-y-6 mb-8">
                <div>
                  <label className="block text-sm font-bold mb-2 text-zinc-500">Product Name</label>
                  <p className="text-xl font-bold">{productName}</p>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 text-zinc-500">Tagline</label>
                  <p className="text-lg">{generated.tagline}</p>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 text-zinc-500">Description</label>
                  <p className="text-zinc-600">{generated.description}</p>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 text-zinc-500">Your URL</label>
                  <p className="text-zinc-600 font-mono bg-zinc-50 px-4 py-3 rounded-xl">
                    waitlistfast.com/{generated.slug}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 border border-zinc-200 py-4 rounded-2xl font-bold hover:bg-zinc-50 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleCreate}
                  disabled={creating}
                  className="flex-1 bg-zinc-900 text-white py-4 rounded-2xl font-bold hover:bg-zinc-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {creating ? 'Creating...' : (
                    <>
                      Create Waitlist
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
        <ErrorModal
          isOpen={!!error}
          onClose={() => setError(null)}
          title="Generation Failed"
          message={error || ''}
        />
      </div>
    </div>
    </DashboardLayout>
  );
}
