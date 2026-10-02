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
        width: '100%',
        backgroundColor: 'var(--color-bg-secondary)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '16px',
        boxSizing: 'border-box',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      <div style={{ width: '100%', maxWidth: '1000px' }}>
        {/* Top breadcrumb label */}
        <div
          style={{
            marginBottom: '8px',
            paddingLeft: '4px',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--color-text-tertiary)',
            userSelect: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <img src="/zyntra-logo.png" alt="Zyntra" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
          <span>Zyntra — Login</span>
        </div>

        {/* Card */}
        <div
          style={{
            width: '100%',
            backgroundColor: 'var(--color-bg-primary)',
            borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
            overflow: 'hidden',
            border: '1px solid var(--color-border-primary)',
            display: 'flex',
            flexDirection: 'row',
            minHeight: '520px',
          }}
        >
          {/* Left Brand Panel — hidden on mobile */}
          <BrandPanel />

          {/* Right Form Panel */}
          <div
            style={{
              flex: 1,
              minWidth: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '32px 24px',
              backgroundColor: 'var(--color-bg-primary)',
            }}
          >
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
