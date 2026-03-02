
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { OrderStatus, Order } from '../types';
import { useNavigate } from 'react-router-dom';

const sendWhatsAppBill = (order: Order, phone: string) => {
  if (!phone) return;
  
  const separator = "---------------------------";
  const itemsText = order.items.map((i: any) => 
    `• ${i.name} (x${i.quantity}) - ₹${(i.price * i.quantity).toFixed(2)}`
  ).join('\n');
  
  const timestamp = new Date(order.createdAt).toLocaleString();
  
  const message = `*OFFICIAL INVOICE*\n${separator}\n` +
    `*Order ID:* #${order.id}\n` +
    `*Table:* ${order.tableNumber}\n` +
    `*Date:* ${timestamp}\n` +
    `${separator}\n` +
    `*ITEMS:*\n${itemsText}\n` +
    `${separator}\n` +
    `*Subtotal:* ₹${order.subtotal.toFixed(2)}\n` +
    (order.discount > 0 ? `*Discount:* -₹${order.discount.toFixed(2)}\n` : '') +
    `*CGST (2.5%):* ₹${order.cgst.toFixed(2)}\n` +
    `*SGST (2.5%):* ₹${order.sgst.toFixed(2)}\n` +
    `${separator}\n` +
    `*GRAND TOTAL: ₹${order.total.toFixed(2)}*\n` +
    `${separator}\n` +
    `_Thank you for your order!_`;
  
  const cleanPhone = phone.replace(/\D/g, '');
  const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
};

