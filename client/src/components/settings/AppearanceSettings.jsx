import React, { useState, useRef } from 'react';
import {
  Sun,
  Moon,
  Eye,
  Image as ImageIcon,
  Upload,
  Palette,
  Sparkles,
  RefreshCw,
  Check,
  CheckCheck,
  SendHorizontal,
  Paperclip,
  Smile,
  Sliders,
  ShieldAlert
} from 'lucide-react';
import useThemeStore from '../../store/useThemeStore';
import {
  ACCENT_PRESETS,
  SENT_BUBBLE_PRESETS,
  RECEIVED_BUBBLE_PRESETS,
  WALLPAPER_PRESETS,
  EYE_COMFORT_MODES,
  getContrastTextColor,
  getChatWallpaperStyle
} from '../../utils/themeWallpapers';

const MORPHISM_CARDS = [
  {
    value: 'glass',
    title: 'Glass',
    sub1: 'Translucent',
    sub2: 'Balanced blur',
  },
  {
    value: 'soft',
    title: 'Soft',
    sub1: 'Quiet depth',
    sub2: 'Low contrast',
  },
  {
    value: 'neo',
    title: 'Neo',
    sub1: 'Crisp',
    sub2: 'Sharp edges',
  },
];

const THEME_OPTIONS = [
  { value: 'auto', label: 'Auto (System)', icon: Sparkles },
  { value: 'light', label: 'Day (Light)', icon: Sun },
  { value: 'dark', label: 'Night (Dark)', icon: Moon },
  { value: 'midnight', label: 'Midnight OLED', icon: Moon },
  { value: 'twilight', label: 'Twilight Dusk', icon: Sparkles },
];

const PillSelector = ({ options, value, onChange }) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      backgroundColor: 'var(--color-bg-secondary)',
      border: '1px solid var(--color-border-primary)',
      borderRadius: '8px',
      padding: '3px',
      gap: '2px',
      userSelect: 'none',
      flexWrap: 'wrap'
    }}
  >
    {options.map((opt) => {
      const isActive = value === opt.value;
      const Icon = opt.icon;
      return (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '6px 13px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            backgroundColor: isActive ? 'var(--color-accent, #1d63ff)' : 'transparent',
            color: isActive ? '#ffffff' : 'var(--color-text-secondary)'
          }}
        >
          {Icon && <Icon size={12} />}
          {opt.label}
        </button>
      );
    })}
  </div>
);

