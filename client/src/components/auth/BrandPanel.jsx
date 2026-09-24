import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Zap, Users } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

const features = [
  { icon: ShieldCheck, label: 'End-to-End Encrypted', color: '#10b981' },
  { icon: Zap,         label: 'Real-time messaging',  color: '#f59e0b' },
  { icon: Users,       label: 'Multi-workspace',       color: '#8b5cf6' },
];

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
        position: 'relative',
        overflow: 'hidden',
        color: '#ffffff',
        padding: '44px 44px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        userSelect: 'none',
        flex: '0 0 45%',
        minWidth: '340px',
        background: 'linear-gradient(-45deg, #080c1e, #0d1530, #08122a, #050a1a)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 16s ease infinite',
      }}
    >
      {/* Ambient glow orbs */}
      <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-100px', left: '-60px', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* Brand logo */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '36px' }}
        >
          <div style={{
            width: '44px', height: '44px', borderRadius: '14px',
            backgroundColor: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(37,99,235,0.3)',
            overflow: 'hidden', padding: '4px', flexShrink: 0,
          }}>
            <img src="/zyntra-unicorn-transparent.png" alt="Zyntra" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <h1 style={{ fontSize: '30px', fontWeight: 800, letterSpacing: '-0.03em', color: '#ffffff', margin: 0 }}>Zyntra</h1>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.23, 1, 0.32, 1] }}
        >
          <h2 style={{ fontSize: '26px', fontWeight: 800, lineHeight: 1.2, color: '#ffffff', letterSpacing: '-0.025em', margin: '0 0 10px' }}>
            Communication that<br />
            <span style={{ color: 'rgba(147,197,253,0.9)' }}>follows where you belong.</span>
          </h2>
          <p style={{ fontSize: '13px', color: 'rgba(148,163,184,0.9)', lineHeight: 1.65, margin: '0 0 32px' }}>
            Sign in once and continue securely in the context that matters — personal or workplace.
          </p>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.18 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}
        >
          {features.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.2 + i * 0.07, ease: [0.23, 1, 0.32, 1] }}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 14px', borderRadius: '12px',
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <div style={{
                width: '28px', height: '28px', borderRadius: '8px',
                backgroundColor: `${f.color}22`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <f.icon size={14} style={{ color: f.color }} />
              </div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(226,232,240,0.9)' }}>{f.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Identity Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          style={{
            border: '1px solid rgba(255,255,255,0.1)',
            backgroundColor: 'rgba(255,255,255,0.04)',
            borderRadius: '16px', padding: '16px',
          }}
        >
          <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(100,116,139,1)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '10px' }}>Your Zyntra Identity</span>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #4338ca)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '14px', flexShrink: 0 }}>
              {initial}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayHandle}</div>
              <div style={{ fontSize: '11px', color: 'rgba(148,163,184,0.8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '12px' }}>
            {[
              { label: 'Personal', sub: 'Private conversations', path: '/personal' },
              { label: 'Workplace', sub: 'Teams · Projects', path: '/workspace' },
            ].map((ctx) => (
              <button
                key={ctx.label}
                onClick={() => navigate(ctx.path)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '9px 12px', borderRadius: '10px',
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  cursor: 'pointer', transition: 'background-color 150ms',
                }}
                className="hover:bg-white/[0.08]"
              >
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff' }}>{ctx.label}</span>
                <span style={{ fontSize: '11px', color: 'rgba(148,163,184,0.7)' }}>{ctx.sub}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BrandPanel;
