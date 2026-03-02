
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './AppContext';
import Dashboard from './views/Dashboard';
import POS from './views/POS';
import KDS from './views/KDS';
import InventoryView from './views/InventoryView';
import CustomerPortal from './views/CustomerPortal';
import Settings from './views/Settings';
import Login from './views/Login';
import MenuView from './views/MenuView';
import StaffView from './views/StaffView';

const ProfileModal = ({ isOpen, onClose, user }: { isOpen: boolean, onClose: () => void, user: any }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl border border-slate-100">
        <div className="bg-slate-900 p-8 text-center relative">
          <div className="w-24 h-24 rounded-3xl bg-blue-600 mx-auto flex items-center justify-center text-white text-4xl font-black shadow-xl border-4 border-slate-800">
            {user?.name?.charAt(0)}
          </div>
          <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors">
            <i className="fas fa-times"></i>
          </button>
          <h3 className="text-white mt-4 text-2xl font-black tracking-tight">{user?.name}</h3>
          <p className="text-blue-400 text-xs font-black uppercase tracking-[0.2em]">{user?.role} ACCOUNT</p>
        </div>
        <div className="p-8 space-y-6">
          <div className="space-y-4">
             <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center space-x-3">
                  <i className="fas fa-id-badge text-slate-400"></i>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Internal ID</span>
                </div>
                <span className="font-mono font-bold text-slate-800">#{user?.id}</span>
             </div>
             <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center space-x-3">
                  <i className="fas fa-user-circle text-slate-400"></i>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Username</span>
                </div>
                <span className="font-bold text-slate-800">@{user?.username}</span>
             </div>
          </div>
          <button onClick={onClose} className="w-full py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

const Sidebar = ({ isOpen, toggle }: { isOpen: boolean, toggle: () => void }) => {
  const location = useLocation();
  const { user, logout } = useApp();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const allLinks = [
    { to: '/', icon: 'fa-chart-line', label: 'Dashboard', roles: ['ADMIN'] },
    { to: '/pos', icon: 'fa-cash-register', label: 'POS Terminal', roles: ['ADMIN', 'STAFF'] },
    { to: '/kds', icon: 'fa-utensils', label: 'Kitchen Display', roles: ['ADMIN', 'STAFF'] },
    { to: '/inventory', icon: 'fa-boxes-stacked', label: 'Inventory', roles: ['ADMIN', 'STAFF'] },
    { to: '/menu', icon: 'fa-book-open', label: 'Menu Builder', roles: ['ADMIN'] },
    { to: '/staff', icon: 'fa-users-cog', label: 'Staff Hub', roles: ['ADMIN'] },
    { to: '/settings', icon: 'fa-cog', label: 'Settings', roles: ['ADMIN'] },
  ];

  const visibleLinks = allLinks.filter(link => user && link.roles.includes(user.role));

  return (
    <>
      <aside className={`w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 flex flex-col shadow-xl z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 text-center border-b border-slate-800 relative">
          <h1 className="text-xl font-bold tracking-tight text-blue-400 uppercase">SMART<span className="text-white">BILLING</span></h1>
          <p className="text-[8px] text-slate-400 mt-1 uppercase tracking-widest font-black">AI Powered ERP</p>
          <button onClick={toggle} className="md:hidden absolute top-6 right-4 text-slate-500 hover:text-white">
            <i className="fas fa-chevron-left"></i>
          </button>
        </div>
        <nav className="flex-1 mt-6 px-4 overflow-y-auto">
          {visibleLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => { if(window.innerWidth < 768) toggle(); }}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 mb-1 ${
                location.pathname === link.to ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <i className={`fas ${link.icon} w-5`}></i>
              <span className="font-semibold text-sm">{link.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800 space-y-4">
          <div 
            onClick={() => setIsProfileOpen(true)}
            className="flex items-center space-x-3 text-slate-400 cursor-pointer hover:bg-slate-800/50 p-2 rounded-xl transition-all border border-transparent hover:border-slate-700"
          >
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600 text-white font-black text-[10px]">
              {user?.name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-white truncate">{user?.name}</p>
              <p className="text-[8px] uppercase font-black text-slate-500">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 p-2 rounded-lg bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
          >
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </div>
      </aside>
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} user={user} />
    </>
  );
};

const Header = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
  const { isSyncing, cloudStatus, notifications, markNotificationsAsRead } = useApp();
  const [showNotif, setShowNotif] = useState(false);
  const [hasAiKey, setHasAiKey] = useState(true);
  
  useEffect(() => {
    const keys = localStorage.getItem('gemini_api_keys');
    const hasKeys = keys && JSON.parse(keys).some((k: any) => k.isActive);
    setHasAiKey(!!hasKeys || !!process.env.API_KEY || !!process.env.OPENAI_API_KEY);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getStatusConfig = () => {
    switch(cloudStatus) {
      case 'syncing': return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', label: 'Syncing Nodes...', icon: 'fa-sync animate-spin' };
      case 'offline': return { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100', label: 'Local Cache Active', icon: 'fa-wifi-slash' };
      case 'error': return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100', label: 'Cloud Unavailable', icon: 'fa-exclamation-triangle' };
      default: return { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100', label: 'Enterprise Cloud Live', icon: 'fa-cloud' };
    }
  };

  const config = getStatusConfig();

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center space-x-4">
        <button onClick={toggleSidebar} className="md:hidden text-slate-500 hover:text-blue-600 p-2 bg-slate-100 rounded-lg">
          <i className="fas fa-bars"></i>
        </button>
        <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight hidden sm:block">Smart Billing Management</h2>
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border transition-all duration-500 ${config.bg} ${config.text} ${config.border}`}>
          <i className={`fas ${config.icon} text-[10px]`}></i>
          <span className="text-[9px] font-black uppercase tracking-widest whitespace-nowrap">
            {config.label}
          </span>
        </div>
        {!hasAiKey && (
          <Link to="/settings" className="flex items-center space-x-2 px-3 py-1 rounded-full bg-red-600 text-white text-[9px] font-black uppercase tracking-widest animate-pulse shadow-lg">
             <i className="fas fa-robot"></i>
             <span>Configure AI Key</span>
          </Link>
        )}
      </div>
      <div className="flex items-center space-x-4 relative">
        {isSyncing && (
          <span className="text-[9px] font-black text-blue-500 animate-pulse uppercase tracking-widest flex items-center">
             Live Sync
          </span>
        )}
        <button 
          onClick={() => { setShowNotif(!showNotif); markNotificationsAsRead(); }}
          className="relative text-slate-400 hover:text-blue-600 transition-colors w-8 h-8 rounded-full hover:bg-slate-50 flex items-center justify-center"
        >
          <i className="fas fa-bell text-sm"></i>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full text-[8px] text-white flex items-center justify-center font-bold">
              {unreadCount}
            </span>
          )}
        </button>

        {showNotif && (
          <div className="absolute top-12 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 animate-fade-in z-50 overflow-hidden">
             <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Notifications</h3>
               <button onClick={() => setShowNotif(false)} className="text-slate-400 hover:text-slate-900"><i className="fas fa-times"></i></button>
             </div>
             <div className="max-h-96 overflow-y-auto divide-y divide-slate-50">
               {notifications.length === 0 ? (
                 <div className="p-10 text-center text-slate-400 italic text-[10px] uppercase font-bold">No new notifications</div>
               ) : notifications.map(n => (
                 <div key={n.id} className={`p-4 hover:bg-slate-50 transition-colors ${!n.read ? 'bg-blue-50/30' : ''}`}>
                    <p className="font-bold text-xs text-slate-800">{n.title}</p>
                    <p className="text-[10px] text-slate-500 mt-1">{n.message}</p>
                    <p className="text-[8px] text-slate-400 mt-2 uppercase font-black">{new Date(n.timestamp).toLocaleTimeString()}</p>
                 </div>
               ))}
             </div>
          </div>
        )}
      </div>
    </header>
  );
};

const AuthenticatedLayout = ({ children }: { children?: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar isOpen={sidebarOpen} toggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 md:ml-64 flex flex-col w-full overflow-hidden">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="p-4 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

const AppContent = () => {
  const { user } = useApp();
  const location = useLocation();

  if (location.pathname === '/customer') {
    return <CustomerPortal />;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <AuthenticatedLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/pos" element={<POS />} />
        <Route path="/kds" element={<KDS />} />
        <Route path="/inventory" element={<InventoryView />} />
        <Route path="/menu" element={<MenuView />} />
        <Route path="/staff" element={<StaffView />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/customer" element={<Navigate to="/" />} />
      </Routes>
    </AuthenticatedLayout>
  );
}

const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </AppProvider>
  );
};

export default App;
