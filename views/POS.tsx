
import React, { useState, useMemo } from 'react';
import { useApp } from '../AppContext';
import { MenuItem, Order, OrderStatus, DiscountCode } from '../types';
import { parseVoiceCommand } from '../aiService';

// Payment credentials
const OWNER_VPA = "surajy7021@oksbi";
const OWNER_NAME = "614_Suraj Yadav";

const sendWhatsAppBill = (order: Order, phone: string) => {
  if (!phone) return;
  
  const separator = "---------------------------";
  const itemsText = order.items.map((i: any) => 
    `• ${i.name} (x${i.quantity}) - ₹${(i.price * i.quantity).toFixed(2)}`
  ).join('\n');
  
  const timestamp = new Date(order.createdAt).toLocaleString();
  
  const message = `*INVOICE: SMART BILLING SOFTWARE*\n${separator}\n` +
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
    `_Thank you for dining with us!_`;
  
  const cleanPhone = phone.replace(/\D/g, '');
  const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
};

const InvoiceModal = ({ order, isOpen, onClose }: { order: Order | null, isOpen: boolean, onClose: () => void }) => {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/95 backdrop-blur-xl p-4 animate-fade-in no-print">
      <div className="bg-white rounded-[40px] w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100 print-area">
        <div className="p-10 overflow-y-auto font-mono text-[11px] leading-relaxed">
          <div className="text-center mb-8 space-y-1">
            <h2 className="text-2xl font-black tracking-tighter uppercase text-slate-900">SMART BILLING</h2>
            <p className="font-black text-blue-600">RESTAURANT TERMINAL</p>
            <p className="opacity-60 uppercase text-[9px] font-bold">GSTIN: 27AABCU1234F1Z5</p>
          </div>
          
          <div className="border-y border-dashed border-slate-300 py-4 mb-6 flex justify-between uppercase">
            <div className="space-y-1">
              <p>Inv: <span className="font-black">#{order.id}</span></p>
              <p>Table: <span className="font-black">#{order.tableNumber}</span></p>
            </div>
            <div className="text-right space-y-1">
              <p>{new Date(order.createdAt).toLocaleDateString()}</p>
              <p>{new Date(order.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
            </div>
          </div>

          <table className="w-full mb-6">
            <thead>
              <tr className="border-b border-slate-100 uppercase text-[10px] font-black">
                <th className="text-left py-2">Item</th>
                <th className="text-center py-2">Qty</th>
                <th className="text-right py-2">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {order.items.map((i, idx) => (
                <tr key={idx}>
                  <td className="py-3">
                    <p className="font-black text-slate-800">{i.name}</p>
                    <p className="opacity-50 text-[9px] uppercase">₹{i.price} / unit</p>
                  </td>
                  <td className="py-3 text-center font-bold">x{i.quantity}</td>
                  <td className="py-3 text-right font-black text-slate-900">₹{(i.price * i.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t border-dashed border-slate-300 pt-4 space-y-2">
            <div className="flex justify-between">
              <span className="font-bold text-slate-500">Subtotal</span>
              <span className="font-bold text-slate-900">₹{order.subtotal.toFixed(2)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-blue-600 font-black">
                <span>Discount ({order.appliedPromo || 'Manual'})</span>
                <span>-₹{order.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between opacity-60">
              <span>CGST (2.5%)</span>
              <span>₹{order.cgst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between opacity-60">
              <span>SGST (2.5%)</span>
              <span>₹{order.sgst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-black pt-4 border-t border-slate-100 text-slate-900">
              <span className="tracking-tighter">GRAND TOTAL</span>
              <span>₹{order.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-10 text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 no-print">
              <span className="h-[1px] bg-slate-200 flex-1"></span>
              <p className="font-black uppercase tracking-[0.3em] text-[9px] text-slate-400">Paid via {order.paymentMethod || 'CASH'}</p>
              <span className="h-[1px] bg-slate-200 flex-1"></span>
            </div>
            <p className="font-black uppercase text-[10px] pt-4 text-slate-900">*** VISIT AGAIN ***</p>
          </div>
        </div>
        <div className="p-6 bg-slate-900 grid grid-cols-2 gap-4 no-print">
          <button onClick={onClose} className="py-4 bg-white/10 text-white rounded-2xl font-black uppercase text-[10px] hover:bg-white/20 transition-all">Close</button>
          <button 
            className="py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] shadow-lg shadow-blue-900/40 active:scale-95 transition-all" 
            onClick={() => window.print()}
          >
            <i className="fas fa-print mr-2"></i> Print Bill
          </button>
        </div>
      </div>
    </div>
  );
};

const PaymentModal = ({ order, isOpen, onClose, onConfirm }: { order: Order | null, isOpen: boolean, onClose: () => void, onConfirm: (method: 'CASH' | 'UPI') => void }) => {
  if (!isOpen || !order) return null;
  
  const upiUrl = `upi://pay?pa=${OWNER_VPA}&pn=${encodeURIComponent(OWNER_NAME)}&am=${order.total.toFixed(2)}&cu=INR&tn=Order_${order.id}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiUrl)}`;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 animate-fade-in no-print">
      <div className="bg-white rounded-[48px] w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        <div className="p-8 bg-slate-900 text-white text-center relative">
          <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white"><i className="fas fa-times"></i></button>
          <p className="text-blue-400 text-[9px] font-black uppercase tracking-widest mb-1">Final Payment Due</p>
          <h3 className="text-4xl font-black tracking-tighter">₹{order.total.toFixed(2)}</h3>
          <p className="text-slate-500 text-[10px] uppercase font-bold mt-1">Pay to: {OWNER_NAME}</p>
        </div>
        <div className="p-8 space-y-8 flex-1 overflow-y-auto">
          <div className="bg-blue-50 p-6 rounded-[32px] flex flex-col items-center border border-blue-100">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">Scan using any UPI App</p>
            <div className="bg-white p-4 rounded-3xl shadow-xl">
              <img src={qrUrl} alt="UPI QR" className="w-48 h-48" />
            </div>
            <p className="text-xs font-black mt-4 text-slate-800 tracking-tight">{OWNER_VPA}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => onConfirm('CASH')} 
              className="py-5 bg-slate-100 rounded-[24px] font-black uppercase text-[10px] flex flex-col items-center hover:bg-slate-200 transition-all active:scale-95"
            >
              <i className="fas fa-money-bill-wave text-2xl mb-2 text-slate-700"></i>
              <span>Cash Payment</span>
            </button>
            <button 
              onClick={() => onConfirm('UPI')} 
              className="py-5 bg-green-600 text-white rounded-[24px] font-black uppercase text-[10px] flex flex-col items-center shadow-xl shadow-green-100 hover:bg-green-700 transition-all active:scale-95"
            >
              <i className="fas fa-check-circle text-2xl mb-2"></i>
              <span>Confirm UPI</span>
            </button>
          </div>
        </div>
        <div className="p-4 text-center no-print">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Smart Billing Merchant Node</p>
        </div>
      </div>
    </div>
  );
};

const POS: React.FC = () => {
  const { menu, addOrder, orders, discountCodes, currentBranch } = useApp();
  const [cart, setCart] = useState<{ item: MenuItem; qty: number; notes?: string }[]>([]);
  const [tableNumber, setTableNumber] = useState('1');
  const [searchQuery, setSearchQuery] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [manualDiscount, setManualDiscount] = useState<{ value: number; type: 'PERCENT' | 'FLAT' }>({ value: 0, type: 'PERCENT' });
  const [appliedPromo, setAppliedPromo] = useState<DiscountCode | null>(null);
  const [customerPhone, setCustomerPhone] = useState('');
  const [activeTab, setActiveTab] = useState<'MENU' | 'HISTORY'>('MENU');
  const [pendingPaymentOrder, setPendingPaymentOrder] = useState<Order | null>(null);
  const [viewInvoiceOrder, setViewInvoiceOrder] = useState<Order | null>(null);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Filtered Menu Items
  const filteredMenu = useMemo(() => {
    return menu.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [menu, searchQuery]);

  const subtotal = cart.reduce((acc, i) => acc + (i.item.price * i.qty), 0);
  
  // Calculate discount
  let discountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.type === 'PERCENT') discountAmount = (subtotal * appliedPromo.value) / 100;
    else discountAmount = appliedPromo.value;
  } else if (manualDiscount.value > 0) {
    if (manualDiscount.type === 'PERCENT') discountAmount = (subtotal * manualDiscount.value) / 100;
    else discountAmount = manualDiscount.value;
  }

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const cgst = taxableAmount * 0.025;
  const sgst = taxableAmount * 0.025;
  const total = taxableAmount + cgst + sgst;

  const handleApplyPromo = (code: string) => {
    setManualDiscount({ value: 0, type: 'PERCENT' }); 
    const found = discountCodes.find(c => c.code.toUpperCase() === code.toUpperCase());
    if (found) {
      if (found.minOrder && subtotal < found.minOrder) return alert(`Min order ₹${found.minOrder} required.`);
      setAppliedPromo(found);
    } else {
      alert("Invalid Promo Code");
    }
  };

  const handleCommit = () => {
    if (cart.length === 0) return;
    const newOrder: Omit<Order, 'branchId'> = {
      id: Math.random().toString(36).substr(2, 6).toUpperCase(),
      tableNumber,
      items: cart.map(i => ({ menuItemId: i.item.id, name: i.item.name, price: i.item.price, quantity: i.qty, modifiers: i.notes ? [i.notes] : [] })),
      subtotal,
      discount: discountAmount,
      appliedPromo: appliedPromo?.code,
      cgst, sgst, total,
      status: OrderStatus.PENDING,
      createdAt: new Date(),
      customerPhone
    };
    setPendingPaymentOrder(newOrder as any);
    setMobileCartOpen(false);
  };

  const finalizeOrder = (method: 'CASH' | 'UPI') => {
    if (!pendingPaymentOrder) return;
    const final = { ...pendingPaymentOrder, branchId: currentBranch.id, paymentMethod: method, status: OrderStatus.PAID };
    addOrder(final);
    
    if (customerPhone) sendWhatsAppBill(final, customerPhone);

    setCart([]);
    setAppliedPromo(null);
    setManualDiscount({ value: 0, type: 'PERCENT' });
    setPromoCode('');
    setCustomerPhone('');
    setPendingPaymentOrder(null);
    setActiveTab('HISTORY');
    setViewInvoiceOrder(final);
  };

  const handleVoice = async () => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) return alert("Browser Speech API not supported.");
    
    const recognition = new SpeechRecognition();
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      try {
        const res = await parseVoiceCommand(transcript, menu.map(m => m.name));
        if (res.action === 'ADD_ITEM') {
          res.items.forEach((vItem: any) => {
            const found = menu.find(m => m.name.toLowerCase().includes(vItem.name.toLowerCase()));
            if (found) setCart(prev => [...prev, { item: found, qty: vItem.qty || 1, notes: vItem.notes }]);
          });
        }
        if (res.promo) handleApplyPromo(res.promo);
        if (res.action === 'GENERATE_BILL') handleCommit();
        if (res.action === 'OPEN_BILL') setMobileCartOpen(true);
      } catch (err) { console.error("AI Command Error:", err); }
    };
    recognition.start();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] space-y-4 relative overflow-hidden pb-20 lg:pb-0">
      {/* Top Navigation */}
      <div className="bg-white p-3 rounded-2xl flex flex-col md:flex-row items-center justify-between border border-slate-200 shadow-sm no-print gap-3">
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <div className="bg-blue-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center shrink-0">
            <i className="fas fa-store mr-2"></i> {currentBranch.name}
          </div>
          <button onClick={() => setActiveTab('MENU')} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all grow md:grow-0 ${activeTab === 'MENU' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>Terminal</button>
          <button onClick={() => setActiveTab('HISTORY')} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all grow md:grow-0 ${activeTab === 'HISTORY' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>Log</button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:max-w-xs group">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs transition-colors group-focus-within:text-blue-600"></i>
          <input 
            type="text" 
            placeholder="Filter menu..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-600 transition-all shadow-sm"
          />
        </div>

        <button onClick={handleVoice} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center space-x-2 transition-all shrink-0 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-900 text-white shadow-lg'}`}>
          <i className="fas fa-microphone"></i>
          <span className="hidden sm:inline">{isListening ? 'Listening...' : 'Voice POS'}</span>
        </button>
      </div>

      <div className="flex flex-1 space-x-4 overflow-hidden no-print">
        {activeTab === 'MENU' ? (
          <>
            <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
              {filteredMenu.length === 0 ? (
                <div className="col-span-full py-20 text-center text-slate-300 font-black uppercase text-[10px] tracking-widest italic">No items matched search</div>
              ) : filteredMenu.map(item => (
                <div key={item.id} onClick={() => setCart(p => [...p, { item, qty: 1 }])} className="bg-white p-2 rounded-[24px] border border-slate-100 hover:border-blue-400 cursor-pointer shadow-sm hover:shadow-md transition-all active:scale-95 group">
                  <div className="relative h-28 overflow-hidden rounded-[18px] mb-3">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="px-1 pb-1">
                    <p className="font-black text-[10px] text-slate-400 uppercase tracking-widest mb-1 truncate opacity-60">{item.category}</p>
                    <p className="font-bold text-[11px] text-slate-800 truncate mb-1">{item.name}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-600 font-black text-[10px] tracking-tight">₹{item.price.toFixed(2)}</span>
                      <i className="fas fa-plus-circle text-slate-200 group-hover:text-blue-500 transition-colors"></i>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="hidden lg:flex w-80 bg-white rounded-[32px] border border-slate-200 shadow-xl flex-col overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50/80 flex justify-between items-center">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Order Tray</h3>
                <div className="bg-slate-900 text-white px-3 py-1 rounded-full text-[9px] font-black">TBL #{tableNumber}</div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-200 opacity-50">
                    <i className="fas fa-shopping-basket text-5xl mb-3"></i>
                    <p className="text-[10px] font-black uppercase">Tray Empty</p>
                  </div>
                ) : cart.map((i, idx) => (
                  <div key={idx} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 relative group">
                    <button onClick={() => setCart(c => c.filter((_,id)=>id!==idx))} className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full shadow-sm text-red-500 text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all border border-slate-100"><i className="fas fa-times"></i></button>
                    <div className="flex justify-between items-start">
                      <div className="min-w-0 flex-1 pr-2">
                        <p className="font-black text-[10px] text-slate-800 truncate uppercase tracking-tight">{i.item.name}</p>
                        <p className="text-[9px] font-bold text-slate-400">₹{i.item.price.toFixed(2)} x {i.qty}</p>
                      </div>
                      <p className="font-black text-[10px] text-blue-600">₹{(i.item.price * i.qty).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-6 bg-slate-50 border-t space-y-4">
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Apply Discount</span>
                    <div className="flex bg-slate-100 rounded-lg p-0.5">
                      <button onClick={()=>setManualDiscount(prev=>({...prev, type: 'PERCENT'}))} className={`px-2 py-0.5 rounded text-[8px] font-black ${manualDiscount.type==='PERCENT' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>%</button>
                      <button onClick={()=>setManualDiscount(prev=>({...prev, type: 'FLAT'}))} className={`px-2 py-0.5 rounded text-[8px] font-black ${manualDiscount.type==='FLAT' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>₹</button>
                    </div>
                  </div>
                  <input type="number" value={manualDiscount.value || ''} onChange={e => { setAppliedPromo(null); setManualDiscount(prev => ({...prev, value: parseFloat(e.target.value) || 0})); }} placeholder={`Type ${manualDiscount.type==='PERCENT' ? '%' : 'Amount'}`} className="w-full bg-slate-50 border-none rounded-lg px-3 py-2 text-xs font-bold outline-none focus:ring-1 focus:ring-blue-500" />
                </div>

                {/* WhatsApp Option (Optional) - Added as requested */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                   <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">WhatsApp Receipt (Optional)</label>
                   <div className="relative">
                      <i className="fab fa-whatsapp absolute left-3 top-1/2 -translate-y-1/2 text-green-500 text-xs"></i>
                      <input 
                        type="tel" 
                        placeholder="Mobile number..." 
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-lg pl-9 pr-3 py-2 text-xs font-bold outline-none focus:ring-1 focus:ring-green-500"
                      />
                   </div>
                </div>

                <div className="space-y-1.5 text-[10px] font-bold uppercase text-slate-500">
                  <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                  {discountAmount > 0 && <div className="flex justify-between text-red-500 font-black"><span>Total Savings</span><span>-₹{discountAmount.toFixed(2)}</span></div>}
                  <div className="flex justify-between opacity-60"><span>GST (5%)</span><span>₹{(cgst + sgst).toFixed(2)}</span></div>
                  <div className="flex justify-between text-xl font-black text-slate-900 pt-3 border-t border-slate-200">
                    <span className="tracking-tighter">TOTAL</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
                <button onClick={handleCommit} disabled={cart.length === 0} className="w-full py-4 bg-blue-600 text-white rounded-[20px] font-black uppercase tracking-widest text-[11px] shadow-xl shadow-blue-100 active:scale-95 transition-all disabled:opacity-50">Confirm & Pay</button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
             <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-800">Branch Logs ({currentBranch.name})</h3>
             </div>
             <div className="flex-1 overflow-y-auto">
               <table className="w-full text-left">
                 <thead className="bg-slate-50 text-[9px] font-black uppercase text-slate-400 tracking-widest">
                   <tr><th className="p-5">Ref</th><th className="p-5">Table</th><th className="p-5">Total</th><th className="p-5 text-right">Action</th></tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                   {orders.filter(o=>o.branchId === currentBranch.id).length === 0 ? (
                     <tr><td colSpan={4} className="p-20 text-center text-slate-300 italic uppercase font-black tracking-widest text-[10px]">No Logs Found</td></tr>
                   ) : orders.filter(o=>o.branchId === currentBranch.id).map(o => (
                     <tr key={o.id} className="text-[11px] font-bold hover:bg-slate-50 transition-colors">
                       <td className="p-5 uppercase text-slate-900">#{o.id}</td>
                       <td className="p-5 text-slate-500">TBL-{o.tableNumber}</td>
                       <td className="p-5 font-black text-blue-600">₹{o.total.toFixed(2)}</td>
                       <td className="p-5 text-right"><button onClick={()=>setViewInvoiceOrder(o)} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase hover:bg-blue-600 transition-all">Invoice</button></td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        )}
      </div>

      {/* Mobile Check Bill - High Z-index ensured */}
      {cart.length > 0 && activeTab === 'MENU' && (
        <div className="lg:hidden fixed bottom-6 left-6 right-6 z-[90] no-print">
           <button onClick={() => setMobileCartOpen(true)} className="w-full flex items-center justify-between bg-slate-900 text-white p-5 rounded-[24px] shadow-2xl animate-fade-in border border-white/10 active:scale-95 transition-transform">
              <div className="flex flex-col text-left">
                 <span className="text-[8px] font-black uppercase tracking-[0.2em] text-blue-400">Tray ({cart.length} items)</span>
                 <span className="text-xl font-black">₹{total.toFixed(2)}</span>
              </div>
              <div className="flex items-center space-x-2 bg-blue-600 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                <span>Check Bill</span>
                <i className="fas fa-arrow-right text-[8px]"></i>
              </div>
           </button>
        </div>
      )}

      {/* Mobile Bill Modal */}
      {mobileCartOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-xl p-4 animate-fade-in lg:hidden no-print">
          <div className="bg-white rounded-[40px] h-full flex flex-col overflow-hidden shadow-2xl border border-slate-100">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-800">Checkout Bill</h3>
              <button onClick={() => setMobileCartOpen(false)} className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm"><i className="fas fa-times"></i></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
               {cart.map((i, idx) => (
                 <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="font-black text-[12px] text-slate-800 uppercase tracking-tight truncate">{i.item.name}</p>
                      <p className="text-blue-600 font-bold text-[10px]">₹{(i.item.price * i.qty).toFixed(2)} (x{i.qty})</p>
                    </div>
                    <button onClick={() => setCart(c => c.filter((_,id)=>id!==idx))} className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-red-500 shadow-sm"><i className="fas fa-trash-alt text-xs"></i></button>
                 </div>
               ))}
               
               <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Add Discount</span>
                    <div className="flex bg-white rounded-lg p-0.5 border border-slate-200">
                      <button onClick={()=>setManualDiscount(prev=>({...prev, type: 'PERCENT'}))} className={`px-3 py-1 rounded-md text-[9px] font-black ${manualDiscount.type==='PERCENT' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>%</button>
                      <button onClick={()=>setManualDiscount(prev=>({...prev, type: 'FLAT'}))} className={`px-3 py-1 rounded-md text-[9px] font-black ${manualDiscount.type==='FLAT' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>₹</button>
                    </div>
                  </div>
                  <input type="number" placeholder={`Manual ${manualDiscount.type === 'PERCENT' ? 'Percentage' : 'Amount'}`} value={manualDiscount.value || ''} onChange={e => { setAppliedPromo(null); setManualDiscount(prev => ({...prev, value: parseFloat(e.target.value) || 0})); }} className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-5 text-sm font-bold outline-none focus:ring-1 focus:ring-blue-500" />
               </div>

               <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-3">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest block">WhatsApp Mobile (Optional)</label>
                  <input type="tel" placeholder="e.g. 7021824542" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-5 text-sm font-bold outline-none focus:ring-1 focus:ring-green-500" />
               </div>
            </div>
            <div className="p-8 space-y-5 border-t border-slate-100 bg-slate-50/80">
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total with GST</span>
                <span className="text-3xl font-black text-slate-900 tracking-tighter">₹{total.toFixed(2)}</span>
              </div>
              <button onClick={handleCommit} className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-blue-900/20 active:scale-95 transition-all">Finalize & Pay</button>
            </div>
          </div>
        </div>
      )}

      <PaymentModal isOpen={!!pendingPaymentOrder} order={pendingPaymentOrder} onClose={() => setPendingPaymentOrder(null)} onConfirm={finalizeOrder} />
      <InvoiceModal isOpen={!!viewInvoiceOrder} order={viewInvoiceOrder} onClose={() => setViewInvoiceOrder(null)} />
    </div>
  );
};

export default POS;