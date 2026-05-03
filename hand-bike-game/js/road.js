/**
 * road.js — Draws the perspective road, sky, and lane markings
 */

export class Road {
  constructor(canvas) {
    this.canvas = canvas;
    this.scroll = 0;
    this.horizon = canvas.height * 0.38;
  }

  update(speed) {
    this.scroll += speed;
  }

  draw(ctx) {
    const W = this.canvas.width, H = this.canvas.height;
    const hz = this.horizon;
    const cx = W / 2;

    // ── Sky ──
    const skyGrad = ctx.createLinearGradient(0, 0, 0, hz);
    skyGrad.addColorStop(0, '#04041a');
    skyGrad.addColorStop(1, '#100c40');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, hz + 2);

    // Stars
    this._drawStars(ctx, W, hz);

    // Horizon glow
    ctx.fillStyle = 'rgba(230,57,70,0.18)';
    ctx.fillRect(0, hz - 4, W, 8);

    // ── Road surface ──
    const roadGrad = ctx.createLinearGradient(0, hz, 0, H);
    roadGrad.addColorStop(0, '#1c1c3a');
    roadGrad.addColorStop(1, '#0d0d22');
    ctx.fillStyle = roadGrad;
    ctx.beginPath();
    ctx.moveTo(cx - 60, hz);
    ctx.lineTo(0, H);
    ctx.lineTo(W, H);
    ctx.lineTo(cx + 60, hz);
    ctx.closePath();
    ctx.fill();

    // ── Road edges (kerb lines) ──
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 60, hz); ctx.lineTo(0, H); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 60, hz); ctx.lineTo(W, H); ctx.stroke();

    // ── Lane dashes ──
    this._drawLanes(ctx, W, H, hz, cx);

    // ── Ground outside road ──
    ctx.fillStyle = '#080814';
    ctx.fillRect(0, hz, W, H);
    // overdraw with road on top (already done) — fill sides only
    ctx.fillStyle = '#080814';
    ctx.beginPath(); ctx.moveTo(0, hz); ctx.lineTo(cx - 60, hz); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(W, hz); ctx.lineTo(cx + 60, hz); ctx.lineTo(W, H); ctx.closePath(); ctx.fill();

    // ── Rumble strips ──
    this._drawRumble(ctx, W, H, hz, cx);
  }

  _drawStars(ctx, W, hz) {
    if (!this._stars) {
      this._stars = Array.from({ length: 80 }, () => ({
        x: Math.random() * W,
        y: Math.random() * hz * 0.9,
        r: Math.random() * 1.2 + 0.3
      }));
    }
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    for (const s of this._stars) {
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
    }
  }

  _drawLanes(ctx, W, H, hz, cx) {
    const NUM_LANES = 2; // divide road into 3 lanes with 2 dashes
    for (let lane = 1; lane <= NUM_LANES; lane++) {
      const SEGS = 14;
      for (let i = 0; i < SEGS; i++) {
        const t0 = ((i / SEGS) + this.scroll * 0.0018) % 1;
        const t1 = (((i + 0.4) / SEGS) + this.scroll * 0.0018) % 1;
        if (t0 > t1) continue;

        const lerp = (a, b, t) => a + (b - a) * t;
        const roadW = (t) => (cx - 60) * (1 - t) * 2 + 120;
        const laneF = lane / (NUM_LANES + 1);

        const x0 = cx - roadW(t0) / 2 + roadW(t0) * laneF;
        const y0 = lerp(hz, H, t0);
        const x1 = cx - roadW(t1) / 2 + roadW(t1) * laneF;
        const y1 = lerp(hz, H, t1);

        ctx.strokeStyle = 'rgba(255,220,50,0.45)';
        ctx.lineWidth = 1 + t0 * 3;
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      }
    }
  }

  _drawRumble(ctx, W, H, hz, cx) {
    const SEGS = 24;
    for (let i = 0; i < SEGS; i++) {
      const t = ((i / SEGS) + this.scroll * 0.0022) % 1;
      if (i % 2 !== 0) continue;
      const lerp = (a, b, t) => a + (b - a) * t;
      const roadW = (cx - 60) * (1 - t) * 2 + 120;
      const y = lerp(hz, H, t);
      const lx = cx - roadW / 2;
      const rx = cx + roadW / 2;
      const segH = (H - hz) / SEGS;

      ctx.fillStyle = 'rgba(230,57,70,0.55)';
      ctx.fillRect(lx - 6, y, 6, segH * 0.4);
      ctx.fillRect(rx, y, 6, segH * 0.4);
    }
  }
}
