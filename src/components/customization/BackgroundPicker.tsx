import { useState } from 'react';
import { GRADIENT_PRESETS } from '../../lib/colors';

interface BackgroundPickerProps {
  type: 'solid' | 'gradient' | 'image';
  value: string;
  onTypeChange: (type: 'solid' | 'gradient' | 'image') => void;
  onValueChange: (value: string) => void;
}

export function BackgroundPicker({ type, value, onTypeChange, onValueChange }: BackgroundPickerProps) {
  const [imageUrl, setImageUrl] = useState('');

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-zinc-900">Background</label>

      {/* Type selector */}
      <div className="flex gap-2">
        {(['solid', 'gradient', 'image'] as const).map((t) => (
          <button
            key={t}
            onClick={() => onTypeChange(t)}
            className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all capitalize ${
              type === t
                ? 'border-zinc-900 bg-zinc-900 text-white'
                : 'border-zinc-200 hover:border-zinc-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Solid color */}
      {type === 'solid' && (
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={value}
              onChange={(e) => onValueChange(e.target.value)}
              className="w-12 h-12 rounded cursor-pointer"
            />
            <input
              type="text"
              value={value}
              onChange={(e) => onValueChange(e.target.value)}
              placeholder="#FAFAFA"
              className="flex-1 px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900"
            />
          </div>
        </div>
      )}

      {/* Gradient */}
      {type === 'gradient' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {GRADIENT_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => onValueChange(preset.value)}
                className={`relative h-20 rounded-lg transition-all ${
                  value === preset.value
                    ? 'ring-2 ring-zinc-900 ring-offset-2'
                    : 'hover:scale-105'
                }`}
                style={{ background: preset.value }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-sm font-medium bg-black/30 px-3 py-1 rounded">
                    {preset.name}
                  </span>
                </div>
                {value === preset.value && (
                  <span className="absolute top-2 right-2 text-white text-lg">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Image */}
      {type === 'image' && (
        <div className="space-y-3">
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => {
              setImageUrl(e.target.value);
              onValueChange(e.target.value);
            }}
            placeholder="Enter image URL"
            className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900"
          />
          <div className="text-sm text-zinc-600">
            Or upload an image (coming soon)
          </div>
          {value && (
            <div
              className="h-32 rounded-lg bg-cover bg-center"
              style={{ backgroundImage: `url(${value})` }}
            />
          )}
        </div>
      )}

      {/* Preview */}
      <div className="p-4 rounded-lg border border-zinc-200">
        <div className="text-sm font-medium text-zinc-900 mb-2">Preview</div>
        <div
          className="h-24 rounded-lg"
          style={
            type === 'solid'
              ? { backgroundColor: value }
              : type === 'gradient'
              ? { background: value }
              : { backgroundImage: `url(${value})`, backgroundSize: 'cover', backgroundPosition: 'center' }
          }
        />
      </div>
    </div>
  );
}
