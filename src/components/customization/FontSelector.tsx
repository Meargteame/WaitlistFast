import { FONT_PAIRS, type FontPairId } from '../../lib/templates';

interface FontSelectorProps {
  value: FontPairId;
  onChange: (fontId: FontPairId) => void;
}

export function FontSelector({ value, onChange }: FontSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-zinc-900">Font Family</label>
      
      <div className="space-y-2">
        {FONT_PAIRS.map((font) => (
          <button
            key={font.id}
            onClick={() => onChange(font.id)}
            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
              value === font.id
                ? 'border-zinc-900 bg-zinc-50'
                : 'border-zinc-200 hover:border-zinc-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-zinc-900 mb-1">{font.name}</div>
                <div className="text-sm text-zinc-600">
                  {font.heading} / {font.body}
                </div>
              </div>
              {value === font.id && (
                <span className="text-zinc-900 text-lg">✓</span>
              )}
            </div>
            
            {/* Font preview */}
            <div className="mt-3 pt-3 border-t border-zinc-200">
              <div className="text-lg font-bold mb-1" style={{ fontFamily: font.heading }}>
                The quick brown fox
              </div>
              <div className="text-sm text-zinc-600" style={{ fontFamily: font.body }}>
                jumps over the lazy dog
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
