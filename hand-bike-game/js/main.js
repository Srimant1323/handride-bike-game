/**
 * main.js — Entry point, screen management, game loop
 */

import { HandTracker }    from './hand.js';
import { Road }           from './road.js';
import { Bike }           from './bike.js';
import { ObstacleManager} from './obstacles.js';
import { HUD }            from './hud.js';

// ── Screens ──────────────────────────────────────────────────────────────────
const screens = {
  load:     document.getElementById('loadScreen'),
  menu:     document.getElementById('menuScreen'),
  game:     document.getElementById('gameScreen'),
  gameOver: document.getElementById('gameOverScreen'),
};
function show(name) {
  for (const [k, el] of Object.entries(screens)) {
    el.classList.toggle('hidden', k !== name);
  }
}

// ── Loading sequence ──────────────────────────────────────────────────────────
const loadBar = document.getElementById('loadBar');
const loadMsg = document.getElementById('loadMsg');
const LOAD_STEPS = [
  [20,  'Loading renderer…'],
  [45,  'Preparing road assets…'],
  [70,  'Warming up engine…'],
  [90,  'Ready!'],
];
let loadIdx = 0;
function advanceLoad() {
  if (loadIdx >= LOAD_STEPS.length) {
    setTimeout(() => show('menu'), 300);
    return;
  }
  const [pct, msg] = LOAD_STEPS[loadIdx++];
  loadBar.style.width = pct + '%';
  loadMsg.textContent = msg;
  setTimeout(advanceLoad, 380 + Math.random() * 200);
}
setTimeout(advanceLoad, 300);

// ── Canvas setup ──────────────────────────────────────────────────────────────
const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');

// Set initial canvas size before creating game objects
canvas.width  = window.innerWidth;
canvas.height = window.innerHeight;

// ── Game objects ──────────────────────────────────────────────────────────────
const road      = new Road(canvas);
const bike      = new Bike(canvas);
const obstacles = new ObstacleManager(canvas);
const hud       = new HUD();

// ── Resize handler (road now exists) ─────────────────────────────────────────
function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  road.horizon  = canvas.height * 0.38;
}
window.addEventListener('resize', resizeCanvas);

// ── Hand tracker ──────────────────────────────────────────────────────────────
const handTracker = new HandTracker({
  videoEl:       document.getElementById('webcam'),
  overlayCanvas: document.getElementById('handCanvas'),
  onGesture:     (g) => { gesture = g; },
  onStatus:      (s) => { document.querySelector('.cam-note').textContent = s; },
});

// ── Game state ────────────────────────────────────────────────────────────────
let gameRunning = false;
let score       = 0;
let speed       = 4;       // base pixels/frame
let lives       = 3;
let gesture     = null;    // { steer, isFist, isBoost } or null
let bestScore   = parseInt(localStorage.getItem('handride_best') || '0', 10);
let invincible  = 0;       // frames of post-hit invincibility
let rafId       = null;

function gestureLabel(g) {
  if (!g) return 'NO HAND';
  if (g.isFist)  return 'BRAKE ✊';
  if (g.isBoost) return 'BOOST 🤚';
  if (g.steer < -0.25) return '← LEFT';
  if (g.steer >  0.25) return 'RIGHT →';
  return 'CENTER ✋';
}

// ── Game loop ─────────────────────────────────────────────────────────────────
function gameLoop() {
  rafId = requestAnimationFrame(gameLoop);
  if (!gameRunning) return;

  // Parse gesture
  const steer  = gesture ? gesture.steer  : 0;
  const isFist = gesture ? gesture.isFist : false;
  const isBoost= gesture ? gesture.isBoost: false;

  // Speed dynamics
  speed = Math.min(18, 4 + score * 0.0018);
  if (isBoost)  speed = Math.min(22, speed * 1.4);
  if (isFist)   speed = Math.max(1.5, speed * 0.6);

  // Update systems
  road.update(speed);
  bike.update(steer, isFist, isBoost, speed);
  obstacles.update(speed, score);

  // Collision
  if (invincible <= 0) {
    const hit = obstacles.checkCollision(bike.getBounds());
    if (hit) {
      lives--;
      invincible = 90;
      hud.triggerHit();
      if (lives <= 0) endGame();
    }
  } else {
    invincible--;
  }

  // Score
  score += Math.round(speed * 0.12);

  // Draw
  road.draw(ctx);
  obstacles.draw(ctx, road.horizon, canvas.height);

  // Invincibility blink
  if (invincible <= 0 || Math.floor(invincible / 6) % 2 === 0) {
    bike.draw(ctx);
  }

  // HUD
  hud.update({
    score,
    speed: speed * 15,
    lives,
    steer,
    isFist,
    isBoost,
    gesture: gestureLabel(gesture),
  });

  // Keyboard fallback
  hud.update({ score, speed: speed * 15, lives, steer: _kb.steer, isFist: _kb.brake, isBoost: _kb.boost, gesture: gesture ? gestureLabel(gesture) : _kb.label });
}

// ── Keyboard fallback (arrow keys) ───────────────────────────────────────────
const _kb = { steer: 0, brake: false, boost: false, label: 'KEYBOARD' };
const _keys = new Set();
window.addEventListener('keydown', e => _keys.add(e.key));
window.addEventListener('keyup',   e => _keys.delete(e.key));
setInterval(() => {
  if (gesture) return; // hand takes priority
  _kb.steer = _keys.has('ArrowLeft') ? -1 : _keys.has('ArrowRight') ? 1 : 0;
  _kb.brake  = _keys.has('ArrowDown');
  _kb.boost  = _keys.has('ArrowUp');
  _kb.label  = _kb.brake ? 'BRAKE ↓' : _kb.boost ? 'BOOST ↑' : _kb.steer < 0 ? '← LEFT' : _kb.steer > 0 ? 'RIGHT →' : 'CENTER';
  // inject as gesture
  if (_keys.size > 0) {
    gesture = { steer: _kb.steer, isFist: _kb.brake, isBoost: _kb.boost };
  } else {
    gesture = null;
  }
}, 16);

// ── Lifecycle helpers ─────────────────────────────────────────────────────────
function startGame() {
  score = 0; lives = 3; speed = 4; invincible = 0;
  bike.reset();
  obstacles.reset();
  gameRunning = true;
  show('game');
  if (!rafId) gameLoop();
}

function endGame() {
  gameRunning = false;
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem('handride_best', bestScore);
  }
  document.getElementById('goScore').textContent = score;
  document.getElementById('goBest').textContent  = bestScore;
  setTimeout(() => show('gameOver'), 600);
}

// ── Button wiring ─────────────────────────────────────────────────────────────
document.getElementById('startBtn').addEventListener('click', async () => {
  document.getElementById('startBtn').textContent = 'Connecting camera…';
  document.getElementById('startBtn').disabled = true;
  await handTracker.start();
  startGame();
});

document.getElementById('replayBtn').addEventListener('click', () => startGame());

document.getElementById('menuBtn').addEventListener('click', () => {
  gameRunning = false;
  show('menu');
  document.getElementById('startBtn').textContent = 'ENABLE CAMERA & START';
  document.getElementById('startBtn').disabled = false;
});

// Kick off render loop (idle, road draws even on menu once game screen shown)
gameLoop();
