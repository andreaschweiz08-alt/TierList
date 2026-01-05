
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { Player, GameMode, Tier, Region, PlayerStatus, PlayerTiers } from './types';
import { calculateTotalPoints, getPlayerTitle, getMinecraftTorsoUrl, getMinecraftFaceUrl, getNameMCLink } from './utils';
import { MODES, DEFAULT_PLAYER_TIERS, TIER_COLORS_NEON } from './constants';
import Leaderboard from './components/Leaderboard';
import ModeDetails from './components/ModeDetails';
import AdminPanel from './components/AdminPanel';
import Navbar from './components/Navbar';
import { ModeIcon } from './components/ModeIcon';

export interface AdminLog {
  id: string;
  nickname: string;
  timestamp: string;
}

// Fixed type inference issues for INITIAL_PLAYERS by explicitly casting union types and tier maps
const INITIAL_PLAYERS: Player[] = [
  {
    id: '1',
    nickname: 'k1rom_',
    region: 'EU' as Region,
    status: 'Active' as PlayerStatus,
    tiers: {
      [GameMode.Bedwars]: 'S' as Tier,
      [GameMode.Boxing]: 'S' as Tier,
      [GameMode.Nodebuff]: 'A+' as Tier,
      [GameMode.Battlerush]: 'S' as Tier,
      [GameMode.Classic]: 'A+' as Tier,
      [GameMode.BuildUHC]: 'S' as Tier,
      [GameMode.Sumo]: 'S' as Tier,
      [GameMode.Bedfight]: 'A+' as Tier
    },
    totalPoints: 0
  },
  {
    id: '2',
    nickname: 'madetheandrea',
    region: 'EU' as Region,
    status: 'Active' as PlayerStatus,
    tiers: {
      [GameMode.Bedwars]: 'A+' as Tier,
      [GameMode.Boxing]: 'S' as Tier,
      [GameMode.Nodebuff]: 'S' as Tier,
      [GameMode.Battlerush]: 'A+' as Tier,
      [GameMode.Classic]: 'S' as Tier,
      [GameMode.BuildUHC]: 'A+' as Tier,
      [GameMode.Sumo]: 'S' as Tier,
      [GameMode.Bedfight]: 'S' as Tier
    },
    totalPoints: 0
  }
].map(p => ({ ...p, totalPoints: calculateTotalPoints(p.tiers as PlayerTiers) })) as Player[];

const getRegionOverlayStyles = (region: Region) => {
  switch (region) {
    case 'NA': return { bg: 'bg-[#3b0909]', border: 'border-red-900/30', text: 'text-[#ff4d4d]' };
    case 'EU': return { bg: 'bg-[#091a3b]', border: 'border-blue-900/30', text: 'text-[#4d94ff]' };
    case 'SA': return { bg: 'bg-[#093b16]', border: 'border-green-900/30', text: 'text-[#4dff88]' };
    case 'AS': return { bg: 'bg-[#3b3509]', border: 'border-yellow-900/30', text: 'text-[#ffeb4d]' };
    case 'OC': return { bg: 'bg-[#3b0933]', border: 'border-pink-900/30', text: 'text-[#ff4df2]' };
    default: return { bg: 'bg-white/5', border: 'border-white/10', text: 'text-white' };
  }
};

