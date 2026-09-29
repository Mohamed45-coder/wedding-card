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
    this.isReady = false;
  }

  init() {
    this.setupAudioButton();
  }

  // Preload and prepare audio so it is primed and ready to play without latency
  prepareAudio() {
    return new Promise((resolve) => {
      const musicConfig = window.WEDDING_CONFIG?.music;

      // If procedural synthesizer or no audio track configured, it is ready immediately
      if (!musicConfig || musicConfig.useSynthesizer || !musicConfig.customAudioUrl) {
        this.isReady = true;
        resolve();
        return;
      }

      if (!this.customAudio) {
        this.customAudio = new Audio(musicConfig.customAudioUrl);
        this.customAudio.loop = true;
        this.customAudio.volume = 0.6;
        this.customAudio.preload = 'auto';

        // Continuous loop fallback to guarantee seamless replay across all browsers
        this.customAudio.addEventListener('ended', () => {
          this.customAudio.currentTime = 0;
          this.customAudio.play().catch(() => {});
        });
      }

      // If readyState is HAVE_CURRENT_DATA (2) or higher, audio is buffered and ready
      if (this.customAudio.readyState >= 2) {
        this.isReady = true;
        resolve();
        return;
      }

      let isFinished = false;
      const onReady = () => {
        if (isFinished) return;
        isFinished = true;
        cleanup();
        this.isReady = true;
        resolve();
      };

      const cleanup = () => {
        this.customAudio.removeEventListener('canplay', onReady);
        this.customAudio.removeEventListener('canplaythrough', onReady);
        this.customAudio.removeEventListener('loadeddata', onReady);
        this.customAudio.removeEventListener('error', onReady);
      };

      this.customAudio.addEventListener('canplay', onReady, { once: true });
      this.customAudio.addEventListener('canplaythrough', onReady, { once: true });
      this.customAudio.addEventListener('loadeddata', onReady, { once: true });
      this.customAudio.addEventListener('error', onReady, { once: true });

      // Fallback timeout so slow networks/restrictions don't hang indefinitely
      setTimeout(() => {
        if (!isFinished) {
          isFinished = true;
          cleanup();
          this.isReady = true;
          resolve();
        }
      }, 8000);

      this.customAudio.load();
    });
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
    if (this.isPlaying && this.customAudio && !this.customAudio.paused) return;
    this.ensureAudioContext();

    // Check if custom audio URL is set in config
    if (window.WEDDING_CONFIG && window.WEDDING_CONFIG.music && window.WEDDING_CONFIG.music.customAudioUrl) {
      if (!this.customAudio) {
        this.customAudio = new Audio(window.WEDDING_CONFIG.music.customAudioUrl);
        this.customAudio.loop = true;
        this.customAudio.volume = 0.6;
        this.customAudio.preload = 'auto';

        // Continuous loop fallback to guarantee seamless replay across all browsers
        this.customAudio.addEventListener('ended', () => {
          this.customAudio.currentTime = 0;
          this.customAudio.play().catch(() => {});
        });
      }
      this.customAudio.play().catch(() => {});
      this.customAudio.play().then(() => {
        this.isPlaying = true;
        this.isMuted = false;
        this.updateUIState();
      }).catch((e) => {
        console.warn("Background audio play pending interaction:", e);
      });
      this.isPlaying = true;
      this.isMuted = false;
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

    // If custom audio track configured
    if (window.WEDDING_CONFIG && window.WEDDING_CONFIG.music && window.WEDDING_CONFIG.music.customAudioUrl) {
      if (!this.customAudio) {
        this.startAmbientMusic();
        return;
      }
      if (this.customAudio.paused || this.isMuted || !this.isPlaying) {
        this.customAudio.play().then(() => {
          this.isPlaying = true;
          this.isMuted = false;
          this.updateUIState();
        }).catch(() => {});
      } else {
        this.customAudio.pause();
        this.isPlaying = false;
        this.isMuted = true;
        this.updateUIState();
      }
      return;
    }

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

