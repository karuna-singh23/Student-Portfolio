/**
 * CELESTIAL STIPPLED NEBULA & RADIANT STAR CANVAS
 * Recreates the stippled cosmic nebula and elongated 4-pointed radiant cross stars
 * inspired by vintage linocut & astronomical stippling engravings.
 */

class CelestialCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.stars = [];
    this.mouse = { x: -1000, y: -1000, isDown: false };
    this.width = 0;
    this.height = 0;
    this.time = 0;
    this.dustDensity = 1200; // Number of stippled dust dots

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.mouse.x = e.touches[0].clientX;
        this.mouse.y = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('click', (e) => {
      this.spawnStar(e.clientX, e.clientY, true);
    });

    this.createStaticStars();
    this.createDustParticles();
    this.animate();
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
    this.createStaticStars();
    this.createDustParticles();
  }

  createStaticStars() {
    this.stars = [];
    // Place distinctive radiant 4-pointed cross stars like the reference image
    const starCount = Math.floor((this.width * this.height) / 50000) + 12;
    for (let i = 0; i < starCount; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 22 + 10, // vertical spike length
        intensity: Math.random() * 0.6 + 0.4,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        twinkleOffset: Math.random() * Math.PI * 2,
        isCustom: false
      });
    }

    // Always guarantee a few prominent stars like in the reference
    const prominentCount = 5;
    for (let i = 0; i < prominentCount; i++) {
      this.stars.push({
        x: this.width * (0.15 + (i * 0.18) % 0.8),
        y: this.height * (0.2 + (i * 0.22) % 0.7),
        size: Math.random() * 28 + 26,
        intensity: 0.95,
        twinkleSpeed: 0.02,
        twinkleOffset: i * 1.5,
        isCustom: false
      });
    }
  }

  spawnStar(x, y, isCustom = true) {
    this.stars.push({
      x: x,
      y: y,
      size: Math.random() * 26 + 20,
      intensity: 1.0,
      twinkleSpeed: 0.04,
      twinkleOffset: Math.random() * Math.PI,
      isCustom: isCustom,
      lifespan: isCustom ? 400 : undefined
    });
    // Keep max stars bounded
    if (this.stars.length > 50) {
      this.stars.splice(0, 1);
    }
  }

  createDustParticles() {
    this.particles = [];
    const count = Math.min(Math.floor((this.width * this.height) / 1000), 2200);
    for (let i = 0; i < count; i++) {
      // Swirl equation (Archimedean / logarithmic spiral coordinates)
      const angle = Math.random() * Math.PI * 8;
      const radius = Math.pow(Math.random(), 0.6) * (Math.max(this.width, this.height) * 0.7);
      
      this.particles.push({
        angle: angle,
        radius: radius,
        speed: (Math.random() * 0.0004 + 0.0001) * (Math.random() > 0.5 ? 1 : -1),
        baseX: this.width * 0.5 + Math.cos(angle) * radius * 1.2,
        baseY: this.height * 0.45 + Math.sin(angle) * radius * 0.7,
        stippleSize: Math.random() > 0.85 ? 1.5 : 1,
        alpha: Math.random() * 0.55 + 0.15,
        pulseOffset: Math.random() * Math.PI * 2
      });
    }
  }

  /**
   * Draws the authentic 4-pointed radiant cross star from the reference engraving.
   * Long sharp vertical beam, narrower horizontal beam, diamond center flare.
   */
  drawRadiantStar(x, y, length, alpha) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);

    // Subtle radial starlight halo
    const halo = ctx.createRadialGradient(0, 0, 1, 0, 0, length * 1.2);
    halo.addColorStop(0, `rgba(245, 237, 216, ${alpha * 0.4})`);
    halo.addColorStop(0.3, `rgba(224, 203, 150, ${alpha * 0.15})`);
    halo.addColorStop(1, 'rgba(10, 16, 28, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(0, 0, length * 1.2, 0, Math.PI * 2);
    ctx.fill();

    // 4-pointed star shape:
    // Vertical is longer (ratio ~ 1.0), Horizontal is ~ 0.45 of vertical
    const vLen = length;
    const hLen = length * 0.42;
    const core = Math.max(1.8, length * 0.08);

    ctx.fillStyle = `rgba(255, 252, 240, ${alpha * 0.95})`;
    ctx.beginPath();
    // North spike
    ctx.moveTo(0, -vLen);
    ctx.quadraticCurveTo(0, -core, core, 0);
    // East spike
    ctx.quadraticCurveTo(core, 0, hLen, 0);
    ctx.quadraticCurveTo(0, 0, 0, core);
    // South spike
    ctx.quadraticCurveTo(0, core, 0, vLen);
    ctx.quadraticCurveTo(0, core, -core, 0);
    // West spike
    ctx.quadraticCurveTo(-core, 0, -hLen, 0);
    ctx.quadraticCurveTo(0, -core, 0, -vLen);
    ctx.closePath();
    ctx.fill();

    // Secondary subtle micro diamond rotated 45 degrees
    ctx.fillStyle = `rgba(240, 225, 185, ${alpha * 0.4})`;
    const subLen = length * 0.22;
    ctx.beginPath();
    ctx.moveTo(0, -subLen);
    ctx.lineTo(subLen * 0.5, 0);
    ctx.lineTo(0, subLen);
    ctx.lineTo(-subLen * 0.5, 0);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  animate() {
    this.time += 0.015;
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Dark celestial background with slight starlight gradient
    ctx.clearRect(0, 0, w, h);

    // Draw stippled celestial dust particles
    ctx.fillStyle = '#f0e5cf';
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.angle += p.speed;
      
      // Elliptical rotation
      let px = w * 0.5 + Math.cos(p.angle) * p.radius * 1.25;
      let py = h * 0.45 + Math.sin(p.angle) * p.radius * 0.75;

      // Mouse interactive deflection
      const dx = px - this.mouse.x;
      const dy = py - this.mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        const force = (120 - dist) / 120;
        px += (dx / dist) * force * 15;
        py += (dy / dist) * force * 15;
      }

      const pulse = Math.sin(this.time * 2 + p.pulseOffset) * 0.2 + 0.8;
      const finalAlpha = Math.min(1, Math.max(0, p.alpha * pulse));

      ctx.fillStyle = `rgba(242, 235, 218, ${finalAlpha})`;
      ctx.fillRect(px, py, p.stippleSize, p.stippleSize);
    }

    // Draw radiant 4-pointed stars
    for (let i = this.stars.length - 1; i >= 0; i--) {
      const s = this.stars[i];
      const twinkle = Math.sin(this.time * s.twinkleSpeed * 50 + s.twinkleOffset);
      const alpha = Math.max(0.2, Math.min(1.0, s.intensity + twinkle * 0.25));

      this.drawRadiantStar(s.x, s.y, s.size, alpha);

      if (s.isCustom && s.lifespan !== undefined) {
        s.lifespan--;
        if (s.lifespan <= 0) {
          this.stars.splice(i, 1);
        }
      }
    }

    requestAnimationFrame(() => this.animate());
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new CelestialCanvas('celestial-canvas');
});
