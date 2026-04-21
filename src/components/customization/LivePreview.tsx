import { MinimalTemplate } from '../templates/MinimalTemplate';
import { StartupTemplate } from '../templates/StartupTemplate';
import { BoldTemplate } from '../templates/BoldTemplate';
import { ProductTemplate } from '../templates/ProductTemplate';
import { ComingSoonTemplate } from '../templates/ComingSoonTemplate';
import type { TemplateId } from '../../lib/templates';

interface LivePreviewProps {
  waitlist: {
    name: string;
    description: string;
    logoUrl?: string;
    template: TemplateId;
    primaryColor: string;
    fontFamily: string;
    backgroundType: 'solid' | 'gradient' | 'image';
    backgroundValue: string;
    ctaText: string;
    showCounter: boolean;
    features?: Array<{ icon: string; title: string; description: string }>;
    socialLinks?: Array<{ platform: string; url: string }>;
  };
  signupCount?: number;
}

export function LivePreview({ waitlist, signupCount = 42 }: LivePreviewProps) {
  const mockOnSignup = async (email: string) => {
    console.log('Preview signup:', email);
  };

  const renderTemplate = () => {
    const props = {
      waitlist,
      signupCount,
      onSignup: mockOnSignup,
    };

    switch (waitlist.template) {
      case 'minimal':
        return <MinimalTemplate {...props} />;
      case 'startup':
        return <StartupTemplate {...props} />;
      case 'bold':
        return <BoldTemplate {...props} />;
      case 'product':
        return <ProductTemplate {...props} />;
      case 'comingSoon':
        return <ComingSoonTemplate {...props} />;
      default:
        return <MinimalTemplate {...props} />;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Preview header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 bg-white">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="text-sm text-zinc-600 ml-2">Live Preview</span>
        </div>
        <div className="text-xs text-zinc-500">
          Changes update in real-time
        </div>
      </div>

      {/* Preview content */}
      <div className="flex-1 overflow-auto bg-zinc-100">
        <div className="min-h-full">
          {renderTemplate()}
        </div>
      </div>
    </div>
  );
}
