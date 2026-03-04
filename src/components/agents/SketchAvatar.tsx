import React from 'react';

interface SketchAvatarProps {
  src: string;
  alt: string;
  isActive: boolean;
  isPremium?: boolean;
  isLocked?: boolean;
  size?: string;
}

export const SketchAvatar: React.FC<SketchAvatarProps> = ({
  src, alt, isActive, isPremium, isLocked, size = "w-16 h-16"
}) => (
  <div className={`relative ${size} flex-shrink-0 sketch-avatar-wrapper ${isActive ? 'sketch-active' : ''}`}>
    <div className={`w-full h-full rounded-full overflow-hidden border transition-all duration-700 bg-[#F5F5F0] relative
      ${isActive ? 'border-ink shadow-md' : 'border-[#E0E0E0]'}
      ${isLocked ? 'opacity-50' : ''}`}>
      <img src={src} className="w-full h-full object-cover sketch-avatar" alt={alt} loading="lazy" />
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60">
          <span className="text-2xl">🔒</span>
        </div>
      )}
    </div>
    {isPremium && !isLocked && (
      <div className="absolute -top-1 -right-1 w-5 h-5 bg-ink text-white rounded-full flex items-center justify-center border border-white shadow-sm z-10">
        <span className="text-[9px] serif-tc italic font-bold">P</span>
      </div>
    )}
  </div>
);
