
import React from 'react';
import { Player, Region } from '../types';
import { MODES, TIER_COLORS_PLAIN } from '../constants';
import { getMinecraftTorsoUrl, getPlayerTitle } from '../utils';
import { Link } from 'react-router-dom';
import { ModeIcon } from './ModeIcon';

interface LeaderboardProps {
  players: Player[];
  onSelectPlayer: (player: Player) => void;
}

const getRegionStyles = (region: Region) => {
  switch (region) {
    case 'NA':
      return {
        bg: 'bg-[#3b0909]',
        border: 'border-red-900/30',
        text: 'text-[#ff4d4d]',
        shadow: 'rgba(255,0,0,0.3)',
        altShadow: 'rgba(0,255,255,0.3)'
      };
    case 'EU':
      return {
        bg: 'bg-[#091a3b]',
        border: 'border-blue-900/30',
        text: 'text-[#4d94ff]',
        shadow: 'rgba(0,0,255,0.3)',
        altShadow: 'rgba(255,255,0,0.3)'
      };
    case 'SA':
      return {
        bg: 'bg-[#093b16]',
        border: 'border-green-900/30',
        text: 'text-[#4dff88]',
        shadow: 'rgba(0,255,0,0.3)',
        altShadow: 'rgba(255,0,255,0.3)'
      };
    case 'AS':
      return {
        bg: 'bg-[#3b3509]',
        border: 'border-yellow-900/30',
        text: 'text-[#ffeb4d]',
        shadow: 'rgba(255,255,0,0.3)',
        altShadow: 'rgba(0,0,255,0.3)'
      };
    case 'OC':
      return {
        bg: 'bg-[#3b0933]',
        border: 'border-pink-900/30',
        text: 'text-[#ff4df2]',
        shadow: 'rgba(255,0,255,0.3)',
        altShadow: 'rgba(0,255,0,0.3)'
      };
    default:
      return {
        bg: 'bg-[#1a1d23]',
        border: 'border-white/10',
        text: 'text-white',
        shadow: 'rgba(255,255,255,0.1)',
        altShadow: 'rgba(255,255,255,0.1)'
      };
  }
};

