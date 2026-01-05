
import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Player, GameMode, Tier } from '../types';
import { TIER_GROUP_COLORS, MODES } from '../constants';
import { getMinecraftTorsoUrl, getArrowIcon } from '../utils';
import { ModeIcon } from './ModeIcon';

interface ModeDetailsProps {
  players: Player[];
}

const MAIN_TIERS = ['S', 'A', 'B', 'C', 'D', 'F'] as const;
type MainTier = typeof MAIN_TIERS[number];

const ModeDetails: React.FC<ModeDetailsProps> = ({ players }) => {
  const { mode } = useParams<{ mode: string }>();
  const gameMode = mode as GameMode;

  const modeInfo = useMemo(() => MODES.find(m => m.name === gameMode), [gameMode]);

  const playersByMainTier = useMemo(() => {
    const map: Record<MainTier, Player[]> = {
      'S': [],
      'A': [],
      'B': [],
      'C': [],
      'D': [],
      'F': []
    };
    
    players.forEach(p => {
      const tier = p.tiers[gameMode];
      if (!tier) return;
      
      if (tier === 'S') map['S'].push(p);
      else if (tier.startsWith('A')) map['A'].push(p);
      else if (tier.startsWith('B')) map['B'].push(p);
      else if (tier.startsWith('C')) map['C'].push(p);
      else if (tier.startsWith('D')) map['D'].push(p);
      else if (tier === 'F') map['F'].push(p);
    });

    Object.keys(map).forEach(key => {
      map[key as MainTier].sort((a, b) => {
        const tA = a.tiers[gameMode];
        const tB = b.tiers[gameMode];
        if (tA.includes('+') && !tB.includes('+')) return -1;
        if (!tA.includes('+') && tB.includes('+')) return 1;
        if (tA.includes('-') && !tB.includes('-')) return 1;
        if (!tA.includes('-') && tB.includes('-')) return -1;
        return a.nickname.localeCompare(b.nickname);
      });
    });
    
    return map;
  }, [players, gameMode]);

  if (!modeInfo) return <div className="p-20 text-center text-slate-500 font-bold">Mode not found</div>;

  return (
    <div className="min-h-screen flex flex-col space-y-12 animate-in fade-in duration-700 pb-32">
      {/* Enhanced Header */}
      <header className="flex flex-col md:flex-row items-center justify-between px-8 py-12 max-w-[1700px] mx-auto w-full gap-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-[#1e1e2f] rounded-xl flex items-center justify-center border border-white/10 shadow-2xl">
            <ModeIcon mode={modeInfo.name} className="w-10 h-10" />
          </div>
          <div className="space-y-1">
            <span className="text-red-800 font-black uppercase tracking-[0.4em] text-[10px] ml-1">Competitive Division</span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic text-white leading-none">
              {modeInfo.name} <span className="text-red-800">RANKINGS</span>
            </h1>
          </div>
        </div>
        <Link to="/" className="px-10 py-4 bg-white/5 hover:bg-red-800 hover:text-white text-slate-400 font-black italic rounded-2xl transition-all duration-300 uppercase text-[10px] border border-white/10 tracking-widest shadow-lg active:scale-95">
          Return to Registry
        </Link>
      </header>

      {/* Grid delle Tabelle - Less rounded, more compact */}
      <div className="container mx-auto px-6 max-w-[1900px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 items-start">
          {MAIN_TIERS.map(mainTier => {
            const tierPlayers = playersByMainTier[mainTier];
            const headerColor = TIER_GROUP_COLORS[mainTier];
            
            return (
              <div 
                key={mainTier} 
                className="flex flex-col rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 bg-[#12121a] h-full transition-all hover:scale-[1.01] duration-300"
              >
                {/* Header Block */}
                <div 
                  className="px-5 py-4 flex items-center justify-between border-b-2 border-black/20"
                  style={{ backgroundColor: headerColor }}
                >
                  <span className="text-xl font-black text-black italic tracking-tighter uppercase">TIER {mainTier}</span>
                  <span className="bg-black/15 px-2.5 py-1 rounded-lg text-black font-black text-[10px] shadow-sm border border-black/5">{tierPlayers.length}</span>
                </div>

                {/* List Container */}
                <div className="bg-[#08080c] flex flex-col flex-grow min-h-[400px]">
                  {tierPlayers.length === 0 ? (
                    <div className="flex-grow flex flex-col items-center justify-center opacity-10 py-32">
                      <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white">No Record</span>
                    </div>
                  ) : (
                    tierPlayers.map((p, idx) => {
                      const specificTier = p.tiers[gameMode];
                      const arrow = getArrowIcon(specificTier);
                      const arrowColor = arrow === '+' ? 'text-green-400' : arrow === '-' ? 'text-red-400' : 'text-slate-600';
                      
                      return (
                        <div 
                          key={p.id} 
                          className={`flex items-center justify-between px-4 py-3 hover:bg-white/[0.05] transition-all border-b border-white/[0.03] bg-[#0d0d14] group ${idx === tierPlayers.length - 1 ? 'border-b-0' : ''}`}
                        >
                          <div className="flex items-center gap-4 truncate">
                            {/* Full Skin Image */}
                            <div className="shrink-0 w-10 h-12 relative flex items-center justify-center">
                              <img 
                                src={getMinecraftTorsoUrl(p.nickname)} 
                                className="h-full w-auto object-contain drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] z-10 group-hover:scale-110 transition-transform duration-500"
                                alt=""
                                onError={(e) => { (e.target as HTMLImageElement).src = `https://mc-heads.net/body/${p.nickname}/128`; }}
                              />
                            </div>
                            
                            <div className="flex flex-col truncate">
                              <span className="font-black text-slate-100 text-xs uppercase tracking-tight truncate group-hover:text-white transition-all">
                                {p.nickname}
                              </span>
                              <div className="flex items-center gap-1">
                                <span className="text-[7px] font-black uppercase text-slate-500 tracking-widest">{p.region}</span>
                                <span className="text-[7px] font-black uppercase text-red-900/30">•</span>
                                <span className="text-[7px] font-black uppercase text-slate-500 tracking-widest">{specificTier}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center ml-2 shrink-0">
                            {arrow && (
                              <span className={`${arrowColor} font-black text-base drop-shadow-[0_0_8px_currentColor] group-hover:scale-125 transition-transform w-5 text-center`}>
                                {arrow}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ModeDetails;
