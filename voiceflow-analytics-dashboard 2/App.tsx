import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import DashboardStats from './components/DashboardStats';
import TranscriptList from './components/TranscriptList';
import LiveChat from './components/LiveChat';
import { CustomerConfig } from './types';
import { validateToken } from './services/voiceflowService';
import { ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [customer, setCustomer] = useState<CustomerConfig | null>(null);
  const [activeView, setActiveView] = useState('dashboard');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const config = await validateToken(tokenInput);
      setCustomer(config);
      setIsAuthenticated(true);
    } catch (err) {
      setError('Invalid access token. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCustomer(null);
    setTokenInput('');
    setActiveView('dashboard');
  };

  // Unauthenticated View
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="bg-slate-900 p-8 text-center">
            <div className="w-16 h-16 bg-indigo-500 rounded-2xl mx-auto flex items-center justify-center text-white mb-4 shadow-lg shadow-indigo-500/30">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-2xl font-bold text-white">Voiceflow Customer Portal</h1>
            <p className="text-slate-400 mt-2 text-sm">Enter your secure access token to view analytics.</p>
          </div>
          
          <div className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Access Token</label>
                <input
                  type="text"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="e.g. 550e8400-e29b..."
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                />
              </div>
              
              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2">
                   <span>⚠️</span> {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !tokenInput}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <>Access Dashboard <ArrowRight size={20} /></>}
              </button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-xs text-slate-400">
                Authorized use only. All access is logged.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated View
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar 
        activeView={activeView} 
        onChangeView={setActiveView} 
        onLogout={handleLogout}
        customerName={customer?.name || 'Customer'}
      />
      
      <main className="ml-64 flex-1 h-screen overflow-y-auto">
        {activeView === 'dashboard' && <DashboardStats />}
        {activeView === 'transcripts' && <TranscriptList />}
        {activeView === 'live' && <LiveChat />}
        {activeView === 'settings' && (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Configuration</h2>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Project ID</label>
                  <p className="font-mono text-slate-700 mt-1">{customer?.projectID}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Environment</label>
                  <p className="font-mono text-slate-700 mt-1 uppercase">{customer?.environmentID}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
