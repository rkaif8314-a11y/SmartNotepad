'use client';

import React, { memo } from 'react';
import AppIcon from './AppIcon';
import AppImage from './AppImage';

interface AppLogoProps {
  src?: string;
  iconName?: string;
  size?: number;
  className?: string;
  onClick?: () => void;
}

const AppLogo = memo(function AppLogo({
  src,
  iconName = 'SparklesIcon',
  size = 32,
  className = '',
  onClick,
}: AppLogoProps) {
  const content = src ? (
    <AppImage
      src={src}
      alt="SmartNotepad"
      width={size}
      height={size}
      className="shrink-0 rounded-[10px]"
      priority
      unoptimized={src.endsWith('.svg')}
    />
  ) : (
    <span
      aria-hidden="true"
      className="grid shrink-0 place-items-center rounded-[10px] bg-primary text-primary-foreground shadow-sm"
      style={{ width: size, height: size }}
    >
      <AppIcon name={iconName} size={Math.max(16, Math.round(size * 0.58))} className="text-current" />
    </span>
  );

  return (
    <div
      className={`flex items-center ${onClick ? 'cursor-pointer hover:opacity-85 transition-opacity' : ''} ${className}`}
      onClick={onClick}
    >
      {content}
    </div>
  );
});

export default AppLogo;
