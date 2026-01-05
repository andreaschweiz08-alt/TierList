
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Player } from '../types';
import { getMinecraftFaceUrl } from '../utils';

interface NavbarProps {
  isAdmin: boolean;
  onAdminLogin: (nickname: string) => void;
  players: Player[];
  onSelectPlayer: (player: Player) => void;
}

const Navbar: React.FC<NavbarProps> = ({ isAdmin, onAdminLogin, players, onSelectPlayer }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [adminNick, setAdminNick] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  const suggestions = searchQuery.length > 0 
    ? players.filter(p => p.nickname.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
    : [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminNick.trim()) {
      alert('Inserisci un nickname!');
      return;
    }
    if (adminKey === 'admin123') {
      onAdminLogin(adminNick);
      setShowLoginModal(false);
      setAdminKey('');
      setAdminNick('');
      navigate('/admin');
    } else {
      alert('Chiave Admin non valida!');
    }
  };

  return (
    <nav className="sticky top-0 z-[60] bg-[#0d1014]/80 backdrop-blur-xl border-b border-white/5 shadow-2xl h-20">
      <div className="container mx-auto px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center shrink-0">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <div className="absolute inset-0 bg-red-900/20 blur-xl rounded-full"></div>
            <div className="relative font-black italic text-2xl tracking-tighter leading-none text-center">
               <span className="text-red-800 block">TTMC</span>
               <span className="text-[8px] text-white block -mt-1 tracking-[0.2em]">TIERLIST</span>
            </div>
          </div>
        </Link>

        {/* Centered Search */}
        <div className="flex-1 max-w-xl px-8 relative" ref={searchRef}>
          <div className="relative group">
            <input 
              type="text" 
              placeholder="Search legends..." 
              value={searchQuery}
              onFocus={() => setShowSuggestions(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-800/50 transition-all placeholder:text-slate-500 text-white"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-8 right-8 mt-2 bg-[#16191f] border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
              {suggestions.map(player => (
                <button
                  key={player.id}
                  onClick={() => {
                    onSelectPlayer(player);
                    setShowSuggestions(false);
                    setSearchQuery('');
                  }}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition text-left"
                >
                  <img src={getMinecraftFaceUrl(player.nickname)} className="w-8 h-8 rounded border border-white/10" alt="" />
                  <div className="flex flex-col">
                    <span className="font-bold text-white text-sm">{player.nickname}</span>
                    <span className="text-[10px] text-red-700 font-bold uppercase tracking-widest">{player.totalPoints} PTS</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <a 
            href="https://discord.gg/aP4dDY5bSS" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#5865F2]/10 hover:bg-[#5865F2]/20 border border-[#5865F2]/30 rounded-xl transition group"
          >
            <svg className="w-5 h-5 fill-[#5865F2] group-hover:scale-110 transition-transform" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2758-3.68-.2758-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1971.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/>
            </svg>
            <span className="text-[10px] font-black text-[#5865F2] tracking-widest uppercase italic hidden sm:block">Discord</span>
          </a>

          {isAdmin ? (
            <Link to="/admin" className="px-4 py-2.5 bg-red-800 hover:bg-red-900 text-white rounded-xl transition shadow-lg shadow-red-900/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </Link>
          ) : (
            <button 
              onClick={() => setShowLoginModal(true)} 
              className="p-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl transition border border-white/10 group"
              title="Admin Login"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:text-red-700 transition-colors" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Centered Login Modal - Deep Red Theme */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-[#000]/95 backdrop-blur-3xl animate-in fade-in duration-300">
          <div className="bg-[#12141a] border border-white/10 p-8 md:p-12 rounded-[2rem] w-full max-w-md shadow-[0_0_80px_rgba(153,27,27,0.15)] animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center mb-10 text-center">
              <div className="w-16 h-16 bg-red-800 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-red-900/30">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">STAFF ACCESS</h2>
              <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[9px] mt-3">Identity Authorization Required</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Staff Nickname</label>
                <input 
                  autoFocus
                  type="text" 
                  value={adminNick}
                  onChange={(e) => setAdminNick(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-1 focus:ring-red-800 text-white font-bold placeholder:text-slate-700 transition-all"
                  placeholder="Enter Nickname"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Admin Key</label>
                <input 
                  type="password" 
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-1 focus:ring-red-800 text-white font-bold placeholder:text-slate-700 transition-all"
                  placeholder="••••••••"
                />
              </div>
              
              <div className="flex flex-col gap-3 pt-6">
                <button type="submit" className="w-full px-8 py-5 bg-red-800 hover:bg-red-700 text-white rounded-2xl font-black uppercase italic tracking-widest transition-all shadow-lg shadow-red-900/20 active:scale-95">LOG IN</button>
                <button type="button" onClick={() => setShowLoginModal(false)} className="w-full px-8 py-3 bg-transparent hover:bg-white/5 text-slate-500 hover:text-slate-300 rounded-xl font-bold text-[10px] transition-all uppercase tracking-widest">CANCEL</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
