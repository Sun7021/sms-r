
import React from 'react';
import { useApp } from '../AppContext';
import { OrderStatus } from '../types';

const KDS: React.FC = () => {
  const { orders, updateOrderStatus } = useApp();
  
  const statusColors = {
    [OrderStatus.PENDING]: 'border-t-red-500 bg-red-50',
    [OrderStatus.PREPARING]: 'border-t-orange-400 bg-orange-50',
    [OrderStatus.READY]: 'border-t-green-500 bg-green-50',
    [OrderStatus.SERVED]: 'border-t-slate-400 bg-white',
    [OrderStatus.PAID]: 'border-t-blue-500 bg-blue-50',
    [OrderStatus.CANCELLED]: 'border-t-slate-300 bg-slate-50 opacity-50',
  };

  const getNextStatus = (current: OrderStatus) => {
    switch (current) {
      case OrderStatus.PENDING: return OrderStatus.PREPARING;
      case OrderStatus.PREPARING: return OrderStatus.READY;
      case OrderStatus.READY: return OrderStatus.SERVED;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Kitchen Display System</h2>
        <div className="flex space-x-3">
           <span className="flex items-center space-x-2 text-sm text-slate-500">
             <span className="w-3 h-3 rounded-full bg-red-500"></span>
             <span>New</span>
           </span>
           <span className="flex items-center space-x-2 text-sm text-slate-500">
             <span className="w-3 h-3 rounded-full bg-orange-400"></span>
             <span>Preparing</span>
           </span>
           <span className="flex items-center space-x-2 text-sm text-slate-500">
             <span className="w-3 h-3 rounded-full bg-green-500"></span>
             <span>Ready</span>
           </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {orders.filter(o => o.status !== OrderStatus.PAID && o.status !== OrderStatus.CANCELLED).map(order => (
          <div 
            key={order.id} 
            className={`border-t-4 ${statusColors[order.status]} shadow-sm rounded-xl overflow-hidden transition-all flex flex-col min-h-[300px]`}
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-800 text-lg">Table #{order.tableNumber}</h4>
                <p className="text-xs text-slate-500 font-medium">{new Date(order.createdAt).toLocaleTimeString()}</p>
              </div>
              <div className="text-right">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${order.status === OrderStatus.PENDING ? 'bg-red-200 text-red-700' : 'bg-orange-200 text-orange-700'}`}>
                  {order.status}
                </span>
              </div>
            </div>

            <div className="flex-1 p-4 space-y-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-start justify-between">
                  <div className="flex space-x-3">
                    <span className="font-black text-blue-600 text-lg leading-tight">{item.quantity}x</span>
                    <div>
                      <h5 className="font-bold text-slate-800 uppercase text-sm">{item.name}</h5>
                      {order.notes && <p className="text-[10px] text-red-500 italic mt-0.5">{order.notes}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-white border-t border-slate-200 mt-auto">
              {getNextStatus(order.status) ? (
                <button 
                  onClick={() => updateOrderStatus(order.id, getNextStatus(order.status)!)}
                  className="w-full py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-all text-sm uppercase tracking-widest"
                >
                  Mark as {getNextStatus(order.status)}
                </button>
              ) : (
                <div className="text-center text-xs text-slate-400 font-medium py-2">
                  <i className="fas fa-check-circle mr-1 text-green-500"></i> Waiting for service
                </div>
              )}
            </div>
          </div>
        ))}
        {orders.filter(o => o.status !== OrderStatus.PAID && o.status !== OrderStatus.CANCELLED).length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-400 flex flex-col items-center">
             <i className="fas fa-clipboard-list text-6xl mb-4 opacity-20"></i>
             <p className="text-xl font-bold">Kitchen is clear!</p>
             <p className="text-sm">No pending orders at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KDS;
