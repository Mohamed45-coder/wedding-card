/**
 * ==========================================================================
 * ROYAL WEDDING INVITATION - HEART SCRATCH CARD ENGINE
 * Interactive HTML5 Canvas heart-shaped scratch & reveal component.
 *
 * Key design decisions:
 *  - Uses the actual flower image (scratch_flowers.webp) as the cover.
 *  - Percentage tracking via a GRID of cells (no getImageData needed),
 *    so it works even when the canvas is tainted by cross-origin images.
 *  - 50% threshold triggers a smooth CSS opacity fade (not ugly sweeps).
 *  - Feathered radial brush for soft scratch edges.
 *  - Organic falling rose petals during scratching.
 * ==========================================================================
 */

class WeddingScratchCard {
  constructor() {
    this.canvas = document.getElementById('scratchCanvas');
    this.petalsCanvas = document.getElementById('scratchPetalsCanvas');
    this.progressFill = document.getElementById('scratchProgressFill');
    this.lockNotice = document.getElementById('scratchLockNotice');
    this.container = document.getElementById('heartContainer');

    this.ctx = null;
    this.isDrawing = false;
    this.isRevealed = false;
    this.isAutoScratching = false;
    this.lastPoint = null;
    this.scratchedPercentage = 0;
    this.scratchThreshold = 50; // 50% to trigger reveal

    this.width = 400;
    this.height = 360;
    this.dpr = window.devicePixelRatio || 1;
    this.heartPath = null;
    this.brushCanvas = null;
    this.brushRadius = 32;

    // --- Grid-based scratch tracking (no getImageData) ---
    this._gridStep = 6;        // each cell is 6×6 CSS px
    this._gridCols = 0;
    this._gridRows = 0;
    this._scratchGrid = null;  // Uint8Array: 0=outside, 1=inside+unscratched, 2=scratched
    this._totalHeartCells = 0;
    this._scratchedCells = 0;

    this._calcTimer = null;
    this._scratchSoundThrottle = 0;

    // Floral cover image
    this.floralImg = null;
    this.floralImgLoaded = false;

    // Petal engine
    this.petalEngine = null;
  }

  init() {
    if (!this.canvas || !this.container) return;

    this.ctx = this.canvas.getContext('2d');

    // Initialize petal engine
    if (this.petalsCanvas) {
      this.petalEngine = new ScratchPetalEngine(this.petalsCanvas);
      this.petalEngine.init();
    }

    // Load floral image (no crossOrigin needed since we never read pixels)
    this.floralImg = new Image();
    this.floralImg.onload = () => {
      this.floralImgLoaded = true;
      // Redraw the covering with the real image
      this.drawFloralCovering();
    };
    this.floralImg.onerror = () => {
      this.floralImgLoaded = false;
      // Procedural fallback is already drawn by setupCanvas
    };
    this.floralImg.src = 'assets/images/scratch_flowers.webp';

    // Initial canvas setup (draws procedural fallback if image not yet loaded)
    this.setupCanvas();

    this.bindEvents();

    // Resize handling
    if (window.ResizeObserver) {
      const ro = new ResizeObserver(() => {
        if (!this.isRevealed && !this.isAutoScratching) {
          this.setupCanvas();
        } else if (this.petalEngine) {
          this.petalEngine.resize();
        }
      });
      ro.observe(this.container);
    } else {
      window.addEventListener('resize', () => {
        if (!this.isRevealed && !this.isAutoScratching) {
          this.setupCanvas();
        } else if (this.petalEngine) {
          this.petalEngine.resize();
        }
      });
    }

    this.populateRevealedDetails();
  }

  populateRevealedDetails() {
    const cfg = window.WEDDING_CONFIG;
    if (!cfg) return;

    const groomEl = document.getElementById('revealedGroomName');
    const brideEl = document.getElementById('revealedBrideName');
    if (groomEl && cfg.groom?.name) {
      groomEl.textContent = cfg.groom.name.replace(/^(Mohamed\s+)/i, '');
    }
    if (brideEl && cfg.bride?.name) {
      brideEl.textContent = cfg.bride.name.replace(/(\s+Kowsar)$/i, '');
    }
  }

