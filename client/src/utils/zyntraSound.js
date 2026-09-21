/**
 * Zyntra Sonic Signature Engine
 * Procedural Web Audio synthesizer for the 3-4 second mobile app opening animation.
 * 
 * Features:
 * - Soft ambient drone (55Hz / 110Hz warm sub-bed)
 * - Subtle digital pulse (528Hz Solfeggio pure tone)
 * - Gentle crystalline glissando for the unicorn-Z drawing stroke
 * - Three tactile, warm acoustic haptic clicks for the chat dots
 * - Lush, warm E Maj9 tonal completion chime
 * - Smooth transition into UI ambience
 * - Zero external audio dependencies, zero latency, 100% reliable
 */

class ZyntraSoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isMuted = false;
    this.ambientNodes = null;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.85, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    } catch (e) {
      console.warn('[Zyntra Audio] Web Audio initialization deferred:', e);
    }
  }

  ensureContext() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.85, now, 0.05);
    }
  }

  toggleMute() {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  /**
   * Scene 1: Very soft ambient sub-bass tone (55Hz / 110Hz)
   */
  playAmbientTone() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    this.stopAmbientTone();

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(55, now); // A1 sub-drone

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(110, now); // A2 warm body

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, now);
    filter.Q.setValueAtTime(1.0, now);

    // Fade in softly over 600ms
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.035, now + 0.6);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now);

    this.ambientNodes = { osc1, osc2, gain };
  }

  stopAmbientTone() {
    if (this.ambientNodes && this.ctx) {
      const now = this.ctx.currentTime;
      try {
        this.ambientNodes.gain.gain.cancelScheduledValues(now);
        this.ambientNodes.gain.gain.setTargetAtTime(0.0001, now, 0.2);
        this.ambientNodes.osc1.stop(now + 0.25);
        this.ambientNodes.osc2.stop(now + 0.25);
      } catch {}
      this.ambientNodes = null;
    }
  }

  /**
   * Scene 1: Subtle digital pulse when the center light point appears (528Hz)
   */
  playAnticipationPulse() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const subOsc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(528, now); // 528Hz Solfeggio pure tone

    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(264, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1100, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.09, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

    osc.connect(filter);
    subOsc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    subOsc.start(now);
    osc.stop(now + 0.18);
    subOsc.stop(now + 0.18);
  }

  /**
   * Scene 2: Gentle crystalline glissando tone as the Z logo is drawn
   * @param {number} stageIndex 0 = top mane, 1 = flowing diagonal, 2 = lower curve, 3 = horn tip
   */
  playCrystallineNote(stageIndex = 0) {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    // Harmonic crystalline glass notes: E5, G#5, B5, E6
    const frequencies = [659.25, 830.61, 987.77, 1318.51];
    const freq = frequencies[stageIndex % frequencies.length];

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 1.004, now); // +7 cents shimmer

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2600, now);
    filter.Q.setValueAtTime(1.5, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.065, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.4);
    osc2.stop(now + 0.4);
  }

  /**
   * Scene 3: Three tactile, soft acoustic clicks for the conversation dots
   * @param {number} dotIndex 0, 1, 2
   */
  playChatDotClick(dotIndex = 0) {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    // Frequencies: 880Hz (A5), 1046.5Hz (C6), 1318.5Hz (E6)
    const pitches = [880, 1046.5, 1318.5];
    const pitch = pitches[dotIndex] || 880;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(pitch, now);
    // Subtle downward pitch sweep gives tactile "click/wood" feel
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.7, now + 0.04);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(pitch, now);
    filter.Q.setValueAtTime(3.5, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.12 + dotIndex * 0.02, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.048);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  /**
   * Scene 3: Subtle ripple light resonance after the 3rd dot appears
   */
  playRippleChime() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1318.51, now); // E6
    osc.frequency.exponentialRampToValueAtTime(1760, now + 0.28);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2200, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.05, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.46);
  }

  /**
   * Scene 4: Warm, satisfying Major 9th tonal chime when the logo completes & light sweep passes
   * Chord voicing: E3, B3, F#4, G#4, C#5, E5
   */
  playCompletionChord() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    // Warm E Maj9 / C#m7 luxury voicing
    const chordFrequencies = [
      { f: 164.81, gain: 0.09, type: 'sine' },      // E3 warm root
      { f: 246.94, gain: 0.07, type: 'sine' },      // B3 5th
      { f: 369.99, gain: 0.065, type: 'sine' },     // F#4 9th
      { f: 415.30, gain: 0.06, type: 'sine' },      // G#4 maj 3rd
      { f: 554.37, gain: 0.05, type: 'sine' },      // C#5 6th
      { f: 659.25, gain: 0.045, type: 'sine' },     // E5 octave
      { f: 1318.51, gain: 0.025, type: 'sine' },    // E6 glassy overtone
    ];

    chordFrequencies.forEach(({ f, gain: targetGain, type }) => {
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(f, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1600, now);
      filter.frequency.exponentialRampToValueAtTime(2400, now + 0.2);
      filter.frequency.exponentialRampToValueAtTime(900, now + 1.8);

      // Rounded attack and lush warm decay
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(targetGain, now + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.1);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 2.15);
    });
  }

  /**
   * Scene 6: Smoothly fade audio into application UI ambience
   */
  fadeAudioOut(durationMs = 800) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const durSec = durationMs / 1000;
    try {
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + durSec);
      setTimeout(() => {
        this.stopAmbientTone();
        if (!this.isMuted && this.masterGain && this.ctx) {
          this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
        }
      }, durationMs);
    } catch {}
  }
}

export const zyntraSound = new ZyntraSoundEngine();
export default zyntraSound;
