/**
 * ==========================================================================
 * ROYAL WEDDING INVITATION - HERO VIDEO CONTROLLER
 * Manages still video preview, tap-to-play, scroll locking, and completion.
 * ==========================================================================
 */

class WeddingHeroVideoController {
  constructor() {
    this.heroSection = document.getElementById('heroVideoSection');
    this.videoContainer = document.getElementById('videoContainer');
    this.video = document.getElementById('heroVideo');
    this.tapHint = document.getElementById('videoTapHint');
    this.scrollPrompt = document.getElementById('videoScrollPrompt');

    this.hasStarted = false;
    this.isCompleted = false;
    this.isLocked = true;

    this._boundWheelHandler = this.preventScroll.bind(this);
    this._boundTouchHandler = this.preventScroll.bind(this);
    this._boundKeyHandler = this.preventScrollKey.bind(this);
  }

  init() {
    if (!this.heroSection || !this.video) return;

    // 1. Reset scroll and disable browser automatic scroll restoration
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    // 2. Lock scrolling initially until video completes
    document.documentElement.classList.add('video-locked');
    document.body.classList.add('video-locked');
    this.attachScrollLock();

    // 3. Ensure video is muted with no controls and queued at first frame
    this.video.muted = true;
    this.video.volume = 0;
    this.video.controls = false;
    this.video.currentTime = 0;

    // 4. Click & Touch listeners on the video container
    if (this.videoContainer) {
      this.videoContainer.addEventListener('click', (e) => {
        // If user clicked the scroll prompt after video finish, allow normal link action
        if (e.target.closest('#videoScrollPrompt')) return;
        this.handleVideoClick();
      });
    }

    // 5. Video completion event
    this.video.addEventListener('ended', () => {
      this.handleVideoEnded();
    });

    // 6. Smooth scroll on scroll prompt click
    if (this.scrollPrompt) {
      this.scrollPrompt.addEventListener('click', (e) => {
        e.preventDefault();
        const scratchSection = document.getElementById('scratchSection');
        if (scratchSection) {
          scratchSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
  }

  preventScroll(e) {
    if (this.isLocked) {
      e.preventDefault();
    }
  }

  preventScrollKey(e) {
    if (this.isLocked && ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Space', 'Home', 'End'].includes(e.code)) {
      e.preventDefault();
    }
  }

  attachScrollLock() {
    window.addEventListener('wheel', this._boundWheelHandler, { passive: false });
    window.addEventListener('touchmove', this._boundTouchHandler, { passive: false });
    window.addEventListener('keydown', this._boundKeyHandler, { passive: false });
  }

  detachScrollLock() {
    window.removeEventListener('wheel', this._boundWheelHandler);
    window.removeEventListener('touchmove', this._boundTouchHandler);
    window.removeEventListener('keydown', this._boundKeyHandler);
  }

  handleVideoClick() {
    // Once played or completed, ignore clicks until page refresh
    if (this.hasStarted || this.isCompleted) return;

    this.hasStarted = true;

    // Hide tap hint prompt immediately
    if (this.tapHint) {
      this.tapHint.classList.add('hidden');
    }

    // Update cursor
    if (this.videoContainer) {
      this.videoContainer.style.cursor = 'default';
    }

    // Start ambient background music on first user gesture if available
    if (window.weddingAudio) {
      window.weddingAudio.startAmbientMusic();
    }

    // Play video
    const playPromise = this.video.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('Video playback error:', err);
      });
    }
  }

  handleVideoEnded() {
    if (this.isCompleted) return;
    this.isCompleted = true;

    // Keep video paused at the last frame
    this.video.pause();

    // Unlock scrolling
    this.isLocked = false;
    document.documentElement.classList.remove('video-locked');
    document.body.classList.remove('video-locked');
    document.body.classList.add('video-completed');
    this.detachScrollLock();

    // Setup scratch card canvas in case dimensions adjusted
    if (window.weddingScratchCard && !window.weddingScratchCard.isRevealed) {
      window.weddingScratchCard.setupCanvas();
    }
  }
}

window.weddingHeroVideo = new WeddingHeroVideoController();
