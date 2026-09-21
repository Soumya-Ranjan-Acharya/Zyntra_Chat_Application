import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Volume2, VolumeX, ChevronRight } from 'lucide-react';
import zyntraSound from '../../utils/zyntraSound';
import ZyntraUnicornSvg from './ZyntraUnicornSvg';

// Precise scene thresholds in milliseconds (total 4.2s runtime)
const SCENE_TIMES = {
  s1_start: 0,
  s1_pulse: 300,
  s2_stroke_start: 700,
  s2_stroke_top: 750,
  s2_stroke_diag: 1050,
  s2_stroke_base: 1380,
  s2_stroke_horn: 1620,
  s3_dots_start: 1820,
  s3_dot1: 1950,
  s3_dot2: 2150,
  s3_dot3: 2350,
  s3_ripple: 2400,
  s4_sweep_start: 2550,
  s4_sweep_peak: 2750,
  s5_brand_start: 3000,
  s6_trans_start: 3600,
  total_duration: 4200,
};

/**
 * ZyntraOpeningAnimation
 * 
 * Premium 3-4 second mobile app opening animation:
 * Scene 1 — Pure anticipation (0.0s - 0.7s)
 * Scene 2 — The symbol is born (0.7s - 1.8s): top -> flowing diagonal -> lower curve -> horn/unicorn detail
 * Scene 3 — The communication moment (1.8s - 2.5s): 3 conversation dots + ripple
 * Scene 4 — Signature motion (2.5s - 3.0s): thin light sweep left-to-right + settle
 * Scene 5 — Brand reveal (3.0s - 3.6s): "Zyntra" + "ONE IDENTITY. MULTIPLE CONTEXTS."
 * Scene 6 — Transition into application (3.6s - 4.2s): logo gently shrinks and morphs into app
 */
