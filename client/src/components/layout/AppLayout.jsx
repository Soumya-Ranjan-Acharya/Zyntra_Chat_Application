import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings, LogOut, Home } from 'lucide-react';
import Avatar from '../ui/Avatar';
import useAuthStore from '../../store/useAuthStore';

const AppLayout = ({ children, sidebar, isMobileChatOpen = false }) => {
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
        minHeight: '100vh',
        height: '100dvh',
        overflow: 'hidden',
        backgroundColor: 'var(--color-bg-primary)',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Left Sidebar: 320px on desktop, full-width on mobile */}
      <aside
        className={`app-sidebar ${isMobileChatOpen ? 'mobile-hidden' : 'mobile-visible'}`}
        style={{
          backgroundColor: 'var(--sidebar-bg)',
          color: 'var(--sidebar-text)',
          borderRight: '1px solid var(--sidebar-border)',
          zIndex: 30,
          position: 'relative',
        }}
      >
        {/* Sidebar content */}
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
          {sidebar}
        </div>

        {/* Bottom User Bar */}
        <div
          style={{
            padding: '10px 14px calc(10px + env(safe-area-inset-bottom, 0px))',
            backgroundColor: 'rgba(0,0,0,0.25)',
            borderTop: '1px solid var(--sidebar-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden', minWidth: 0 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <Avatar name={user?.name || 'User'} src={user?.avatar} size="sm" status="online" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--sidebar-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>
                {user?.name || 'User'}
              </span>
              <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'rgba(147, 197, 253, 0.85)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                @{activeContext?.username || user?.primaryUsername || 'user'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
            <BottomBtn onClick={() => navigate('/')} title="Context Navigator">
              <Home size={16} />
            </BottomBtn>
            <BottomBtn onClick={() => navigate('/settings/appearance')} title="Settings">
              <Settings size={16} />
            </BottomBtn>
            <BottomBtn onClick={handleLogout} title="Sign Out" danger>
              <LogOut size={16} />
            </BottomBtn>
          </div>
        </div>
      </aside>

      {/* Main content: flex-1 on desktop, full-width on mobile */}
      <main
        className={`app-main ${isMobileChatOpen ? 'mobile-visible' : 'mobile-hidden'}`}
        style={{
          backgroundColor: 'var(--color-bg-primary)',
          position: 'relative',
        }}
      >
        {children}
      </main>
    </div>
  );
};

const BottomBtn = ({ children, onClick, title, danger }) => (
  <motion.button
    onClick={onClick}
    whileTap={{ scale: 0.85 }}
    title={title}
    style={{
      padding: '7px',
      borderRadius: '8px',
      background: 'none',
      border: 'none',
      color: danger ? 'var(--sidebar-text-secondary)' : 'var(--sidebar-text-secondary)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background-color 150ms, color 150ms',
    }}
    className={danger ? 'hover:text-red-400 hover:bg-red-500/10' : 'hover:text-white hover:bg-white/10'}
  >
    {children}
  </motion.button>
);

export default AppLayout;
