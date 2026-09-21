// Artificial Avatar Generation Engine for Zyntra

export const AURA_COLORS = [
  { id: 'azure', label: 'Neon Azure', primary: '#1d63ff', secondary: '#38bdf8', bg: '#030b20' },
  { id: 'magenta', label: 'Cyber Magenta', primary: '#d946ef', secondary: '#f43f5e', bg: '#1d0526' },
  { id: 'matrix', label: 'Emerald Matrix', primary: '#10b981', secondary: '#34d399', bg: '#021e14' },
  { id: 'solar', label: 'Solar Amber', primary: '#f59e0b', secondary: '#fbbf24', bg: '#231502' },
  { id: 'ruby', label: 'Ruby Plasma', primary: '#e11d48', secondary: '#fb7185', bg: '#25030d' },
  { id: 'violet', label: 'Royal Violet', primary: '#8b5cf6', secondary: '#c084fc', bg: '#16082e' },
  { id: 'cyan', label: 'Electric Teal', primary: '#06b6d4', secondary: '#67e8f9', bg: '#021820' },
  { id: 'obsidian', label: 'Midnight Onyx', primary: '#64748b', secondary: '#94a3b8', bg: '#090d16' },
];

export const AVATAR_STYLES = [
  { id: 'android', label: 'Cyber Android', desc: 'Futuristic mecha with glowing optics' },
  { id: 'hologram', label: 'Quantum Core', desc: 'Pulsing 3D orbital energy matrix' },
  { id: 'astro', label: 'Cosmic Astro', desc: 'Void explorer with reflective visor' },
  { id: 'pixel', label: 'Pixel Netrunner', desc: 'Retro 8-bit cyber hacker persona' },
  { id: 'mascot', label: 'Neon Cyberfox', desc: 'Augmented feline mascot with glowing ears' },
  { id: 'matrix', label: 'Neural AI Core', desc: 'Microprocessor with holographic nodes' },
  { id: 'samurai', label: 'Cyber Ronin', desc: 'High-tech armor with glowing neon crest' },
  { id: 'synth', label: 'Synthwave Sun', desc: 'Retro-future grid with neon sunset' },
];

/**
 * Generates an SVG Data URI for an Artificial Avatar
 */
