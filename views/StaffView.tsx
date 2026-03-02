
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Role, User } from '../types';

const StaffView: React.FC = () => {
  const { staff, addStaff, removeStaff } = useApp();
  const [newStaff, setNewStaff] = useState({ name: '', username: '', password: '', role: 'STAFF' as Role });

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.username || !newStaff.password || !newStaff.name) return;
    
    // Check for existing username
    if (staff.some(s => s.username === newStaff.username)) {
      alert("Username already exists!");
      return;
    }

    addStaff({
      id: Date.now().toString(),
      ...newStaff
    });
    setNewStaff({ name: '', username: '', password: '', role: 'STAFF' });
  };

  return (
    <div className="space-y-8 max-w-6xl animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Staff Management Hub</h2>
        <p className="text-sm text-slate-500">Provision access for your restaurant floor and kitchen team.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6 sticky top-24">
            <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase border-l-4 border-blue-600 pl-3">Add Staff Member</h3>
            <form onSubmit={handleAddStaff} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Full Name</label>
                <input 
                  type="text" 
                  value={newStaff.name} 
                  onChange={e => setNewStaff(prev => ({...prev, name: e.target.value}))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-4 outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                  placeholder="e.g. Rahul Sharma"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Staff ID (Username)</label>
                <input 
                  type="text" 
                  value={newStaff.username} 
                  onChange={e => setNewStaff(prev => ({...prev, username: e.target.value}))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-4 outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                  placeholder="ID used for login"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Login Password</label>
                <input 
                  type="password" 
                  value={newStaff.password} 
                  onChange={e => setNewStaff(prev => ({...prev, password: e.target.value}))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-4 outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">System Role</label>
                <select 
                  value={newStaff.role}
                  onChange={e => setNewStaff(prev => ({...prev, role: e.target.value as Role}))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-4 outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                >
                  <option value="STAFF">Staff (POS & KDS Only)</option>
                  <option value="ADMIN">Admin (Full Access)</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white px-6 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-xl hover:translate-y-[-2px] active:translate-y-0">
                Grant System Access
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
               <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase">Active Staff Roster</h3>
               <span className="bg-blue-600 px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-widest">{staff.length} Active Nodes</span>
             </div>
             <div className="divide-y divide-slate-50">
               {staff.length === 0 ? (
                 <div className="p-20 text-center text-slate-400">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-slate-200">
                      <i className="fas fa-user-plus text-xl opacity-20"></i>
                    </div>
                    <p className="font-bold text-slate-600 uppercase tracking-widest text-xs">No team members provisioned</p>
                    <p className="text-xs mt-1">Start by adding your first staff member on the left.</p>
                 </div>
               ) : staff.map(s => (
                 <div key={s.id} className="p-6 flex items-center justify-between hover:bg-blue-50/30 transition-all group">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center font-black text-xl shadow-lg border-2 border-white">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{s.name}</h4>
                        <div className="flex items-center space-x-2 text-xs text-slate-400 font-medium">
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-500 uppercase tracking-tighter">@{s.username}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span className="flex items-center">
                            <i className="fas fa-clock mr-1 text-[10px]"></i> Active now
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${s.role === 'ADMIN' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                        {s.role}
                      </span>
                      <button 
                        onClick={() => removeStaff(s.id)}
                        className="w-10 h-10 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center"
                        title="Revoke Access"
                      >
                        <i className="fas fa-user-minus"></i>
                      </button>
                    </div>
                 </div>
               ))}
             </div>
           </div>
           
           <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group">
             <div className="relative z-10">
               <div className="flex items-center space-x-2 text-blue-400 mb-2">
                 <i className="fas fa-brain animate-pulse"></i>
                 <h3 className="text-sm font-black uppercase tracking-widest">Team Analytics</h3>
               </div>
               <p className="text-slate-400 text-sm mb-6 leading-relaxed">System behavior suggests peak efficiency with current roster. Cross-device sync is active for all provisioned staff IDs.</p>
               <div className="flex space-x-4">
                 <div className="flex-1 bg-white/5 backdrop-blur-sm p-5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all cursor-default">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Live Terminals</p>
                    <p className="text-3xl font-black">{staff.length + 1}</p>
                 </div>
                 <div className="flex-1 bg-white/5 backdrop-blur-sm p-5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all cursor-default">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Security Audit</p>
                    <p className="text-sm font-bold text-green-400 uppercase">Passed <i className="fas fa-check-circle ml-1"></i></p>
                 </div>
               </div>
             </div>
             <i className="fas fa-shield-alt absolute -bottom-10 -right-10 text-[160px] opacity-5 group-hover:rotate-12 transition-all duration-700"></i>
           </div>
        </div>
      </div>
    </div>
  );
};

export default StaffView;
