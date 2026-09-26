/**
 * ==========================================================================
 * ROYAL WEDDING INVITATION - 3D ANTIQUE DOOR OPENING CONTROLLER
 * ==========================================================================
 */

class WeddingDoorController {
  constructor() {
    this.heroSection = document.getElementById('heroLanding');
    this.openDoorBtn = document.getElementById('openDoorBtn');
    this.doorScene = document.getElementById('doorScene');
    this.isOpened = false;
  }

  init() {
    if (!this.heroSection || !this.openDoorBtn) return;

    // Reset scroll and disable automatic scroll restoration so doors are always shown first
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    // Ensure body starts locked
    document.body.classList.add('door-locked');

    // Click & Touch events to open door
    this.openDoorBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.openDoor();
    });

    // Also allow clicking directly on the door panels
    if (this.doorScene) {
      this.doorScene.addEventListener('click', () => {
        if (!this.isOpened) this.openDoor();
      });
    }
  }

  openDoor() {
    if (this.isOpened) return;
    this.isOpened = true;

    // Play majestic open chime & start ambient music
    if (window.weddingAudio) {
      window.weddingAudio.playDoorOpenSound();
      window.weddingAudio.startAmbientMusic();
    }

    // Trigger 3D door swing animation
    if (this.doorScene) {
      this.doorScene.classList.add('doors-opening');
    }

    // Start falling petals & gold particles animation for opening & intro section
    if (window.weddingPetals) {
      window.weddingPetals.start(7500);
    }

    // Smooth transition & scroll to main content
    setTimeout(() => {
      document.body.classList.remove('door-locked');

      // Immediately hide visually
      if (this.heroSection) {
        this.heroSection.classList.add('opened');
      }

      // After the fade-out transition completes, remove the element
      // entirely so there is no empty space above the content
      setTimeout(() => {
        if (this.heroSection && this.heroSection.parentNode) {
          this.heroSection.parentNode.removeChild(this.heroSection);
        }
        // Reset scroll to the very top so couple section is at top
        window.scrollTo(0, 0);

        // Refresh scratch canvas dimensions once hero is cleared
        if (window.weddingScratchCard && !window.weddingScratchCard.isRevealed) {
          window.weddingScratchCard.setupCanvas();
        }
      }, 1300);
    }, 1400);
  }
}

window.weddingDoor = new WeddingDoorController();

