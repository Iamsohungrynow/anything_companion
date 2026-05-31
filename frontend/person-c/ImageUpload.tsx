// ============================================================
// Image Upload Component
// ============================================================
import React, { useRef } from 'react';
import { Scenario } from './index';

interface Props {
  scenario: Scenario | null;
  onImageSelected: (imageUrl: string | null) => void;
  onBack: () => void;
}

const defaultImages: Record<Scenario, string> = {
  study: '☕',
  acg: '✨',
  pet: '🐾',
};

export default function ImageUpload({ scenario, onImageSelected, onBack }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      onImageSelected(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleDefaultImage = () => {
    onImageSelected(null); // null means use emoji default
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-black text-gray-800">Upload or Choose</h1>
          <p className="text-gray-600 text-sm mt-2">Select an image for your {scenario} companion</p>
        </div>

        {/* Upload button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-6 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-95"
        >
          📤 Upload Image
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-300"/>
          <span className="text-gray-500 text-sm font-medium">Or</span>
          <div className="flex-1 h-px bg-gray-300"/>
        </div>

        {/* Default option */}
        <button
          onClick={handleDefaultImage}
          className="w-full py-6 rounded-2xl border-2 border-gray-300 bg-white text-gray-700 font-bold text-lg hover:bg-gray-50 transition-all"
        >
          {defaultImages[scenario || 'study']} Use Default
        </button>

        {/* Back button */}
        <button
          onClick={onBack}
          className="w-full py-3 text-gray-600 font-semibold hover:text-gray-800"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}
