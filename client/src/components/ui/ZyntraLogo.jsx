import React from 'react';

/**
 * ZyntraLogo - Modern Minimalist SVG Brandmark
 * Resolution-independent, styled for light/dark mode compatibility.
 */
export const ZyntraLogoMark = ({ size = 32, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      {/* Primary electric gradient */}
      <linearGradient id="zyntra-grad-primary" x1="10%" y1="0%" x2="90%" y2="100%">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="50%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#a855f7" />
      </linearGradient>

      {/* Secondary accent highlight */}
      <linearGradient id="zyntra-grad-accent" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#06b6d4" />
        <stop offset="100%" stopColor="#3b82f6" />
      </linearGradient>

      {/* Subtle depth shadow */}
      <filter id="zyntra-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#6366f1" floodOpacity="0.35" />
      </filter>
    </defs>

    <g filter="url(#zyntra-glow)">
      {/* Top horizontal & diagonal slash */}
      <path
        d="M22 24C22 21.7909 23.7909 20 26 20H74C76.2091 20 78 21.7909 78 24C78 25.1065 77.5408 26.1633 76.7324 26.9142L36 64.5H74C76.2091 64.5 78 66.2909 78 68.5V74C78 76.2091 76.2091 78 74 78H26C23.7909 78 22 76.2091 22 74C22 72.8935 22.4592 71.8367 23.2676 71.0858L64 33.5H26C23.7909 33.5 22 31.7091 22 29.5V24Z"
        fill="url(#zyntra-grad-primary)"
      />

      {/* Dynamic negative space accent node */}
      <circle cx="72" cy="27" r="4" fill="#38bdf8" />
      <circle cx="28" cy="71" r="4" fill="#a855f7" />
    </g>
  </svg>
);

export const ZyntraWordmark = ({ size = 32, showBadge = false, className = '' }) => (
  <div className={`flex items-center gap-3 select-none ${className}`}>
    <ZyntraLogoMark size={size} />
    <div className="flex flex-col">
      <div className="flex items-center gap-2">
        <span
          style={{
            letterSpacing: '-0.035em',
            color: 'var(--color-text-primary, #ffffff)',
          }}
          className="font-extrabold text-xl leading-none tracking-tight font-sans"
        >
          Zyntra
        </span>
        {showBadge && (
          <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
            PRO
          </span>
        )}
      </div>
    </div>
  </div>
);

export default ZyntraLogoMark;
