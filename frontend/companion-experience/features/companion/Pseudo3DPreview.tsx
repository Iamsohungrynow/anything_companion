// ============================================================
// Pseudo 3D Preview
// ============================================================
// Simple avatar display with optional emoji or image fallback
// Person D owns visual fallback reliability
// ============================================================

import React from 'react';
import { CompanionCard } from '../../shared/types';

interface Props {
  companion: CompanionCard;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-8 h-8 text-base',
  md: 'w-12 h-12 text-2xl',
  lg: 'w-24 h-24 text-6xl',
};

export default function Pseudo3DPreview({ companion, size = 'md' }: Props) {
  const sizeClass = sizeClasses[size];

  return (
    <div className={`${sizeClass} rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-white shadow-sm overflow-hidden select-none`}>
      {companion.imageUrl ? (
        <img
          src={companion.imageUrl}
          alt={companion.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to emoji if image fails
            (e.target as any).style.display = 'none';
          }}
        />
      ) : (
        <span className="animate-bounce">{companion.emoji || '😊'}</span>
      )}
    </div>
  );
}
