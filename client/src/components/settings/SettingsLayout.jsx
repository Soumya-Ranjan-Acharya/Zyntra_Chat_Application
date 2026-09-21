import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

const navTabs = [
  { to: '/settings/appearance', label: 'Appearance & personalization' },
  { to: '/settings/profile', label: 'Profile' },
  { to: '/settings/account', label: 'Account' },
  { to: '/settings/privacy', label: 'Privacy & Security' },
  { to: '/settings/notifications', label: 'Notifications' },
  { to: '/settings/workspace', label: 'Workspace Settings' },
];

const SettingsLayout = ({ children }) => {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const currentTab = navTabs.find((t) => t.to === location.pathname) || navTabs[0];

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f1f3f6',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px 20px',
        boxSizing: 'border-box',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
      }}
    >
      {/* Outer Card Container matching media_1789559080552.png */}
      <div
        style={{
          width: '100%',
          maxWidth: '1060px',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.06)',
          padding: '28px 36px 36px 36px',
          boxSizing: 'border-box',
          margin: '0 auto'
        }}
      >
        {/* Top Header Bar matching media_1789559080552.png */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            userSelect: 'none'
          }}
        >
          {/* Left Title & Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
            <span
              onClick={() => navigate('/')}
              title="Go to Zyntra Hub"
              style={{
                fontSize: '19px',
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '-0.025em',
                cursor: 'pointer'
              }}
            >
              Zyntra
            </span>
            <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 500 }}>
              Settings
            </span>

            {/* Dropdown trigger for section */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'none',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#0f172a',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  backgroundColor: dropdownOpen ? '#f1f5f9' : 'transparent',
                  transition: 'background-color 0.15s'
                }}
              >
                <span>{currentTab.label}</span>
                <span style={{ fontSize: '10px', color: '#64748b' }}>▾</span>
              </button>

              {/* Section dropdown menu */}
              {dropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: '6px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                    minWidth: '220px',
                    zIndex: 50,
                    padding: '6px'
                  }}
                >
                  {navTabs.map((tab) => (
                    <div
                      key={tab.to}
                      onClick={() => {
                        navigate(tab.to);
                        setDropdownOpen(false);
                      }}
                      style={{
                        padding: '8px 12px',
                        fontSize: '12px',
                        fontWeight: tab.to === location.pathname ? 700 : 500,
                        color: tab.to === location.pathname ? '#1d63ff' : '#334155',
                        backgroundColor: tab.to === location.pathname ? '#eff6ff' : 'transparent',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'background-color 0.1s'
                      }}
                    >
                      {tab.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right User Avatar */}
          <div
            onClick={() => navigate('/')}
            title="Return to Hub"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#1d63ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              userSelect: 'none',
              overflow: 'hidden',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
            }}
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name || 'User'}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              'S'
            )}
          </div>
        </div>

        {/* The Crisp Blue Bordered Container matching media_1789559080552.png */}
        <div
          style={{
            border: '2px solid #1d63ff',
            borderRadius: '14px',
            padding: '28px 32px',
            backgroundColor: '#ffffff'
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;