const SettingBlock = ({ title, description, children, badge = null }) => (
  <div style={{ marginBottom: '22px', userSelect: 'none' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
      <h3
        style={{
          fontSize: '13.5px',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          letterSpacing: '-0.01em',
          margin: 0
        }}
      >
        {title}
      </h3>
      {badge && (
        <span
          style={{
            fontSize: '10px',
            fontWeight: 700,
            padding: '2px 7px',
            borderRadius: '999px',
            backgroundColor: 'rgba(var(--color-accent-rgb), 0.15)',
            color: 'var(--color-accent)',
            border: '1px solid rgba(var(--color-accent-rgb), 0.2)'
          }}
        >
          {badge}
        </span>
      )}
    </div>
    {description && (
      <p
        style={{
          fontSize: '11.5px',
          color: 'var(--color-text-tertiary)',
          margin: '0 0 10px 0',
          lineHeight: 1.45
        }}
      >
        {description}
      </p>
    )}
    {children}
  </div>
);

const AppearanceSettings = () => {
  const store = useThemeStore();
  const fileInputRef = useRef(null);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [showCustomSentPicker, setShowCustomSentPicker] = useState(false);
  const [showCustomRecvPicker, setShowCustomRecvPicker] = useState(false);
  const [showCustomAccentPicker, setShowCustomAccentPicker] = useState(false);

  // Handle local image upload for chat wallpaper
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Please choose an image under 5MB for optimal performance.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (typeof dataUrl === 'string') {
        store.setWallpaperCustomUrl(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (customUrlInput.trim()) {
      store.setWallpaperCustomUrl(customUrlInput.trim());
      setCustomUrlInput('');
    }
  };

  const handleCustomSentColor = (hex) => {
    const textColor = getContrastTextColor(hex);
    store.setSentBubbleColor(hex, textColor);
  };

  const handleCustomRecvColor = (hex) => {
    const textColor = getContrastTextColor(hex);
    store.setReceivedBubbleColor(hex, textColor);
  };

  return (
    <div style={{ width: '100%', fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '22px',
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.025em',
              margin: '0 0 3px 0'
            }}
          >
            Appearance & Personalization
          </h2>
          <p style={{ fontSize: '11.5px', color: '#64748b', margin: 0 }}>
            Personalize themes, eye-comforting filters, bubble colors, and chat background wallpapers.
          </p>
        </div>

        <button
          type="button"
          onClick={store.resetToDefaults}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            color: '#64748b',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          title="Reset all personalization to defaults"
        >
          <RefreshCw size={12} />
          Reset to Defaults
        </button>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '28px',
          alignItems: 'start'
        }}
      >
        {/* Left Column: Controls */}
        <div>
          {/* 1. Day / Night & Themes */}
          <SettingBlock
            title="Day / Night Mode & Themes"
            description="Choose day brightness, night slate, midnight OLED pitch black, or twilight dusk."
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {THEME_OPTIONS.map((opt) => {
                const isActive = store.theme === opt.value;
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => store.setTheme(opt.value)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '7px',
                      padding: '8px 14px',
                      borderRadius: '10px',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      border: isActive ? '2px solid var(--color-accent, #1d63ff)' : '1px solid #cbd5e1',
                      backgroundColor: isActive ? '#eff6ff' : '#ffffff',
                      color: isActive ? 'var(--color-accent, #1d63ff)' : '#334155',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Icon size={14} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </SettingBlock>

          {/* 2. Eye-Comforting Coloring & Night Shift */}
          <SettingBlock
            title="Eye-Comforting Coloring (Night Shift & Reading)"
            description="Filter harsh blue wavelengths, reduce ocular fatigue, and add soothing warm tones."
            badge={store.eyeComfort !== 'off' ? 'Active' : null}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
              {EYE_COMFORT_MODES.map((mode) => {
                const isActive = store.eyeComfort === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => store.setEyeComfort(mode.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 12px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 600,
                      border: isActive ? `2px solid ${mode.color}` : '1px solid #e2e8f0',
                      backgroundColor: isActive ? '#ffffff' : '#f8fafc',
                      color: isActive ? '#0f172a' : '#64748b',
                      cursor: 'pointer',
                      boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: mode.color
                      }}
                    />
                    {mode.label}
                  </button>
                );
              })}
            </div>

            {/* Warmth Intensity Slider (shown when eye comfort is active) */}
            {store.eyeComfort !== 'off' && (
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  marginTop: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#334155' }}>
                    Warmth & Softening Intensity:
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'var(--color-accent, #1d63ff)',
                      backgroundColor: '#eff6ff',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}
                  >
                    {store.eyeComfortWarmth}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={store.eyeComfortWarmth}
                  onChange={(e) => store.setEyeComfortWarmth(Number(e.target.value))}
                  style={{
                    width: '100%',
                    accentColor: 'var(--color-accent, #1d63ff)',
                    cursor: 'pointer'
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>
                  <span>Gentle (10%)</span>
                  <span>Balanced (40%)</span>
                  <span>Deep Night (100%)</span>
                </div>
              </div>
            )}
          </SettingBlock>

          {/* 3. Accent Color */}
          <SettingBlock
            title="Accent Color"
            description="Controls focus rings, primary action buttons, links, and highlights."
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
              {ACCENT_PRESETS.map((c) => {
                const isActive = store.accentColor === c.value;
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => store.setAccentColor(c.value)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '3px',
                      cursor: 'pointer'
                    }}
                  >
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        backgroundColor: c.color,
                        outline: isActive ? '2px solid var(--color-accent, #1d63ff)' : 'none',
                        outlineOffset: '2px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {isActive && <Check size={14} color="#ffffff" strokeWidth={3} />}
                    </div>
                    <span
                      style={{
                        fontSize: '9px',
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? 'var(--color-accent, #1d63ff)' : '#64748b'
                      }}
                    >
                      {c.label}
                    </span>
                  </button>
                );
              })}

              {/* Custom Accent Color Button */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', position: 'relative' }}>
                <label
                  title="Choose custom hex accent color"
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: store.accentColor === 'custom'
                      ? store.customAccentColor
                      : 'conic-gradient(from 180deg at 50% 50%, #ff0000, #ff8000, #ffff00, #00ff00, #00ffff, #0000ff, #8000ff, #ff00ff, #ff0000)',
                    outline: store.accentColor === 'custom' ? '2px solid #0f172a' : '1px solid #cbd5e1',
                    outlineOffset: '2px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  <input
                    type="color"
                    value={store.customAccentColor || '#1d63ff'}
                    onChange={(e) => store.setCustomAccentColor(e.target.value)}
                    style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
                  />
                  {store.accentColor === 'custom' && <Check size={14} color="#ffffff" strokeWidth={3} />}
                </label>
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: store.accentColor === 'custom' ? 700 : 500,
                    color: store.accentColor === 'custom' ? '#0f172a' : '#64748b'
                  }}
                >
                  Custom
                </span>
              </div>
            </div>
          </SettingBlock>

          {/* 4. Sent & Receiving Message Bubble Colors */}
          <SettingBlock
            title="Message Bubble Colors (Sent & Received)"
            description="Customize the look of your sent messages and incoming messages."
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Sent Bubble Color */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#1e293b' }}>
                    My Sent Messages Bubble Color:
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '4px',
                        backgroundColor: store.sentBubbleColor,
                        display: 'inline-block',
                        border: '1px solid rgba(0,0,0,0.1)'
                      }}
                    />
                    <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#64748b' }}>
                      {store.sentBubbleColor}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
                  {SENT_BUBBLE_PRESETS.map((p) => {
                    const isActive = store.sentBubbleColor === p.value;
                    return (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => store.setSentBubbleColor(p.value, p.textColor)}
                        title={p.label}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '6px',
                          backgroundColor: p.value,
                          border: isActive ? '2px solid #0f172a' : '1px solid rgba(0,0,0,0.15)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: isActive ? '0 2px 6px rgba(0,0,0,0.2)' : 'none',
                          transform: isActive ? 'scale(1.15)' : 'none',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {isActive && <Check size={12} color={p.textColor} strokeWidth={3} />}
                      </button>
                    );
                  })}

                  {/* Custom sent bubble hex picker */}
                  <label
                    title="Choose custom sent bubble color"
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      backgroundColor: store.sentBubbleColor,
                      border: '2px dashed #94a3b8',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative'
                    }}
                  >
                    <Palette size={12} color={store.sentBubbleTextColor} />
                    <input
                      type="color"
                      value={store.sentBubbleColor}
                      onChange={(e) => handleCustomSentColor(e.target.value)}
                      style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
                    />
                  </label>
                </div>
              </div>

              {/* Received Bubble Color */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#1e293b' }}>
                    Received Messages Bubble Color:
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '4px',
                        backgroundColor: store.receivedBubbleColor,
                        display: 'inline-block',
                        border: '1px solid rgba(0,0,0,0.1)'
                      }}
                    />
                    <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#64748b' }}>
                      {store.receivedBubbleColor}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
                  {RECEIVED_BUBBLE_PRESETS.map((p) => {
                    const isActive = store.receivedBubbleColor === p.value;
                    return (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => store.setReceivedBubbleColor(p.value, p.textColor)}
                        title={p.label}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '6px',
                          backgroundColor: p.value,
                          border: isActive ? '2px solid #0f172a' : '1px solid rgba(0,0,0,0.15)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: isActive ? '0 2px 6px rgba(0,0,0,0.2)' : 'none',
                          transform: isActive ? 'scale(1.15)' : 'none',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {isActive && <Check size={12} color={p.textColor} strokeWidth={3} />}
                      </button>
                    );
                  })}

                  {/* Custom received bubble hex picker */}
                  <label
                    title="Choose custom received bubble color"
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      backgroundColor: store.receivedBubbleColor,
                      border: '2px dashed #94a3b8',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative'
                    }}
                  >
                    <Palette size={12} color={store.receivedBubbleTextColor} />
                    <input
                      type="color"
                      value={store.receivedBubbleColor}
                      onChange={(e) => handleCustomRecvColor(e.target.value)}
                      style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
                    />
                  </label>
                </div>
              </div>

              {/* Bubble Shape & Radius */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '4px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 500, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Bubble Shape
                  </span>
                  <PillSelector
                    options={[
                      { value: 'soft', label: 'Soft' },
                      { value: 'flat', label: 'Flat' },
                      { value: 'sharp', label: 'Sharp' },
                    ]}
                    value={store.messageBubbles}
                    onChange={store.setMessageBubbles}
                  />
                </div>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 500, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Corner Radius
                  </span>
                  <PillSelector
                    options={[
                      { value: '12', label: '12 px' },
                      { value: '16', label: '16 px' },
                      { value: '20', label: '20 px' },
                    ]}
                    value={store.cornerRadius}
                    onChange={store.setCornerRadius}
                  />
                </div>
              </div>
            </div>
          </SettingBlock>

          {/* 5. Chat Wallpaper / Background Image */}
          <SettingBlock
            title="Chat Wallpaper & Background Image"
            description="Select sleek curated patterns, gentle gradients, or upload your own custom image."
          >
            {/* Presets Gallery */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '8px',
                marginBottom: '12px'
              }}
            >
              {WALLPAPER_PRESETS.map((w) => {
                const isActive = store.wallpaper === w.id;
                return (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => store.setWallpaper(w.id)}
                    title={w.description}
                    style={{
                      height: '54px',
                      borderRadius: '10px',
                      border: isActive ? '2px solid var(--color-accent, #1d63ff)' : '1px solid #cbd5e1',
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      padding: '6px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      boxShadow: isActive ? '0 4px 10px rgba(0,0,0,0.1)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {/* Background Pattern Layer */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: '#f8fafc',
                        ...w.style,
                        opacity: 0.9
                      }}
                    />
                    {/* Text Label */}
                    <span
                      style={{
                        position: 'relative',
                        zIndex: 1,
                        fontSize: '9.5px',
                        fontWeight: 700,
                        color: '#0f172a',
                        backgroundColor: 'rgba(255,255,255,0.85)',
                        padding: '1px 5px',
                        borderRadius: '4px',
                        display: 'inline-block',
                        backdropFilter: 'blur(4px)'
                      }}
                    >
                      {w.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom Image Upload & URL Bar */}
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '10px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#1e293b' }}>
                  Custom Background Image:
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '5px 10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      color: '#0f172a',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <Upload size={12} />
                    Upload Image
                  </button>

                  {store.wallpaper === 'custom' && (
                    <button
                      type="button"
                      onClick={() => store.setWallpaper('plain')}
                      style={{
                        padding: '5px 8px',
                        borderRadius: '6px',
                        border: '1px solid #fecaca',
                        backgroundColor: '#fff1f2',
                        color: '#b91c1c',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* URL Input */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  placeholder="Or paste an image URL (https://...)"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyUrl()}
                  style={{
                    flex: 1,
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '11px',
                    outline: 'none',
                    backgroundColor: '#ffffff'
                  }}
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: 'var(--color-accent, #1d63ff)',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Apply
                </button>
              </div>

              {/* Opacity & Blur Sliders */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '4px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#475569', marginBottom: '3px' }}>
                    <span>Opacity</span>
                    <span style={{ fontWeight: 700 }}>{Math.round((store.wallpaperOpacity ?? 0.85) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={store.wallpaperOpacity ?? 0.85}
                    onChange={(e) => store.setWallpaperOpacity(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--color-accent, #1d63ff)', cursor: 'pointer' }}
                  />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#475569', marginBottom: '3px' }}>
                    <span>Blur (Softness)</span>
                    <span style={{ fontWeight: 700 }}>{store.wallpaperBlur ?? 0}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="12"
                    step="1"
                    value={store.wallpaperBlur ?? 0}
                    onChange={(e) => store.setWallpaperBlur(parseInt(e.target.value, 10))}
                    style={{ width: '100%', accentColor: 'var(--color-accent, #1d63ff)', cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>
          </SettingBlock>

          {/* 6. Morphism & Density */}
          <SettingBlock
            title="Morphism Surface Language"
            description="Choose the visual surface style used by application panels and cards."
          >
            <div style={{ display: 'flex', gap: '10px' }}>
              {MORPHISM_CARDS.map((card) => {
                const isActive = store.morphism === card.value;
                return (
                  <button
                    key={card.value}
                    type="button"
                    onClick={() => store.setMorphism(card.value)}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      borderRadius: '10px',
                      textAlign: 'left',
                      border: isActive ? '2px solid var(--color-accent, #1d63ff)' : '1px solid #e2e8f0',
                      backgroundColor: '#ffffff',
                      cursor: 'pointer',
                      boxSizing: 'border-box'
                    }}
                  >
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>
                      {card.title}
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                      {card.sub1}
                    </div>
                  </button>
                );
              })}
            </div>
          </SettingBlock>

          {/* 7. Chat density & Icon Size */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <SettingBlock title="Chat density">
              <PillSelector
                options={[
                  { value: 'comfortable', label: 'Comfortable' },
                  { value: 'compact', label: 'Compact' },
                  { value: 'minimal', label: 'Minimal' },
                ]}
                value={store.chatDensity}
                onChange={store.setChatDensity}
              />
            </SettingBlock>
            <SettingBlock title="Icon size">
              <PillSelector
                options={[
                  { value: '18', label: '18 px' },
                  { value: '22', label: '22 px' },
                  { value: '26', label: '26 px' },
                ]}
                value={store.iconSize}
                onChange={store.setIconSize}
              />
            </SettingBlock>
          </div>
        </div>

        {/* Right Column: Interactive Real-Time Live Chat Preview */}
        <div style={{ position: 'sticky', top: '24px' }}>
          <div
            style={{
              borderRadius: '18px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Preview Card Header */}
            <div
              style={{
                padding: '12px 18px',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                userSelect: 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
                <span style={{ fontSize: '12.5px', fontWeight: 700 }}>Live Chat Real-Time Preview</span>
              </div>
              <span
                style={{
                  fontSize: '9.5px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '2px 7px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  color: '#93c5fd'
                }}
              >
                Instant Sync
              </span>
            </div>

            {/* Preview Chat Body Container */}
            <div
              style={{
                position: 'relative',
                height: '380px',
                backgroundColor: store.theme === 'midnight'
                  ? '#000000'
                  : store.theme === 'twilight'
                  ? '#080c14'
                  : store.theme === 'dark'
                  ? '#0f172a'
                  : '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                overflow: 'hidden'
              }}
            >
              {/* Wallpaper Background Layer */}
              {store.wallpaper !== 'plain' && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    zIndex: 0,
                    transition: 'all 0.3s ease',
                    ...getChatWallpaperStyle(
                      store.wallpaper,
                      store.wallpaperCustomUrl,
                      store.wallpaperOpacity,
                      store.wallpaperBlur
                    )
                  }}
                />
              )}

              {/* Messages Container */}
              <div
                style={{
                  position: 'relative',
                  zIndex: 1,
                  padding: '16px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  overflowY: 'auto'
                }}
              >
                {/* Date Header */}
                <div style={{ textAlign: 'center', margin: '4px 0 8px 0' }}>
                  <span
                    style={{
                      fontSize: '9.5px',
                      fontWeight: 700,
                      color: '#94a3b8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      backgroundColor: 'rgba(255,255,255,0.7)',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      backdropFilter: 'blur(4px)'
                    }}
                  >
                    Today
                  </span>
                </div>

                {/* 1. Received Bubble Preview */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', maxWidth: '85%' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: '#8b5cf6',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 700,
                      flexShrink: 0
                    }}
                  >
                    ER
                  </div>
                  <div
                    style={{
                      padding: '9px 14px',
                      borderRadius: store.messageBubbles === 'sharp' ? '0px' : store.messageBubbles === 'flat' ? '4px' : `${store.cornerRadius || 16}px`,
                      borderBottomLeftRadius: store.messageBubbles === 'sharp' ? '0px' : '3px',
                      backgroundColor: store.receivedBubbleColor || '#f1f5f9',
                      color: store.receivedBubbleTextColor || '#0f172a',
                      fontSize: '12.5px',
                      lineHeight: 1.45,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      border: '1px solid rgba(0,0,0,0.06)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-accent, #1d63ff)', marginBottom: '2px' }}>
                      Elena Rostova
                    </div>
                    <span>
                      Hey Soumya! Notice how the new wallpaper and custom colors look?
                    </span>
                    <div style={{ fontSize: '9px', textAlign: 'right', marginTop: '3px', color: '#94a3b8' }}>
                      04:15 pm
                    </div>
                  </div>
                </div>

                {/* 2. Sent Bubble Preview */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                  <div
                    style={{
                      maxWidth: '85%',
                      padding: '9px 14px',
                      borderRadius: store.messageBubbles === 'sharp' ? '0px' : store.messageBubbles === 'flat' ? '4px' : `${store.cornerRadius || 16}px`,
                      borderBottomRightRadius: store.messageBubbles === 'sharp' ? '0px' : '3px',
                      backgroundColor: store.sentBubbleColor || '#1d63ff',
                      color: store.sentBubbleTextColor || '#ffffff',
                      fontSize: '12.5px',
                      lineHeight: 1.45,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.16)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span>
                      Looks stunning! The custom bubble color and eye-comfort night shift mode are so easy on the eyes.
                    </span>
                    <div
                      style={{
                        fontSize: '9px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '3px',
                        marginTop: '3px',
                        color: store.sentBubbleTextColor === '#ffffff' ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.6)'
                      }}
                    >
                      <span>04:16 pm</span>
                      <CheckCheck size={12} color={store.sentBubbleTextColor === '#ffffff' ? '#bfdbfe' : 'currentColor'} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview Composer */}
              <div
                style={{
                  position: 'relative',
                  zIndex: 2,
                  padding: '10px 14px',
                  backgroundColor: 'rgba(255,255,255,0.92)',
                  backdropFilter: 'blur(8px)',
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', gap: '4px', color: '#94a3b8' }}>
                  <Paperclip size={16} />
                  <Smile size={16} />
                </div>
                <div
                  style={{
                    flex: 1,
                    backgroundColor: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '6px 10px',
                    fontSize: '12px',
                    color: '#0f172a'
                  }}
                >
                  Type a message...
                </div>
                <button
                  type="button"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: 'var(--color-accent, #1d63ff)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <SendHorizontal size={15} />
                </button>
              </div>
            </div>

            {/* Active Specs Footer */}
            <div
              style={{
                padding: '10px 16px',
                backgroundColor: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
                fontSize: '11px',
                color: '#64748b',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                userSelect: 'none'
              }}
            >
              <span>Active Theme: <strong>{store.theme.toUpperCase()}</strong></span>
              <span>Eye Comfort: <strong>{store.eyeComfort.toUpperCase()}</strong></span>
              <span>Sent: <strong style={{ color: store.sentBubbleColor }}>{store.sentBubbleColor}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppearanceSettings;