  /* -----------------------------------------------------------
     Canvas & Brush Setup
     ----------------------------------------------------------- */
  setupCanvas() {
    if (!this.canvas || !this.container) return;

    const w = this.container.clientWidth || 360;
    const h = this.container.clientHeight || Math.round(w * 0.9);
    if (w <= 0 || h <= 0) return;

    this.width = w;
    this.height = h;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2.5);

    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(this.dpr, this.dpr);

    // Feathered brush
    this.brushRadius = Math.max(30, Math.min(45, Math.round(this.width * 0.11)));
    this.createFeatheredBrush(this.brushRadius);

    // Heart path
    this.buildHeartPath();

    // Build scratch-tracking grid
    this._buildScratchGrid();

    // Draw the floral covering
    this.drawFloralCovering();

    // Resize petal canvas
    if (this.petalEngine) {
      this.petalEngine.resize();
    }
  }

  createFeatheredBrush(radius) {
    this.brushCanvas = document.createElement('canvas');
    const size = radius * 2;
    this.brushCanvas.width = size * this.dpr;
    this.brushCanvas.height = size * this.dpr;
    const bCtx = this.brushCanvas.getContext('2d');
    bCtx.scale(this.dpr, this.dpr);

    const radGrad = bCtx.createRadialGradient(radius, radius, radius * 0.25, radius, radius, radius);
    radGrad.addColorStop(0, 'rgba(0, 0, 0, 1)');
    radGrad.addColorStop(0.55, 'rgba(0, 0, 0, 0.95)');
    radGrad.addColorStop(0.85, 'rgba(0, 0, 0, 0.4)');
    radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    bCtx.fillStyle = radGrad;
    bCtx.beginPath();
    bCtx.arc(radius, radius, radius, 0, Math.PI * 2);
    bCtx.fill();
  }

  buildHeartPath() {
    const w = this.width;
    const h = this.height;
    const p = new Path2D();

    p.moveTo(w * 0.5, h * 0.2);
    p.bezierCurveTo(w * 0.3375, h * 0.0333, w * 0.08, h * 0.1167, w * 0.055, h * 0.3556);
    p.bezierCurveTo(w * 0.03, h * 0.5833, w * 0.27, h * 0.7556, w * 0.5, h * 0.9444);
    p.bezierCurveTo(w * 0.73, h * 0.7556, w * 0.97, h * 0.5833, w * 0.945, h * 0.3556);
    p.bezierCurveTo(w * 0.92, h * 0.1167, w * 0.6625, h * 0.0333, w * 0.5, h * 0.2);
    p.closePath();

    this.heartPath = p;
  }

  /* -----------------------------------------------------------
     Grid-Based Scratch Tracking
     A grid of cells tracks which areas of the heart have been
     scratched. Each cell can only be counted once, so overlapping
     strokes don't inflate the percentage. No getImageData needed.
     ----------------------------------------------------------- */
  _buildScratchGrid() {
    const step = this._gridStep;
    this._gridCols = Math.ceil(this.width / step);
    this._gridRows = Math.ceil(this.height / step);
    this._scratchGrid = new Uint8Array(this._gridCols * this._gridRows);
    this._totalHeartCells = 0;
    this._scratchedCells = 0;

    // Mark cells inside the heart
    for (let row = 0; row < this._gridRows; row++) {
      for (let col = 0; col < this._gridCols; col++) {
        const cx = col * step + step * 0.5;
        const cy = row * step + step * 0.5;
        if (this.ctx.isPointInPath(this.heartPath, cx, cy)) {
          this._scratchGrid[row * this._gridCols + col] = 1; // inside heart, unscratched
          this._totalHeartCells++;
        }
        // 0 = outside heart (default)
      }
    }
  }

  /**
   * Mark grid cells as scratched within brush radius of point (x, y).
   * Accurately matches the feathered brush's visible erase zone.
   */
  _markGridScratched(x, y) {
    const effectiveR = this.brushRadius * 0.95;
    const step = this._gridStep;
    const rSq = effectiveR * effectiveR;

    const minCol = Math.max(0, Math.floor((x - effectiveR) / step));
    const maxCol = Math.min(this._gridCols - 1, Math.ceil((x + effectiveR) / step));
    const minRow = Math.max(0, Math.floor((y - effectiveR) / step));
    const maxRow = Math.min(this._gridRows - 1, Math.ceil((y + effectiveR) / step));

    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        const idx = row * this._gridCols + col;
        if (this._scratchGrid[idx] !== 1) continue; // skip if outside heart or already scratched

        const cellX = col * step + step * 0.5;
        const cellY = row * step + step * 0.5;
        const dx = cellX - x;
        const dy = cellY - y;

        if (dx * dx + dy * dy <= rSq) {
          this._scratchGrid[idx] = 2; // scratched
          this._scratchedCells++;
        }
      }
    }
  }

  /**
   * Mark grid cells along a line from (x1,y1) to (x2,y2).
   */
  _markGridLine(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.hypot(dx, dy);
    const stepDist = this._gridStep; // sample every grid step along the line
    const steps = Math.max(1, Math.ceil(dist / stepDist));

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      this._markGridScratched(x1 + dx * t, y1 + dy * t);
    }
  }

  _getScratchPercentage() {
    if (this._totalHeartCells === 0) return 0;
    return Math.round((this._scratchedCells / this._totalHeartCells) * 100);
  }

  /* -----------------------------------------------------------
     Floral Covering Drawing
     Uses the actual flower image. Falls back to a rich procedural
     pattern if the image fails to load.
     ----------------------------------------------------------- */
  drawFloralCovering() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.clip(this.heartPath);

    if (this.floralImgLoaded && this.floralImg.complete && this.floralImg.naturalWidth > 0) {
      // === Draw the real floral image ===
      // Cover-fill: maintain aspect ratio, fill heart bounding box
      const imgW = this.floralImg.naturalWidth;
      const imgH = this.floralImg.naturalHeight;
      const scale = Math.max(w / imgW, h / imgH);
      const drawW = imgW * scale;
      const drawH = imgH * scale;
      const offsetX = (w - drawW) / 2;
      const offsetY = (h - drawH) / 2;
      ctx.drawImage(this.floralImg, offsetX, offsetY, drawW, drawH);

      // Subtle warm overlay to unify with site theme
      ctx.fillStyle = 'rgba(92, 16, 29, 0.08)';
      ctx.fill(this.heartPath);
    } else {
      // === Procedural fallback ===
      this._drawProceduralFloral(ctx, w, h);
    }

    // Depth vignette around heart edges
    const vignette = ctx.createRadialGradient(w * 0.5, h * 0.48, w * 0.18, w * 0.5, h * 0.48, w * 0.52);
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(0.75, 'rgba(40, 5, 12, 0.12)');
    vignette.addColorStop(1, 'rgba(20, 0, 5, 0.35)');
    ctx.fillStyle = vignette;
    ctx.fill(this.heartPath);

    // Gold sparkle dust
    const rng = this._seededRandom(77);
    for (let i = 0; i < 30; i++) {
      const sx = (0.14 + rng() * 0.72) * w;
      const sy = (0.14 + rng() * 0.72) * h;
      if (ctx.isPointInPath(this.heartPath, sx, sy)) {
        ctx.beginPath();
        ctx.arc(sx, sy, 0.8 + rng() * 1.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 235, 168, ${0.35 + rng() * 0.45})`;
        ctx.fill();
      }
    }

    ctx.restore();
  }

  /**
   * Rich procedural floral pattern used when image fails to load.
   */
  _drawProceduralFloral(ctx, w, h) {
    // Background gradient
    const grad = ctx.createRadialGradient(w * 0.5, h * 0.42, w * 0.05, w * 0.5, h * 0.45, w * 0.6);
    grad.addColorStop(0, '#D04060');
    grad.addColorStop(0.25, '#B8324C');
    grad.addColorStop(0.5, '#8C1C2E');
    grad.addColorStop(0.75, '#5C101D');
    grad.addColorStop(1, '#3A0A10');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    const flowerColors = [
      { fill: '#C02040', stroke: '#8A1228' },
      { fill: '#E28E9E', stroke: '#B85E71' },
      { fill: '#D44D68', stroke: '#A02040' },
      { fill: '#FFEEF2', stroke: '#D8A0AD' },
      { fill: '#B8324C', stroke: '#85172C' },
      { fill: '#942236', stroke: '#6A1021' },
    ];

    const rng = this._seededRandom(42);

    // Large flowers
    for (let i = 0; i < 28; i++) {
      const fx = w * (0.08 + rng() * 0.84);
      const fy = h * (0.08 + rng() * 0.84);
      if (!ctx.isPointInPath(this.heartPath, fx, fy)) continue;

      const flowerSize = 14 + rng() * 20;
      const petalCount = 5 + Math.floor(rng() * 4);
      const colorSet = flowerColors[Math.floor(rng() * flowerColors.length)];

      ctx.save();
      ctx.translate(fx, fy);
      ctx.rotate(rng() * Math.PI * 2);
      ctx.globalAlpha = 0.7 + rng() * 0.3;

      for (let p = 0; p < petalCount; p++) {
        ctx.save();
        ctx.rotate((p / petalCount) * Math.PI * 2);
        ctx.beginPath();
        ctx.ellipse(flowerSize * 0.5, 0, flowerSize * 0.5, flowerSize * 0.28, 0, 0, Math.PI * 2);
        ctx.fillStyle = colorSet.fill;
        ctx.fill();
        ctx.strokeStyle = colorSet.stroke;
        ctx.lineWidth = 0.6;
        ctx.stroke();
        ctx.restore();
      }

      ctx.beginPath();
      ctx.arc(0, 0, flowerSize * 0.18, 0, Math.PI * 2);
      ctx.fillStyle = rng() > 0.5 ? '#FFEEBB' : '#FFD700';
      ctx.fill();
      ctx.restore();
    }

    // Small buds
    for (let i = 0; i < 20; i++) {
      const fx = w * (0.06 + rng() * 0.88);
      const fy = h * (0.06 + rng() * 0.88);
      if (!ctx.isPointInPath(this.heartPath, fx, fy)) continue;

      const budSize = 5 + rng() * 9;
      const colorSet = flowerColors[Math.floor(rng() * flowerColors.length)];

      ctx.save();
      ctx.globalAlpha = 0.6 + rng() * 0.4;
      ctx.beginPath();
      ctx.arc(fx, fy, budSize, 0, Math.PI * 2);
      ctx.fillStyle = colorSet.fill;
      ctx.fill();
      ctx.restore();
    }

    // Leaves
    for (let i = 0; i < 14; i++) {
      const lx = w * (0.1 + rng() * 0.8);
      const ly = h * (0.1 + rng() * 0.8);
      if (!ctx.isPointInPath(this.heartPath, lx, ly)) continue;

      const leafLen = 12 + rng() * 14;
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(rng() * Math.PI * 2);
      ctx.globalAlpha = 0.35 + rng() * 0.25;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(leafLen * 0.3, -leafLen * 0.3, leafLen * 0.7, -leafLen * 0.2, leafLen, 0);
      ctx.bezierCurveTo(leafLen * 0.7, leafLen * 0.2, leafLen * 0.3, leafLen * 0.3, 0, 0);
      ctx.fillStyle = rng() > 0.5 ? '#2D5E2B' : '#3A7038';
      ctx.fill();
      ctx.restore();
    }
  }

  _seededRandom(seed) {
    let s = seed;
    return () => {
      s = (s * 16807 + 0) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  /* -----------------------------------------------------------
     Pointer & Touch Event Handlers
     ----------------------------------------------------------- */
  bindEvents() {
    this.canvas.addEventListener('mousedown', (e) => this.handleStart(e));
    window.addEventListener('mousemove', (e) => this.handleMove(e));
    window.addEventListener('mouseup', () => this.handleEnd());

    this.canvas.addEventListener('touchstart', (e) => this.handleStart(e), { passive: false });
    this.canvas.addEventListener('touchmove', (e) => this.handleMove(e), { passive: false });
    window.addEventListener('touchmove', (e) => {
      if (this.isDrawing) this.handleMove(e);
    }, { passive: false });
    window.addEventListener('touchend', () => this.handleEnd());
    window.addEventListener('touchcancel', () => this.handleEnd());
  }

  getPointerPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    const clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches && e.touches.length > 0 ? e.touches[0].clientY : e.clientY;

    const scaleX = this.width / rect.width;
    const scaleY = this.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  handleStart(e) {
    if (this.isRevealed || this.isAutoScratching) return;
    this.isDrawing = true;
    const pos = this.getPointerPos(e);
    this.lastPoint = pos;

    this.eraseAt(pos.x, pos.y);
    this._markGridScratched(pos.x, pos.y);
    this.spawnScratchPetals(pos.x, pos.y);
  }

  handleMove(e) {
    if (!this.isDrawing || this.isRevealed || this.isAutoScratching) return;
    if (e.cancelable) {
      e.preventDefault();
    }

    const pos = this.getPointerPos(e);
    if (!this.lastPoint) {
      this.lastPoint = pos;
      return;
    }

    this.eraseLine(this.lastPoint.x, this.lastPoint.y, pos.x, pos.y);
    this._markGridLine(this.lastPoint.x, this.lastPoint.y, pos.x, pos.y);
    this.spawnScratchPetals(pos.x, pos.y);
    this.lastPoint = pos;

    // Tactile audio feedback (throttled)
    const now = Date.now();
    if (now - this._scratchSoundThrottle > 140) {
      this._scratchSoundThrottle = now;
      if (window.weddingAudio && typeof window.weddingAudio.playScratchSound === 'function') {
        window.weddingAudio.playScratchSound();
      }
    }

    // Throttled percentage update
    if (!this._calcTimer) {
      this._calcTimer = setTimeout(() => {
        this._updateProgress();
        this._calcTimer = null;
      }, 50);
    }
  }

  handleEnd() {
    this.isDrawing = false;
    this.lastPoint = null;
    if (!this.isRevealed && !this.isAutoScratching) {
      this._updateProgress();
    }
  }

  /* -----------------------------------------------------------
     Progress Update & Threshold Check
     ----------------------------------------------------------- */
  _updateProgress() {
    if (this.isRevealed || this.isAutoScratching) return;

    const percentage = this._getScratchPercentage();
    this.scratchedPercentage = percentage;

    // Update progress bar (maps 0-50% scratched → 0-100% bar fill)
    if (this.progressFill) {
      const displayPct = Math.min(100, Math.round((percentage / this.scratchThreshold) * 100));
      this.progressFill.style.width = `${displayPct}%`;
    }

    // Check threshold (50%)
    if (percentage >= this.scratchThreshold) {
      this.startAutoReveal();
    }
  }

  /* -----------------------------------------------------------
     Soft Feathered Scratch Erasing
     ----------------------------------------------------------- */
  eraseAt(x, y) {
    if (!this.brushCanvas) return;
    const ctx = this.ctx;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    const r = this.brushRadius;
    ctx.drawImage(this.brushCanvas, x - r, y - r, r * 2, r * 2);
    ctx.restore();
  }

  eraseLine(x1, y1, x2, y2) {
    if (!this.brushCanvas) return;
    const ctx = this.ctx;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';

    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.hypot(dx, dy);
    const stepDist = 5;
    const steps = Math.max(1, Math.ceil(dist / stepDist));
    const r = this.brushRadius;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = x1 + dx * t;
      const y = y1 + dy * t;
      ctx.drawImage(this.brushCanvas, x - r, y - r, r * 2, r * 2);
    }

    ctx.restore();
  }

  spawnScratchPetals(x, y) {
    if (this.petalEngine) {
      this.petalEngine.spawnPetalsAt(x, y, 1);
    }
  }

  /* -----------------------------------------------------------
     SMOOTH AUTO-REVEAL (Triggered at 50%)
     Gracefully reveals the special date and enables next sections.
     ----------------------------------------------------------- */
  startAutoReveal() {
    if (this.isAutoScratching || this.isRevealed) return;
    this.isAutoScratching = true;
    this.isDrawing = false;
    this.lastPoint = null;

    // Immediately unlock downstream sections
    document.body.classList.remove('scratch-locked');
    if (this.lockNotice) {
      this.lockNotice.style.opacity = '0';
      this.lockNotice.style.transform = 'translateY(10px)';
      this.lockNotice.style.transition = 'all 0.4s ease';
      setTimeout(() => {
        this.lockNotice.style.display = 'none';
      }, 400);
    }

    // Fill progress bar to 100%
    if (this.progressFill) {
      this.progressFill.style.transition = 'width 0.4s ease-out';
      this.progressFill.style.width = '100%';
    }

    // Spawn celebration petals
    if (this.petalEngine) {
      this.petalEngine.celebrateFlurry(24);
    }

    // Smooth CSS opacity fade on the canvas
    if (this.canvas) {
      this.canvas.classList.add('revealed');
      this.canvas.style.pointerEvents = 'none';
    }
    if (this.container) {
      this.container.classList.add('revealed');
      this.container.style.touchAction = 'pan-y';
    }

    // Immediately observe and animate newly visible sections
    if (window.weddingObserver && typeof window.weddingObserver.init === 'function') {
      window.weddingObserver.init();
    }

    // After fade completes, finalize
    setTimeout(() => {
      this.triggerCompleteReveal();
    }, 600);
  }

  /* -----------------------------------------------------------
     Complete Reveal & Celebrations
     ----------------------------------------------------------- */
  triggerCompleteReveal() {
    if (this.isRevealed) return;
    this.isRevealed = true;
    this.isAutoScratching = false;

    // Clear leftover canvas content
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.width, this.height);
    }

    // Ensure everything is unlocked
    document.body.classList.remove('scratch-locked');

    if (this.canvas) {
      this.canvas.classList.add('revealed');
      this.canvas.style.display = 'none';
      this.canvas.style.pointerEvents = 'none';
    }
    if (this.container) {
      this.container.classList.add('revealed');
      this.container.style.touchAction = 'pan-y';
    }

    // Re-trigger scroll observer for newly visible sections
    if (window.weddingObserver && typeof window.weddingObserver.init === 'function') {
      window.weddingObserver.init();
    }

    // Launch celebration effects
    if (window.weddingCelebration && typeof window.weddingCelebration.launch === 'function') {
      window.weddingCelebration.launch();
    }

    // Play celebration fanfare
    if (window.weddingAudio && typeof window.weddingAudio.playCelebrationFanfare === 'function') {
      window.weddingAudio.playCelebrationFanfare();
    }

    // Toast notification
    if (typeof window.showToast === 'function') {
      const g = window.WEDDING_CONFIG?.groom?.name?.replace(/^(Mohamed\s+)/i, '') || 'Rahamathullah';
      const b = window.WEDDING_CONFIG?.bride?.name?.replace(/(\s+Kowsar)$/i, '') || 'Maseera';
      window.showToast(`🎉 Date Revealed! Save the Date for ${g} & ${b}!`);
    }
  }
}

/**
 * ==========================================================================
 * SCRATCH PETAL PARTICLE ENGINE
 * Realistic 3D fluttering rose petals released during scratch interaction
 * ==========================================================================
 */
class ScratchPetalEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = null;
    this.petals = [];
    this.maxPetals = 45;
    this.animationFrame = null;
    this.isRunning = false;
    this.width = 0;
    this.height = 0;
    this.dpr = 1;
  }

  init() {
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.resize();
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = rect.width || 440;
    this.height = rect.height || 420;

    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(this.dpr, this.dpr);
  }

  spawnPetalsAt(originX, originY, count = 1) {
    if (this.petals.length >= this.maxPetals) return;

    for (let i = 0; i < count; i++) {
      const offsetX = originX + this.width * 0.12 + (Math.random() - 0.5) * 24;
      const offsetY = originY + this.height * 0.12 + (Math.random() - 0.5) * 24;
      this.petals.push(new RealisticRosePetal(offsetX, offsetY));
    }

    if (!this.isRunning) {
      this.startLoop();
    }
  }

  celebrateFlurry(count = 24) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const x = this.width * 0.15 + Math.random() * (this.width * 0.7);
        const y = this.height * 0.08 + Math.random() * (this.height * 0.3);
        this.petals.push(new RealisticRosePetal(x, y, true));
        if (!this.isRunning) this.startLoop();
      }, i * 50);
    }
  }

  startLoop() {
    this.isRunning = true;
    this.loop();
  }

  loop() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = this.petals.length - 1; i >= 0; i--) {
      const p = this.petals[i];
      p.update();
      p.draw(this.ctx);

      if (p.y > this.height + 20 || p.alpha <= 0.02) {
        this.petals.splice(i, 1);
      }
    }

    if (this.petals.length > 0) {
      this.animationFrame = requestAnimationFrame(() => this.loop());
    } else {
      this.isRunning = false;
      this.animationFrame = null;
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
  }
}

/**
 * Single Realistic Rose Petal Particle
 */
class RealisticRosePetal {
  constructor(x, y, isFlurry = false) {
    this.x = x;
    this.y = y;

    this.size = isFlurry ? 9 + Math.random() * 8 : 8 + Math.random() * 7;
    this.vx = (Math.random() - 0.5) * 1.8;
    this.vy = isFlurry ? 1.0 + Math.random() * 1.6 : -0.4 + Math.random() * 1.2;
    this.gravity = 0.05 + Math.random() * 0.03;
    this.maxVy = 1.8 + Math.random() * 1.2;

    this.swayAngle = Math.random() * Math.PI * 2;
    this.swaySpeed = 0.03 + Math.random() * 0.035;
    this.swayAmount = 0.6 + Math.random() * 0.9;

    this.rotation = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 0.06;
    this.flipAngle = Math.random() * Math.PI * 2;
    this.flipSpeed = 0.04 + Math.random() * 0.05;

    this.alpha = 0.85 + Math.random() * 0.15;
    this.decay = 0.003 + Math.random() * 0.004;

    const colors = [
      { base: '#781729', highlight: '#9E2A3E', shadow: '#500C19' },
      { base: '#942236', highlight: '#B8324C', shadow: '#6A1021' },
      { base: '#B8324C', highlight: '#D44D68', shadow: '#85172C' },
      { base: '#E28E9E', highlight: '#F4B6C3', shadow: '#B85E71' },
      { base: '#F3E4D6', highlight: '#FFF7EE', shadow: '#D8BFA9' }
    ];
    this.palette = colors[Math.floor(Math.random() * colors.length)];
  }

  update() {
    this.vy = Math.min(this.maxVy, this.vy + this.gravity);
    this.swayAngle += this.swaySpeed;
    this.x += this.vx + Math.sin(this.swayAngle) * this.swayAmount;
    this.y += this.vy;

    this.rotation += this.rotSpeed;
    this.flipAngle += this.flipSpeed;
    this.alpha -= this.decay;
  }

  draw(ctx) {
    const scaleY = Math.cos(this.flipAngle);
    if (this.alpha <= 0) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.scale(1, Math.max(0.15, Math.abs(scaleY)));
    ctx.globalAlpha = Math.max(0, this.alpha);

    const w = this.size;
    const h = this.size * 1.25;

    ctx.beginPath();
    ctx.moveTo(0, -h * 0.5);
    ctx.bezierCurveTo(w * 0.65, -h * 0.45, w * 0.75, h * 0.35, 0, h * 0.5);
    ctx.bezierCurveTo(-w * 0.75, h * 0.35, -w * 0.65, -h * 0.45, 0, -h * 0.5);
    ctx.closePath();

    ctx.fillStyle = this.palette.base;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, -h * 0.4);
    ctx.quadraticCurveTo(w * 0.25, 0, 0, h * 0.35);
    ctx.strokeStyle = this.palette.highlight;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }
}

// Instantiate and expose
window.weddingScratchCard = new WeddingScratchCard();
