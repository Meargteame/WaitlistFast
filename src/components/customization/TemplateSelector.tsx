import { motion } from 'framer-motion';
import { TEMPLATES, type TemplateId } from '../../lib/templates';

interface TemplateSelectorProps {
  selected: TemplateId;
  onChange: (templateId: TemplateId) => void;
}

export function TemplateSelector({ selected, onChange }: TemplateSelectorProps) {
  const templates = Object.values(TEMPLATES);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-zinc-900">Choose Template</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <motion.button
            key={template.id}
            onClick={() => onChange(template.id as TemplateId)}
            className={`relative p-4 rounded-xl border-2 transition-all text-left ${
              selected === template.id
                ? 'border-zinc-900 bg-zinc-50'
                : 'border-zinc-200 hover:border-zinc-300'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Preview placeholder */}
            <div className="aspect-video rounded-lg bg-gradient-to-br from-zinc-100 to-zinc-200 mb-3 flex items-center justify-center">
              <span className="text-4xl">{getTemplateIcon(template.id)}</span>
            </div>

            {/* Template info */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-zinc-900">{template.name}</h4>
                {selected === template.id && (
                  <span className="text-zinc-900">✓</span>
                )}
              </div>
              <p className="text-sm text-zinc-600">{template.description}</p>
            </div>

            {/* Selected indicator */}
            {selected === template.id && (
              <motion.div
                layoutId="selected-template"
                className="absolute inset-0 border-2 border-zinc-900 rounded-xl pointer-events-none"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function getTemplateIcon(templateId: string): string {
  const icons: Record<string, string> = {
    minimal: '◻️',
    startup: '🚀',
    bold: '⚡',
    product: '📦',
    comingSoon: '⏰',
  };
  return icons[templateId] || '📄';
}
