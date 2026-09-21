/**
 * ==========================================================================
 * ROYAL WEDDING INVITATION - HEART SCRATCH CARD
 * HTML5 Canvas interactive heart-shaped scratch foil with 50% threshold
 * The canvas itself is clipped to a heart shape so the entire card is a heart.
 * ==========================================================================
 */

class WeddingScratchCard {
  constructor() {
    this.canvas = document.getElementById('scratchCanvas');
    this.progressFill = document.getElementById('scratchProgressFill');
    this.isDrawing = false;
    this.isRevealed = false;
    this.ctx = null;
    this.lastPoint = null;
    this.scratchedPercentage = 0;
    this.scratchThreshold = 50; // 50% threshold
    this.heartPixelCount = 0;   // total pixels inside the heart mask
  }

  init() {
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

    this.setupCanvas();
    this.bindEvents();

    // Rebuild on resize
    window.addEventListener('resize', () => {
      if (!this.isRevealed) {
        this.setupCanvas();
      }
    });
  }

  /* -----------------------------------------------------------
     Canvas setup: size it, draw everything, then pre-compute
     how many pixels are inside the heart so we can later
     calculate a percentage against only those pixels.
     ----------------------------------------------------------- */
  setupCanvas() {
    const container = this.canvas.parentElement;
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    this.width = rect.width;
    this.height = rect.height;

    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);