const App: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>(() => {
    const saved = localStorage.getItem('mc_tierlist_players_v5');
    return saved ? JSON.parse(saved) : INITIAL_PLAYERS;
  });

  const [adminLogs, setAdminLogs] = useState<AdminLog[]>(() => {
    const saved = localStorage.getItem('mc_tierlist_logs_v1');
    return saved ? JSON.parse(saved) : [];
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [activeAdminNick, setActiveAdminNick] = useState<string>('');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  useEffect(() => {
    localStorage.setItem('mc_tierlist_players_v5', JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem('mc_tierlist_logs_v1', JSON.stringify(adminLogs));
  }, [adminLogs]);

  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => b.totalPoints - a.totalPoints);
  }, [players]);

  const handleUpdatePlayer = (updatedPlayer: Player) => {
    const playerWithPoints = { ...updatedPlayer, totalPoints: calculateTotalPoints(updatedPlayer.tiers) };
    setPlayers(prev => {
      const exists = prev.find(p => p.id === playerWithPoints.id);
      if (exists) return prev.map(p => p.id === playerWithPoints.id ? playerWithPoints : p);
      return [...prev, playerWithPoints];
    });
  };

  const handleDeletePlayer = (id: string) => {
    setPlayers(prev => prev.filter(p => p.id !== id));
  };

  const handleAdminLogin = (nickname: string) => {
    setIsAdmin(true);
    setActiveAdminNick(nickname);
    const newLog: AdminLog = {
      id: Math.random().toString(36).substr(2, 9),
      nickname: nickname,
      timestamp: new Date().toLocaleString('it-IT')
    };
    setAdminLogs(prev => [newLog, ...prev].slice(0, 50));
  };

  const selectedPlayerRank = useMemo(() => {
    if (!selectedPlayer) return 0;
    return sortedPlayers.findIndex(p => p.id === selectedPlayer.id) + 1;
  }, [selectedPlayer, sortedPlayers]);

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col bg-[#0f1115] selection:bg-red-800/30 text-slate-100">
        <Navbar 
          isAdmin={isAdmin} 
          onAdminLogin={handleAdminLogin}
          players={players}
          onSelectPlayer={setSelectedPlayer}
        />
        
        <main className="flex-grow container mx-auto px-4 py-12">
          <Routes>
            <Route path="/" element={<Leaderboard players={players} onSelectPlayer={setSelectedPlayer} />} />
            <Route path="/mode/:mode" element={<ModeDetails players={players} />} />
            <Route path="/admin" element={
              isAdmin ? (
                <AdminPanel 
                  players={players} 
                  onUpdate={handleUpdatePlayer} 
                  onDelete={handleDeletePlayer} 
                  logs={adminLogs}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-96 bg-white/5 rounded-[3rem] border border-white/10">
                  <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-4 text-white">ACCESS DENIED</h2>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Security Clearance Required</p>
                  <Link to="/" className="mt-8 px-10 py-4 bg-red-800 hover:bg-red-900 rounded-2xl transition font-black italic tracking-widest shadow-xl shadow-red-900/20">RETURN TO BASE</Link>
                </div>
              )
            } />
          </Routes>
        </main>

        {/* Player Profile Overlay */}
        {selectedPlayer && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
            <div className="absolute inset-0 cursor-pointer" onClick={() => setSelectedPlayer(null)} />
            
            <div className="relative w-full max-w-5xl bg-[#1e1e2f] border border-white/10 shadow-[0_0_80px_rgba(0,0,0,1)] flex flex-col md:flex-row overflow-hidden rounded-[3rem] max-h-[95vh] md:max-h-none animate-in zoom-in-95 duration-300">
              
              <div className="md:w-2/5 p-10 flex flex-col items-center text-center justify-center bg-gradient-to-b from-white/[0.04] to-transparent border-b md:border-b-0 md:border-r border-white/5 relative">
                
                {/* NameMC Link Button */}
                <a 
                  href={getNameMCLink(selectedPlayer.nickname)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-black/50 hover:bg-red-800 rounded-full border border-white/10 transition-all text-[10px] font-black uppercase tracking-widest group z-10 active:scale-95"
                >
                  <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                  <span>Open NameMC</span>
                </a>

                <div className="relative mb-12 group w-full flex items-center justify-center">
                  <div className="absolute inset-x-0 -bottom-10 h-32 bg-red-800/20 blur-[80px] rounded-full scale-125 opacity-60"></div>
                  
                  <div className="relative w-56 md:w-72 h-80 md:h-[26rem] flex items-end justify-center rounded-[3rem] bg-gradient-to-t from-white/[0.03] to-transparent border border-white/[0.02] shadow-inner transition-all duration-500 overflow-visible group-hover:border-white/5">
                    <img 
                      src={getMinecraftTorsoUrl(selectedPlayer.nickname)} 
                      alt={selectedPlayer.nickname}
                      className="h-[110%] w-auto object-contain drop-shadow-[0_25px_40px_rgba(0,0,0,0.9)] transition-transform group-hover:scale-[1.08] duration-700 z-10 pointer-events-none"
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://mc-heads.net/body/${selectedPlayer.nickname}/512`; }}
                    />
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-40 h-8 bg-black/70 blur-2xl rounded-full opacity-80"></div>
                  </div>
                </div>
                
                <div className="space-y-1 mb-8">
                  <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase text-white leading-none drop-shadow-md">{selectedPlayer.nickname}</h2>
                  <div className="flex items-center justify-center gap-3">
                    {(() => {
                      const regStyle = getRegionOverlayStyles(selectedPlayer.region);
                      return (
                        <span className={`px-3 py-1 ${regStyle.bg} border ${regStyle.border} ${regStyle.text} font-black text-[10px] rounded-lg uppercase tracking-widest shadow-lg`}>
                          {selectedPlayer.region}
                        </span>
                      );
                    })()}
                    <span className={`font-black uppercase tracking-widest text-[11px] flex items-center gap-1.5 ${selectedPlayer.status === 'Active' ? 'text-green-500' : 'text-red-500'}`}>
                      <span className={`w-2 h-2 rounded-full ${selectedPlayer.status === 'Active' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                      {selectedPlayer.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full">
                   <div className="bg-black/40 border border-white/5 p-5 rounded-[2rem] flex flex-col items-center group/stat hover:border-red-800/30 transition-colors">
                      <span className="text-red-700 font-black text-4xl italic leading-none group-hover/stat:scale-110 transition-transform">{selectedPlayer.totalPoints}</span>
                      <span className="text-slate-500 font-black uppercase tracking-widest text-[9px] mt-2 opacity-60">Total Points</span>
                   </div>
                   <div className="bg-black/40 border border-white/5 p-5 rounded-[2rem] flex flex-col items-center group/stat hover:border-white/20 transition-colors">
                      <span className="text-white font-black text-4xl italic leading-none group-hover/stat:scale-110 transition-transform">#{selectedPlayerRank}</span>
                      <span className="text-slate-500 font-black uppercase tracking-widest text-[9px] mt-2 opacity-60">Global Rank</span>
                   </div>
                </div>
              </div>

              <div className="md:w-3/5 p-10 md:p-14 overflow-y-auto scrollbar-hide bg-[#161625]/40 backdrop-blur-sm border-l border-white/5">
                <div className="space-y-12">
                  <header className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-red-800 font-black tracking-[0.5em] uppercase mb-1.5">Official Tier Data</span>
                      <h3 className="text-4xl font-black text-white uppercase tracking-tighter italic">Combat Profile</h3>
                    </div>
                    <button 
                      onClick={() => setSelectedPlayer(null)} 
                      className="p-3.5 bg-white/5 hover:bg-red-800 hover:text-white rounded-2xl text-slate-500 transition-all group active:scale-90"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </header>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {MODES.map(mode => {
                      const tier = selectedPlayer.tiers[mode.name];
                      const tierStyles = TIER_COLORS_NEON[tier];
                      const textClass = tierStyles.split(' ').find(c => c.startsWith('text-')) || 'text-white';
                      
                      return (
                        <div key={mode.name} className="flex items-center justify-between p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all group/mode">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="w-12 h-12 shrink-0 rounded-2xl bg-black/40 flex items-center justify-center text-slate-500 group-hover/mode:text-red-700 transition-colors shadow-inner border border-white/5 group-hover/mode:border-red-900/30">
                              <ModeIcon mode={mode.name} className="w-6 h-6 grayscale group-hover/mode:grayscale-0 transition-all" />
                            </div>
                            <span className="font-black text-slate-400 text-xs tracking-[0.15em] uppercase italic group-hover/mode:text-white transition-colors truncate">
                              {mode.name}
                            </span>
                          </div>
                          <div className={`shrink-0 ml-4 font-black text-2xl italic transition-all group-hover/mode:scale-110 drop-shadow-[0_0_10px_rgba(0,0,0,0.5)] ${textClass}`}>
                            {tier}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <footer className="border-t border-white/5 bg-black/40 py-12">
          <div className="container mx-auto px-4 text-center">
            <div className="font-black italic text-2xl tracking-tighter mb-2 uppercase select-none">TTMC <span className="text-red-800">TIERLIST</span></div>
            <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.5em] opacity-80">Official 1.8 Italian Competitive Registry & Leaderboard</p>
          </div>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;
