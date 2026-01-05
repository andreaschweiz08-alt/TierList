
import { Tier, GameMode, ModeConfig } from './types';

export const TIER_SCORES: Record<Tier, number> = {
  'S': 50,
  'A+': 40,
  'A-': 35,
  'B+': 30,
  'B-': 25,
  'C+': 20,
  'C-': 15,
  'D+': 10,
  'D-': 5,
  'F': 0
};

export const TIERS_ORDERED: Tier[] = ['S', 'A+', 'A-', 'B+', 'B-', 'C+', 'C-', 'D+', 'D-', 'F'];

export const TIER_COLORS_PLAIN: Record<Tier, string> = {
  'S': 'border-[#FFD700] text-[#FFD700]',
  'A+': 'border-[#C0C0C0] text-[#C0C0C0]',
  'A-': 'border-[#A0A0A0] text-[#A0A0A0]',
  'B+': 'border-[#CD7F32] text-[#CD7F32]',
  'B-': 'border-[#B87333] text-[#B87333]',
  'C+': 'border-[#4A5568] text-[#4A5568]',
  'C-': 'border-[#3D4451] text-[#3D4451]',
  'D+': 'border-[#313844] text-[#313844]',
  'D-': 'border-[#2D3748] text-[#2D3748]',
  'F': 'border-[#1C222D] text-[#1C222D]'
};

export const TIER_GROUP_COLORS: Record<string, string> = {
  'S': '#FFD700',
  'A': '#C0C0C0',
  'B': '#CD7F32',
  'C': '#3D4451',
  'D': '#313844',
  'F': '#262C38'
};

export const TIER_COLORS_NEON: Record<Tier, string> = {
  'S': 'border-[#FFD700] text-[#FFD700] shadow-[0_0_10px_rgba(255,215,0,0.4)]',
  'A+': 'border-[#C0C0C0] text-[#C0C0C0] shadow-[0_0_10px_rgba(192,192,192,0.4)]',
  'A-': 'border-[#A0A0A0] text-[#A0A0A0] shadow-[0_0_8px_rgba(160,160,160,0.3)]',
  'B+': 'border-[#CD7F32] text-[#CD7F32] shadow-[0_0_8px_rgba(205,127,50,0.3)]',
  'B-': 'border-[#B87333] text-[#B87333]',
  'C+': 'border-[#3D4451] text-[#3D4451]',
  'C-': 'border-[#303640] text-[#303640]',
  'D+': 'border-[#2D3748] text-[#2D3748]',
  'D-': 'border-[#262C38] text-[#262C38]',
  'F': 'border-[#1C222D] text-[#1C222D]'
};

export const MODES: ModeConfig[] = [
  { name: GameMode.Bedwars, icon: '' },
  { name: GameMode.Boxing, icon: '' },
  { name: GameMode.Nodebuff, icon: '' },
  { name: GameMode.Battlerush, icon: '' },
  { name: GameMode.Classic, icon: '' },
  { name: GameMode.BuildUHC, icon: '' },
  { name: GameMode.Sumo, icon: '' },
  { name: GameMode.Bedfight, icon: '' }
];

export const DEFAULT_PLAYER_TIERS: any = {
  [GameMode.Bedwars]: 'F',
  [GameMode.Boxing]: 'F',
  [GameMode.Nodebuff]: 'F',
  [GameMode.Battlerush]: 'F',
  [GameMode.Classic]: 'F',
  [GameMode.BuildUHC]: 'F',
  [GameMode.Sumo]: 'F',
  [GameMode.Bedfight]: 'F',
};
