import { create } from 'zustand';
import { getEyeComfortFilter, ACCENT_PRESETS } from '../utils/themeWallpapers';
const getInitial = () => {
  let initial = {
    theme: 'light',
    morphism: 'glass',
    accentColor: 'azure',
    customAccentColor: '#1d63ff',
    chatDensity: 'comfortable',
    iconSize: '22',
    messageBubbles: 'soft',
    wallpaper: 'plain',
    wallpaperCustomUrl: '',
    wallpaperOpacity: 0.85,
    wallpaperBlur: 0,
    cornerRadius: '16',
    reduceMotion: false,
    highContrast: false,

    // Eye Comfort Modes
    eyeComfort: 'off',
    eyeComfortWarmth: 40,

    // Sent & Received Message Bubbles
    sentBubbleColor: '#1d63ff',
    sentBubbleTextColor: '#ffffff',
    receivedBubbleColor: '#f1f5f9',
    receivedBubbleTextColor: '#0f172a',
  };

  try {
    const saved = localStorage.getItem('zyntra-theme');
    if (saved) initial = { ...initial, ...JSON.parse(saved) };
  } catch {}

  // Allow URL query parameter overrides
  if (typeof window !== 'undefined' && window.location.search) {
    const params = new URLSearchParams(window.location.search);
    if (params.get('theme')) initial.theme = params.get('theme');
    if (params.get('accent')) initial.accentColor = params.get('accent');
    if (params.get('eye')) initial.eyeComfort = params.get('eye');
    if (params.get('warmth')) initial.eyeComfortWarmth = Number(params.get('warmth'));
    if (params.get('wallpaper')) initial.wallpaper = params.get('wallpaper');
    if (params.get('sent')) initial.sentBubbleColor = params.get('sent');
    if (params.get('recv')) initial.receivedBubbleColor = params.get('recv');
  }

  return initial;
};

const persist = (state) => {
  try {
    localStorage.setItem(
      'zyntra-theme',
      JSON.stringify({
        theme: state.theme,
        morphism: state.morphism,
        accentColor: state.accentColor,
        customAccentColor: state.customAccentColor,
        chatDensity: state.chatDensity,
        iconSize: state.iconSize,
        messageBubbles: state.messageBubbles,
        wallpaper: state.wallpaper,
        wallpaperCustomUrl: state.wallpaperCustomUrl,
        wallpaperOpacity: state.wallpaperOpacity,
        wallpaperBlur: state.wallpaperBlur,
        cornerRadius: state.cornerRadius,
        reduceMotion: state.reduceMotion,
        highContrast: state.highContrast,
        eyeComfort: state.eyeComfort,
        eyeComfortWarmth: state.eyeComfortWarmth,
        sentBubbleColor: state.sentBubbleColor,
        sentBubbleTextColor: state.sentBubbleTextColor,
        receivedBubbleColor: state.receivedBubbleColor,
        receivedBubbleTextColor: state.receivedBubbleTextColor,
      })
    );
  } catch {}
};

