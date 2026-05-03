/**
 * bike.js — Player bike entity: physics + rendering
 */

export class Bike {
  constructor(canvas) {
    this.canvas = canvas;
    this.reset();
  }

  reset() {
    const W = this.canvas.width, H = this.canvas.height;
    this.x     = W / 2;
    this.y     = H - 110;
    this.tilt  = 0;
    this.vx    = 0;
    this.trail = [];   // exhaust particles
    this.boostT = 0;
  }

  update(steer, isFist, isBoost, speed) {
    const W = this.canvas.width;
    const maxX = W * 0.78;
    const minX = W * 0.22;

    this.vx += steer * 3.5;
    this.vx *= 0.78;          // friction
    if (isFist) this.vx *= 0.4;
    this.x = Math.max(minX, Math.min(maxX, this.x + this.vx));

    this.tilt += (steer * 6 - this.tilt) * 0.12;
    this.boostT = isBoost ? Math.min(1, this.boostT + 0.15) : Math.max(0, this.boostT - 0.1);

    // Exhaust particles
    if (Math.random() < 0.6) {
      this.trail.push({
        x: this.x + (Math.random() - 0.5) * 8,
        y: this.y + 30,
        vx: (Math.random() - 0.5) * 1.5,
        vy: 1.5 + Math.random() * 2,
        life: 1,
        r: 3 + Math.random() * 4,
        isBoost
      });
    }
    this.trail = this.trail
      .map(p => ({ ...p, y: p.y + p.vy, x: p.x + p.vx, life: p.life - 0.06 }))
      .filter(p => p.life > 0);
  }

  draw(ctx) {
    // Trail
    for (const p of this.trail) {
      const a = p.life * 0.4;
      ctx.fillStyle = p.isBoost
        ? `rgba(0,170,255,${a})`
        : `rgba(160,80,40,${a})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.tilt * 0.06);

    if (this.boostT > 0) {
      ctx.shadowColor = '#00aaff';
      ctx.shadowBlur  = 24 * this.boostT;
    }

    this._drawBodywork(ctx);
    this._drawWheels(ctx);
    this._drawLights(ctx);
    if (this.boostT > 0) this._drawBoostFlame(ctx);

    ctx.shadowBlur = 0;
    ctx.restore();
  }

  _drawBodywork(ctx) {
    // Main body
    ctx.fillStyle = '#e63946';
    ctx.beginPath();
    ctx.roundRect(-18, -28, 36, 52, 4);
    ctx.fill();

    // Dark lower half
    ctx.fillStyle = '#c1121f';
    ctx.fillRect(-18, 8, 36, 16);

    // Fairing / windshield
    ctx.fillStyle = '#1d3557';
    ctx.beginPath();
    ctx.roundRect(-13, -26, 26, 20, 3);
    ctx.fill();

    ctx.fillStyle = 'rgba(100,200,255,0.35)';
    ctx.beginPath();
    ctx.roundRect(-11, -24, 22, 16, 2);
    ctx.fill();

    // Seat
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.roundRect(-10, -6, 20, 10, 3);
    ctx.fill();

    // Handlebars
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-18, -10); ctx.lineTo(-24, -6); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(18, -10);  ctx.lineTo(24, -6);  ctx.stroke();

    // Number plate
    ctx.fillStyle = '#fff';
    ctx.fillRect(-10, 20, 20, 8);
    ctx.fillStyle = '#000';
    ctx.font = 'bold 6px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('01', 0, 27);
    ctx.textAlign = 'left';
  }

  _drawWheels(ctx) {
    const wY = [22, -22];
    for (const wy of wY) {
      // Tyre
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath(); ctx.ellipse(0, wy, 14, 8, 0, 0, Math.PI * 2); ctx.fill();
      // Rim
      ctx.fillStyle = '#555';
      ctx.beginPath(); ctx.ellipse(0, wy, 8, 4.5, 0, 0, Math.PI * 2); ctx.fill();
      // Hub
      ctx.fillStyle = '#888';
      ctx.beginPath(); ctx.arc(0, wy, 3, 0, Math.PI * 2); ctx.fill();
    }
  }

  _drawLights(ctx) {
    // Headlight
    const pulse = 0.85 + 0.15 * Math.sin(Date.now() * 0.004);
    ctx.fillStyle = `rgba(255,230,100,${pulse})`;
    ctx.beginPath(); ctx.ellipse(0, -32, 7, 4, 0, 0, Math.PI * 2); ctx.fill();
    // Headlight glow
    ctx.fillStyle = `rgba(255,220,80,0.15)`;
    ctx.beginPath(); ctx.ellipse(0, -38, 12, 8, 0, 0, Math.PI * 2); ctx.fill();

    // Tail light
    ctx.fillStyle = `rgba(255,40,40,0.9)`;
    ctx.fillRect(-6, 24, 5, 4);
    ctx.fillRect(1,  24, 5, 4);
  }

  _drawBoostFlame(ctx) {
    const t = this.boostT;
    const flicker = 0.7 + Math.random() * 0.3;
    ctx.fillStyle = `rgba(0,170,255,${t * flicker * 0.9})`;
    ctx.beginPath();
    ctx.moveTo(-8, 28);
    ctx.lineTo(8, 28);
    ctx.lineTo(4, 28 + 18 * t + Math.random() * 8);
    ctx.lineTo(0, 28 + 24 * t + Math.random() * 6);
    ctx.lineTo(-4, 28 + 18 * t + Math.random() * 8);
    ctx.closePath();
    ctx.fill();
    // Inner white core
    ctx.fillStyle = `rgba(180,230,255,${t * 0.6})`;
    ctx.beginPath();
    ctx.moveTo(-4, 28); ctx.lineTo(4, 28); ctx.lineTo(0, 28 + 12 * t); ctx.closePath(); ctx.fill();
  }

  getBounds() {
    return { x: this.x - 16, y: this.y - 24, w: 32, h: 50 };
  }
}
