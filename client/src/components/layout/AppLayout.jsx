import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, LogOut, Menu, X, Home } from 'lucide-react';
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
        backgroundColor: 'var(--color-bg-primary)',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
            style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Left Sidebar */}
      <aside
        style={{
          width: '320px',
          minWidth: '320px',
          maxWidth: '320px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--sidebar-bg)',
          color: 'var(--sidebar-text)',
          borderRight: '1px solid var(--sidebar-border)',
          zIndex: 30,
          position: 'relative',
        }}
      >
        {/* Sidebar content */}
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', position: 'relative' }}>
          {sidebar}
        </div>

        {/* Bottom User Bar */}
        <div
          style={{
            padding: '10px 12px',
            backgroundColor: 'rgba(0,0,0,0.2)',
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
              <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'rgba(147, 197, 253, 0.8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                @{activeContext?.username || user?.primaryUsername || 'user'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
            <BottomBtn onClick={() => navigate('/')} title="Context Navigator">
              <Home size={15} />
            </BottomBtn>
            <BottomBtn onClick={() => navigate('/settings/appearance')} title="Settings">
              <Settings size={15} />
            </BottomBtn>
            <BottomBtn onClick={handleLogout} title="Sign Out" danger>
              <LogOut size={15} />
            </BottomBtn>
          </div>
        </div>
      </aside>

      {/* Mobile hamburger */}
      <div className="lg:hidden fixed top-3 left-3 z-50">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            padding: '8px', borderRadius: '12px',
            backgroundColor: 'var(--sidebar-bg)',
            color: 'var(--sidebar-text)',
            boxShadow: 'var(--elevation-3)',
            border: '1px solid var(--sidebar-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
          aria-label="Toggle navigation menu"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </motion.button>
      </div>

      {/* Main content */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          height: '100%',
          overflow: 'hidden',
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
      padding: '6px', borderRadius: '8px',
      background: 'none', border: 'none',
      color: danger ? 'var(--sidebar-text-secondary)' : 'var(--sidebar-text-secondary)',
      cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'background-color 150ms, color 150ms',
    }}
    className={danger ? 'hover:text-red-400 hover:bg-red-500/10' : 'hover:text-white hover:bg-white/10'}
  >
    {children}
  </motion.button>
);

export default AppLayout;
