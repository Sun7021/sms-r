
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { MenuItem } from '../types';
import { generateFoodImage } from '../aiService';

const MenuView: React.FC = () => {
  const { menu, updateMenu } = useApp();
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMenu = menu.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    if (!editingItem) return;
    const isNew = !editingItem.id;
    const itemToSave = isNew 
      ? { ...editingItem, id: Date.now().toString() } as MenuItem 
      : editingItem as MenuItem;

    if (isNew) {
      updateMenu([...menu, itemToSave]);
    } else {
      updateMenu(menu.map(m => m.id === itemToSave.id ? itemToSave : m));
    }
    setEditingItem(null);
  };

  const handleAIImage = async () => {
    if (!editingItem?.name) return alert("Please enter a name first");
    setIsGenerating(true);
    try {
      const url = await generateFoodImage(editingItem.name, editingItem.description || '');
      setEditingItem(prev => ({ ...prev, image: url }));
    } catch (err: any) {
      console.error(err);
      alert(`AI Generation failed: ${err.message || "Check your API key or connection."}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingItem(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Remove "${name}" from the menu?`)) {
      updateMenu(menu.filter(m => m.id !== id));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Menu Builder</h2>
          <p className="text-sm text-slate-500">Manage and optimize your restaurant offerings.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input 
              type="text" 
              placeholder="Filter menu..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition-all text-xs font-bold w-64 shadow-sm"
            />
          </div>
          <button 
            onClick={() => setEditingItem({ name: '', category: 'Main', price: 0, ingredients: [] })}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-black shadow-lg hover:bg-blue-700 transition-all flex items-center space-x-2 uppercase text-[10px] tracking-widest"
          >
            <i className="fas fa-plus"></i>
            <span>Add Item</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredMenu.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-300 font-black uppercase text-xs tracking-widest italic">No products found</div>
        ) : filteredMenu.map(item => (
          <div key={item.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm group hover:shadow-md transition-all">
            <div className="h-48 relative overflow-hidden bg-slate-50">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-200">
                  <i className="fas fa-image text-4xl mb-2"></i>
                  <span className="text-[10px] font-black uppercase tracking-widest">No Image</span>
                </div>
              )}
              <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center space-x-3">
                <button onClick={() => setEditingItem(item)} className="w-12 h-12 bg-white rounded-2xl text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-xl">
                  <i className="fas fa-edit"></i>
                </button>
                <button onClick={() => handleDelete(item.id, item.name)} className="w-12 h-12 bg-white rounded-2xl text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-xl">
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">{item.category}</span>
                <span className="font-black text-slate-800 text-sm">₹{item.price.toFixed(2)}</span>
              </div>
              <h4 className="font-bold text-slate-800 text-base mb-1 truncate">{item.name}</h4>
              <p className="text-[10px] text-slate-400 line-clamp-2 min-h-[30px]">{item.description || 'Basic menu item description.'}</p>
            </div>
          </div>
        ))}
      </div>

      {editingItem && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-full border border-slate-100 animate-fade-in">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{editingItem.id ? 'Edit Item' : 'New Item'}</h3>
              <button onClick={() => setEditingItem(null)} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"><i className="fas fa-times"></i></button>
            </div>
            
            <div className="p-8 overflow-y-auto space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-5">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Product Name</label>
                    <input 
                      type="text" 
                      value={editingItem.name} 
                      onChange={e => setEditingItem(prev => ({...prev!, name: e.target.value}))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-5 outline-none focus:ring-2 focus:ring-blue-600 text-slate-800 font-bold text-sm"
                      placeholder="Item Name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Category</label>
                      <select 
                        value={editingItem.category} 
                        onChange={e => setEditingItem(prev => ({...prev!, category: e.target.value}))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-5 outline-none focus:ring-2 focus:ring-blue-600 text-slate-800 font-bold text-sm"
                      >
                        <option>Main</option>
                        <option>Starter</option>
                        <option>Beverage</option>
                        <option>Dessert</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Price (₹)</label>
                      <input 
                        type="number" 
                        value={editingItem.price} 
                        onChange={e => setEditingItem(prev => ({...prev!, price: parseFloat(e.target.value)}))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-5 outline-none focus:ring-2 focus:ring-blue-600 text-slate-800 font-bold text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Description</label>
                    <textarea 
                      rows={4}
                      value={editingItem.description || ''}
                      onChange={e => setEditingItem(prev => ({...prev!, description: e.target.value}))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-5 outline-none focus:ring-2 focus:ring-blue-600 text-slate-800 text-xs font-medium"
                      placeholder="Description for the item..."
                    ></textarea>
                  </div>
                </div>

                <div className="space-y-5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Product Image</label>
                  <div className="w-full h-56 bg-slate-50 rounded-[32px] overflow-hidden relative border border-slate-200 flex items-center justify-center group/img shadow-inner">
                    {editingItem.image ? (
                      <img src={editingItem.image} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-6 space-y-3">
                        <i className="fas fa-image text-5xl text-slate-200"></i>
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em]">No Visual Data</p>
                      </div>
                    )}
                    {isGenerating && (
                      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-[10px] text-blue-400 font-black uppercase tracking-[0.3em] animate-pulse">AI Rendering...</p>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="cursor-pointer bg-slate-100 text-slate-700 py-3.5 rounded-2xl text-[10px] font-black uppercase text-center hover:bg-slate-200 transition-all block border border-slate-200">
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                      <i className="fas fa-upload mr-2"></i> Local
                    </label>
                    <button 
                      onClick={handleAIImage} 
                      disabled={isGenerating}
                      className="bg-slate-900 text-white py-3.5 rounded-2xl text-[10px] font-black uppercase hover:bg-slate-800 disabled:opacity-50 transition-all shadow-lg active:scale-95"
                    >
                      <i className="fas fa-magic mr-2"></i> AI Generate
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3">
              <button onClick={() => setEditingItem(null)} className="px-8 py-4 font-black text-slate-400 hover:text-slate-600 text-[10px] uppercase tracking-widest">Discard</button>
              <button onClick={handleSave} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-900/20 hover:bg-blue-700 transition-all text-[10px] uppercase tracking-widest active:scale-95">Save Product</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuView;
