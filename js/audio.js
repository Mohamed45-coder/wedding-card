/**
 * ==========================================================================
 * ROYAL WEDDING INVITATION - AUDIO CONTROLLER & WEB AUDIO SYNTHESIZER
 * Plays procedural royal ambient music (Sitar/Harp/Drone) and sound effects
 * without needing heavy external audio assets.
 * ==========================================================================
 */

class WeddingAudioController {
  constructor() {
    this.audioCtx = null;
    this.isPlaying = false;
    this.isMuted = false;
    this.ambientInterval = null;
    this.gainNode = null;
    this.customAudio = null;
  }

  init() {
    this.setupAudioButton();
  }

  // Initialize Web Audio Context on first user gesture
  ensureAudioContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
        this.gainNode = this.audioCtx.createGain();
        this.gainNode.gain.setValueAtTime(0.18, this.audioCtx.currentTime);
        this.gainNode.connect(this.audioCtx.destination);
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // Play gentle royal door creak / chime fanfare
  playDoorOpenSound() {
    try {
      this.ensureAudioContext();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      // Majestic harp chord (F# major / oriental scale: F#4, A#4, C#5, F5, F#5)
      const freqs = [370.0, 466.16, 554.37, 698.46, 739.99];
      freqs.forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const noteGain = this.audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        noteGain.gain.setValueAtTime(0, now + idx * 0.12);
        noteGain.gain.linearRampToValueAtTime(0.15, now + idx * 0.12 + 0.05);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 1.8);

        osc.connect(noteGain);
        noteGain.connect(this.gainNode);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 2.0);
      });
    } catch (e) {
      console.warn("Audio play prevented:", e);
    }
  }

  // Play scratch friction sound
  playScratchSound() {
    try {
      this.ensureAudioContext();
      if (!this.audioCtx || this.isMuted) return;

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const scratchGain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180 + Math.random() * 240, now);

      scratchGain.gain.setValueAtTime(0.04, now);
      scratchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(scratchGain);
      scratchGain.connect(this.gainNode);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch (e) {}
  }

  // Play joyous fireworks celebration chime
  playCelebrationFanfare() {
    try {
      this.ensureAudioContext();
      if (!this.audioCtx || this.isMuted) return;

      const now = this.audioCtx.currentTime;
      // Joyous royal arpeggio notes
      const fanfareNotes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      fanfareNotes.forEach((freq, i) => {
        const osc = this.audioCtx.createOscillator();
        const noteGain = this.audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.1);

        noteGain.gain.setValueAtTime(0, now + i * 0.1);
        noteGain.gain.linearRampToValueAtTime(0.2, now + i * 0.1 + 0.04);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 2.2);

        osc.connect(noteGain);
        noteGain.connect(this.gainNode);

        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 2.4);
      });
    } catch (e) {}
  }

  // Start background ambient music
  startAmbientMusic() {
    if (this.isPlaying) return;
    this.ensureAudioContext();

    // Check if custom audio URL is set in config
    if (window.WEDDING_CONFIG && window.WEDDING_CONFIG.music && window.WEDDING_CONFIG.music.customAudioUrl) {
      if (!this.customAudio) {
        this.customAudio = new Audio(window.WEDDING_CONFIG.music.customAudioUrl);
        this.customAudio.loop = true;
      }
      this.customAudio.play().catch(() => {});
      this.isPlaying = true;
      this.updateUIState();
      return;
    }

    // Procedural Ambient Royal Raga Drone & Bells (Raag Yaman / Bilawal harmony)
    this.isPlaying = true;
    this.updateUIState();

    const scale = [220.00, 277.18, 329.63, 415.30, 440.00, 554.37, 659.25, 830.61]; // A major / oriental warm scale
    
    // Play warm background drone
    this.playDroneNote(110); // A2 deep drone

    // Interval arpeggio for ambient meditative music
    this.ambientInterval = setInterval(() => {
      if (!this.isPlaying || this.isMuted || !this.audioCtx) return;
      
      const randomNote = scale[Math.floor(Math.random() * scale.length)];
      const now = this.audioCtx.currentTime;

      const osc = this.audioCtx.createOscillator();
      const noteGain = this.audioCtx.createGain();

      osc.type = Math.random() > 0.5 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(randomNote, now);

      noteGain.gain.setValueAtTime(0, now);
      noteGain.gain.linearRampToValueAtTime(0.08, now + 0.15);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

      osc.connect(noteGain);
      noteGain.connect(this.gainNode);

      osc.start(now);
      osc.stop(now + 3.4);
    }, 1800);
  }

  playDroneNote(freq) {
    if (!this.audioCtx) return;
    try {
      const now = this.audioCtx.currentTime;
      const droneOsc = this.audioCtx.createOscillator();
      const droneGain = this.audioCtx.createGain();

      droneOsc.type = 'sine';
      droneOsc.frequency.setValueAtTime(freq, now);

      droneGain.gain.setValueAtTime(0.03, now);
      droneOsc.connect(droneGain);
      droneGain.connect(this.gainNode);

      droneOsc.start();
    } catch(e) {}
  }

  togglePlayPause() {
    this.ensureAudioContext();
    if (this.isMuted || !this.isPlaying) {
      this.isMuted = false;
      this.isPlaying = true;
      if (this.gainNode) {
        this.gainNode.gain.setValueAtTime(0.18, this.audioCtx.currentTime);
      }
      if (this.customAudio) this.customAudio.play();
      if (!this.ambientInterval) this.startAmbientMusic();
    } else {
      this.isMuted = true;
      if (this.gainNode) {
        this.gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
      }
      if (this.customAudio) this.customAudio.pause();
    }
    this.updateUIState();
  }

  updateUIState() {
    const audioBtn = document.getElementById('audioToggleBtn');
    if (!audioBtn) return;

    if (this.isPlaying && !this.isMuted) {
      audioBtn.classList.add('audio-playing');
      audioBtn.classList.remove('audio-muted');
      audioBtn.setAttribute('aria-label', 'Mute background music');
    } else {
      audioBtn.classList.remove('audio-playing');
      audioBtn.classList.add('audio-muted');
      audioBtn.setAttribute('aria-label', 'Play background music');
    }
  }

  setupAudioButton() {
    const audioBtn = document.getElementById('audioToggleBtn');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        this.togglePlayPause();
      });
    }
  }
}

// Instantiate global audio controller
window.weddingAudio = new WeddingAudioController();

