import React from 'react';

/**
 * ZyntraUnicornSvg
 * Pure vector representation of the Zyntra Unicorn-Z emblem with:
 * - Fluid unicorn mane crest
 * - Sleek equine head profile and ear
 * - Radiant horn with star gleam
 * - Layered glass-metal diagonal ribbon folds
 * - Rounded neon magenta foundation
 * - Subtle cyan -> electric blue -> violet edge illumination
 */
const ZyntraUnicornSvg = ({
  className = '',
  style = {},
  glowIntensity = 1,
  showStar = true,
  strokeProgress = 1,
  isDrawing = false,
}) => {
  return (
    <svg
      viewBox="0 0 200 230"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'visible',
        filter: `drop-shadow(0 10px 28px rgba(99, 102, 241, ${0.35 * glowIntensity})) drop-shadow(0 2px 10px rgba(56, 189, 248, ${0.45 * glowIntensity}))`,
        ...style,
      }}
    >
      <defs>
        {/* Core Gradients matching the master brand artwork */}
        <linearGradient id="zyntraHornGrad" x1="120" y1="50" x2="162" y2="16" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="45%" stopColor="#e0e7ff" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>

        <linearGradient id="zyntraManeGrad" x1="30" y1="40" x2="110" y2="35" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#d946ef" />
          <stop offset="35%" stopColor="#818cf8" />
          <stop offset="70%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#e0e7ff" />
        </linearGradient>

        <linearGradient id="zyntraHeadGrad" x1="100" y1="25" x2="140" y2="65" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="30%" stopColor="#ede9fe" />
          <stop offset="75%" stopColor="#c7d2fe" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>

        <linearGradient id="zyntraDiagRibbonGrad" x1="130" y1="45" x2="40" y2="165" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="18%" stopColor="#ddd6fe" />
          <stop offset="45%" stopColor="#6366f1" />
          <stop offset="80%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>

        <linearGradient id="zyntraOuterFoldGrad" x1="60" y1="120" x2="135" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="40%" stopColor="#3b82f6" />
          <stop offset="85%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>

        <linearGradient id="zyntraBaseGrad" x1="45" y1="175" x2="155" y2="190" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="35%" stopColor="#2563eb" />
          <stop offset="70%" stopColor="#9333ea" />
          <stop offset="92%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#f472b6" />
        </linearGradient>

        {/* Specular Rim Light Gradient */}
        <linearGradient id="zyntraRimGlow" x1="30" y1="20" x2="170" y2="200" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
          <stop offset="30%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="65%" stopColor="#818cf8" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.85" />
        </linearGradient>

        {/* Soft Glass Glow Filter */}
        <filter id="zyntraGlassFilter" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
          <feSpecularLighting in="blur" surfaceScale="4" specularConstant="0.8" specularExponent="20" result="specular">
            <fePointLight x="90" y="30" z="80" />
          </feSpecularLighting>
          <feComposite in="specular" in2="SourceAlpha" operator="in" result="specular" />
          <feComposite in="SourceGraphic" in2="specular" operator="over" />
        </filter>
      </defs>

      <g filter="url(#zyntraGlassFilter)">
        {/* Layer 1: Lower Foundation Base Ribbon */}
        <path
          d="M 52 165 C 60 182, 85 198, 122 198 C 145 198, 162 188, 160 178 C 158 168, 138 162, 118 162 C 86 162, 62 163, 52 165 Z"
          fill="url(#zyntraBaseGrad)"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="0.8"
        />

        {/* Layer 2: Main Diagonal Z Body & Ribbon Fold */}
        <path
          d="M 124 58 C 112 76, 88 112, 54 158 C 48 166, 44 175, 48 182 C 54 188, 72 178, 86 164 C 114 135, 140 98, 148 74 C 152 64, 138 52, 124 58 Z"
          fill="url(#zyntraDiagRibbonGrad)"
        />

        {/* Layer 3: Outer Sweeping Cyan-Blue Loop */}
        <path
          d="M 48 182 C 34 165, 42 136, 68 102 C 90 75, 115 54, 130 50 C 122 62, 102 88, 82 118 C 62 148, 48 174, 48 182 Z"
          fill="url(#zyntraOuterFoldGrad)"
          opacity="0.95"
        />

        {/* Layer 4: Upper Unicorn Mane (flowing crest backward to the left) */}
        <path
          d="M 120 44 C 104 32, 78 30, 48 40 C 40 43, 36 38, 44 32 C 60 20, 92 18, 122 30 C 132 34, 134 42, 120 44 Z"
          fill="url(#zyntraManeGrad)"
        />
        <path
          d="M 112 50 C 96 42, 74 44, 52 54 C 44 58, 40 54, 48 48 C 66 38, 92 36, 116 46 Z"
          fill="url(#zyntraManeGrad)"
          opacity="0.85"
        />

        {/* Layer 5: Unicorn Head, Equine Jaw & Ear Profile */}
        <path
          d="M 118 36 C 122 28, 132 24, 138 28 C 142 32, 138 40, 136 44 C 144 42, 154 48, 156 56 C 158 64, 150 72, 142 74 C 136 75, 130 68, 126 62 C 120 54, 116 42, 118 36 Z"
          fill="url(#zyntraHeadGrad)"
        />

        {/* Unicorn Ear Accent */}
        <path
          d="M 132 28 C 135 20, 141 18, 143 24 C 144 28, 138 34, 132 36 Z"
          fill="#ede9fe"
        />

        {/* Layer 6: Radiant Unicorn Horn pointing up-right (~45°) */}
        <path
          d="M 136 32 L 168 12 C 170 11, 171 13, 169 15 L 142 38 Z"
          fill="url(#zyntraHornGrad)"
          filter="drop-shadow(0 0 6px rgba(255,255,255,0.85))"
        />

        {/* Delicate Horn Spiral Ridges */}
        <line x1="144" y1="31" x2="147" y2="28" stroke="#a5b4fc" strokeWidth="0.75" strokeLinecap="round" />
        <line x1="152" y1="25" x2="155" y2="22" stroke="#c7d2fe" strokeWidth="0.75" strokeLinecap="round" />
        <line x1="160" y1="19" x2="163" y2="16" stroke="#ffffff" strokeWidth="0.75" strokeLinecap="round" />

        {/* Luminous Rim / Contour Highlight */}
        <path
          d="M 48 40 C 60 20, 95 18, 126 30 L 168 12 M 142 74 C 114 135, 70 176, 52 182 C 60 198, 100 198, 148 184"
          stroke="url(#zyntraRimGlow)"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
          opacity="0.8"
        />

        {/* 4-Point Star Glint at Horn Tip */}
        {showStar && (
          <g transform="translate(169, 12)">
            <circle cx="0" cy="0" r="1.8" fill="#ffffff" filter="drop-shadow(0 0 4px #ffffff)" />
            <line x1="-7" y1="0" x2="7" y2="0" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.9" />
            <line x1="0" y1="-7" x2="0" y2="7" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.9" />
            <line x1="-3.5" y1="-3.5" x2="3.5" y2="3.5" stroke="#bae6fd" strokeWidth="0.6" strokeLinecap="round" opacity="0.7" />
            <line x1="3.5" y1="-3.5" x2="-3.5" y2="3.5" stroke="#bae6fd" strokeWidth="0.6" strokeLinecap="round" opacity="0.7" />
          </g>
        )}

        {/* Secondary Delicate Sparkle between Neck & Diagonal */}
        {showStar && (
          <g transform="translate(132, 102)">
            <circle cx="0" cy="0" r="1.2" fill="#ffffff" opacity="0.85" />
            <line x1="-4" y1="0" x2="4" y2="0" stroke="#ffffff" strokeWidth="0.8" strokeLinecap="round" opacity="0.8" />
            <line x1="0" y1="-4" x2="0" y2="4" stroke="#ffffff" strokeWidth="0.8" strokeLinecap="round" opacity="0.8" />
          </g>
        )}
      </g>
    </svg>
  );
};

export default ZyntraUnicornSvg;
