
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const { login } = useApp();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = login(username, password);
    if (!success) {
      setError('Invalid username or password');
    }
  };

  const handleCustomerPortal = () => {
    navigate('/customer');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        
        <div className="text-center">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center text-white text-4xl font-bold shadow-xl shadow-blue-200 mb-6">
            <i className="fas fa-receipt"></i>
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight uppercase">Smart Billing Software</h2>
          <p className="mt-2 text-slate-500 font-medium text-xs uppercase tracking-widest">Enterprise Management Node</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Username</label>
              <div className="relative">
                <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition-all text-slate-800"
                  placeholder="Staff ID"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Password</label>
              <div className="relative">
                <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition-all text-slate-800"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-lg flex items-center space-x-2">
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-3">
            <button
              type="submit"
              className="w-full py-4 bg-slate-900 text-white rounded-xl font-black shadow-xl hover:bg-slate-800 transition-all uppercase tracking-widest text-sm"
            >
              Sign In
            </button>
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="flex-shrink mx-4 text-slate-300 text-[10px] font-black uppercase tracking-widest">OR</span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>
            <button
              type="button"
              onClick={handleCustomerPortal}
              className="w-full py-4 bg-blue-50 text-blue-600 border-2 border-blue-100 rounded-xl font-black hover:bg-blue-100 transition-all uppercase tracking-widest text-sm flex items-center justify-center space-x-2"
            >
              <i className="fas fa-qrcode"></i>
              <span>Open Customer Ordering</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;