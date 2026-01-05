import React, { useState } from 'react';
import { GameMode } from '../types';

interface ModeIconProps {
  mode: GameMode;
  className?: string;
}

export const ModeIcon: React.FC<ModeIconProps> = ({ mode, className = "w-6 h-6" }) => {
  const [imageError, setImageError] = useState(false);

  const getIconUrl = (mode: GameMode): string => {
    switch (mode) {
      case GameMode.Bedwars:
      case GameMode.Bedfight:
        return '/images/bed.png';
      case GameMode.Boxing:
        return '/images/chestplate.png';
      case GameMode.Nodebuff:
        return '/images/potion.png';
      case GameMode.BuildUHC:
        return '/images/gapple.png';
      case GameMode.Battlerush:
        return '/images/lilypad.png';
      case GameMode.Sumo:
        return '/images/lead.png';
      case GameMode.Classic:
        return '/images/sword.png';
      default:
        return '';
    }
  };

  const url = getIconUrl(mode);

  if (!url || imageError) {
    return (
      <div className={`${className} bg-slate-700 rounded flex items-center justify-center text-white text-xs font-bold`}>
        {mode.charAt(0)}
      </div>
    );
  }

  return (
    <img 
      src={url} 
      alt={mode} 
      className={`${className} object-contain`}
      style={{ imageRendering: 'pixelated' }}
      onError={() => {
        console.error('Cannot load image:', url);
        console.log('Mode:', mode);
        console.log('Expected file: public' + url);
        setImageError(true);
      }}
      onLoad={() => {
        console.log('Successfully loaded:', url);
      }}
    />
  );
};