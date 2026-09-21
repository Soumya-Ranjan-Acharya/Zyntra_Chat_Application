import React from 'react';

// Deterministic colorful gradient palettes for user avatars
const avatarGradients = [
  'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', // Blue
  'linear-gradient(135deg, #10b981 0%, #047857 100%)', // Emerald
  'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', // Purple
  'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', // Amber
  'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', // Pink
  'linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)', // Cyan
  'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', // Indigo
  'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)', // Teal
];

const getGradientForName = (name) => {
  if (!name) return avatarGradients[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % avatarGradients.length;
  return avatarGradients[index];
};

const getInitials = (name) => {
  if (!name) return '?';
  const words = name.trim().split(' ');
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

const Avatar = ({ src, name, size = 'md', status = null, className = '' }) => {
  const sizes = {
    sm: 'w-8 h-8 text-[11px]',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const statusColors = {
    online: '#10b981',
    offline: '#64748b',
    away: '#f59e0b',
  };

  const gradient = getGradientForName(name);

  return (
    <div className={`relative inline-block ${sizes[size]} shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover rounded-full bg-slate-800"
        />
      ) : (
        <div
          style={{
            background: gradient,
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.15)'
          }}
          className="w-full h-full flex items-center justify-center rounded-full text-white font-bold tracking-tight select-none"
        >
          {getInitials(name)}
        </div>
      )}
      {status && statusColors[status] && (
        <span
          style={{
            backgroundColor: statusColors[status],
            width: '9px',
            height: '9px',
            borderRadius: '50%',
            position: 'absolute',
            bottom: '-1px',
            right: '-1px',
            boxShadow: '0 0 0 2px #081028'
          }}
        />
      )}
    </div>
  );
};

export default Avatar;
