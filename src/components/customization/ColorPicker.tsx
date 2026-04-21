import { useState } from 'react';
import { PRESET_COLORS } from '../../lib/colors';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
}

export function ColorPicker({ value, onChange, label = 'Primary Color' }: ColorPickerProps) {
  const [showCustom, setShowCustom] = useState(false);

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-zinc-900">{label}</label>
      
      {/* Preset colors */}
      <div className="grid grid-cols-6 gap-2">
        {PRESET_COLORS.map((preset) => (
          <button
            key={preset.value}
            onClick={() => onChange(preset.value)}
            className={`relative w-full aspect-square rounded-lg transition-all ${
              value === preset.value
                ? 'ring-2 ring-zinc-900 ring-offset-2 scale-110'
                : 'hover:scale-105'
            }`}
            style={{ backgroundColor: preset.value }}
            title={preset.name}
          >
            {value === preset.value && (
              <span className="absolute inset-0 flex items-center justify-center text-white text-lg">
                ✓
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Custom color input */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowCustom(!showCustom)}
          className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          {showCustom ? '− Hide' : '+ Custom color'}
        </button>
      </div>

      {showCustom && (
        <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-lg">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-12 h-12 rounded cursor-pointer"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#000000"
            className="flex-1 px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900"
            pattern="^#[0-9A-Fa-f]{6}$"
          />
        </div>
      )}

      {/* Current color preview */}
      <div className="flex items-center gap-3 p-3 bg-white border border-zinc-200 rounded-lg">
        <div
          className="w-10 h-10 rounded-lg"
          style={{ backgroundColor: value }}
        />
        <div className="flex-1">
          <div className="text-sm font-medium text-zinc-900">Current color</div>
          <div className="text-xs text-zinc-600">{value}</div>
        </div>
      </div>
    </div>
  );
}