const CustomerPortal: React.FC = () => {
  const { menu, addOrder, currentBranch } = useApp();
  const navigate = useNavigate();
  const [cart, setCart] = useState<{ id: string; name: string; price: number; qty: number }[]>([]);
  const [view, setView] = useState<'MENU' | 'CART' | 'TRACK'>('MENU');
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '' });

  const addToCart = (item: any) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === item.id);
      if (ex) return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { id: item.id, name: item.name, price: item.price, qty: 1 }];
    });
  };

  const total = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);

  const handleCheckoutClick = () => {
    if (cart.length === 0) return;
    setShowDetailsModal(true);
  };

  const placeOrder = () => {
    if (!customerInfo.name || !customerInfo.phone) return alert("Please provide your name and phone.");
    
    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 6).toUpperCase(),
      branchId: currentBranch.id,
      tableNumber: 'QR-05',
      items: cart.map(i => ({ menuItemId: i.id, name: i.name, price: i.price, quantity: i.qty })),
      subtotal: total,
      discount: 0,
      cgst: total * 0.025,
      sgst: total * 0.025,
      total: total * 1.05,
      status: OrderStatus.PENDING,
      createdAt: new Date(),
      customerName: customerInfo.name,
      customerPhone: customerInfo.phone,
      notes: `Phone: ${customerInfo.phone}`,
    };
    
    addOrder(newOrder);
    setLastOrder(newOrder);
    setView('TRACK');
    setCart([]);
    setShowDetailsModal(false);
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl flex flex-col border-x border-slate-200 no-print">
      <div className="sticky top-0 z-50">
        <div className="bg-slate-900 p-6 text-white text-center rounded-b-[40px] relative shadow-xl">
          <button onClick={() => navigate('/')} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"><i className="fas fa-arrow-left"></i></button>
          <h1 className="text-2xl font-black tracking-tighter uppercase">SMART <span className="text-blue-500">BILLING</span></h1>
          <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-widest opacity-60">Table Node • Premium Service</p>
        </div>
        <div className="p-4 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-around shadow-sm mx-4 -mt-6 rounded-3xl border border-slate-200">
          <button onClick={() => setView('MENU')} className={`flex flex-col items-center space-y-1 flex-1 py-2 rounded-2xl transition-all ${view === 'MENU' ? 'text-blue-600 bg-blue-50/50' : 'text-slate-400'}`}><i className="fas fa-th-large text-lg"></i><span className="text-[9px] font-black uppercase tracking-widest">Menu</span></button>
          <button onClick={() => setView('CART')} className={`flex flex-col items-center space-y-1 relative flex-1 py-2 rounded-2xl transition-all ${view === 'CART' ? 'text-blue-600 bg-blue-50/50' : 'text-slate-400'}`}><i className="fas fa-shopping-basket text-lg"></i><span className="text-[9px] font-black uppercase tracking-widest">Tray</span>{cart.length > 0 && <span className="absolute top-1 right-1/4 bg-red-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-black shadow-sm">{cart.length}</span>}</button>
          <button onClick={() => setView('TRACK')} className={`flex flex-col items-center space-y-1 flex-1 py-2 rounded-2xl transition-all ${view === 'TRACK' ? 'text-blue-600 bg-blue-50/50' : 'text-slate-400'}`}><i className="fas fa-receipt text-lg"></i><span className="text-[9px] font-black uppercase tracking-widest">Track</span></button>
        </div>
      </div>
      <div className="flex-1 p-6 overflow-y-auto mt-2">
        {view === 'MENU' && (
          <div className="space-y-6">
            <div className="relative"><input type="text" placeholder="Search for dishes..." className="w-full bg-slate-100 border-none rounded-2xl py-4 px-12 text-sm focus:ring-2 focus:ring-blue-500 shadow-sm" /><i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"></i></div>
            <div className="grid grid-cols-1 gap-4">
              {menu.map(item => (
                <div key={item.id} className="flex items-center space-x-4 p-3 rounded-[24px] hover:bg-slate-50 border border-slate-50 hover:border-slate-200 transition-all shadow-sm group">
                  <div className="w-20 h-20 overflow-hidden rounded-2xl shadow-sm"><img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /></div>
                  <div className="flex-1"><h4 className="font-black text-slate-800 text-sm tracking-tight">{item.name}</h4><p className="text-blue-600 font-black text-sm">₹{item.price}</p></div>
                  <button onClick={() => addToCart(item)} className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg active:scale-90 transition-all"><i className="fas fa-plus"></i></button>
                </div>
              ))}
            </div>
          </div>
        )}
        {view === 'CART' && (
          <div className="space-y-6 animate-fade-in">
             <div className="flex items-center justify-between"><h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Your Tray</h2><button onClick={() => setCart([])} className="text-[10px] font-black uppercase text-red-500">Clear All</button></div>
             {cart.length === 0 ? (
               <div className="text-center py-20 flex flex-col items-center"><div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-4"><i className="fas fa-shopping-basket text-4xl text-slate-200"></i></div><p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Empty Tray</p></div>
             ) : (
               <div className="space-y-4">
                 <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
                    {cart.map(i => (
                      <div key={i.id} className="flex justify-between items-center p-4 border-b border-slate-50 last:border-b-0"><div><p className="font-bold text-slate-800 text-sm">{i.name}</p><p className="text-[10px] text-slate-500 font-bold uppercase">₹{i.price} x {i.qty}</p></div><div className="flex items-center space-x-4"><span className="font-black text-slate-800 text-sm">₹{(i.price * i.qty).toFixed(2)}</span><button onClick={() => setCart(prev => prev.filter(item => item.id !== i.id))} className="text-red-300 hover:text-red-500"><i className="fas fa-times-circle"></i></button></div></div>
                    ))}
                 </div>
                 <button onClick={handleCheckoutClick} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black shadow-xl uppercase tracking-[0.2em] text-xs active:scale-95 transition-all">Checkout Tray</button>
               </div>
             )}
          </div>
        )}
        {view === 'TRACK' && lastOrder && (
          <div className="flex flex-col items-center text-center py-10 space-y-8 animate-fade-in">
            <div className="relative"><div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl shadow-lg animate-bounce z-10 relative"><i className="fas fa-check"></i></div><div className="absolute top-0 left-0 w-24 h-24 bg-green-400 rounded-full animate-ping opacity-20"></div></div>
            <div><h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Order Sent!</h2><p className="text-slate-500 font-bold text-xs mt-1 uppercase tracking-widest opacity-60">Ticket: <span className="text-blue-600">#{lastOrder.id}</span></p></div>
            <button onClick={() => sendWhatsAppBill(lastOrder, customerInfo.phone)} className="w-full py-5 bg-[#25D366] text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center space-x-3 shadow-xl hover:bg-[#128C7E] active:scale-95 transition-all"><i className="fab fa-whatsapp text-2xl"></i><span>Get Bill on WhatsApp</span></button>
          </div>
        )}
      </div>
      {showDetailsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white rounded-[40px] w-full max-w-sm overflow-hidden shadow-2xl border border-slate-100">
            <div className="p-10 space-y-8">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Order Details</h3>
              <div className="space-y-5">
                <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Name</label><input type="text" value={customerInfo.name} onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-blue-600 transition-all text-sm font-bold" /></div>
                <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">WhatsApp</label><input type="tel" value={customerInfo.phone} onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-blue-600 transition-all text-sm font-bold" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4"><button onClick={() => setShowDetailsModal(false)} className="py-4 px-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-[10px] tracking-widest">Back</button><button onClick={placeOrder} className="py-4 px-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-blue-200 active:scale-95 transition-all">Order</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerPortal;