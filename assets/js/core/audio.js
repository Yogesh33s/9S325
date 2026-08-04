export class MuseumAudio {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.ambient = null;
    this.volume = 0.45;
    this.muted = false;
    this.started = false;
  }

  ensureContext() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.volume;
    this.master.connect(this.ctx.destination);
  }

  async resume() {
    this.ensureContext();
    if (this.ctx.state === 'suspended') await this.ctx.resume();
    if (!this.started) this.startAmbient();
  }

  startAmbient() {
    if (!this.ctx || this.started) return;
    this.started = true;

    const drone = this.ctx.createOscillator();
    const pad = this.ctx.createOscillator();
    const noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 2, this.ctx.sampleRate);
    const channel = noiseBuffer.getChannelData(0);
    for (let i = 0; i < channel.length; i += 1) channel[i] = (Math.random() * 2 - 1) * 0.16;
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 420;
    const highpass = this.ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 120;

    const droneGain = this.ctx.createGain();
    const padGain = this.ctx.createGain();
    const noiseGain = this.ctx.createGain();

    drone.type = 'sine';
    drone.frequency.value = 48;
    pad.type = 'triangle';
    pad.frequency.value = 96;
    droneGain.gain.value = 0.055;
    padGain.gain.value = 0.018;
    noiseGain.gain.value = 0.015;

    drone.connect(droneGain).connect(lowpass).connect(this.master);
    pad.connect(padGain).connect(highpass).connect(this.master);
    noise.connect(noiseGain).connect(lowpass).connect(this.master);

    drone.start();
    pad.start();
    noise.start();

    this.ambient = { drone, pad, noise, droneGain, padGain, noiseGain };
    this.pulseAmbient();
  }

  pulseAmbient() {
    if (!this.ambient || !this.ctx) return;
    const now = this.ctx.currentTime;
    this.ambient.padGain.gain.cancelScheduledValues(now);
    this.ambient.padGain.gain.setValueAtTime(0.014, now);
    this.ambient.padGain.gain.linearRampToValueAtTime(0.028, now + 2.4);
    this.ambient.padGain.gain.linearRampToValueAtTime(0.014, now + 5.8);
    setTimeout(() => this.pulseAmbient(), 5600);
  }

  chirp(type = 'hover') {
    if (!this.ctx || this.muted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = type === 'click' ? 900 : 1200;
    osc.type = type === 'click' ? 'sawtooth' : 'triangle';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(type === 'click' ? 180 : 420, now);
    osc.frequency.exponentialRampToValueAtTime(type === 'click' ? 40 : 160, now + 0.18);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(type === 'click' ? 0.07 : 0.028, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
    osc.connect(filter).connect(gain).connect(this.master);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  impact(intensity = 1) {
    if (!this.ctx || this.muted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(86 * intensity, now);
    osc.frequency.exponentialRampToValueAtTime(28, now + 0.35);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.16 * intensity, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);
    osc.connect(gain).connect(this.master);
    osc.start(now);
    osc.stop(now + 0.4);
  }

  toggle(force) {
    this.muted = typeof force === 'boolean' ? force : !this.muted;
    if (this.master) this.master.gain.value = this.muted ? 0 : this.volume;
    return this.muted;
  }

  setVolume(value) {
    this.volume = Number(value);
    if (this.master && !this.muted) this.master.gain.value = this.volume;
  }
}

export const getAudioManager = () => {
  if (!window.__weaponverseAudio) window.__weaponverseAudio = new MuseumAudio();
  return window.__weaponverseAudio;
};

export function setupAudioDock() {
  const audio = getAudioManager();
  const button = document.querySelector('.audio-toggle');
  const slider = document.querySelector('.audio-volume');
  const arm = () => audio.resume().catch(() => {});
  window.addEventListener('pointerdown', arm, { once: true });

  button?.addEventListener('click', async () => {
    await audio.resume().catch(() => {});
    const muted = audio.toggle();
    button.textContent = muted ? 'Audio: Off' : 'Audio: On';
    if (!muted) audio.chirp('click');
  });

  slider?.addEventListener('input', async (event) => {
    await audio.resume().catch(() => {});
    audio.setVolume(event.target.value);
  });

  document.querySelectorAll('a, button, .filter-btn').forEach((node) => {
    node.addEventListener('mouseenter', () => audio.chirp('hover'));
    node.addEventListener('click', async () => {
      await audio.resume().catch(() => {});
      audio.chirp('click');
    });
  });

  return audio;
}
