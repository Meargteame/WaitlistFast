import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { TemplateSelector } from '../components/customization/TemplateSelector';
import { ColorPicker } from '../components/customization/ColorPicker';
import { FontSelector } from '../components/customization/FontSelector';
import { BackgroundPicker } from '../components/customization/BackgroundPicker';
import { LogoUploader } from '../components/customization/LogoUploader';
import { LivePreview } from '../components/customization/LivePreview';
import { api } from '../lib/api';
import type { TemplateId, FontPairId } from '../lib/templates';

export function Customize() {
  const slug = window.location.pathname.split('/customize/')[1];
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'template' | 'style' | 'content'>('template');

  const [config, setConfig] = useState({
    name: '',
    description: '',
    logoUrl: '',
    template: 'minimal' as TemplateId,
    primaryColor: '#18181b',
    fontFamily: 'inter' as FontPairId,
    backgroundType: 'solid' as 'solid' | 'gradient' | 'image',
    backgroundValue: '#FAFAFA',
    ctaText: 'Join the waitlist',
    showCounter: true,
    features: [] as Array<{ icon: string; title: string; description: string }>,
    socialLinks: [] as Array<{ platform: string; url: string }>,
  });

  useEffect(() => {
    loadWaitlist();
  }, [slug]);

  const loadWaitlist = async () => {
    if (!slug) return;

    try {
      const data = await api.waitlists.get(slug);
      setConfig({
        name: data.waitlist.name,
        description: data.waitlist.description,
        logoUrl: data.waitlist.logo_url || '',
        template: (data.waitlist.template || 'minimal') as TemplateId,
        primaryColor: data.waitlist.primary_color || '#18181b',
        fontFamily: (data.waitlist.font_family || 'inter') as FontPairId,
        backgroundType: (data.waitlist.background_type || 'solid') as any,
        backgroundValue: data.waitlist.background_value || '#FAFAFA',
        ctaText: data.waitlist.cta_text || 'Join the waitlist',
        showCounter: data.waitlist.show_counter !== 0,
        features: data.waitlist.features_json ? JSON.parse(data.waitlist.features_json) : [],
        socialLinks: data.waitlist.social_links_json ? JSON.parse(data.waitlist.social_links_json) : [],
      });
    } catch (error) {
      console.error('Failed to load waitlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!slug) return;

    setSaving(true);
    try {
      await api.waitlists.update(slug, {
        template: config.template,
        primaryColor: config.primaryColor,
        fontFamily: config.fontFamily,
        backgroundType: config.backgroundType,
        backgroundValue: config.backgroundValue,
        ctaText: config.ctaText,
        showCounter: config.showCounter,
        logoUrl: config.logoUrl,
        features: config.features,
        socialLinks: config.socialLinks,
      });

      alert('Customization saved!');
      window.location.href = '/dashboard';
    } catch (error: any) {
      alert(error.message || 'Failed to save customization');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-zinc-600">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 bg-white">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Customize Waitlist</h1>
            <p className="text-zinc-600 mt-1">{config.name}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="px-4 py-2 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Customization panel */}
          <div className="w-96 border-r border-zinc-200 bg-white overflow-y-auto">
            {/* Tabs */}
            <div className="flex border-b border-zinc-200">
              {[
                { id: 'template', label: 'Template' },
                { id: 'style', label: 'Style' },
                { id: 'content', label: 'Content' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-zinc-900 border-b-2 border-zinc-900'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="p-6 space-y-6">
              {activeTab === 'template' && (
                <TemplateSelector
                  selected={config.template}
                  onChange={(template) => setConfig({ ...config, template })}
                />
              )}

              {activeTab === 'style' && (
                <>
                  <ColorPicker
                    value={config.primaryColor}
                    onChange={(primaryColor) => setConfig({ ...config, primaryColor })}
                  />

                  <FontSelector
                    value={config.fontFamily}
                    onChange={(fontFamily) => setConfig({ ...config, fontFamily })}
                  />

                  <BackgroundPicker
                    type={config.backgroundType}
                    value={config.backgroundValue}
                    onTypeChange={(backgroundType) => setConfig({ ...config, backgroundType })}
                    onValueChange={(backgroundValue) => setConfig({ ...config, backgroundValue })}
                  />

                  <LogoUploader
                    value={config.logoUrl}
                    onChange={(logoUrl) => setConfig({ ...config, logoUrl })}
                  />
                </>
              )}

              {activeTab === 'content' && (
                <>
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-zinc-900">
                      Button Text
                    </label>
                    <input
                      type="text"
                      value={config.ctaText}
                      onChange={(e) => setConfig({ ...config, ctaText: e.target.value })}
                      className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900"
                      maxLength={50}
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.showCounter}
                        onChange={(e) => setConfig({ ...config, showCounter: e.target.checked })}
                        className="w-4 h-4 rounded border-zinc-300"
                      />
                      <span className="text-sm font-medium text-zinc-900">
                        Show signup counter
                      </span>
                    </label>
                  </div>

                  <div className="text-sm text-zinc-600">
                    Features and social links coming soon...
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right: Live preview */}
          <div className="flex-1 bg-zinc-100">
            <LivePreview waitlist={config} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