export function generateArtificialAvatar({
  style = 'android',
  auraId = 'azure',
  seed = 'nexus-01',
  expression = 'focused'
}) {
  const aura = AURA_COLORS.find((a) => a.id === auraId) || AURA_COLORS[0];
  const p = aura.primary;
  const s = aura.secondary;
  const bg = aura.bg;

  let innerSvg = '';

  if (style === 'android') {
    innerSvg = `
      <!-- Head Base -->
      <path d="M45,35 Q60,25 75,35 L85,60 Q80,95 60,105 Q40,95 35,60 Z" fill="#1e293b" stroke="${p}" stroke-width="2.5" />
      <!-- Cheeks & Jaw Plates -->
      <polygon points="40,65 50,90 60,98 50,98 36,75" fill="#334155" />
      <polygon points="80,65 70,90 60,98 70,98 84,75" fill="#334155" />
      <line x1="60" y1="92" x2="60" y2="104" stroke="${p}" stroke-width="2" />
      <!-- Forehead Plate -->
      <polygon points="50,30 70,30 74,42 46,42" fill="#0f172a" stroke="${s}" stroke-width="1.5" />
      <circle cx="60" cy="36" r="2.5" fill="${s}" />
      <!-- Glowing Optical Visor -->
      <path d="M42,50 Q60,46 78,50 L75,60 Q60,56 45,60 Z" fill="${p}" filter="url(#glow)" />
      <line x1="45" y1="55" x2="75" y2="55" stroke="#ffffff" stroke-width="2" stroke-linecap="round" />
      <!-- Ear Antennas -->
      <rect x="30" y="52" width="5" height="18" rx="2" fill="${s}" />
      <rect x="85" y="52" width="5" height="18" rx="2" fill="${s}" />
      <!-- Temple Circuit Lines -->
      <path d="M36,46 L42,46 L45,42" stroke="${s}" stroke-width="1.2" fill="none" />
      <path d="M84,46 L78,46 L75,42" stroke="${s}" stroke-width="1.2" fill="none" />
    `;
  } else if (style === 'hologram') {
    innerSvg = `
      <!-- Core Pulsing Sphere -->
      <circle cx="60" cy="60" r="24" fill="url(#coreGrad)" filter="url(#glow)" />
      <!-- Inner geometric grid -->
      <polygon points="60,40 76,50 76,70 60,80 44,70 44,50" fill="none" stroke="#ffffff" stroke-width="1.5" opacity="0.85" />
      <circle cx="60" cy="60" r="8" fill="#ffffff" filter="url(#glow)" />
      <!-- Orbital Rings -->
      <ellipse cx="60" cy="60" rx="38" ry="14" fill="none" stroke="${p}" stroke-width="2" transform="rotate(-25 60 60)" />
      <circle cx="28" cy="46" r="3" fill="${s}" filter="url(#glow)" />
      <ellipse cx="60" cy="60" rx="38" ry="14" fill="none" stroke="${s}" stroke-width="2" transform="rotate(40 60 60)" />
      <circle cx="90" cy="74" r="3" fill="${p}" filter="url(#glow)" />
      <!-- Radial Data Nodes -->
      <line x1="60" y1="20" x2="60" y2="28" stroke="${s}" stroke-width="2" stroke-dasharray="2 2" />
      <line x1="60" y1="92" x2="60" y2="100" stroke="${s}" stroke-width="2" stroke-dasharray="2 2" />
      <line x1="20" y1="60" x2="28" y2="60" stroke="${s}" stroke-width="2" stroke-dasharray="2 2" />
      <line x1="92" y1="60" x2="100" y2="60" stroke="${s}" stroke-width="2" stroke-dasharray="2 2" />
    `;
  } else if (style === 'astro') {
    innerSvg = `
      <!-- Helmet Outer Shell -->
      <circle cx="60" cy="58" r="36" fill="#1e293b" stroke="${p}" stroke-width="3" />
      <!-- Helmet Collar / Base -->
      <path d="M35,90 Q60,82 85,90 L90,108 L30,108 Z" fill="#0f172a" stroke="${s}" stroke-width="2" />
      <rect x="48" y="94" width="24" height="6" rx="3" fill="${p}" />
      <!-- Large Reflective Visor -->
      <ellipse cx="60" cy="56" rx="26" ry="20" fill="url(#coreGrad)" filter="url(#glow)" />
      <!-- Reflection Highlight Curve -->
      <path d="M42,46 Q58,40 76,46 Q64,48 48,53 Z" fill="#ffffff" opacity="0.75" />
      <!-- Side Comm Beacon -->
      <circle cx="22" cy="58" r="4" fill="${s}" />
      <line x1="22" y1="58" x2="16" y2="40" stroke="${s}" stroke-width="2.5" stroke-linecap="round" />
      <circle cx="16" cy="38" r="3" fill="${p}" filter="url(#glow)" />
    `;
  } else if (style === 'pixel') {
    innerSvg = `
      <!-- 8-Bit Pixel Netrunner Head -->
      <rect x="42" y="32" width="36" height="48" fill="#1e293b" stroke="${p}" stroke-width="2" />
      <rect x="36" y="44" width="6" height="24" fill="#334155" />
      <rect x="78" y="44" width="6" height="24" fill="#334155" />
      <!-- Neon Pixel Shades -->
      <rect x="38" y="46" width="44" height="14" fill="${p}" filter="url(#glow)" />
      <rect x="44" y="48" width="12" height="10" fill="#ffffff" />
      <rect x="64" y="48" width="12" height="10" fill="#ffffff" />
      <rect x="58" y="52" width="4" height="4" fill="#0f172a" />
      <!-- Cyber Mouth Grid -->
      <rect x="50" y="68" width="20" height="4" fill="${s}" />
      <line x1="55" y1="68" x2="55" y2="72" stroke="#0f172a" stroke-width="1" />
      <line x1="60" y1="68" x2="60" y2="72" stroke="#0f172a" stroke-width="1" />
      <line x1="65" y1="68" x2="65" y2="72" stroke="#0f172a" stroke-width="1" />
      <!-- Hair Pixels -->
      <rect x="42" y="26" width="12" height="6" fill="${s}" />
      <rect x="54" y="22" width="14" height="10" fill="${s}" />
      <rect x="68" y="26" width="10" height="6" fill="${s}" />
      <!-- Collar -->
      <polygon points="40,80 80,80 92,106 28,106" fill="#0f172a" stroke="${p}" stroke-width="1.5" />
    `;
  } else if (style === 'mascot') {
    innerSvg = `
      <!-- Cyber Fox Ears -->
      <polygon points="34,44 24,18 48,34" fill="#1e293b" stroke="${p}" stroke-width="2" />
      <polygon points="32,40 27,24 42,34" fill="${p}" filter="url(#glow)" />
      <polygon points="86,44 96,18 72,34" fill="#1e293b" stroke="${p}" stroke-width="2" />
      <polygon points="88,40 93,24 78,34" fill="${p}" filter="url(#glow)" />
      <!-- Face Mask -->
      <polygon points="36,44 84,44 92,68 60,98 28,68" fill="#0f172a" stroke="${s}" stroke-width="2" />
      <polygon points="46,54 74,54 80,68 60,86 40,68" fill="#1e293b" />
      <!-- Neon Slit Eyes -->
      <polygon points="42,56 54,58 48,64" fill="${p}" filter="url(#glow)" />
      <polygon points="78,56 66,58 72,64" fill="${p}" filter="url(#glow)" />
      <!-- Cyber Nose & Whiskers -->
      <circle cx="60" cy="74" r="3" fill="${s}" />
      <line x1="30" y1="68" x2="16" y2="64" stroke="${s}" stroke-width="2" />
      <line x1="30" y1="74" x2="18" y2="78" stroke="${s}" stroke-width="2" />
      <line x1="90" y1="68" x2="104" y2="64" stroke="${s}" stroke-width="2" />
      <line x1="90" y1="74" x2="102" y2="78" stroke="${s}" stroke-width="2" />
    `;
  } else if (style === 'matrix') {
    innerSvg = `
      <!-- Chip Package -->
      <rect x="36" y="36" width="48" height="48" rx="6" fill="#0f172a" stroke="${p}" stroke-width="2.5" />
      <!-- Chip Pins Top & Bottom -->
      <line x1="44" y1="28" x2="44" y2="36" stroke="${s}" stroke-width="2.5" />
      <line x1="52" y1="28" x2="52" y2="36" stroke="${s}" stroke-width="2.5" />
      <line x1="60" y1="28" x2="60" y2="36" stroke="${s}" stroke-width="2.5" />
      <line x1="68" y1="28" x2="68" y2="36" stroke="${s}" stroke-width="2.5" />
      <line x1="76" y1="28" x2="76" y2="36" stroke="${s}" stroke-width="2.5" />
      <line x1="44" y1="84" x2="44" y2="92" stroke="${s}" stroke-width="2.5" />
      <line x1="52" y1="84" x2="52" y2="92" stroke="${s}" stroke-width="2.5" />
      <line x1="60" y1="84" x2="60" y2="92" stroke="${s}" stroke-width="2.5" />
      <line x1="68" y1="84" x2="68" y2="92" stroke="${s}" stroke-width="2.5" />
      <line x1="76" y1="84" x2="76" y2="92" stroke="${s}" stroke-width="2.5" />
      <!-- Core Die -->
      <rect x="46" y="46" width="28" height="28" rx="4" fill="url(#coreGrad)" filter="url(#glow)" />
      <!-- Quantum Nodes -->
      <circle cx="60" cy="60" r="6" fill="#ffffff" />
      <line x1="60" y1="46" x2="60" y2="74" stroke="#ffffff" stroke-width="1.5" />
      <line x1="46" y1="60" x2="74" y2="60" stroke="#ffffff" stroke-width="1.5" />
    `;
  } else if (style === 'samurai') {
    innerSvg = `
      <!-- Kabuto Helmet Dome -->
      <path d="M36,52 Q60,22 84,52 L92,72 L28,72 Z" fill="#0f172a" stroke="${p}" stroke-width="2.5" />
      <!-- Golden Crest / Horns -->
      <path d="M60,34 L40,16 Q54,28 60,36 Q66,28 80,16 Z" fill="${s}" filter="url(#glow)" />
      <circle cx="60" cy="38" r="4" fill="${p}" />
      <!-- Menpo Mask -->
      <polygon points="34,70 86,70 78,98 60,106 42,98" fill="#1e293b" stroke="${s}" stroke-width="2" />
      <!-- Glowing Eye Slits -->
      <line x1="42" y1="62" x2="54" y2="62" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" filter="url(#glow)" />
      <line x1="66" y1="62" x2="78" y2="62" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" filter="url(#glow)" />
      <!-- Neck Guard Ribs -->
      <path d="M26,76 Q60,86 94,76" stroke="${p}" stroke-width="2" fill="none" />
      <path d="M28,84 Q60,94 92,84" stroke="${p}" stroke-width="2" fill="none" />
    `;
  } else {
    // synthwave
    innerSvg = `
      <!-- Neon Sunset Half -->
      <circle cx="60" cy="60" r="28" fill="url(#coreGrad)" filter="url(#glow)" />
      <rect x="30" y="60" width="60" height="2" fill="#090d16" />
      <rect x="30" y="65" width="60" height="3" fill="#090d16" />
      <rect x="30" y="71" width="60" height="4" fill="#090d16" />
      <rect x="30" y="78" width="60" height="5" fill="#090d16" />
      <!-- Perspective Wireframe Grid Base -->
      <polygon points="15,86 105,86 120,120 0,120" fill="#090d16" stroke="${p}" stroke-width="1.5" />
      <line x1="60" y1="86" x2="60" y2="120" stroke="${s}" stroke-width="1.5" />
      <line x1="40" y1="86" x2="25" y2="120" stroke="${p}" stroke-width="1" />
      <line x1="80" y1="86" x2="95" y2="120" stroke="${p}" stroke-width="1" />
      <line x1="0" y1="96" x2="120" y2="96" stroke="${p}" stroke-width="1" />
      <line x1="0" y1="108" x2="120" y2="108" stroke="${p}" stroke-width="1" />
    `;
  }

  const rawSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <defs>
        <radialGradient id="auraGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${p}" stop-opacity="0.35" />
          <stop offset="70%" stop-color="${bg}" stop-opacity="0.9" />
          <stop offset="100%" stop-color="${bg}" stop-opacity="1" />
        </radialGradient>
        <linearGradient id="coreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${s}" />
          <stop offset="100%" stop-color="${p}" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <!-- Outer Disc Background -->
      <circle cx="60" cy="60" r="58" fill="url(#auraGrad)" stroke="${p}" stroke-width="2.5" />

      <!-- Tech Background Ring & Particles -->
      <circle cx="60" cy="60" r="52" fill="none" stroke="${s}" stroke-width="0.75" stroke-dasharray="3 4" opacity="0.6" />
      <circle cx="20" cy="30" r="1.5" fill="${s}" opacity="0.8" />
      <circle cx="102" cy="35" r="1" fill="${p}" opacity="0.8" />
      <circle cx="95" cy="85" r="1.5" fill="${s}" opacity="0.7" />
      <circle cx="25" cy="85" r="1" fill="${p}" opacity="0.7" />

      <!-- Avatar Character Layer -->
      ${innerSvg}

      <!-- Outer Ambient Border Ring -->
      <circle cx="60" cy="60" r="58" fill="none" stroke="${s}" stroke-width="1.5" opacity="0.6" />
    </svg>
  `.trim();

  // Convert to clean SVG data URL
  const encoded = encodeURIComponent(rawSvg)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22');

  return `data:image/svg+xml;utf8,${encoded}`;
}

/**
 * 8 Ready-to-use Curated Artificial Avatar Presets
 */
export const ARTIFICIAL_AVATAR_PRESETS = [
  {
    id: 'nexus-prime',
    name: 'Nexus Prime',
    style: 'android',
    auraId: 'azure',
    title: 'Autonomous System Vanguard',
    url: generateArtificialAvatar({ style: 'android', auraId: 'azure', seed: 'nexus' }),
  },
  {
    id: 'cyber-ronin',
    name: 'Ronin-X',
    style: 'samurai',
    auraId: 'ruby',
    title: 'Encrypted Blade Protocol',
    url: generateArtificialAvatar({ style: 'samurai', auraId: 'ruby', seed: 'ronin' }),
  },
  {
    id: 'quantum-core',
    name: 'Aether Core',
    style: 'hologram',
    auraId: 'cyan',
    title: 'Zero-Point Neural Entity',
    url: generateArtificialAvatar({ style: 'hologram', auraId: 'cyan', seed: 'aether' }),
  },
  {
    id: 'void-walker',
    name: 'Cosmo Astro',
    style: 'astro',
    auraId: 'violet',
    title: 'Deep Void Cartographer',
    url: generateArtificialAvatar({ style: 'astro', auraId: 'violet', seed: 'astro' }),
  },
  {
    id: 'kitsune-net',
    name: 'Neon Cyberfox',
    style: 'mascot',
    auraId: 'solar',
    title: 'Spectral Signal Runner',
    url: generateArtificialAvatar({ style: 'mascot', auraId: 'solar', seed: 'fox' }),
  },
  {
    id: 'matrix-node',
    name: 'Neural Microchip',
    style: 'matrix',
    auraId: 'matrix',
    title: 'Sub-Atomic Compute Node',
    url: generateArtificialAvatar({ style: 'matrix', auraId: 'matrix', seed: 'matrix' }),
  },
  {
    id: 'synth-echo',
    name: 'Synthwave Glitch',
    style: 'synth',
    auraId: 'magenta',
    title: 'Outrun Frequency Operator',
    url: generateArtificialAvatar({ style: 'synth', auraId: 'magenta', seed: 'synth' }),
  },
  {
    id: 'pixel-hacker',
    name: 'Cipher 0x8F',
    style: 'pixel',
    auraId: 'obsidian',
    title: 'Underground Netrunner',
    url: generateArtificialAvatar({ style: 'pixel', auraId: 'obsidian', seed: 'cipher' }),
  },
];
