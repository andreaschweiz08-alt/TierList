
import { PlayerTiers, Tier } from './types';
import { TIER_SCORES } from './constants';

export const calculateTotalPoints = (tiers: PlayerTiers): number => {
  return Object.values(tiers).reduce((acc, tier) => acc + TIER_SCORES[tier as Tier], 0);
};

export const getMinecraftFaceUrl = (username: string): string => {
  // mc-heads.net è più veloce e affidabile per i volti piatti con overlay
  return `https://mc-heads.net/avatar/${username}/64`;
};

export const getMinecraftBodyUrl = (username: string): string => {
  return `https://mc-heads.net/player/${username}/512`;
};

export const getMinecraftTorsoUrl = (username: string): string => {
  // Visage per il busto 3D (profilo)
  return `https://visage.surgeplay.com/bust/512/${username}`;
};

export const getNameMCLink = (username: string): string => {
  return `https://namemc.com/profile/${username}`;
};

export const getArrowIcon = (tier: Tier): string => {
  if (tier.includes('+')) return '+';
  if (tier.includes('-')) return '-';
  return '';
};

export const getPlayerTitle = (points: number): string => {
  if (points >= 360) return 'Grand Champion';
  if (points >= 321) return 'Champion';
  if (points >= 271) return 'Emerald';
  if (points >= 201) return 'Diamond';
  if (points >= 141) return 'Platinum';
  if (points >= 91) return 'Gold';
  if (points >= 51) return 'Silver';
  if (points >= 21) return 'Bronze';
  return 'Copper';
};
