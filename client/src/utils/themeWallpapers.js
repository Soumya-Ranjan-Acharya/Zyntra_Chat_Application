// Theme wallapers, color palettes, and visual presets for Zyntra

export const ACCENT_PRESETS = [
  { value: 'azure', color: '#1d63ff', label: 'Azure' },
  { value: 'violet', color: '#8b5cf6', label: 'Violet' },
  { value: 'mint', color: '#10b981', label: 'Mint' },
  { value: 'amber', color: '#f59e0b', label: 'Amber' },
  { value: 'rose', color: '#f43f5e', label: 'Rose' },
  { value: 'sky', color: '#06b6d4', label: 'Sky' },
  { value: 'emerald', color: '#059669', label: 'Emerald' },
  { value: 'coral', color: '#f97316', label: 'Sunset' },
  { value: 'ruby', color: '#e11d48', label: 'Ruby' },
  { value: 'indigo', color: '#4f46e5', label: 'Indigo' },
  { value: 'fuchsia', color: '#d946ef', label: 'Fuchsia' },
  { value: 'slate', color: '#475569', label: 'Slate' },
];

export const SENT_BUBBLE_PRESETS = [
  { value: '#1d63ff', textColor: '#ffffff', label: 'Azure Blue' },
  { value: '#2563eb', textColor: '#ffffff', label: 'Royal Blue' },
  { value: '#7c3aed', textColor: '#ffffff', label: 'Deep Violet' },
  { value: '#059669', textColor: '#ffffff', label: 'Forest Green' },
  { value: '#0d9488', textColor: '#ffffff', label: 'Teal Cyan' },
  { value: '#ea580c', textColor: '#ffffff', label: 'Warm Sunset' },
  { value: '#e11d48', textColor: '#ffffff', label: 'Vibrant Ruby' },
  { value: '#c026d3', textColor: '#ffffff', label: 'Magenta Pink' },
  { value: '#1e293b', textColor: '#f8fafc', label: 'Midnight Slate' },
  { value: '#09090b', textColor: '#ffffff', label: 'Onyx Black' },
];

export const RECEIVED_BUBBLE_PRESETS = [
  { value: '#f1f5f9', textColor: '#0f172a', label: 'Soft Cloud' },
  { value: '#e2e8f0', textColor: '#0f172a', label: 'Light Slate' },
  { value: '#fef3c7', textColor: '#78350f', label: 'Warm Amber' },
  { value: '#ecfdf5', textColor: '#065f46', label: 'Mint Breeze' },
  { value: '#eff6ff', textColor: '#1e40af', label: 'Soft Sky' },
  { value: '#f5f3ff', textColor: '#5b21b6', label: 'Lavender Mist' },
  { value: '#fff1f2', textColor: '#9f1239', label: 'Blush Rose' },
  { value: '#334155', textColor: '#f8fafc', label: 'Charcoal Dark' },
  { value: '#1e293b', textColor: '#f8fafc', label: 'Deep Navy' },
];

export const WALLPAPER_PRESETS = [
  {
    id: 'plain',
    label: 'Plain Solid',
    description: 'Clean distraction-free surface',
    style: { backgroundColor: 'transparent' },
  },
  {
    id: 'warm',
    label: 'Warm Sunset',
    description: 'Gentle golden peach gradient',
    style: {
      backgroundImage: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 40%, #ffedd5 100%)',
      backgroundSize: 'cover',
    },
  },
  {
    id: 'cool',
    label: 'Cool Azure',
    description: 'Crisp morning sky gradient',
    style: {
      backgroundImage: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #e0e7ff 100%)',
      backgroundSize: 'cover',
    },
  },
  {
    id: 'geometric',
    label: 'Tech Mesh',
    description: 'Subtle engineering isometric grid',
    style: {
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2394a3b8' fill-opacity='0.18' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
      backgroundRepeat: 'repeat',
    },
  },
  {
    id: 'stars',
    label: 'Constellations',
    description: 'Delicate starry night stardust',
    style: {
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2364748b' fill-opacity='0.25'%3E%3Ccircle cx='10' cy='15' r='1.5'/%3E%3Ccircle cx='45' cy='25' r='1'/%3E%3Ccircle cx='25' cy='50' r='1.2'/%3E%3Ccircle cx='55' cy='5' r='0.8'/%3E%3Ccircle cx='5' cy='45' r='0.8'/%3E%3Cpolygon points='35,12 36,15 39,16 36,17 35,20 34,17 31,16 34,15' fill='%2338bdf8' fill-opacity='0.35'/%3E%3C/g%3E%3C/svg%3E")`,
      backgroundRepeat: 'repeat',
    },
  },
  {
    id: 'waves',
    label: 'Gentle Waves',
    description: 'Flowing calm contours',
    style: {
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='40' viewBox='0 0 100 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 20 Q 25 5, 50 20 T 100 20' fill='none' stroke='%233b82f6' stroke-opacity='0.18' stroke-width='1.5'/%3E%3Cpath d='M0 30 Q 25 15, 50 30 T 100 30' fill='none' stroke='%238b5cf6' stroke-opacity='0.12' stroke-width='1'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'repeat',
    },
  },
  {
    id: 'grid',
    label: 'Minimal Graph',
    description: 'Clean architectural blueprint',
    style: {
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M32 0H0v32h32V0zM1 31V1h30v30H1z' fill='%2364748b' fill-opacity='0.12'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'repeat',
    },
  },
  {
    id: 'nebula',
    label: 'Cyber Aurora',
    description: 'Multi-spectrum glowing mesh',
    style: {
      backgroundImage: `radial-gradient(circle at 15% 20%, rgba(59, 130, 246, 0.22) 0%, transparent 45%), radial-gradient(circle at 85% 80%, rgba(217, 70, 239, 0.18) 0%, transparent 45%), radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.12) 0%, transparent 55%)`,
      backgroundSize: 'cover',
    },
  },
];

