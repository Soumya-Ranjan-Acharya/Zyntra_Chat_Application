import React, { useEffect } from 'react';
import BrandPanel from '../components/auth/BrandPanel';
import LoginForm from '../components/auth/LoginForm';

const LoginPage = () => {
  useEffect(() => {
    document.title = 'Zyntra — Login';
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-secondary, #e2e5ea)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        boxSizing: 'border-box',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
      }}
      className="p-3 sm:p-6"
    >
      <div style={{ width: '100%', maxWidth: '1040px' }}>
        {/* Top Header */}
        <div
          style={{
            marginBottom: '10px',
            paddingLeft: '4px',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--color-text-tertiary, #64748b)',
            userSelect: 'none'
          }}
          className="flex items-center gap-2"
        >
          <img src="/zyntra-logo.png" alt="Zyntra" className="w-4 h-4 object-contain lg:hidden" />
          <span>Zyntra — Login</span>
        </div>

        {/* Master Floating Window Card */}
        <div
          style={{
            width: '100%',
            backgroundColor: 'var(--color-bg-primary, #ffffff)',
            borderRadius: '24px',
            boxShadow: 'var(--elevation-3, 0 20px 40px -15px rgba(0, 0, 0, 0.15))',
            overflow: 'hidden',
            border: '1px solid var(--color-border-primary, #d1d5db)',
          }}
          className="flex flex-col lg:flex-row min-h-0 sm:min-h-[560px]"
        >
          {/* Left Brand Panel (Desktop) */}
          <BrandPanel />

          {/* Right Form Panel */}
          <div
            style={{
              backgroundColor: 'var(--color-bg-primary, #ffffff)',
            }}
            className="flex-1 p-5 sm:p-10 flex items-center justify-center"
          >
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
