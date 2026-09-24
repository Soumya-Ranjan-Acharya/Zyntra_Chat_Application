import React from 'react';
import { motion } from 'framer-motion';

const avatarGradients = [
  'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  'linear-gradient(135deg, #10b981 0%, #047857 100%)',
  'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
  'linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)',
  'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
  'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)',
];

const getGradientForName = (name) => {
  if (!name) return avatarGradients[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarGradients[Math.abs(hash) % avatarGradients.length];
};

const getInitials = (name) => {
  if (!name) return '?';
  const words = name.trim().split(' ');
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

const statusConfig = {
  online:  { color: '#10b981', pulse: true },
  offline: { color: '#64748b', pulse: false },
  away:    { color: '#f59e0b', pulse: false },
};

const sizeConfig = {
  sm: { cls: 'w-8 h-8',   text: '11px', dot: '8px',  dotPos: { bottom: '-1px', right: '-1px' }, ring: '1.5px' },
  md: { cls: 'w-10 h-10', text: '13px', dot: '9px',  dotPos: { bottom: '-1px', right: '-1px' }, ring: '2px' },
  lg: { cls: 'w-12 h-12', text: '15px', dot: '10px', dotPos: { bottom: '0', right: '0' },        ring: '2px' },
  xl: { cls: 'w-16 h-16', text: '20px', dot: '12px', dotPos: { bottom: '1px', right: '1px' },   ring: '2px' },
};

const Avatar = ({ src, name, size = 'md', status = null, className = '' }) => {
  const cfg = sizeConfig[size] || sizeConfig.md;
  const gradient = getGradientForName(name);
  const statusInfo = status ? statusConfig[status] : null;

  return (
    <div className={`relative inline-block ${cfg.cls} shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover rounded-full"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
        />
      ) : (
        <div
          style={{
            background: gradient,
            boxShadow: '0 2px 8px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.15)',
            fontSize: cfg.text,
            fontWeight: 700,
          }}
          className="w-full h-full flex items-center justify-center rounded-full text-white tracking-tight select-none"
        >
          {getInitials(name)}
        </div>
      )}

      {statusInfo && (
        <span
          className={statusInfo.pulse ? 'status-online-pulse' : ''}
          style={{
            backgroundColor: statusInfo.color,
            width: cfg.dot,
            height: cfg.dot,
            borderRadius: '50%',
            position: 'absolute',
            ...cfg.dotPos,
            boxShadow: `0 0 0 ${cfg.ring} var(--sidebar-bg, #081028)`,
            display: 'block',
          }}
        />
      )}
    </div>
  );
};

export default Avatar;
