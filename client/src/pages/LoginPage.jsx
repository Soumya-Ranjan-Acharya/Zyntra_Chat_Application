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
        backgroundColor: '#e2e5ea',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px 16px',
        boxSizing: 'border-box',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
      }}
    >
      <div style={{ width: '100%', maxWidth: '1040px' }}>
        {/* Top Header matching media_1789559066111.png */}
        <div
          style={{
            marginBottom: '12px',
            paddingLeft: '4px',
            fontSize: '13px',
            fontWeight: 500,
            color: '#64748b',
            userSelect: 'none'
          }}
        >
          Zyntra — Login
        </div>

        {/* Master Floating Window Card */}
        <div
          style={{
            width: '100%',
            backgroundColor: '#ffffff',
            borderRadius: '28px',
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.15)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'row',
            border: '1px solid #d1d5db',
            minHeight: '600px'
          }}
        >
          {/* Left Brand Panel */}
          <BrandPanel />

          {/* Right Form Panel */}
          <div
            style={{
              flex: '1 1 55%',
              backgroundColor: '#ffffff',
              padding: '36px 44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
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
