/**
 * ==========================================================================
 * ROYAL WEDDING INVITATION - FLOATING ROSE PETALS & GOLD DUST
 * Ambient romantic particles drifting across the screen
 * ==========================================================================
 */

class WeddingPetals {
  constructor() {
    this.canvas = document.getElementById('petalsCanvas');
    this.ctx = null;
    this.petals = [];
    this.goldDust = [];
    this.petalCount = 20; // Lightweight for high performance
    this.dustCount = 28;
    this.animationFrame = null;
    this.isRunning = false;
  }

  init() {
    if (!this.canvas) return;

    // Check for user reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Initialize petals
    this.petals = [];
    for (let i = 0; i < this.petalCount; i++) {
      this.petals.push(new RosePetal(this.width, this.height));
    }

    // Initialize gold dust particles
    this.goldDust = [];
    for (let i = 0; i < this.dustCount; i++) {
      this.goldDust.push(new GoldDustParticle(this.width, this.height));
    }

    this.isRunning = true;
    this.loop();

    // Pause when tab is invisible to save battery
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.isRunning = false;
      } else {
        this.isRunning = true;
        this.loop();
      }
    });
  }

  resize() {
    if (!this.canvas) return;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  loop() {
    if (!this.isRunning || !this.ctx) return;
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Render Gold Dust
    for (const d of this.goldDust) {
      d.update(this.width, this.height);
      d.draw(this.ctx);
    }

    // Render Rose Petals
    for (const p of this.petals) {
      p.update(this.width, this.height);
      p.draw(this.ctx);
    }

    this.animationFrame = requestAnimationFrame(() => this.loop());
  }
}

class RosePetal {
  constructor(w, h) {
    this.reset(w, h, true);
  }

  reset(w, h, initial = false) {
    this.x = Math.random() * w;
    this.y = initial ? Math.random() * h : -30;
    this.size = 10 + Math.random() * 12;
    this.speedY = 0.8 + Math.random() * 1.4;
    this.speedX = -0.6 + Math.random() * 1.2;
    this.oscSpeed = 0.02 + Math.random() * 0.03;
    this.oscAngle = Math.random() * Math.PI * 2;
    this.rot = Math.random() * Math.PI * 2;
    this.rotSpeed = -0.02 + Math.random() * 0.04;
    this.opacity = 0.5 + Math.random() * 0.4;
    
    // Varying romantic shades (maroon crimson to soft blush rose)
    const shades = ['#8A1C2E', '#9E2A3E', '#B3394F', '#C84D63'];
    this.color = shades[Math.floor(Math.random() * shades.length)];
  }

  update(w, h) {
    this.oscAngle += this.oscSpeed;
    this.x += this.speedX + Math.sin(this.oscAngle) * 0.8;
    this.y += this.speedY;
    this.rot += this.rotSpeed;

    if (this.y > h + 30 || this.x < -30 || this.x > w + 30) {
      this.reset(w, h);
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;

    // Organic petal path
    ctx.beginPath();
    ctx.moveTo(0, -this.size / 2);
    ctx.bezierCurveTo(this.size * 0.6, -this.size / 2, this.size * 0.8, this.size / 3, 0, this.size / 2);
    ctx.bezierCurveTo(-this.size * 0.8, this.size / 3, -this.size * 0.6, -this.size / 2, 0, -this.size / 2);
    ctx.fill();

    ctx.restore();
  }
}

class GoldDustParticle {
  constructor(w, h) {
    this.reset(w, h, true);
  }

  reset(w, h, initial = false) {
    this.x = Math.random() * w;
    this.y = initial ? Math.random() * h : -10;
    this.radius = 1 + Math.random() * 1.8;
    this.speedY = 0.4 + Math.random() * 0.8;
    this.speedX = -0.3 + Math.random() * 0.6;
    this.alpha = 0.3 + Math.random() * 0.6;
    this.pulse = Math.random() * Math.PI;
  }

  update(w, h) {
    this.pulse += 0.04;
    this.y += this.speedY;
    this.x += this.speedX;

    if (this.y > h + 10 || this.x < -10 || this.x > w + 10) {
      this.reset(w, h);
    }
  }

  draw(ctx) {
    const currentAlpha = Math.max(0.1, this.alpha + Math.sin(this.pulse) * 0.25);
    ctx.save();
    ctx.globalAlpha = currentAlpha;
    ctx.fillStyle = '#FFE599';
    ctx.shadowBlur = 4;
    ctx.shadowColor = '#D4AF37';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

window.weddingPetals = new WeddingPetals();

