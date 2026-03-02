
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { InventoryItem } from '../types';

const InventoryView: React.FC = () => {
  const { inventory, updateInventory } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<InventoryItem> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (item?: InventoryItem) => {
    setEditingItem(item || { name: '', currentStock: 0, minStock: 0, unit: 'kg', costPerUnit: 0 });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!editingItem?.name) return;
    
    if (editingItem.id) {
      updateInventory(inventory.map(i => i.id === editingItem.id ? (editingItem as InventoryItem) : i));
    } else {
      const newItem: InventoryItem = {
        ...(editingItem as InventoryItem),
        id: 'i' + Date.now(),
      };
      updateInventory([...inventory, newItem]);
    }
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from inventory?`)) {
      updateInventory(inventory.filter(item => item.id !== id));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Inventory Management</h2>
          <p className="text-sm text-slate-500">Stock levels synced across all enterprise terminals.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input 
              type="text" 
              placeholder="Search inventory..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition-all text-xs font-bold w-64 shadow-sm"
            />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black shadow-lg hover:bg-blue-700 transition-all flex items-center space-x-2 uppercase tracking-widest text-xs"
          >
            <i className="fas fa-plus"></i>
            <span className="hidden sm:inline">Add Product</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/80 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Item Name</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Stock</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Min Level</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cost/Unit</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredInventory.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center text-slate-400 italic font-bold text-xs uppercase tracking-widest">No matching items found.</td>
              </tr>
            ) : filteredInventory.map(item => {
              const status = item.currentStock <= item.minStock ? 'low' : 'ok';
              return (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 font-bold text-slate-800">{item.name}</td>
                  <td className="px-6 py-4">
                    <span className={`font-mono font-bold px-2 py-1 rounded bg-slate-50 ${status === 'low' ? 'text-red-500' : 'text-slate-800'}`}>
                      {Number(item.currentStock).toFixed(2)} <span className="text-[10px] opacity-50 uppercase">{item.unit}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-medium">{item.minStock} {item.unit}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${status === 'low' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                      {status === 'low' ? 'Critical' : 'Healthy'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-600">₹{Number(item.costPerUnit).toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => handleOpenModal(item)}
                        className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-all"
                        title="Modify Item"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id, item.name)}
                        className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-all"
                        title="Remove Item"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 no-print">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">{editingItem?.id ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Item Name</label>
                <input 
                  type="text" 
                  value={editingItem?.name} 
                  onChange={e => setEditingItem(prev => ({...prev!, name: e.target.value}))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                  placeholder="e.g. Fresh Chicken Breast"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Stock Level</label>
                  <input 
                    type="number" 
                    value={editingItem?.currentStock} 
                    onChange={e => setEditingItem(prev => ({...prev!, currentStock: parseFloat(e.target.value)}))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Min Level</label>
                  <input 
                    type="number" 
                    value={editingItem?.minStock} 
                    onChange={e => setEditingItem(prev => ({...prev!, minStock: parseFloat(e.target.value)}))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Unit</label>
                  <input 
                    type="text" 
                    value={editingItem?.unit} 
                    onChange={e => setEditingItem(prev => ({...prev!, unit: e.target.value}))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="kg, L, units..."
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Cost / Unit (₹)</label>
                  <input 
                    type="number" 
                    value={editingItem?.costPerUnit} 
                    onChange={e => setEditingItem(prev => ({...prev!, costPerUnit: parseFloat(e.target.value)}))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-slate-600">Cancel</button>
              <button onClick={handleSave} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black shadow-xl hover:bg-slate-800 transition-all uppercase tracking-widest text-[10px]">Commit Records</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 no-print">
        <div className="bg-gradient-to-br from-slate-900 to-blue-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden group">
           <div className="relative z-10">
             <div className="flex items-center space-x-2 text-blue-400 mb-2">
               <i className="fas fa-robot animate-pulse"></i>
               <h3 className="text-xs font-black uppercase tracking-widest">AI Procurement</h3>
             </div>
             <p className="text-slate-300 text-sm mb-6 leading-relaxed">System prediction suggests stock optimization for the upcoming weekend rush.</p>
             <div className="space-y-3">
               <div className="flex items-center justify-between bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 group-hover:bg-white/10 transition-all">
                 <span className="font-bold">Chicken (Premium)</span>
                 <span className="font-mono bg-blue-600 px-2 py-0.5 rounded text-xs">+40.00kg</span>
               </div>
               <div className="flex items-center justify-between bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 group-hover:bg-white/10 transition-all">
                 <span className="font-bold">Basmati Rice</span>
                 <span className="font-mono bg-blue-600 px-2 py-0.5 rounded text-xs">+25.00kg</span>
               </div>
             </div>
             <button className="w-full mt-6 py-4 bg-white text-slate-900 rounded-2xl font-black hover:bg-blue-50 transition-all uppercase tracking-widest text-[10px] shadow-lg">
               Approve Auto-Purchase Orders
             </button>
           </div>
           <i className="fas fa-truck-moving absolute -bottom-10 -right-10 text-[180px] text-white/5 group-hover:translate-x-4 transition-all duration-1000"></i>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Wastage Analytics</h3>
            <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full">-4.2% Variance</span>
          </div>
          <div className="h-40 flex items-end space-x-4">
             {[40, 70, 45, 90, 65, 30, 80].map((h, i) => (
               <div key={i} className="flex-1 flex flex-col items-center">
                 <div className="w-full bg-slate-100 rounded-t-xl relative group" style={{ height: `${h}%` }}>
                    <div className="absolute inset-0 bg-blue-500/20 group-hover:bg-blue-500/40 rounded-t-xl transition-all"></div>
                 </div>
                 <span className="text-[8px] text-slate-400 mt-2 uppercase font-black">Day {i+1}</span>
               </div>
             ))}
          </div>
          <p className="text-[10px] text-slate-500 mt-6 leading-relaxed italic border-l-2 border-slate-100 pl-3">"Anomaly detected on Day 4: Manual stock adjustment of 15kg for Chicken. Audited by System."</p>
        </div>
      </div>
    </div>
  );
};

export default InventoryView;
