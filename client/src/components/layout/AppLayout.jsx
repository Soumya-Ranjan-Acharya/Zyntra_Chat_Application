import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, LogOut, Menu, X, Home } from 'lucide-react';
import Avatar from '../ui/Avatar';
import useAuthStore from '../../store/useAuthStore';

const AppLayout = ({ children, sidebar }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, activeContext } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Close sidebar on route change for mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

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
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 lg:hidden"
            style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Left Sidebar Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 w-[86vw] max-w-[320px] sm:w-[320px] transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--sidebar-bg)',
          color: 'var(--sidebar-text)',
          borderRight: '1px solid var(--sidebar-border)',
          zIndex: 50,
          boxShadow: sidebarOpen ? '0 0 40px rgba(0,0,0,0.5)' : 'none',
        }}
      >
        {/* Mobile Drawer Top Close Header */}
        <div className="lg:hidden flex items-center justify-between px-3.5 py-2.5 border-b border-[var(--sidebar-border)] bg-[var(--color-bg-primary)]">
          <div className="flex items-center gap-2">
            <img src="/zyntra-logo.png" alt="Zyntra" className="w-5 h-5 object-contain" />
            <span className="font-bold text-xs tracking-tight text-[var(--color-text-primary)]">Zyntra Navigation</span>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors"
            title="Close menu"
          >
            <X size={18} />
          </motion.button>
        </div>

        {/* Sidebar content */}
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', position: 'relative' }}>
          {React.isValidElement(sidebar)
            ? React.cloneElement(sidebar, { onCloseMobile: () => setSidebarOpen(false) })
            : sidebar}
        </div>

        {/* Bottom User Bar */}
        <div
          style={{
            padding: '10px 12px calc(10px + env(safe-area-inset-bottom, 0px))',
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

      {/* Mobile hamburger button */}
      {!sidebarOpen && (
        <div className="lg:hidden fixed top-2.5 left-2.5 z-30">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setSidebarOpen(true)}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '11px',
              backgroundColor: 'var(--color-bg-primary)',
              color: 'var(--color-text-primary)',
              boxShadow: 'var(--elevation-2)',
              border: '1px solid var(--color-border-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
            }}
            aria-label="Open navigation menu"
          >
            <Menu size={19} />
          </motion.button>
        </div>
      )}

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