const ZyntraOpeningAnimation = ({
  onComplete,
  autoplay = true,
  speed = 1.0,
  enableSound = true,
  mode = 'fullscreen', // 'fullscreen' | 'embedded'
}) => {
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [isMuted, setIsMuted] = useState(!enableSound);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  const soundTriggersRef = useRef({
    ambient: false,
    pulse: false,
    crystallines: [false, false, false, false],
    dots: [false, false, false],
    ripple: false,
    chord: false,
    fadeout: false,
  });

  const animFrameRef = useRef(null);
  const lastTimestampRef = useRef(null);

  const resetSoundTriggers = useCallback(() => {
    soundTriggersRef.current = {
      ambient: false,
      pulse: false,
      crystallines: [false, false, false, false],
      dots: [false, false, false],
      ripple: false,
      chord: false,
      fadeout: false,
    };
  }, []);

  useEffect(() => {
    zyntraSound.setMuted(isMuted);
  }, [isMuted]);

  const handleInteraction = useCallback(() => {
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
      zyntraSound.ensureContext();
    }
  }, [hasUserInteracted]);

  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      lastTimestampRef.current = null;
      return;
    }

    const step = (timestamp) => {
      if (!lastTimestampRef.current) lastTimestampRef.current = timestamp;
      const delta = (timestamp - lastTimestampRef.current) * speed;
      lastTimestampRef.current = timestamp;

      setCurrentTimeMs((prevTime) => {
        const nextTime = prevTime + delta;
        const triggers = soundTriggersRef.current;

        // S1: Ambient tone
        if (nextTime >= 100 && !triggers.ambient && !isMuted) {
          triggers.ambient = true;
          zyntraSound.playAmbientTone();
        }

        // S1: Anticipation Pulse
        if (nextTime >= SCENE_TIMES.s1_pulse && !triggers.pulse && !isMuted) {
          triggers.pulse = true;
          zyntraSound.playAnticipationPulse();
        }

        // S2: Crystalline Drawing Notes
        if (nextTime >= SCENE_TIMES.s2_stroke_top && !triggers.crystallines[0] && !isMuted) {
          triggers.crystallines[0] = true;
          zyntraSound.playCrystallineNote(0);
        }
        if (nextTime >= SCENE_TIMES.s2_stroke_diag && !triggers.crystallines[1] && !isMuted) {
          triggers.crystallines[1] = true;
          zyntraSound.playCrystallineNote(1);
        }
        if (nextTime >= SCENE_TIMES.s2_stroke_base && !triggers.crystallines[2] && !isMuted) {
          triggers.crystallines[2] = true;
          zyntraSound.playCrystallineNote(2);
        }
        if (nextTime >= SCENE_TIMES.s2_stroke_horn && !triggers.crystallines[3] && !isMuted) {
          triggers.crystallines[3] = true;
          zyntraSound.playCrystallineNote(3);
        }

        // S3: Conversation Dots
        if (nextTime >= SCENE_TIMES.s3_dot1 && !triggers.dots[0] && !isMuted) {
          triggers.dots[0] = true;
          zyntraSound.playChatDotClick(0);
        }
        if (nextTime >= SCENE_TIMES.s3_dot2 && !triggers.dots[1] && !isMuted) {
          triggers.dots[1] = true;
          zyntraSound.playChatDotClick(1);
        }
        if (nextTime >= SCENE_TIMES.s3_dot3 && !triggers.dots[2] && !isMuted) {
          triggers.dots[2] = true;
          zyntraSound.playChatDotClick(2);
        }
        if (nextTime >= SCENE_TIMES.s3_ripple && !triggers.ripple && !isMuted) {
          triggers.ripple = true;
          zyntraSound.playRippleChime();
        }

        // S4: Completion Chord & Light Sweep
        if (nextTime >= SCENE_TIMES.s4_sweep_start && !triggers.chord && !isMuted) {
          triggers.chord = true;
          zyntraSound.playCompletionChord();
        }

        // S6: Audio Fadeout
        if (nextTime >= SCENE_TIMES.s6_trans_start && !triggers.fadeout && !isMuted) {
          triggers.fadeout = true;
          zyntraSound.fadeAudioOut(600);
        }

        // Completion callback
        if (nextTime >= SCENE_TIMES.total_duration) {
          setTimeout(() => {
            setIsPlaying(false);
            if (onComplete) onComplete();
          }, 50);
          return SCENE_TIMES.total_duration;
        }

        animFrameRef.current = requestAnimationFrame(step);
        return nextTime;
      });
    };

    animFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, speed, isMuted, onComplete, resetSoundTriggers]);

  // Timeline Progress Calculations
  const t = currentTimeMs;

  // Scene 1: Anticipation Point (0 - 700ms)
  const s1PointScale = t < 250 ? 0 : t < 450 ? (t - 250) / 200 * 1.5 : Math.max(1, 1.5 - (t - 450) / 250 * 0.5);
  const s1LineLength = t < 450 ? 0 : Math.min(1, (t - 450) / 250);

  // Scene 2: Logo Drawing Motion (700ms - 1820ms)
  const s2StrokeProgress = Math.min(1, Math.max(0, (t - 700) / 1120));
  const s2LogoMaterialize = Math.min(1, Math.max(0, (t - 800) / 1020));

  // Compute stroke head position for the glowing comet
  let strokeHeadX = 50;
  let strokeHeadY = 50;
  const isStrokeActive = t >= 700 && t <= 1850;

  if (s2StrokeProgress <= 0.25) {
    const p = s2StrokeProgress / 0.25;
    strokeHeadX = 24 + p * 40;
    strokeHeadY = 22 - Math.sin(p * Math.PI) * 4;
  } else if (s2StrokeProgress <= 0.55) {
    const p = (s2StrokeProgress - 0.25) / 0.30;
    strokeHeadX = 64 - p * 40;
    strokeHeadY = 18 + p * 58;
  } else if (s2StrokeProgress <= 0.78) {
    const p = (s2StrokeProgress - 0.55) / 0.23;
    strokeHeadX = 24 + p * 44;
    strokeHeadY = 76 + Math.sin(p * Math.PI) * 8;
  } else {
    const p = (s2StrokeProgress - 0.78) / 0.22;
    strokeHeadX = 68 + p * 14;
    strokeHeadY = 84 - p * 76;
  }

  // Scene 3: Conversation Dots (1820ms - 2550ms)
  const dot1Visible = t >= SCENE_TIMES.s3_dot1;
  const dot2Visible = t >= SCENE_TIMES.s3_dot2;
  const dot3Visible = t >= SCENE_TIMES.s3_dot3;
  const rippleProgress = t < SCENE_TIMES.s3_ripple ? 0 : Math.min(1, (t - SCENE_TIMES.s3_ripple) / 600);

  // Scene 4: Signature Light Sweep (2550ms - 3000ms)
  const s4SweepProgress = Math.min(1, Math.max(0, (t - 2550) / 450));
  const s4BrightnessLift = t >= 2550 && t <= 2950
    ? 1 + Math.sin(s4SweepProgress * Math.PI) * 0.22
    : 1;

  // Scene 5: Brand Reveal (3000ms - 3600ms)
  const s5BrandProgress = Math.min(1, Math.max(0, (t - 3000) / 500));

  // Scene 6: App Transition (3600ms - 4200ms)
  const s6TransProgress = Math.min(1, Math.max(0, (t - 3600) / 600));
  const s6LogoScale = 1 - s6TransProgress * 0.76;
  const s6LogoTranslateY = -s6TransProgress * 280;
  const s6LogoTranslateX = -s6TransProgress * 80;
  const s6BgOpacity = 1 - s6TransProgress;

  return (
    <div
      onClick={handleInteraction}
      style={{
        position: mode === 'fullscreen' ? 'fixed' : 'relative',
        inset: mode === 'fullscreen' ? 0 : 'auto',
        width: '100%',
        height: mode === 'fullscreen' ? '100vh' : '100%',
        backgroundColor: '#040714',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        userSelect: 'none',
        fontFamily: "'Inter', -apple-system, system-ui, sans-serif",
      }}
    >
      {/* Background Ambience Layer: Pure midnight-navy */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 90% 70% at 50% 45%, #08112e 0%, #040714 85%)',
          opacity: s6BgOpacity,
          transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: 'none',
        }}
      />

      {/* Subtle Cyan/Violet Ambient Bloom behind Logo */}
      {t >= 700 && (
        <div
          style={{
            position: 'absolute',
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.22) 0%, rgba(56,189,248,0.12) 45%, transparent 75%)',
            filter: 'blur(35px)',
            opacity: s2LogoMaterialize * (1 - s6TransProgress),
            transform: `scale(${1 + s4SweepProgress * 0.15})`,
            transition: 'transform 0.3s ease-out',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* CENTRAL HERO COMPOSITION */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `translate(${s6LogoTranslateX}px, ${s6LogoTranslateY}px) scale(${s6LogoScale})`,
          transformOrigin: 'center center',
          transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Logo Container */}
        <div
          style={{
            position: 'relative',
            width: '140px',
            height: '160px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            filter: `brightness(${s4BrightnessLift})`,
          }}
        >
          {/* SCENE 1: Pure Anticipation Center Light Point */}
          {t < 800 && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
                opacity: t < 700 ? 1 : 1 - (t - 700) / 100,
              }}
            >
              <div
                style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  backgroundColor: '#93c5fd',
                  boxShadow: `0 0 ${12 * s1PointScale}px ${4 * s1PointScale}px rgba(96, 165, 250, 0.9), 0 0 24px rgba(56, 189, 248, 0.7)`,
                  transform: `scale(${s1PointScale})`,
                  transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />

              {s1LineLength > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: `${s1LineLength * 70}px`,
                    height: '1.5px',
                    background: 'linear-gradient(90deg, #93c5fd 0%, rgba(56,189,248,0.85) 60%, transparent 100%)',
                    transform: 'translateY(-50%) rotate(-35deg)',
                    transformOrigin: 'left center',
                    boxShadow: '0 0 8px rgba(96, 165, 250, 0.8)',
                    opacity: 1 - (t - 450) / 300 * 0.3,
                  }}
                />
              )}
            </div>
          )}

          {/* SCENE 2: The Symbol is Born */}
          {t >= 700 && (
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                opacity: s2LogoMaterialize,
                transition: 'opacity 0.2s ease',
              }}
            >
              <img
                src="/zyntra-unicorn-transparent.png"
                alt="Zyntra Unicorn Logo"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  filter: `drop-shadow(0 8px 24px rgba(99, 102, 241, ${0.45 * s2LogoMaterialize})) drop-shadow(0 2px 8px rgba(56, 189, 248, ${0.5 * s2LogoMaterialize}))`,
                  zIndex: 2,
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />

              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 1,
                  opacity: 0.95,
                }}
              >
                <ZyntraUnicornSvg
                  glowIntensity={s4BrightnessLift}
                  strokeProgress={s2StrokeProgress}
                  showStar={t >= 1650}
                />
              </div>

              {/* Dynamic Stroke Drawing Mask Overlay */}
              {t < 1850 && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 3,
                    pointerEvents: 'none',
                    background: `radial-gradient(circle at ${strokeHeadX}% ${strokeHeadY}%, transparent ${s2StrokeProgress * 75}%, rgba(4,7,20, 0.95) ${s2StrokeProgress * 95}%)`,
                  }}
                />
              )}

              {/* Glowing Comet Head */}
              {isStrokeActive && (
                <div
                  style={{
                    position: 'absolute',
                    left: `${strokeHeadX}%`,
                    top: `${strokeHeadY}%`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: 10,
                    pointerEvents: 'none',
                  }}
                >
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#ffffff',
                      boxShadow: '0 0 14px 4px #38bdf8, 0 0 28px 8px #818cf8',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      width: '28px',
                      height: '2px',
                      background: 'linear-gradient(90deg, #ffffff, #38bdf8, transparent)',
                      transform: 'translate(-100%, -50%)',
                      filter: 'blur(0.5px)',
                    }}
                  />
                </div>
              )}

              {/* SCENE 4: Specular Light Sweep */}
              {t >= 2500 && t <= 3050 && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 5,
                    overflow: 'hidden',
                    pointerEvents: 'none',
                    maskImage: 'url(/zyntra-unicorn-transparent.png)',
                    WebkitMaskImage: 'url(/zyntra-unicorn-transparent.png)',
                    maskSize: 'contain',
                    WebkitMaskSize: 'contain',
                    maskRepeat: 'no-repeat',
                    WebkitMaskRepeat: 'no-repeat',
                    maskPosition: 'center',
                    WebkitMaskPosition: 'center',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '-20%',
                      left: 0,
                      width: '45%',
                      height: '140%',
                      background: 'linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.15) 38%, rgba(255,255,255,0.95) 50%, rgba(147,197,253,0.85) 55%, transparent 75%)',
                      transform: `translateX(${-120 + s4SweepProgress * 300}%) rotate(18deg)`,
                      boxShadow: '0 0 15px rgba(255,255,255,0.8)',
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* SCENE 3: Three Chat Dots Inside Symbol */}
          {t >= 1820 && (
            <div
              style={{
                position: 'absolute',
                top: '52%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                zIndex: 8,
                pointerEvents: 'none',
                opacity: 1 - s6TransProgress,
              }}
            >
              <div
                style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 0 8px rgba(56, 189, 248, 0.95)',
                  transform: dot1Visible ? 'scale(1)' : 'scale(0)',
                  transition: 'transform 0.22s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                }}
              />

              <div
                style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 0 8px rgba(56, 189, 248, 0.95)',
                  transform: dot2Visible ? 'scale(1)' : 'scale(0)',
                  transition: 'transform 0.22s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                }}
              />

              <div
                style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 0 8px rgba(56, 189, 248, 0.95)',
                  transform: dot3Visible ? 'scale(1)' : 'scale(0)',
                  transition: 'transform 0.22s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                }}
              />

              {rippleProgress > 0 && rippleProgress < 1 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    right: '-4px',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    border: '1.5px solid rgba(147, 197, 253, 0.9)',
                    boxShadow: '0 0 16px rgba(129, 140, 248, 0.75)',
                    transform: `translate(50%, -50%) scale(${1 + rippleProgress * 12})`,
                    opacity: (1 - rippleProgress) * 0.85,
                    pointerEvents: 'none',
                  }}
                />
              )}
            </div>
          )}
        </div>

        {/* SCENE 5: Brand Reveal */}
        {t >= 2950 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '16px',
              opacity: s5BrandProgress * (1 - s6TransProgress),
              transform: `translateY(${(1 - s5BrandProgress) * 10}px)`,
              transition: 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <h1
              style={{
                fontSize: '26px',
                fontWeight: 700,
                letterSpacing: '-0.035em',
                color: '#ffffff',
                margin: '0 0 6px 0',
                display: 'flex',
                alignItems: 'center',
                textShadow: '0 2px 14px rgba(255, 255, 255, 0.25)',
              }}
            >
              <span
                style={{
                  background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #f472b6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginRight: '1px',
                }}
              >
                Z
              </span>
              <span>yntra</span>
            </h1>

            <p
              style={{
                fontSize: '9.5px',
                fontWeight: 600,
                letterSpacing: '0.28em',
                color: '#94a3b8',
                textTransform: 'uppercase',
                margin: 0,
                whiteSpace: 'nowrap',
                opacity: 0.9,
              }}
            >
              ONE IDENTITY. MULTIPLE CONTEXTS.
            </p>
          </div>
        )}
      </div>

      {/* Minimal Top Bar Audio & Skip Controls */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 100,
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleInteraction();
            setIsMuted(!isMuted);
          }}
          title={isMuted ? 'Enable Zyntra Sonic Signature' : 'Mute Sonic Signature'}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            borderRadius: '20px',
            padding: '7px 12px',
            color: isMuted ? '#94a3b8' : '#38bdf8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            fontWeight: 600,
            backdropFilter: 'blur(10px)',
            transition: 'all 0.2s ease',
          }}
        >
          {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          <span>{isMuted ? 'Muted' : 'Sound On'}</span>
        </button>

        {onComplete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              zyntraSound.stopAmbientTone();
              onComplete();
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              padding: '7px 12px',
              color: '#cbd5e1',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: 500,
              backdropFilter: 'blur(10px)',
            }}
          >
            <span>Skip</span>
            <ChevronRight size={13} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ZyntraOpeningAnimation;