const Leaderboard: React.FC<LeaderboardProps> = ({ players, onSelectPlayer }) => {
  const sortedPlayers = [...players].sort((a, b) => b.totalPoints - a.totalPoints);

  return (
    <div className="animate-in fade-in duration-700 max-w-[1700px] mx-auto space-y-12">
      {/* Header Section */}
      <div className="flex flex-col items-center text-center gap-8 py-6">
        <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-white italic uppercase leading-none select-none drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          ITALIAN <span className="text-red-800">LEADERBOARD</span>
        </h1>
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-center gap-2 max-w-full overflow-x-auto pb-4 no-scrollbar">
          <div className="flex flex-nowrap gap-2 bg-white/[0.02] p-2 rounded-2xl border border-white/5 items-center">
            {MODES.map(mode => (
              <Link 
                key={mode.name} 
                to={`/mode/${mode.name}`}
                className="flex items-center gap-3 px-5 py-2.5 rounded-xl hover:bg-red-800/10 border border-transparent hover:border-red-800/30 transition-all group whitespace-nowrap"
              >
                <ModeIcon mode={mode.name} className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-black text-[10px] tracking-widest uppercase italic text-slate-500 group-hover:text-white">{mode.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main Table Content - Less rounded, wider */}
      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#12141a] shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#1a1d23] text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] border-b border-white/5">
                <th className="px-10 py-5 text-left w-28">RANK</th>
                <th className="px-6 py-5 text-left min-w-[320px]">PLAYER</th>
                <th className="px-6 py-5 text-center w-40">REGION</th>
                <th className="px-6 py-5 text-center min-w-[480px]">COMBAT TIERS (8 MODES)</th>
                <th className="px-10 py-5 text-right w-48">SCORE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {sortedPlayers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-40 text-center text-slate-700 font-black uppercase tracking-[0.5em] italic">Database Empty</td>
                </tr>
              ) : (
                sortedPlayers.map((player, index) => {
                  const rank = index + 1;
                  const regStyle = getRegionStyles(player.region);
                  
                  // Rank styling
                  let rankColor = 'text-slate-700';
                  if (rank === 1) rankColor = 'text-[#ffd700] drop-shadow-[0_0_12px_rgba(255,215,0,0.3)]';
                  else if (rank === 2) rankColor = 'text-[#c0c0c0] drop-shadow-[0_0_12px_rgba(192,192,192,0.3)]';
                  else if (rank === 3) rankColor = 'text-[#cd7f32] drop-shadow-[0_0_12px_rgba(205,127,50,0.3)]';

                  return (
                    <tr 
                      key={player.id} 
                      onClick={() => onSelectPlayer(player)}
                      className="group cursor-pointer hover:bg-white/[0.03] transition-all duration-300 border-l-4 border-transparent hover:border-red-800 even:bg-white/[0.01]"
                    >
                      {/* Rank Column */}
                      <td className="px-10 py-4">
                        <span className={`text-4xl font-black italic tracking-tighter ${rankColor}`}>
                          {rank < 10 ? `0${rank}` : rank}
                        </span>
                      </td>

                      {/* Player Column */}
                      <td className="px-6 py-2">
                        <div className="flex items-center gap-6 relative">
                          <div className="relative w-16 h-20 shrink-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                             <img 
                                src={getMinecraftTorsoUrl(player.nickname)} 
                                alt=""
                                className="h-full w-auto object-contain drop-shadow-[0_8px_8px_rgba(0,0,0,0.6)] z-10"
                                onError={(e) => { (e.target as HTMLImageElement).src = `https://mc-heads.net/body/${player.nickname}/128`; }}
                             />
                          </div>

                          <div className="flex flex-col">
                            <span className="font-black text-white text-2xl group-hover:text-red-800 transition-colors tracking-tighter uppercase italic leading-none">
                              {player.nickname}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1.5">
                              {getPlayerTitle(player.totalPoints)} <span className={player.status === 'Active' ? 'text-green-500/50' : 'text-red-500/50'}>• {player.status}</span>
                            </span>
                          </div>
                        </div>
                      </td>
                      
                      {/* Region Column */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center">
                          <div className="relative group/glitch">
                            <div className={`w-16 h-16 ${regStyle.bg} rounded-xl flex items-center justify-center border ${regStyle.border} shadow-lg transition-all duration-500 group-hover:scale-105 overflow-hidden`}>
                              <span 
                                className={`font-black text-2xl uppercase tracking-tighter ${regStyle.text} relative z-10`}
                                style={{
                                  textShadow: `2px 0px 0px ${regStyle.shadow}, -2px 0px 0px ${regStyle.altShadow}`
                                }}
                              >
                                {player.region}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Tiers Column */}
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap items-center justify-center gap-2 max-w-[520px] mx-auto">
                          {MODES.map(mode => {
                            const tier = player.tiers[mode.name];
                            const tierStyle = TIER_COLORS_PLAIN[tier];
                            return (
                              <div 
                                key={mode.name} 
                                className={`relative w-10 h-10 rounded-lg bg-[#1a1a1a] border border-white/5 flex items-center justify-center transition-all hover:scale-110 group/tier shadow-md hover:border-white/20`}
                                title={`${mode.name}: ${tier}`}
                              >
                                <ModeIcon mode={mode.name} className="w-5 h-5 opacity-50 group-hover/tier:opacity-100 transition-all" />
                                <div className={`absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#0f1115] border border-inherit rounded flex items-center justify-center shadow-md ${tierStyle}`}>
                                  <span className="text-[9px] font-black leading-none tracking-tighter">{tier}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </td>

                      {/* Points Column */}
                      <td className="px-10 py-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-4xl font-black text-white italic tracking-tighter group-hover:text-red-800 transition-colors drop-shadow-lg">
                            {player.totalPoints}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
