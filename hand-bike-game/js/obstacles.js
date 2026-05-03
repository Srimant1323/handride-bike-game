/**
 * obstacles.js — Spawns and draws traffic obstacles in perspective
 */

const TYPES = ['car-blue', 'car-yellow', 'car-white', 'cone', 'truck'];
const LANE_OFFSETS = [-0.28, 0, 0.28]; // fraction of road width

export class ObstacleManager {
  constructor(canvas) {
    this.canvas    = canvas;
    this.obstacles = [];
    this.spawnTimer = 0;
  }

  reset() {
    this.obstacles  = [];
    this.spawnTimer = 0;
  }

  update(speed, score) {
    // Dynamic spawn rate
    this.spawnTimer++;
    const interval = Math.max(28, 90 - Math.floor(score / 200) * 4);
    if (this.spawnTimer >= interval) {
      this._spawn(score);
      this.spawnTimer = 0;
    }

    for (const o of this.obstacles) {
      o.y += speed * (o.type === 'truck' ? 1.1 : 1.5);
    }

    this.obstacles = this.obstacles.filter(o => o.y < this.canvas.height + 100);
  }

  _spawn(score) {
    const W = this.canvas.width;
    // Pick 1 or 2 lanes randomly
    const count = Math.random() < 0.3 + score * 0.0003 ? 2 : 1;
    const lanes = [...LANE_OFFSETS].sort(() => Math.random() - 0.5).slice(0, count);

    for (const lane of lanes) {
      const roadW = W * 0.56;
      const x = W / 2 + lane * roadW + (Math.random() - 0.5) * 20;
      const type = TYPES[Math.floor(Math.random() * TYPES.length)];
      this.obstacles.push({ x, y: -60, type, id: Math.random() });
    }
  }

  draw(ctx, horizon, canvasH) {
    // Sort back-to-front so nearer ones draw on top
    const sorted = [...this.obstacles].sort((a, b) => a.y - b.y);
    for (const o of sorted) {
      const t = Math.max(0, Math.min(1, (o.y - horizon) / (canvasH - horizon)));
      const scale = 0.25 + t * 0.75;
      this._drawObstacle(ctx, o, scale);
    }
  }

  // Axis-aligned hit detection
  checkCollision(bikeBounds) {
    const { x, y, w, h } = bikeBounds;
    for (const o of this.obstacles) {
      const hw = (o.type === 'truck' ? 28 : o.type === 'cone' ? 12 : 22) * 0.8;
      const hh = (o.type === 'truck' ? 60 : o.type === 'cone' ? 20 : 50) * 0.8;
      if (
        x < o.x + hw && x + w > o.x - hw &&
        y < o.y + hh && y + h > o.y - hh
      ) {
        o.y = this.canvas.height + 200; // remove it
        return true;
      }
    }
    return false;
  }

  _drawObstacle(ctx, o, scale) {
    ctx.save();
    ctx.translate(o.x, o.y);
    ctx.scale(scale, scale);

    switch (o.type) {
      case 'car-blue':   this._drawCar(ctx, '#2196f3', '#1565c0', '#64b5f6'); break;
      case 'car-yellow': this._drawCar(ctx, '#ffd600', '#f57f17', '#fff176'); break;
      case 'car-white':  this._drawCar(ctx, '#e0e0e0', '#9e9e9e', '#fff');   break;
      case 'cone':       this._drawCone(ctx);  break;
      case 'truck':      this._drawTruck(ctx); break;
    }

    ctx.restore();
  }

  _drawCar(ctx, body, dark, glass) {
    // Body
    ctx.fillStyle = body;
    ctx.beginPath(); ctx.roundRect(-22, -26, 44, 52, 4); ctx.fill();
    // Roof cabin
    ctx.fillStyle = dark;
    ctx.beginPath(); ctx.roundRect(-16, -24, 32, 22, 3); ctx.fill();
    // Windshield
    ctx.fillStyle = `rgba(${glass},0.55)`;
    ctx.beginPath(); ctx.roundRect(-13, -22, 26, 18, 2); ctx.fill();
    // Wheels
    for (const [wx, wy] of [[-14, 18],[14, 18],[-14,-14],[14,-14]]) {
      ctx.fillStyle = '#111';
      ctx.beginPath(); ctx.ellipse(wx, wy, 7, 5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#444';
      ctx.beginPath(); ctx.ellipse(wx, wy, 4, 3, 0, 0, Math.PI * 2); ctx.fill();
    }
    // Tail lights
    ctx.fillStyle = 'rgba(255,50,50,0.9)';
    ctx.fillRect(-20, 20, 8, 5); ctx.fillRect(12, 20, 8, 5);
    // Headlights
    ctx.fillStyle = 'rgba(255,240,180,0.8)';
    ctx.fillRect(-18, -28, 8, 4); ctx.fillRect(10, -28, 8, 4);
  }

  _drawCone(ctx) {
    ctx.fillStyle = '#ff6600';
    ctx.beginPath();
    ctx.moveTo(0, -22); ctx.lineTo(14, 22); ctx.lineTo(-14, 22); ctx.closePath();
    ctx.fill();
    // White stripe
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(-7, -2); ctx.lineTo(7, -2); ctx.lineTo(9, 6); ctx.lineTo(-9, 6); ctx.closePath();
    ctx.fill();
    // Base
    ctx.fillStyle = '#333';
    ctx.fillRect(-16, 20, 32, 6);
  }

  _drawTruck(ctx) {
    // Cab
    ctx.fillStyle = '#e53935';
    ctx.beginPath(); ctx.roundRect(-24, -30, 48, 34, 4); ctx.fill();
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.roundRect(-18, -28, 36, 22, 3); ctx.fill();
    ctx.fillStyle = 'rgba(100,180,255,0.4)';
    ctx.beginPath(); ctx.roundRect(-15, -26, 30, 16, 2); ctx.fill();
    // Trailer
    ctx.fillStyle = '#b0bec5';
    ctx.fillRect(-24, 6, 48, 58);
    ctx.strokeStyle = '#78909c'; ctx.lineWidth = 1;
    ctx.strokeRect(-24, 6, 48, 58);
    // Logo on trailer
    ctx.fillStyle = '#e63946'; ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center'; ctx.fillText('CARGO', 0, 38); ctx.textAlign = 'left';
    // Wheels
    for (const [wx, wy] of [[-20, 52],[20, 52],[-20, 20],[20, 20]]) {
      ctx.fillStyle = '#111';
      ctx.beginPath(); ctx.ellipse(wx, wy, 9, 6, 0, 0, Math.PI * 2); ctx.fill();
    }
  }
}
