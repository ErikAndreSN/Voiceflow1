import React from 'react';
import { LayoutDashboard, MessageSquare, Radio, Settings, LogOut, FileText } from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onChangeView: (view: string) => void;
  onLogout: () => void;
  customerName: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onChangeView, onLogout, customerName }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'transcripts', label: 'Transcripts', icon: FileText },
    { id: 'live', label: 'Live Monitor', icon: Radio },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white h-screen flex flex-col fixed left-0 top-0 shadow-xl z-50">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-indigo-500 flex items-center justify-center font-bold text-lg">
            V
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">VF Analytics</h1>
            <p className="text-xs text-slate-400">{customerName}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 mt-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
              {item.id === 'live' && (
                <span className="ml-auto w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
