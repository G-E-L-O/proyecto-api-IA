/**
 * Audio Engine - Generador de Música Ambiental Simple
 * Usa Web Audio API para crear música adaptativa
 */

class AudioEngine {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.isPlaying = false;
  }

  async initialize() {
    if (this.audioContext) return;

    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = 0.3;
      console.log('🎵 Audio Engine inicializado');
    } catch (error) {
      console.error('Error inicializando Audio Engine:', error);
      throw error;
    }
  }

  async play() {
    await this.initialize();
    
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
    
    this.isPlaying = true;
    this.createSimpleTone();
    console.log('▶️ Reproduciendo música generativa');
  }

  createSimpleTone() {
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.type = 'sine';
    osc.frequency.value = 220;
    gain.gain.value = 0.1;
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
  }

  async pause() {
    if (this.audioContext) {
      await this.audioContext.suspend();
    }
    this.isPlaying = false;
    console.log('⏸️ Música pausada');
  }

  setVolume(volume) {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  destroy() {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

export default AudioEngine;
