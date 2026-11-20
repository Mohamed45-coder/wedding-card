/**
 * ==========================================================================
 * ROYAL WEDDING INVITATION - INITIAL LOADING CONTROLLER
 * Ensures the website starts with an elegant glassmorphism loading screen
 * using the hero video's first frame, and smoothly reveals the invitation
 * ONLY when the hero video is ready to play, so a tap always starts it.
 * Background music is fetched afterwards so it never delays the reveal.
 * ==========================================================================
 */

class WeddingLoaderController {
  constructor() {
    this.loaderEl = null;
    this.isDismissed = false;
    this.hasStarted = false;
    this.startTime = Date.now();
    this.minDisplayDuration = 650; // Smooth minimum display to avoid abrupt flashing
  }

  init() {
    if (this.hasStarted) return;
    this.hasStarted = true;
    this.loaderEl = document.getElementById('weddingInvitationLoader');

    if (!this.loaderEl) return;

    // 1. Prime Web Audio Context on any early user gesture
    const unlockAudio = () => {
      try {
        if (window.weddingAudio && typeof window.weddingAudio.ensureAudioContext === 'function') {
          window.weddingAudio.ensureAudioContext();
        }
      } catch (e) {}
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('click', unlockAudio);
    };
    window.addEventListener('touchstart', unlockAudio, { passive: true, once: true });
    window.addEventListener('pointerdown', unlockAudio, { passive: true, once: true });
    window.addEventListener('click', unlockAudio, { passive: true, once: true });

    // 2. Wait only for the hero video (the first thing the guest taps)
    this.coordinateReadiness();
  }

  async coordinateReadiness() {
    try {
      await this.prepareVideo();
    } catch (err) {
      console.warn('[Loader] Media preparation note:', err);
    }

    // 3. Graceful timing check before transition
    const elapsed = Date.now() - this.startTime;
    const remainingTime = Math.max(0, this.minDisplayDuration - elapsed);

    setTimeout(() => {
      this.dismiss();
      this.scheduleAudioPreload();
    }, remainingTime);
  }

  // Fetch the music only after the video has buffered, so the two
  // downloads don't compete for bandwidth on slow mobile networks.
  scheduleAudioPreload() {
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      if (window.weddingAudio && typeof window.weddingAudio.prepareAudio === 'function') {
        window.weddingAudio.prepareAudio().catch(() => {});
      }
    };

    const video = document.getElementById('heroVideo');
    if (!video || video.readyState >= 4) {
      start();
      return;
    }
    video.addEventListener('canplaythrough', start, { once: true });
    video.addEventListener('playing', start, { once: true });
    setTimeout(start, 5000);
  }

  prepareVideo() {
    return new Promise((resolve) => {
      const video = document.getElementById('heroVideo');
      if (!video) {
        resolve();
        return;
      }

      // readyState 3 (HAVE_FUTURE_DATA) or 4 (HAVE_ENOUGH_DATA) means video can start playing without buffering
      if (video.readyState >= 3) {
        resolve();
        return;
      }

      let isFinished = false;
      const markReady = () => {
        if (isFinished) return;
        isFinished = true;
        cleanup();
        resolve();
      };

      const cleanup = () => {
        video.removeEventListener('canplay', markReady);
        video.removeEventListener('canplaythrough', markReady);
        video.removeEventListener('loadeddata', markReady);
        video.removeEventListener('error', markReady);
      };

      video.addEventListener('canplay', markReady, { once: true });
      video.addEventListener('canplaythrough', markReady, { once: true });
      video.addEventListener('loadeddata', markReady, { once: true });
      video.addEventListener('error', markReady, { once: true });

      // Fallback timeout so slow networks/restrictions don't block the site indefinitely
      setTimeout(() => {
        if (!isFinished) {
          isFinished = true;
          cleanup();
          resolve();
        }
      }, 8000);

      // Trigger video buffering. Only call load() if the browser hasn't
      // already started fetching (preload="auto"), otherwise it would abort
      // and restart the download from zero.
      if (video.preload !== 'auto') {
        video.preload = 'auto';
      }
      if (video.networkState === HTMLMediaElement.NETWORK_EMPTY ||
          (video.networkState === HTMLMediaElement.NETWORK_IDLE && video.readyState === 0)) {
        video.load();
      }
    });
  }

  dismiss() {
    if (this.isDismissed) return;
    this.isDismissed = true;

    if (!this.loaderEl) return;

    // Smooth dissolve animation
    this.loaderEl.classList.add('loader-hidden');

    // Notify components that invitation is ready
    window.dispatchEvent(new CustomEvent('wedding:invitationReady'));

    // Remove from active rendering flow after fade completes
    setTimeout(() => {
      if (this.loaderEl) {
        this.loaderEl.style.display = 'none';
      }
    }, 850);
  }
}

// Instantiate global loader controller
window.weddingLoader = new WeddingLoaderController();

// Auto-start as soon as DOM is accessible
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.weddingLoader.init();
    });
  } else {
    window.weddingLoader.init();
  }
}
