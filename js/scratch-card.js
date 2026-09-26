/**
 * ==========================================================================
 * ROYAL WEDDING INVITATION - SQUARE SCRATCH CARD
 * HTML5 Canvas interactive golden metallic scratch foil with 45% threshold.
 * Covers 100% of the revealed wedding details. Unlocks scroll upon completion.
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
    this.scratchThreshold = 45; // 45% threshold for complete reveal
    this._calcTimer = null;
  }

  init() {
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

    this.setupCanvas();
    this.bindEvents();

    // Rebuild on resize if not already revealed
    window.addEventListener('resize', () => {
      if (!this.isRevealed) {
        this.setupCanvas();
      }
    });
  }

  /* -----------------------------------------------------------
     Canvas setup: match exact container pixel size with DPR
     ----------------------------------------------------------- */
  setupCanvas() {
    const container = this.canvas.parentElement;
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    this.width = rect.width;
    this.height = rect.height;

    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transforms
    this.ctx.scale(dpr, dpr);

    this.drawSquareFoil();
  }

  /* -----------------------------------------------------------
     Draw the royal square metallic golden foil covering 100%
     ----------------------------------------------------------- */
  drawSquareFoil() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const cx = w / 2;
    const cy = h / 2;

    // Clear everything
    ctx.clearRect(0, 0, w, h);

    // 1. Rich Metallic Gold Gradient
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0.0, '#7A5809');
    grad.addColorStop(0.18, '#DDAE3B');
    grad.addColorStop(0.35, '#FFF6D6');
    grad.addColorStop(0.55, '#F7E5A9');
    grad.addColorStop(0.75, '#C99A2C');
    grad.addColorStop(0.92, '#DDAE3B');
    grad.addColorStop(1.0, '#7A5809');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // 2. Central Shimmer Radial Glow
    const radGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, Math.max(w, h) * 0.6);
    radGrad.addColorStop(0, 'rgba(255, 255, 240, 0.45)');
    radGrad.addColorStop(0.5, 'rgba(255, 246, 214, 0.15)');
    radGrad.addColorStop(1, 'rgba(0, 0, 0, 0.08)');
    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, w, h);

    // 3. Subtle Maroon Filigree & Diagonal Etch Pattern
    ctx.strokeStyle = 'rgba(92, 16, 29, 0.15)';
    ctx.lineWidth = 1.5;
    const lineSpacing = 22;
    for (let x = -h; x < w + h; x += lineSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + h * 0.6, h);
      ctx.stroke();
    }

    // 4. Double Ornate Inner Gold Border Frame
    const inset1 = 14;
    ctx.strokeStyle = 'rgba(92, 16, 29, 0.45)';
    ctx.lineWidth = 2;
    ctx.strokeRect(inset1, inset1, w - inset1 * 2, h - inset1 * 2);

    const inset2 = 20;
    ctx.strokeStyle = '#FFF6D6';
    ctx.lineWidth = 1;
    ctx.strokeRect(inset2, inset2, w - inset2 * 2, h - inset2 * 2);

    // Ornate Corner Diamond Accents
    ctx.fillStyle = '#5C101D';
    const cornerSize = 6;
    const drawDiamond = (dx, dy) => {
      ctx.beginPath();
      ctx.moveTo(dx, dy - cornerSize);
      ctx.lineTo(dx + cornerSize, dy);
      ctx.lineTo(dx, dy + cornerSize);
      ctx.lineTo(dx - cornerSize, dy);
      ctx.closePath();
      ctx.fill();
    };
    drawDiamond(inset2, inset2);
    drawDiamond(w - inset2, inset2);
    drawDiamond(inset2, h - inset2);
    drawDiamond(w - inset2, h - inset2);

    // 5. Central Badge & Typography
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Top Sparkle Pill
    ctx.fillStyle = 'rgba(92, 16, 29, 0.85)';
    const pillW = Math.min(180, w * 0.55);
    const pillH = 26;
    const pillY = cy - 65;
    ctx.beginPath();
    ctx.roundRect(cx - pillW / 2, pillY - pillH / 2, pillW, pillH, 13);
    ctx.fill();

    ctx.fillStyle = '#FFF6D6';
    ctx.font = `600 ${Math.max(10, Math.round(w * 0.03))}px "Montserrat", sans-serif`;
    ctx.fillText('✨ SCRATCH CARD ✨', cx, pillY);

    // Large Scratch Title
    ctx.fillStyle = '#3A0A10';
    ctx.font = `bold ${Math.max(18, Math.round(w * 0.066))}px "Playfair Display", Georgia, serif`;
    ctx.fillText('✨ Scratch Here ✨', cx, cy - 15);

    // Subtitle instruction
    ctx.fillStyle = '#4A121A';
    ctx.font = `500 ${Math.max(11, Math.round(w * 0.034))}px "Montserrat", sans-serif`;
    ctx.fillText('Unveil the Wedding Date & Schedule', cx, cy + 22);

    // Love Icon / Emoji
    ctx.font = `${Math.max(22, Math.round(w * 0.08))}px serif`;
    ctx.fillText('💍', cx, cy + 62);
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
      }, 50);
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
    ctx.arc(x, y, 32, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  scratchLine(x1, y1, x2, y2) {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = 64;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }

  /* -----------------------------------------------------------
     Measure how much of the square card foil has been erased
     ----------------------------------------------------------- */
  calculateScratchedPercent() {
    if (this.isRevealed) return;

    const canvasW = this.canvas.width;
    const canvasH = this.canvas.height;
    const step = 8;
    const imgData = this.ctx.getImageData(0, 0, canvasW, canvasH);
    const px = imgData.data;

    let total = 0;
    let scratched = 0;

    for (let y = 0; y < canvasH; y += step) {
      for (let x = 0; x < canvasW; x += step) {
        total++;
        const idx = (y * canvasW + x) * 4;
        if (px[idx + 3] < 20) {
          scratched++;
        }
      }
    }

    if (total === 0) return;

    const percentage = Math.round((scratched / total) * 100);
    this.scratchedPercentage = percentage;

    // Update progress bar
    if (this.progressFill) {
      const displayPct = Math.min(100, Math.round((percentage / this.scratchThreshold) * 100));
      this.progressFill.style.width = `${displayPct}%`;
    }

    // Check threshold for full reveal
    if (percentage >= this.scratchThreshold) {
      this.triggerCompleteReveal();
    }
  }

  /* -----------------------------------------------------------
     Trigger complete reveal: unlock scrolling and celebrate!
     ----------------------------------------------------------- */
  triggerCompleteReveal() {
    if (this.isRevealed) return;
    this.isRevealed = true;

    // 1. Fade out the canvas foil
    this.canvas.classList.add('revealed');
    if (this.progressFill) {
      this.progressFill.style.width = '100%';
    }

    // 2. Unlock body scrolling & unlock sections downstream
    document.body.classList.remove('scratch-locked');
    const lockNotice = document.getElementById('scratchLockNotice');
    if (lockNotice) {
      lockNotice.style.opacity = '0';
      lockNotice.style.transform = 'translateY(10px)';
      lockNotice.style.transition = 'all 0.4s ease';
      setTimeout(() => {
        lockNotice.style.display = 'none';
      }, 400);
    }

    // 3. Re-initialize scroll observer so unlocked sections reveal smoothly
    setTimeout(() => {
      if (window.weddingObserver) {
        window.weddingObserver.init();
      }
    }, 150);

    // 4. Launch fireworks & confetti
    if (window.weddingCelebration) {
      window.weddingCelebration.launch();
    }

    // 5. Play celebration sound
    if (window.weddingAudio) {
      window.weddingAudio.playCelebrationFanfare();
    }

    // 6. Toast notification
    if (window.showToast) {
      const g = window.WEDDING_CONFIG?.groom?.name || 'Rahamathullah';
      const b = window.WEDDING_CONFIG?.bride?.name || 'Maseera';
      window.showToast(`🎉 Date Revealed! Save the Date for ${g} & ${b}!`);
    }
  }
}

window.weddingScratchCard = new WeddingScratchCard();
