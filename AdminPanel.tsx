
import React, { useState, useMemo } from 'react';
import { Player, GameMode, Tier, PlayerTiers, Region, PlayerStatus } from '../types';
import { MODES, TIERS_ORDERED, DEFAULT_PLAYER_TIERS } from '../constants';
import { getMinecraftFaceUrl } from '../utils';
import { ModeIcon } from './ModeIcon';
import { AdminLog } from '../App';

interface AdminPanelProps {
  players: Player[];
  onUpdate: (player: Player) => void;
  onDelete: (id: string) => void;
  logs: AdminLog[];
}

const AdminPanel: React.FC<AdminPanelProps> = ({ players, onUpdate, onDelete, logs }) => {
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [formData, setFormData] = useState<{ nickname: string; region: Region; status: PlayerStatus; tiers: PlayerTiers }>({
    nickname: '',
    region: 'EU',
    status: 'Active',
    tiers: { ...DEFAULT_PLAYER_TIERS }
  });

  const [filterMode, setFilterMode] = useState<GameMode | 'All'>('All');
  const [filterTier, setFilterTier] = useState<Tier | 'All'>('All');

  const filteredPlayers = useMemo(() => {
    return players.filter(player => {
      if (filterMode === 'All') return true;
      if (filterTier === 'All') return true;
      return player.tiers[filterMode] === filterTier;
    });
  }, [players, filterMode, filterTier]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nickname.trim()) return;

    const newPlayer: Player = {
      id: editingPlayer ? editingPlayer.id : Math.random().toString(36).substr(2, 9),
      nickname: formData.nickname.trim(),
      region: formData.region,
      status: formData.status,
      tiers: formData.tiers,
      totalPoints: 0
    };

    onUpdate(newPlayer);
    resetForm();
  };

  const resetForm = () => {
    setEditingPlayer(null);
    setFormData({ nickname: '', region: 'EU', status: 'Active', tiers: { ...DEFAULT_PLAYER_TIERS } });
  };

  const startEdit = (player: Player) => {
    setEditingPlayer(player);
    setFormData({ 
      nickname: player.nickname, 
      region: player.region || 'EU', 
      status: player.status || 'Active',
      tiers: { ...player.tiers } 
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateTier = (mode: GameMode, tier: Tier) => {
    setFormData(prev => ({
      ...prev,
      tiers: { ...prev.tiers, [mode]: tier }
    }));
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-16 pb-32 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-6xl font-black italic tracking-tighter text-white">STAFF <span className="text-red-800">CONTROL</span></h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Entity Management & Power Level Override</p>
        </div>
        <button 
          onClick={resetForm}
          className="bg-red-800 hover:bg-red-700 px-10 py-4 rounded-xl font-black italic shadow-xl shadow-red-900/20 transition-all hover:scale-105 uppercase tracking-widest text-xs"
        >
          {editingPlayer ? 'ABORT PROTOCOL' : 'INITIALIZE PLAYER'}
        </button>
      </header>

      {/* Form Section - Less rounded */}
      <section className="bg-[#1e1e2f] border border-white/5 rounded-xl p-10 md:p-14 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-red-800"></div>
        <h2 className="text-3xl font-black mb-10 text-white italic uppercase tracking-tighter">
          {editingPlayer ? `Modifying Data: ${editingPlayer.nickname}` : 'New Combatant Entry'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div className="space-y-10">
              <div className="space-y-4">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-1">Warrior Identity</label>
                <div className="flex gap-5">
                  <input 
                    type="text" 
                    placeholder="USERNAME" 
                    value={formData.nickname}
                    onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-6 py-4 focus:ring-2 focus:ring-red-800 outline-none transition text-white font-black italic uppercase placeholder:text-slate-700"
                    required
                  />
                  <div className="w-16 h-16 bg-[#0d1014] border border-white/10 rounded-xl flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                    {formData.nickname && (
                      <img src={getMinecraftFaceUrl(formData.nickname)} className="w-12 h-12 rounded-lg" alt="Preview" />
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-1">Region</label>
                  <select 
                    value={formData.region}
                    onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value as Region }))}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-6 py-3 text-white font-bold outline-none focus:border-red-800"
                  >
                    {['EU', 'NA', 'SA', 'AS', 'OC'].map(reg => <option key={reg} value={reg}>{reg}</option>)}
                  </select>
                </div>
                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-1">Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as PlayerStatus }))}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-6 py-3 text-white font-bold outline-none focus:border-red-800"
                  >
                    <option value="Active">Active</option>
                    <option value="Retired">Retired</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
               {MODES.map(mode => (
                 <div key={mode.name} className="bg-black/20 p-5 rounded-2xl border border-white/5 flex flex-col gap-4 group hover:border-white/20 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#0d1014] flex items-center justify-center text-slate-500 group-hover:text-red-800 transition-colors">
                        <ModeIcon mode={mode.name} className="w-4 h-4" />
                      </div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{mode.name}</label>
                    </div>
                    <select 
                      value={formData.tiers[mode.name]}
                      onChange={(e) => updateTier(mode.name, e.target.value as Tier)}
                      className="w-full bg-[#161625] border border-white/10 rounded-xl text-xs font-black px-4 py-3 outline-none focus:border-red-800 transition appearance-none cursor-pointer uppercase italic"
                    >
                      {TIERS_ORDERED.map(t => (
                        <option key={t} value={t} className="bg-[#1e1e2f]">{t}</option>
                      ))}
                    </select>
                 </div>
               ))}
            </div>
          </div>

          <div className="pt-10 border-t border-white/5 flex justify-end">
            <button 
              type="submit" 
              className="px-14 py-5 bg-red-800 hover:bg-red-700 text-white font-black italic rounded-xl shadow-xl shadow-red-900/20 transition-all hover:scale-105 uppercase tracking-widest text-xs"
            >
              {editingPlayer ? 'AUTHORIZE OVERRIDE' : 'COMMIT REGISTRATION'}
            </button>
          </div>
        </form>
      </section>

      {/* Database Overview - Less rounded, more width */}
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
          <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.5em] italic">Registry Ledger</h2>
          
          <div className="flex flex-wrap items-center gap-4 bg-[#1e1e2f] border border-white/5 p-4 rounded-xl shadow-lg">
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-black text-red-800 uppercase tracking-widest ml-1">Target Mode</span>
              <select 
                value={filterMode}
                onChange={(e) => setFilterMode(e.target.value as any)}
                className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-[10px] font-black text-white outline-none focus:border-red-800"
              >
                <option value="All">ALL MODES</option>
                {MODES.map(m => <option key={m.name} value={m.name}>{m.name.toUpperCase()}</option>)}
              </select>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-black text-red-800 uppercase tracking-widest ml-1">Target Tier</span>
              <select 
                value={filterTier}
                disabled={filterMode === 'All'}
                onChange={(e) => setFilterTier(e.target.value as any)}
                className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-[10px] font-black text-white outline-none focus:border-red-800 disabled:opacity-30"
              >
                <option value="All">ALL TIERS</option>
                {TIERS_ORDERED.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-white/5 bg-[#1e1e2f] shadow-2xl">
          <table className="w-full text-left">
            <thead className="bg-[#2a2a3d] text-slate-500 text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="px-10 py-5">Combatant</th>
                <th className="px-10 py-5">Region</th>
                <th className="px-10 py-5">Status</th>
                <th className="px-10 py-5 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {filteredPlayers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-10 py-20 text-center">
                    <p className="text-slate-600 font-black italic uppercase tracking-[0.3em] text-xs">No records match the current filter protocols</p>
                  </td>
                </tr>
              ) : (
                filteredPlayers.map(player => (
                  <tr key={player.id} className="hover:bg-white/[0.02] transition group">
                    <td className="px-10 py-3">
                      <div className="flex items-center gap-4">
                        <img src={getMinecraftFaceUrl(player.nickname)} className="w-10 h-10 rounded-lg border border-white/10 bg-[#0d1014]" alt="" />
                        <span className="font-black italic uppercase tracking-tighter text-slate-200 group-hover:text-white transition-colors">{player.nickname}</span>
                      </div>
                    </td>
                    <td className="px-10 py-3">
                      <span className="px-3 py-1 bg-white/5 border border-white/10 text-slate-400 font-black text-[10px] rounded-lg tracking-widest uppercase">
                        {player.region}
                      </span>
                    </td>
                    <td className="px-10 py-3">
                      <span className={`font-black italic uppercase text-xs ${player.status === 'Active' ? 'text-green-500' : 'text-red-500'}`}>{player.status}</span>
                    </td>
                    <td className="px-10 py-3 text-right space-x-8">
                      <button onClick={() => startEdit(player)} className="text-[10px] font-black text-indigo-400 hover:text-white transition tracking-widest uppercase">MODIFY</button>
                      <button onClick={() => { if (confirm(`Expunge record for ${player.nickname}?`)) onDelete(player.id); }} className="text-[10px] font-black text-red-600 hover:text-white transition tracking-widest uppercase">EXPUNGE</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminPanel;
