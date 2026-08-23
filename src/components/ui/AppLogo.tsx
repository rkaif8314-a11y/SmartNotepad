'use client';

import React, { memo } from 'react';
import AppImage from './AppImage';

interface AppLogoProps {
  src?: string;
  size?: number;
  className?: string;
  onClick?: () => void;
}

const AppLogo = memo(function AppLogo({
  src = '/app-icon.svg',
  size = 32,
  className = '',
  onClick,
}: AppLogoProps) {
  return (
    <div
      className={`flex items-center ${onClick ? 'cursor-pointer hover:opacity-85 transition-opacity' : ''} ${className}`}
      onClick={onClick}
    >
      <AppImage
        src={src}
        alt="SmartNotepad"
        width={size}
        height={size}
        className="shrink-0 rounded-[10px]"
        priority
        unoptimized={src.endsWith('.svg')}
      />
    </div>
  );
});

export default AppLogo;