const useThemeStore = create((set, get) => ({
  ...getInitial(),

  applyTheme: () => {
    if (typeof window === 'undefined') return;
    const s = get();
    const el = document.documentElement;

    // Resolve system preference for 'auto'
    let resolvedTheme = s.theme;
    if (s.theme === 'auto') {
      resolvedTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }

    el.setAttribute('data-theme', resolvedTheme);
    el.setAttribute('data-raw-theme', s.theme);
    el.setAttribute('data-eye-comfort', s.eyeComfort);
    el.setAttribute('data-morphism', s.morphism);
    el.setAttribute('data-accent', s.accentColor);
    el.setAttribute('data-density', s.chatDensity);
    el.setAttribute('data-icon-size', s.iconSize);
    el.setAttribute('data-bubbles', s.messageBubbles);
    el.setAttribute('data-wallpaper', s.wallpaper);
    el.setAttribute('data-radius', s.cornerRadius);
    el.setAttribute('data-reduce-motion', String(s.reduceMotion));
    el.setAttribute('data-high-contrast', String(s.highContrast));

    // Custom accent color injection
    if (s.accentColor === 'custom' && s.customAccentColor) {
      el.style.setProperty('--color-accent', s.customAccentColor);
      el.style.setProperty('--color-accent-hover', s.customAccentColor);
    } else {
      const preset = ACCENT_PRESETS.find((p) => p.value === s.accentColor);
      if (preset) {
        el.style.setProperty('--color-accent', preset.color);
      } else {
        el.style.removeProperty('--color-accent');
        el.style.removeProperty('--color-accent-hover');
      }
    }

    // Dynamic Bubble CSS variables
    el.style.setProperty('--bubble-bg-sent', s.sentBubbleColor || '#1d63ff');
    el.style.setProperty('--bubble-text-sent', s.sentBubbleTextColor || '#ffffff');
    el.style.setProperty('--bubble-bg-received', s.receivedBubbleColor || '#f1f5f9');
    el.style.setProperty('--bubble-text-received', s.receivedBubbleTextColor || '#0f172a');
    el.style.setProperty('--chat-wallpaper-opacity', String(s.wallpaperOpacity ?? 0.85));
    el.style.setProperty('--chat-wallpaper-blur', `${s.wallpaperBlur ?? 0}px`);

    // Eye Comfort Filter
    const filter = getEyeComfortFilter(s.eyeComfort, s.eyeComfortWarmth);
    el.style.filter = filter;
    el.style.transition = 'filter 0.25s ease';
  },

  setTheme: (theme) => {
    set({ theme });
    const s = get();
    persist(s);
    s.applyTheme();
  },
  setMorphism: (morphism) => {
    set({ morphism });
    const s = get();
    persist(s);
    s.applyTheme();
  },
  setAccentColor: (accentColor) => {
    set({ accentColor });
    const s = get();
    persist(s);
    s.applyTheme();
  },
  setCustomAccentColor: (customAccentColor) => {
    set({ accentColor: 'custom', customAccentColor });
    const s = get();
    persist(s);
    s.applyTheme();
  },
  setChatDensity: (chatDensity) => {
    set({ chatDensity });
    const s = get();
    persist(s);
    s.applyTheme();
  },
  setIconSize: (iconSize) => {
    set({ iconSize });
    const s = get();
    persist(s);
    s.applyTheme();
  },
  setMessageBubbles: (messageBubbles) => {
    set({ messageBubbles });
    const s = get();
    persist(s);
    s.applyTheme();
  },
  setWallpaper: (wallpaper) => {
    set({ wallpaper });
    const s = get();
    persist(s);
    s.applyTheme();
  },
  setWallpaperCustomUrl: (wallpaperCustomUrl) => {
    set({ wallpaper: 'custom', wallpaperCustomUrl });
    const s = get();
    persist(s);
    s.applyTheme();
  },
  setWallpaperOpacity: (wallpaperOpacity) => {
    set({ wallpaperOpacity });
    const s = get();
    persist(s);
    s.applyTheme();
  },
  setWallpaperBlur: (wallpaperBlur) => {
    set({ wallpaperBlur });
    const s = get();
    persist(s);
    s.applyTheme();
  },
  setCornerRadius: (cornerRadius) => {
    set({ cornerRadius });
    const s = get();
    persist(s);
    s.applyTheme();
  },
  setReduceMotion: (reduceMotion) => {
    set({ reduceMotion });
    const s = get();
    persist(s);
    s.applyTheme();
  },
  setHighContrast: (highContrast) => {
    set({ highContrast });
    const s = get();
    persist(s);
    s.applyTheme();
  },
  setEyeComfort: (eyeComfort) => {
    set({ eyeComfort });
    const s = get();
    persist(s);
    s.applyTheme();
  },
  setEyeComfortWarmth: (eyeComfortWarmth) => {
    set({ eyeComfortWarmth });
    const s = get();
    persist(s);
    s.applyTheme();
  },
  setSentBubbleColor: (sentBubbleColor, textColor = null) => {
    set((state) => ({
      sentBubbleColor,
      sentBubbleTextColor: textColor !== null ? textColor : state.sentBubbleTextColor,
    }));
    const s = get();
    persist(s);
    s.applyTheme();
  },
  setSentBubbleTextColor: (sentBubbleTextColor) => {
    set({ sentBubbleTextColor });
    const s = get();
    persist(s);
    s.applyTheme();
  },
  setReceivedBubbleColor: (receivedBubbleColor, textColor = null) => {
    set((state) => ({
      receivedBubbleColor,
      receivedBubbleTextColor: textColor !== null ? textColor : state.receivedBubbleTextColor,
    }));
    const s = get();
    persist(s);
    s.applyTheme();
  },
  setReceivedBubbleTextColor: (receivedBubbleTextColor) => {
    set({ receivedBubbleTextColor });
    const s = get();
    persist(s);
    s.applyTheme();
  },
  resetToDefaults: () => {
    localStorage.removeItem('zyntra-theme');
    set({
      theme: 'light',
      morphism: 'glass',
      accentColor: 'azure',
      customAccentColor: '#1d63ff',
      chatDensity: 'comfortable',
      iconSize: '22',
      messageBubbles: 'soft',
      wallpaper: 'plain',
      wallpaperCustomUrl: '',
      wallpaperOpacity: 0.85,
      wallpaperBlur: 0,
      cornerRadius: '16',
      reduceMotion: false,
      highContrast: false,
      eyeComfort: 'off',
      eyeComfortWarmth: 40,
      sentBubbleColor: '#1d63ff',
      sentBubbleTextColor: '#ffffff',
      receivedBubbleColor: '#f1f5f9',
      receivedBubbleTextColor: '#0f172a',
    });
    const s = get();
    persist(s);
    s.applyTheme();
  },
}));

export default useThemeStore;
