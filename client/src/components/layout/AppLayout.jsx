import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, LogOut, Menu, X, Home, Shield } from 'lucide-react';
import Avatar from '../ui/Avatar';
import useAuthStore from '../../store/useAuthStore';

const AppLayout = ({ children, sidebar }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, activeContext } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div
      style={{
        display: 'flex',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
      }}
    >
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Left Sidebar */}
      <aside
        style={{
          width: '320px',
          minWidth: '320px',
          maxWidth: '320px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#081028',
          color: '#e2e8f0',
          borderRight: '1px solid #162244',
          zIndex: 30
        }}
      >
        {/* Sidebar Content */}
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', position: 'relative' }}>
          {sidebar}
        </div>

        {/* Bottom User Bar */}
        <div className="p-3 bg-[#070e24] border-t border-[#131f40] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
            <div className="relative shrink-0">
              <Avatar name={user?.name || 'Soumya'} src={user?.avatar} size="sm" status="online" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-xs text-white truncate tracking-tight">
                {user?.name || 'Soumya Mohanty'}
              </span>
              <span className="text-[10.5px] font-mono text-blue-300/80 truncate">
                @{activeContext?.username || user?.primaryUsername || 'soumya'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            {/* Home / Context Navigator Button */}
            <button
              onClick={() => navigate('/')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Context Navigator"
            >
              <Home size={15} />
            </button>
            {/* Settings Button */}
            <button
              onClick={() => navigate('/settings/appearance')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Appearance & Settings"
            >
              <Settings size={15} />
            </button>
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Hamburger Header (Only visible on small screens) */}
      <div className="lg:hidden fixed top-3 left-3 z-30">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl bg-[#081028] text-white shadow-lg border border-[#1e2e5a] flex items-center justify-center cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Main Application Content Area */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          height: '100%',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          position: 'relative'
        }}
      >
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
