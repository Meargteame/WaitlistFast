import { useState } from 'react';

interface LogoUploaderProps {
  value?: string;
  onChange: (url: string) => void;
}

export function LogoUploader({ value, onChange }: LogoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      // For now, create a local URL
      // In production, upload to S3/R2
      const url = URL.createObjectURL(file);
      onChange(url);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-zinc-900">Logo</label>

      {/* Upload area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-8 transition-all ${
          dragActive
            ? 'border-zinc-900 bg-zinc-50'
            : 'border-zinc-200 hover:border-zinc-300'
        }`}
      >
        <input
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />

        <div className="text-center">
          {value ? (
            <div className="space-y-3">
              <img
                src={value}
                alt="Logo preview"
                className="h-16 mx-auto object-contain"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onChange('');
                }}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Remove logo
              </button>
            </div>
          ) : (
            <>
              <div className="text-4xl mb-2">📷</div>
              <div className="text-sm text-zinc-600 mb-1">
                {uploading ? 'Uploading...' : 'Drop your logo here or click to browse'}
              </div>
              <div className="text-xs text-zinc-500">
                PNG, JPG, SVG up to 5MB
              </div>
            </>
          )}
        </div>
      </div>

      {/* URL input alternative */}
      <div className="text-center text-sm text-zinc-600">or</div>
      <input
        type="url"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter logo URL"
        className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-900"
      />
    </div>
  );
}
