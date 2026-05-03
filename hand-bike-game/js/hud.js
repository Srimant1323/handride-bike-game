/**
 * hud.js — Updates DOM-based HUD elements and hit flash effect
 */

export class HUD {
  constructor() {
    this.scoreEl  = document.getElementById('hudScore');
    this.speedEl  = document.getElementById('hudSpeed');
    this.livesEl  = document.getElementById('hudLives');
    this.steerKnob = document.getElementById('steerKnob');
    this.gestureEl = document.getElementById('gestureTag');
    this.hitAlpha  = 0;
    this._hitOverlay = this._createHitOverlay();
  }

  _createHitOverlay() {
    const div = document.createElement('div');
    div.style.cssText = `
      position: fixed; inset: 0; pointer-events: none;
      background: rgba(230,57,70,0); z-index: 50;
      transition: background 0.05s linear;
    `;
    document.getElementById('gameScreen').appendChild(div);
    return div;
  }

  update({ score, speed, lives, steer, isFist, isBoost, gesture }) {
    this.scoreEl.textContent = score;
    this.speedEl.innerHTML   = `${Math.round(speed)} <small>km/h</small>`;

    const hearts = '♥ '.repeat(lives) + '♡ '.repeat(Math.max(0, 3 - lives));
    this.livesEl.textContent = hearts.trim();
    this.livesEl.style.color = lives <= 1 ? '#e63946' : '#f0f0f0';

    // Steer knob (50% = centre)
    const pct = ((steer + 1) / 2) * 100;
    this.steerKnob.style.left = `${pct}%`;
    this.steerKnob.style.background = isFist ? '#ff6600' : isBoost ? '#00aaff' : '#00ff88';
    this.steerKnob.style.boxShadow  = `0 0 8px ${isFist ? '#ff6600' : isBoost ? '#00aaff' : '#00ff88'}`;

    this.gestureEl.textContent = gesture;
    this.gestureEl.style.color = isFist ? '#ff9900' : isBoost ? '#00aaff' : '#00ff88';
  }

  triggerHit() {
    this.hitAlpha = 1;
    this._hitOverlay.style.background = 'rgba(230,57,70,0.45)';
    clearTimeout(this._hitTimer);
    this._hitTimer = setTimeout(() => {
      this._hitOverlay.style.background = 'rgba(230,57,70,0)';
    }, 120);
  }
}
