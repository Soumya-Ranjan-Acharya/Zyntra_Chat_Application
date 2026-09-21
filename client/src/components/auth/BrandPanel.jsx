import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

const BrandPanel = ({ previewUsername, previewName }) => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const displayHandle = previewUsername
    ? (previewUsername.startsWith('@') ? previewUsername : `@${previewUsername}`)
    : (user?.primaryUsername ? `@${user.primaryUsername}` : '@yourhandle');

  const displayName = previewName || user?.name || 'Zyntra Verified Member';
  const initial = (previewName || user?.name || user?.primaryUsername || 'Z').charAt(0).toUpperCase();

  return (
    <div
      style={{
        backgroundColor: '#0a0f1d',
        position: 'relative',
        overflow: 'hidden',
        color: '#ffffff',
        padding: '40px 44px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        userSelect: 'none',
        flex: '0 0 45%',
        minWidth: '340px'
      }}
    >
      {/* Visual Accent Circle in Top Right matching mockup */}
      <div
        style={{
          position: 'absolute',
          top: '-60px',
          right: '-60px',
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          backgroundColor: '#131e3b',
          pointerEvents: 'none'
        }}
      />

      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: '#05091a',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
              overflow: 'hidden',
              padding: '4px',
              flexShrink: 0
            }}
          >
            <img
              src="/zyntra-unicorn-transparent.png"
              alt="Zyntra"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              color: '#ffffff',
              margin: 0
            }}
          >
            Zyntra
          </h1>
        </div>

        {/* Hero Headline & Subtitle */}
        <h2
          style={{
            fontSize: '24px',
            fontWeight: 700,
            lineHeight: 1.25,
            color: '#ffffff',
            letterSpacing: '-0.02em',
            marginTop: '24px',
            marginBottom: '10px'
          }}
        >
          Communication that follows where you belong.
        </h2>
        <p
          style={{
            fontSize: '12px',
            color: '#94a3b8',
            lineHeight: 1.6,
            marginBottom: '28px'
          }}
        >
          Sign in once and securely continue in the context that matters right now.
        </p>

        {/* Outer Enclosing Container matching media_1789559066111.png */}
        <div
          style={{
            border: '1px solid #19274a',
            backgroundColor: 'rgba(12, 20, 40, 0.75)',
            borderRadius: '20px',
            padding: '18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          {/* YOUR ZYNTRA IDENTITY */}
          <div>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                display: 'block',
                marginBottom: '8px'
              }}
            >
              YOUR ZYNTRA IDENTITY
            </span>
            <div
              style={{
                backgroundColor: '#131e3b',
                border: '1px solid #1f305c',
                borderRadius: '12px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: '#1d63ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '14px',
                  flexShrink: 0
                }}
              >
                {initial}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#ffffff',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {displayHandle}
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: '#94a3b8',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {displayName}
                </div>
              </div>
            </div>
          </div>

          {/* AVAILABLE CONTEXTS */}
          <div>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                display: 'block',
                marginBottom: '8px'
              }}
            >
              AVAILABLE CONTEXTS
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Personal Context Box */}
              <div
                onClick={() => navigate('/personal')}
                style={{
                  backgroundColor: '#0e172e',
                  border: '1px solid #1a294d',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer'
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff' }}>
                  Personal
                </span>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                  Private conversations
                </span>
              </div>

              {/* Workplace Context Box */}
              <div
                onClick={() => navigate('/workspace')}
                style={{
                  backgroundColor: '#0e172e',
                  border: '1px solid #1a294d',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer'
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff' }}>
                  Workplace
                </span>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                  Teams · Projects
                </span>
              </div>

              {/* Create new workplace button */}
              <div
                onClick={() => navigate('/')}
                style={{
                  border: '1px solid #203461',
                  borderRadius: '12px',
                  padding: '9px 12px',
                  textAlign: 'center',
                  fontSize: '11px',
                  fontWeight: 500,
                  color: '#cbd5e1',
                  cursor: 'pointer',
                  backgroundColor: 'transparent'
                }}
              >
                Create new workplace +
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandPanel;