export const EYE_COMFORT_MODES = [
  {
    id: 'off',
    label: 'Standard (Off)',
    desc: 'Default true-color display without filter.',
    color: '#3b82f6',
  },
  {
    id: 'amber',
    label: 'Warm Amber',
    desc: 'Cuts blue wavelengths (3200K) to relax eyes.',
    color: '#f59e0b',
  },
  {
    id: 'sepia',
    label: 'Sepia Reading',
    desc: 'Soft e-ink paper tone for long reading sessions.',
    color: '#d97706',
  },
  {
    id: 'forest',
    label: 'Forest Sage',
    desc: 'Natural organic green undertone calming eye focus.',
    color: '#10b981',
  },
  {
    id: 'muted',
    label: 'Muted Glare',
    desc: 'Softens high-contrast harshness and glare.',
    color: '#64748b',
  },
];

/**
 * Returns CSS filter string for eye comfort mode & warmth intensity (10-100)
 */
export function getEyeComfortFilter(mode, warmth = 40) {
  if (!mode || mode === 'off') return 'none';
  const w = Math.min(Math.max(warmth, 10), 100);

  if (mode === 'amber') {
    const s = (w * 0.45).toFixed(1);
    const h = (w * 0.15).toFixed(1);
    const sat = (100 + w * 0.12).toFixed(1);
    return `sepia(${s}%) hue-rotate(-${h}deg) saturate(${sat}%)`;
  }
  if (mode === 'sepia') {
    const s = (w * 0.55).toFixed(1);
    const c = (100 - w * 0.15).toFixed(1);
    return `sepia(${s}%) contrast(${c}%)`;
  }
  if (mode === 'forest') {
    const h = (w * 0.28).toFixed(1);
    const b = (100 - w * 0.05).toFixed(1);
    return `hue-rotate(${h}deg) brightness(${b}%)`;
  }
  if (mode === 'muted') {
    const c = (100 - w * 0.35).toFixed(1);
    const b = (100 - w * 0.1).toFixed(1);
    return `contrast(${c}%) brightness(${b}%)`;
  }
  return 'none';
}

/**
 * Calculates whether black or white text has better readability on a given background hex
 */
export function getContrastTextColor(hexColor) {
  if (!hexColor || typeof hexColor !== 'string') return '#ffffff';
  let hex = hexColor.replace('#', '');
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  if (hex.length !== 6) return '#ffffff';

  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  // YIQ luminance formula
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 150 ? '#0f172a' : '#ffffff';
}

/**
 * Returns background style object for chat area given wallpaper settings
 */
export function getChatWallpaperStyle(wallpaper, wallpaperCustomUrl, opacity = 1, blur = 0) {
  let baseStyle = {};
  if (wallpaper === 'custom' && wallpaperCustomUrl) {
    baseStyle = {
      backgroundImage: `url(${wallpaperCustomUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    };
  } else {
    const found = WALLPAPER_PRESETS.find((w) => w.id === wallpaper);
    baseStyle = found ? found.style : WALLPAPER_PRESETS[0].style;
  }

  return {
    ...baseStyle,
    opacity,
    filter: blur > 0 ? `blur(${blur}px)` : 'none',
  };
}
