import React, { useState, useRef } from 'react';
import {
  Sparkles,
  RefreshCw,
  Check,
  Camera,
  Wand2,
  Zap,
  User,
  Upload,
  ShieldCheck
} from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import {
  AURA_COLORS,
  AVATAR_STYLES,
  ARTIFICIAL_AVATAR_PRESETS,
  generateArtificialAvatar
} from '../../utils/artificialAvatars';

const ProfileSettings = () => {
  const { user, updateAvatar, updateProfile } = useAuthStore();

  // Basic Profile Form State
  const [name, setName] = useState(user?.name || 'Soumya Mohanty');
  const [bio, setBio] = useState(user?.bio || 'Lead Engineer & Systems Architect · Building contextual communication');
  const [profileSaved, setProfileSaved] = useState(false);

  // Artificial Avatar Studio State
  const [selectedStyle, setSelectedStyle] = useState('android');
  const [selectedAura, setSelectedAura] = useState('azure');
  const [customSeed, setCustomSeed] = useState('nexus-01');
  const [generatedPreviewUrl, setGeneratedPreviewUrl] = useState(() => {
    return user?.avatar || ARTIFICIAL_AVATAR_PRESETS[0].url;
  });
  const [equippedSuccess, setEquippedSuccess] = useState(false);

  const fileInputRef = useRef(null);

  // Re-generate preview whenever style or aura changes
  const handleRegenerate = (newStyle = selectedStyle, newAura = selectedAura, newSeed = customSeed) => {
    const url = generateArtificialAvatar({
      style: newStyle,
      auraId: newAura,
      seed: newSeed
    });
    setGeneratedPreviewUrl(url);
  };

  // Randomize all parameters for a surprise avatar
  const handleRandomizeAI = () => {
    const randomStyle = AVATAR_STYLES[Math.floor(Math.random() * AVATAR_STYLES.length)].id;
    const randomAura = AURA_COLORS[Math.floor(Math.random() * AURA_COLORS.length)].id;
    const randomSeeds = ['quantum', 'pulse', 'valkyrie', 'phantom', 'hyperion', 'nebula', 'specter', 'matrix-x', 'zenith'];
    const randomSeedVal = randomSeeds[Math.floor(Math.random() * randomSeeds.length)] + '-' + Math.floor(Math.random() * 99);

    setSelectedStyle(randomStyle);
    setSelectedAura(randomAura);
    setCustomSeed(randomSeedVal);
    handleRegenerate(randomStyle, randomAura, randomSeedVal);
  };

  // Select a preset avatar
  const handleSelectPreset = (preset) => {
    setSelectedStyle(preset.style);
    setSelectedAura(preset.auraId);
    setGeneratedPreviewUrl(preset.url);
  };

  // Equip generated avatar to user profile
  const handleEquipAvatar = (urlToEquip = generatedPreviewUrl) => {
    updateAvatar(urlToEquip, 'ai');
    setEquippedSuccess(true);
    setTimeout(() => setEquippedSuccess(false), 2400);
  };

  // Revert back to traditional initials
  const handleRevertToInitials = () => {
    updateAvatar(null, 'initials');
    setEquippedSuccess(true);
    setTimeout(() => setEquippedSuccess(false), 2400);
  };

  // Upload custom local photo
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (typeof dataUrl === 'string') {
        updateAvatar(dataUrl, 'image');
        setGeneratedPreviewUrl(dataUrl);
        setEquippedSuccess(true);
        setTimeout(() => setEquippedSuccess(false), 2400);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile({ name, bio });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2200);
  };

  return (
    <div style={{ width: '100%', fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      {/* Title */}
      <div style={{ marginBottom: '20px' }}>
        <h2
          style={{
            fontSize: '22px',
            fontWeight: 800,
            color: '#0f172a',
            letterSpacing: '-0.025em',
            margin: '0 0 3px 0'
          }}
        >
          Profile Identity & Artificial Avatar Studio
        </h2>
        <p style={{ fontSize: '11.5px', color: '#64748b', margin: 0 }}>
          Manage your personal persona, generate synthetic AI avatars, and configure contextual aliases.
        </p>
      </div>

      {/* Primary Identity Summary Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          marginBottom: '26px',
          flexWrap: 'wrap',
          gap: '14px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Active Avatar Display */}
          <div
            style={{
              position: 'relative',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              padding: '3px',
              background: user?.avatar
                ? 'linear-gradient(135deg, #1d63ff 0%, #d946ef 100%)'
                : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              boxShadow: '0 4px 14px rgba(29, 99, 255, 0.25)',
              flexShrink: 0
            }}
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="Active Avatar"
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  backgroundColor: '#0f172a'
                }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  backgroundColor: '#1d63ff',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: 800
                }}
              >
                SM
              </div>
            )}
            <span
              title="Verified Account"
              style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                backgroundColor: '#10b981',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                border: '2px solid #ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}
            >
              <ShieldCheck size={10} strokeWidth={3} />
            </span>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                {name}
              </span>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '2px 7px',
                  borderRadius: '999px',
                  backgroundColor: user?.avatar ? '#eff6ff' : '#f1f5f9',
                  color: user?.avatar ? '#1d63ff' : '#64748b',
                  border: user?.avatar ? '1px solid #bfdbfe' : '1px solid #cbd5e1'
                }}
              >
                {user?.avatar ? 'Artificial Avatar Active' : 'Traditional Initials'}
              </span>
            </div>
            <div style={{ fontSize: '11.5px', color: '#64748b', fontFamily: 'monospace', margin: '2px 0 4px 0' }}>
              @{user?.primaryUsername || 'soumya'}
            </div>
            <p style={{ fontSize: '11px', color: '#475569', margin: 0, maxWidth: '420px' }}>
              {bio}
            </p>
          </div>
        </div>

        {/* Quick Photo Actions */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePhotoUpload}
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
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Camera size={12} />
            Upload Photo
          </button>
          {user?.avatar && (
            <button
              type="button"
              onClick={handleRevertToInitials}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                color: '#64748b',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Reset to Initials
            </button>
          )}
        </div>
      </div>

      {/* =========================================================
          SECTION 1: ARTIFICIAL AVATAR STUDIO (The Highlight Feature)
          ========================================================= */}
      <div
        style={{
          borderRadius: '18px',
          border: '2px solid #1d63ff',
          padding: '22px 24px',
          backgroundColor: '#ffffff',
          boxShadow: '0 8px 25px rgba(29, 99, 255, 0.08)',
          marginBottom: '32px'
        }}
      >
        {/* Studio Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '18px',
            flexWrap: 'wrap',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#eff6ff',
                color: '#1d63ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Wand2 size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Artificial Avatar Studio
              </h3>
              <p style={{ fontSize: '11px', color: '#64748b', margin: '1px 0 0 0' }}>
                Procedural neural avatar generator with customized styles, auras, and cybernetic optics.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRandomizeAI}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '8px',
              border: '1px solid #bfdbfe',
              backgroundColor: '#eff6ff',
              color: '#1d63ff',
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Sparkles size={13} />
            Surprise Me (Generate Random AI)
          </button>
        </div>

        {/* Studio Body: Interactive 2-Column Editor */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            alignItems: 'center',
            marginBottom: '20px'
          }}
        >
          {/* Left: Interactive Avatar Preview Viewport */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              backgroundColor: '#0b101f',
              borderRadius: '16px',
              border: '1px solid #1e293b',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Ambient Background Grid lines */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.15,
                backgroundImage: `radial-gradient(#38bdf8 1px, transparent 1px)`,
                backgroundSize: '16px 16px',
                pointerEvents: 'none'
              }}
            />

            {/* Glowing Avatar Stage */}
            <div
              style={{
                position: 'relative',
                width: '130px',
                height: '130px',
                borderRadius: '50%',
                padding: '6px',
                background: 'linear-gradient(135deg, #1d63ff 0%, #d946ef 50%, #10b981 100%)',
                boxShadow: '0 0 30px rgba(29, 99, 255, 0.4), 0 0 10px rgba(217, 70, 239, 0.3)',
                marginBottom: '16px',
                transition: 'all 0.3s ease'
              }}
            >
              <img
                src={generatedPreviewUrl}
                alt="AI Avatar Preview"
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
            </div>

            {/* Avatar Details Meta */}
            <div style={{ textAlign: 'center', zIndex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff', marginBottom: '2px' }}>
                {AVATAR_STYLES.find((s) => s.id === selectedStyle)?.label || 'Cyber Android'}
              </div>
              <div style={{ fontSize: '10.5px', color: '#94a3b8', fontFamily: 'monospace' }}>
                Aura: {AURA_COLORS.find((a) => a.id === selectedAura)?.label} · Seed: {customSeed}
              </div>
            </div>

            {/* Primary Action: Equip Button */}
            <button
              type="button"
              onClick={() => handleEquipAvatar(generatedPreviewUrl)}
              style={{
                marginTop: '16px',
                padding: '9px 24px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: equippedSuccess ? '#10b981' : '#1d63ff',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                boxShadow: '0 4px 12px rgba(29, 99, 255, 0.3)',
                transition: 'all 0.2s ease',
                zIndex: 1
              }}
            >
              {equippedSuccess ? (
                <>
                  <Check size={14} strokeWidth={3} /> Equipped to Profile!
                </>
              ) : (
                <>
                  <Zap size={14} /> Equip This Artificial Avatar
                </>
              )}
            </button>
          </div>

          {/* Right: Customization Controls */}
          <div>
            {/* 1. Select Archetype Style */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                1. Select AI Archetype Style
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                {AVATAR_STYLES.map((style) => {
                  const isActive = selectedStyle === style.id;
                  return (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => {
                        setSelectedStyle(style.id);
                        handleRegenerate(style.id, selectedAura, customSeed);
                      }}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '8px',
                        textAlign: 'left',
                        border: isActive ? '2px solid #1d63ff' : '1px solid #e2e8f0',
                        backgroundColor: isActive ? '#eff6ff' : '#ffffff',
                        color: isActive ? '#1d63ff' : '#334155',
                        fontSize: '11px',
                        fontWeight: isActive ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {style.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Select Aura Energy */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                2. Energy Aura & Optical Glow
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                {AURA_COLORS.map((aura) => {
                  const isActive = selectedAura === aura.id;
                  return (
                    <button
                      key={aura.id}
                      type="button"
                      onClick={() => {
                        setSelectedAura(aura.id);
                        handleRegenerate(selectedStyle, aura.id, customSeed);
                      }}
                      title={aura.label}
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        backgroundColor: aura.primary,
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
                      {isActive && <Check size={13} color="#ffffff" strokeWidth={3} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Custom Persona Seed / Prompt */}
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                3. Persona Seed Keyword (Procedural Synthesizer)
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  value={customSeed}
                  onChange={(e) => setCustomSeed(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRegenerate(selectedStyle, selectedAura, customSeed)}
                  placeholder="e.g. quantum-fox, cyber-samurai..."
                  style={{
                    flex: 1,
                    padding: '7px 10px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '11.5px',
                    outline: 'none',
                    backgroundColor: '#ffffff'
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleRegenerate(selectedStyle, selectedAura, customSeed)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Synthesize
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Curated Presets Showcase Gallery */}
        <div>
          <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
            Instant Curated AI Avatar Presets:
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
              gap: '10px'
            }}
          >
            {ARTIFICIAL_AVATAR_PRESETS.map((preset) => {
              const isActive = generatedPreviewUrl === preset.url;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  style={{
                    padding: '10px 8px',
                    borderRadius: '12px',
                    border: isActive ? '2px solid #1d63ff' : '1px solid #e2e8f0',
                    backgroundColor: isActive ? '#eff6ff' : '#f8fafc',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      backgroundColor: '#0f172a',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  >
                    <img src={preset.url} alt={preset.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#0f172a', textAlign: 'center' }}>
                    {preset.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* =========================================================
          SECTION 2: TRADITIONAL PROFILE DETAILS FORM
          ========================================================= */}
      <form onSubmit={handleSaveProfile} style={{ maxWidth: '640px' }}>
        <h3
          style={{
            fontSize: '14px',
            fontWeight: 800,
            color: '#0f172a',
            margin: '0 0 12px 0'
          }}
        >
          General Profile Information
        </h3>

        {/* Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '11.5px',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '4px'
              }}
            >
              Full Display Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#0f172a',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '11.5px',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '4px'
              }}
            >
              Bio / Status
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={2}
              style={{
                width: '100%',
                padding: '9px 12px',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '12.5px',
                color: '#0f172a',
                outline: 'none',
                resize: 'none',
                lineHeight: 1.45,
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Contextual Usernames Section */}
        <div style={{ marginBottom: '22px' }}>
          <h4
            style={{
              fontSize: '12.5px',
              fontWeight: 800,
              color: '#0f172a',
              margin: '0 0 2px 0'
            }}
          >
            Contextual Workspaces & Personas
          </h4>
          <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 10px 0' }}>
            Each workspace allows a distinct alias persona while remaining linked to your verified root account.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {user?.contexts?.map((ctx) => (
              <div
                key={ctx.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px'
                }}
              >
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a' }}>
                    {ctx.name}
                  </div>
                  <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#1d63ff', fontWeight: 600 }}>
                    @{ctx.username}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => alert(`Context alias @${ctx.username} is active for ${ctx.name}`)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#334155',
                    cursor: 'pointer'
                  }}
                >
                  Active Alias
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div>
          <button
            type="submit"
            style={{
              padding: '9px 22px',
              backgroundColor: '#1d63ff',
              color: '#ffffff',
              fontSize: '12.5px',
              fontWeight: 700,
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(29, 99, 255, 0.25)',
              transition: 'background-color 0.15s'
            }}
          >
            {profileSaved ? (
              <>
                <Check size={14} strokeWidth={3} /> Profile Changes Saved!
              </>
            ) : (
              'Save Profile Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;
