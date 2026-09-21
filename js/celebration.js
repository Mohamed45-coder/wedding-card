/**
 * ==========================================================================
 * ROYAL WEDDING INVITATION - CELEBRATION ENGINE
 * Fullscreen Fireworks & Gold Confetti Particle Canvas
 * ==========================================================================
 */

class WeddingCelebration {
  constructor() {
    this.canvas = document.getElementById('fireworksCanvas');
    this.ctx = null;
    this.particles = [];
    this.fireworks = [];
    this.confetti = [];
    this.isActive = false;
    this.animationFrame = null;
    this.colors = [
      '#FFDF73', '#D4AF37', '#FFF6D6', '#E5B842', // Royal Gold tones
      '#D92534', '#942236', '#FAF7F0', '#00C896'  // Crimson, Ivory, Emerald
    ];
  }

  init() {
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    if (!this.canvas) return;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  launch() {
    this.init();
    this.isActive = true;
    this.particles = [];
    this.fireworks = [];
    this.confetti = [];

    // Spawn 120 confetti pieces immediately
    for (let i = 0; i < 140; i++) {
      this.confetti.push(new ConfettiPiece(this.width, this.height, this.colors));
    }

    // Launch multi-burst fireworks sequence
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        if (!this.isActive) return;
        const targetX = this.width * 0.2 + Math.random() * (this.width * 0.6);
        const targetY = this.height * 0.15 + Math.random() * (this.height * 0.4);
        this.createFireworkBurst(targetX, targetY);
      }, i * 450);
    }

    if (!this.animationFrame) {
      this.loop();
    }

    // Auto terminate after 8 seconds
    setTimeout(() => {
      this.isActive = false;
    }, 8000);
  }

  createFireworkBurst(x, y) {
    const particleCount = 60;
    const color = this.colors[Math.floor(Math.random() * this.colors.length)];
    for (let i = 0; i < particleCount; i++) {
      this.particles.push(new FireworkParticle(x, y, color));
    }
  }

  loop() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Update & render particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.update();
      p.draw(this.ctx);
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update & render confetti
    for (let i = this.confetti.length - 1; i >= 0; i--) {
      const c = this.confetti[i];
      c.update();
      c.draw(this.ctx);
      if (c.y > this.height + 20) {
        if (this.isActive) {
          c.reset(this.width);
        } else {
          this.confetti.splice(i, 1);
        }
      }
    }

    if (this.isActive || this.particles.length > 0 || this.confetti.length > 0) {
      this.animationFrame = requestAnimationFrame(() => this.loop());
    } else {
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.animationFrame = null;
    }
  }
}

class FireworkParticle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.5 + Math.random() * 5.5;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.gravity = 0.06;
    this.friction = 0.96;
    this.alpha = 1;
    this.decay = 0.015 + Math.random() * 0.02;
    this.size = 2.5 + Math.random() * 2.5;
  }

  update() {
    this.vx *= this.friction;
    this.vy *= this.friction;
    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= this.decay;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 8;
    ctx.shadowColor = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class ConfettiPiece {
  constructor(w, h, colors) {
    this.colors = colors;
    this.reset(w);
    this.y = Math.random() * h;
  }

  reset(w) {
    this.x = Math.random() * w;
    this.y = -20;
    this.size = 6 + Math.random() * 6;
    this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
    this.speedY = 2 + Math.random() * 3.5;
    this.speedX = -1.5 + Math.random() * 3;
    this.rotation = Math.random() * 360;
    this.rotSpeed = -4 + Math.random() * 8;
  }

  update() {
    this.y += this.speedY;
    this.x += this.speedX;
    this.rotation += this.rotSpeed;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 0.6);
    ctx.restore();
  }
}

window.weddingCelebration = new WeddingCelebration();