    this.drawHeartFoil();
    this.precomputeHeartMask(dpr);
  }

  /* -----------------------------------------------------------
     Build a heart bezier path at the centre of the canvas.
     Everything outside the heart is fully transparent so it
     naturally looks heart-shaped.
     ----------------------------------------------------------- */
  heartPath(ctx, cx, cy, size) {
    const s = size;
    ctx.beginPath();
    ctx.moveTo(cx, cy - s * 0.35);

    // left hump
    ctx.bezierCurveTo(
      cx - s * 0.02, cy - s * 0.85,
      cx - s * 0.65, cy - s * 0.85,
      cx - s * 0.65, cy - s * 0.35
    );
    // left bottom
    ctx.bezierCurveTo(
      cx - s * 0.65, cy + s * 0.1,
      cx - s * 0.2,  cy + s * 0.45,
      cx,            cy + s * 0.7
    );
    // right bottom
    ctx.bezierCurveTo(
      cx + s * 0.2,  cy + s * 0.45,
      cx + s * 0.65, cy + s * 0.1,
      cx + s * 0.65, cy - s * 0.35
    );
    // right hump
    ctx.bezierCurveTo(
      cx + s * 0.65, cy - s * 0.85,
      cx + s * 0.02, cy - s * 0.85,
      cx,            cy - s * 0.35
    );
    ctx.closePath();
  }

  /* -----------------------------------------------------------
     Draw the golden metallic foil ONLY inside the heart shape.
     ----------------------------------------------------------- */
  drawHeartFoil() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const cx = w / 2;
    const cy = h / 2;
    const heartSize = Math.min(w, h) * 0.48;

    // Clear everything (transparent)
    ctx.clearRect(0, 0, w, h);

    // Clip to heart
    ctx.save();
    this.heartPath(ctx, cx, cy, heartSize);
    ctx.clip();

    // Metallic gold gradient
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#9A7410');
    grad.addColorStop(0.2, '#F7E5A9');
    grad.addColorStop(0.45, '#DDAE3B');
    grad.addColorStop(0.6, '#FFF6D6');
    grad.addColorStop(0.8, '#C99A2C');
    grad.addColorStop(1, '#9A7410');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Subtle maroon filigree swirl pattern lines inside the heart
    ctx.strokeStyle = 'rgba(92, 16, 29, 0.2)';
    ctx.lineWidth = 1.5;
    for (let i = -10; i < 20; i++) {
      ctx.beginPath();
      ctx.moveTo(w * (i / 10), 0);
      ctx.lineTo(w * (i / 10) - h * 0.3, h);
      ctx.stroke();
    }

    // Decorative text in the centre
    ctx.fillStyle = '#3A0A10';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = `bold ${Math.max(14, heartSize * 0.13)}px "Playfair Display", Georgia, serif`;
    ctx.fillText('✨ Scratch Here ✨', cx, cy - heartSize * 0.08);

    ctx.font = `${Math.max(11, heartSize * 0.085)}px "Montserrat", sans-serif`;
    ctx.fillText('Reveal the Wedding Date', cx, cy + heartSize * 0.12);

    // Small heart emoji
    ctx.font = `${Math.max(18, heartSize * 0.18)}px serif`;
    ctx.fillText('❤️', cx, cy + heartSize * 0.35);

    // Thin gold border stroke around the heart
    ctx.restore();
    ctx.save();
    this.heartPath(ctx, cx, cy, heartSize);
    ctx.strokeStyle = '#C99A2C';
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(221, 174, 59, 0.6)';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.restore();
  }

  /* -----------------------------------------------------------
     Pre-scan the canvas once to count how many pixels are
     opaque (inside the heart). We only measure scratch %
     against those pixels, ignoring transparent background.
     ----------------------------------------------------------- */
  precomputeHeartMask(dpr) {
    const canvasW = this.canvas.width;
    const canvasH = this.canvas.height;
    const step = 8; // sample grid
    const imgData = this.ctx.getImageData(0, 0, canvasW, canvasH);
    const px = imgData.data;
    let count = 0;

    for (let y = 0; y < canvasH; y += step) {
      for (let x = 0; x < canvasW; x += step) {
        const idx = (y * canvasW + x) * 4;
        if (px[idx + 3] > 20) {  // non-transparent → inside heart
          count++;
        }
      }
    }
    this.heartPixelCount = count;
  }

  /* -----------------------------------------------------------
     Bind pointer & touch events
     ----------------------------------------------------------- */
  bindEvents() {
    this.canvas.addEventListener('mousedown', (e) => this.startScratch(e));
    window.addEventListener('mousemove', (e) => this.moveScratch(e));
    window.addEventListener('mouseup', () => this.endScratch());

    this.canvas.addEventListener('touchstart', (e) => this.startScratch(e), { passive: false });
    window.addEventListener('touchmove', (e) => this.moveScratch(e), { passive: false });
    window.addEventListener('touchend', () => this.endScratch());
  }

  getPointerPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  startScratch(e) {
    if (this.isRevealed) return;
    this.isDrawing = true;
    this.lastPoint = this.getPointerPos(e);
    this.scratchAt(this.lastPoint.x, this.lastPoint.y);
  }

  moveScratch(e) {
    if (!this.isDrawing || this.isRevealed) return;
    if (e.cancelable) e.preventDefault();

    const pt = this.getPointerPos(e);
    this.scratchLine(this.lastPoint.x, this.lastPoint.y, pt.x, pt.y);
    this.lastPoint = pt;

    // Tactile audio feedback
    if (window.weddingAudio && Math.random() > 0.5) {
      window.weddingAudio.playScratchSound();
    }

    // Throttled percentage calculation
    if (!this._calcTimer) {
      this._calcTimer = setTimeout(() => {
        this.calculateScratchedPercent();
        this._calcTimer = null;
      }, 60);
    }
  }

  endScratch() {
    this.isDrawing = false;
  }

  /* -----------------------------------------------------------
     Erase foil under the pointer using destination-out
     ----------------------------------------------------------- */
  scratchAt(x, y) {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  scratchLine(x1, y1, x2, y2) {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = 54;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }

  /* -----------------------------------------------------------
     Measure how much of the HEART has been scratched (ignoring
     the transparent area outside the heart shape).
     ----------------------------------------------------------- */
  calculateScratchedPercent() {
    if (this.isRevealed || this.heartPixelCount === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const canvasW = this.canvas.width;
    const canvasH = this.canvas.height;
    const step = 8;
    const imgData = this.ctx.getImageData(0, 0, canvasW, canvasH);
    const px = imgData.data;

    let cleared = 0;
    let totalInHeart = 0;

    for (let y = 0; y < canvasH; y += step) {
      for (let x = 0; x < canvasW; x += step) {
        const idx = (y * canvasW + x) * 4;
        // A pixel that was originally opaque (inside heart) but is now
        // transparent counts as "scratched". Pixels that were always
        // transparent (outside heart) are ignored.
        //
        // We use the pre-computed heartPixelCount as the total.
        // A scratched-inside-heart pixel has alpha < 20.
        if (px[idx + 3] < 20) {
          // Could be outside heart (always transparent) or scratched
          // We can't distinguish directly, so instead count remaining
        } else {
          totalInHeart++;
        }
      }
    }

    // Remaining opaque pixels vs original heart pixel count
    const scratchedCount = this.heartPixelCount - totalInHeart;
    const percentage = Math.round((scratchedCount / this.heartPixelCount) * 100);
    this.scratchedPercentage = percentage;

    // Update progress bar
    if (this.progressFill) {
      const displayPct = Math.min(100, Math.round((percentage / this.scratchThreshold) * 100));
      this.progressFill.style.width = `${displayPct}%`;
    }

    // Check 50% reveal threshold
    if (percentage >= this.scratchThreshold) {
      this.triggerCompleteReveal();
    }
  }

  /* -----------------------------------------------------------
     Trigger the celebration reveal sequence
     ----------------------------------------------------------- */
  triggerCompleteReveal() {
    if (this.isRevealed) return;
    this.isRevealed = true;

    // Fade out the remaining canvas foil
    this.canvas.classList.add('revealed');
    if (this.progressFill) {
      this.progressFill.style.width = '100%';
    }

    // Launch fireworks & confetti
    if (window.weddingCelebration) {
      window.weddingCelebration.launch();
    }

    // Play celebration sound
    if (window.weddingAudio) {
      window.weddingAudio.playCelebrationFanfare();
    }

    // Toast notification
    if (window.showToast) {
      window.showToast("🎉 Date Revealed! Save the Date for Mohamed & Fathima!");
    }
  }
}

window.weddingScratchCard = new WeddingScratchCard();
