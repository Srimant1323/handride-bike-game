# 🏍️ HandRide — Gesture Controlled Bike Game

Control a racing bike with your bare hands using your webcam and MediaPipe AI hand tracking.

## Project Structure

```
hand-bike-game/
├── index.html          ← Main entry point
├── css/
│   └── style.css       ← All styles (dark racing theme)
└── js/
    ├── main.js         ← Game loop, screen management, keyboard fallback
    ├── hand.js         ← MediaPipe Hands wrapper + gesture detection
    ├── road.js         ← Perspective road renderer
    ├── bike.js         ← Player bike physics + drawing
    ├── obstacles.js    ← Obstacle spawning + collision detection
    └── hud.js          ← DOM HUD updates + hit flash
```

## How to Run

> **You MUST serve this over HTTP** — ES modules and camera access won't work from `file://`.

### Option 1 — VS Code Live Server
1. Install the **Live Server** extension
2. Right-click `index.html` → **Open with Live Server**

### Option 2 — Python (built-in)
```bash
cd hand-bike-game
python -m http.server 8080
# Open http://localhost:8080
```

### Option 3 — Node.js
```bash
npx serve .
```

## Controls

| Gesture | Action |
|---------|--------|
| ✋ Tilt open palm left/right | Steer |
| ✊ Make a fist | Brake |
| 🤚 All 5 fingers extended upward | BOOST (blue flame!) |

**Keyboard fallback (no camera needed):**
| Key | Action |
|-----|--------|
| ← → Arrow keys | Steer |
| ↓ Arrow | Brake |
| ↑ Arrow | Boost |

## Tips
- Make sure your hand is **well-lit** and fully visible in the camera box
- The small webcam preview (top-right) shows the green hand skeleton when tracking
- Speed and obstacle density increase as your score climbs
- You have **3 lives** — brief invincibility after each hit

## Browser Requirements
- Chrome 88+ or Edge 88+ (for ES modules + camera)
- Allow camera permission when prompted
- MediaPipe loads from CDN on first run (needs internet)
