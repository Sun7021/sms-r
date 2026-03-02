
import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../AppContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getSalesPrediction } from '../aiService';
import { OrderStatus } from '../types';

const Dashboard: React.FC = () => {
  const { salesHistory, menu, orders, currentBranch } = useApp();
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  // Real-time stat calculation filtered by branch
  const liveStats = useMemo(() => {
    const today = new Date().toLocaleDateString();
    
    // Filter orders belonging to the currently selected branch
    const branchOrders = orders.filter(o => o.branchId === currentBranch.id);
    
    const todayPaidOrders = branchOrders.filter(o => 
      o.status === OrderStatus.PAID && 
      new Date(o.createdAt).toLocaleDateString() === today
    );
    
    const totalRevenue = todayPaidOrders.reduce((acc, o) => acc + o.total, 0);
    
    const activeOrdersCount = branchOrders.filter(o => 
      o.status !== OrderStatus.PAID && 
      o.status !== OrderStatus.CANCELLED
    ).length;

    // Determine popular item from branch orders
    const itemCounts: Record<string, number> = {};
    branchOrders.forEach(o => o.items.forEach(i => {
      itemCounts[i.name] = (itemCounts[i.name] || 0) + i.quantity;
    }));
    
    const sortedItems = Object.entries(itemCounts).sort((a, b) => b[1] - a[1]);
    const popularItem = sortedItems[0]?.[0] || 'N/A';

    return {
      revenue: totalRevenue,
      active: activeOrdersCount,
      popular: popularItem
    };
  }, [orders, currentBranch.id]);

  useEffect(() => {
    const fetchAI = async () => {
      if (salesHistory.length === 0) return;
      setLoadingAI(true);
      try {
        const prediction = await getSalesPrediction(salesHistory);
        setAiInsights(prediction);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingAI(false);
      }
    };
    fetchAI();
  }, [salesHistory]);

  const stats = [
    { label: 'Today Revenue', value: `₹${liveStats.revenue.toLocaleString()}`, icon: 'fa-indian-rupee-sign', color: 'bg-blue-600' },
    { label: 'Active Orders', value: liveStats.active.toString(), icon: 'fa-shopping-bag', color: 'bg-indigo-600' },
    { label: 'Live Top Choice', value: liveStats.popular, icon: 'fa-fire', color: 'bg-orange-600' },
    { label: 'Branch Node', value: currentBranch.name, icon: 'fa-network-wired', color: 'bg-green-600' },
  ];

  return (
    <div className="space-y-4 h-[calc(100vh-100px)] overflow-y-auto pr-1">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-3">
            <div className={`${stat.color} w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg flex-shrink-0`}>
              <i className={`fas ${stat.icon} text-sm`}></i>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest truncate">{stat.label}</p>
              <h3 className="text-lg font-black text-slate-800 tracking-tight truncate">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Revenue Analytics ({currentBranch.name})</h3>
          </div>
          <div className="h-64 flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesHistory}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  formatter={(value: any) => [`₹${value}`, 'Amount']}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSales)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-xl relative overflow-hidden flex flex-col">
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center space-x-2 mb-4 text-blue-400">
              <i className="fas fa-robot text-sm animate-pulse"></i>
              <h3 className="text-[10px] font-black uppercase tracking-widest">AI Forecast Engine</h3>
            </div>

            {loadingAI ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-3">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Processing Data...</p>
              </div>
            ) : aiInsights ? (
              <div className="flex-1 space-y-4">
                <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                  <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1">Weekly Growth</p>
                  <p className="text-2xl font-black text-blue-400">+{aiInsights.growthForecast || 14}%</p>
                </div>
                <div>
                  <h4 className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-2">Demand Hub</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {aiInsights.peakHours.map((hour: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 bg-blue-600/20 text-blue-300 text-[8px] rounded-lg uppercase font-black border border-blue-500/20">{hour}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-2">Aesthetic Trends</h4>
                  <ul className="space-y-1.5">
                    {aiInsights.suggestedDishes.map((dish: string, i: number) => (
                      <li key={i} className="flex items-center space-x-2 text-[10px] text-slate-300">
                        <i className="fas fa-check-circle text-green-500 text-[8px]"></i>
                        <span className="font-bold">{dish}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500 text-[10px] uppercase font-black">Waiting for Data</div>
            )}
          </div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
