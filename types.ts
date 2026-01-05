
export type Tier = 'S' | 'A+' | 'A-' | 'B+' | 'B-' | 'C+' | 'C-' | 'D+' | 'D-' | 'F';

export enum GameMode {
  Bedwars = 'Bedwars',
  Boxing = 'Boxing',
  Nodebuff = 'Nodebuff',
  Battlerush = 'Battlerush',
  Classic = 'Classic',
  BuildUHC = 'Build UHC',
  Sumo = 'Sumo',
  Bedfight = 'Bedfight'
}

export type Region = 'EU' | 'NA' | 'SA' | 'AS' | 'OC';
export type PlayerStatus = 'Active' | 'Retired';

export interface PlayerTiers {
  [GameMode.Bedwars]: Tier;
  [GameMode.Boxing]: Tier;
  [GameMode.Nodebuff]: Tier;
  [GameMode.Battlerush]: Tier;
  [GameMode.Classic]: Tier;
  [GameMode.BuildUHC]: Tier;
  [GameMode.Sumo]: Tier;
  [GameMode.Bedfight]: Tier;
}

export interface Player {
  id: string;
  nickname: string;
  region: Region;
  status: PlayerStatus;
  tiers: PlayerTiers;
  totalPoints: number;
}

export interface ModeConfig {
  name: GameMode;
  icon: string;
}
