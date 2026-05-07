# 🏍️ HandRide — Gesture Controlled Bike Racing Game

> *"I didn't want to install a game — so I built my own, and made it controllable with just my hand."*

![HandRide](https://img.shields.io/badge/HandRide-Gesture%20Controlled%20Game-e63946?style=for-the-badge)
![MediaPipe](https://img.shields.io/badge/MediaPipe-Hand%20Tracking-00aaff?style=for-the-badge)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6%20Modules-ffd60a?style=for-the-badge)
![No Install](https://img.shields.io/badge/No%20Install-Runs%20in%20Browser-00ff88?style=for-the-badge)

---

## 💡 The Idea

I'm an M.Tech Bioinformatics student — and like most people, I love games. But I didn't want to download and install one. So I thought — *what if I just build one myself, right in the browser, and control it with my bare hands?*

No game engine. No game design background. Just curiosity, a webcam, and the idea that your hand should be enough of a controller.

That's how **HandRide** was born — a browser-based bike racing game where your hand movements control everything. Tilt your palm to steer, make a fist to brake, and raise all fingers to boost. No keyboard required (though it works as fallback too).

---

## 🎮 What It Does

- A bike races down an endless procedurally generated road
- Your **webcam** watches your hand in real time using **MediaPipe AI**
- The AI tracks **21 landmarks** on your hand — knuckles, fingertips, wrist — at 30+ frames per second
- Your hand movements are translated instantly into game controls
- Dodge cars, cones, and trucks — survive as long as possible, score as high as you can

---

## ✋ Hand Gesture Controls

| Gesture | Action | How It Works |
|--------|--------|--------------|
| ✋ Tilt open palm left | Steer Left | Wrist X-position < center |
| ✋ Tilt open palm right | Steer Right | Wrist X-position > center |
| ✊ Make a fist | Brake | All 4 fingertips below knuckles |
| 🤚 All fingers extended up | BOOST 🔵 | All 4 fingertips above knuckles |

**Keyboard fallback (no camera needed):**

| Key | Action |
|-----|--------|
| ← → Arrow keys | Steer |
| ↓ Arrow | Brake |
| ↑ Arrow | Boost |

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **HTML5 Canvas API** | Game rendering — road, bike, obstacles, effects |
| **MediaPipe Hands** | Real-time hand landmark detection via webcam |
| **Vanilla JavaScript (ES6 Modules)** | Game logic, physics, gesture parsing |
| **CSS3** | Dark racing UI, animations, HUD |
| **No frameworks. No dependencies to install.** | Runs entirely in the browser |

---

## 📁 Project Structure

```
handride-bike-game/
├── index.html          ← Entry point — all screens (menu, game, game over)
├── README.md           ← You are here
├── css/
│   └── style.css       ← Full dark racing theme, animations, HUD styles
└── js/
    ├── main.js         ← Game loop, screen manager, keyboard fallback
    ├── hand.js         ← MediaPipe wrapper + gesture detection logic
    ├── bike.js         ← Bike physics, drawing, boost flame, exhaust particles
    ├── road.js         ← Perspective road, stars, lane dashes, rumble strips
    ├── obstacles.js    ← Car/cone/truck spawning, scaling & collision detection
    └── hud.js          ← Live DOM HUD updates, hit flash overlay
```

---

## 🚀 How to Run Locally

> ⚠️ **Must be served over HTTP** — camera access doesn't work from `file://`

**Option 1 — Python (simplest):**
```bash
cd handride-bike-game
python -m http.server 8080
# Open http://localhost:8080 in Chrome
```

**Option 2 — Node.js:**
```bash
npx serve .
```

**Option 3 — VS Code Live Server:**
- Install the **Live Server** extension
- Right-click `index.html` → **Open with Live Server**

---

## 🌐 Live Demo

Deployed on Netlify — just open the link, allow camera, and play. No installation whatsoever.

> 🔗 **[Play HandRide Live →](#)**  (https://neurorash.netlify.app/)

---

## 🧠 How the Hand Tracking Works

MediaPipe Hands runs a neural network inside your browser that detects a hand from the webcam feed and returns 21 3D landmark coordinates — every joint of every finger, plus the wrist.

```
Landmarks used in HandRide:
  Wrist [0]          → horizontal position = steer direction
  Index tip [8]      → extended upward = not fist
  Middle tip [12]    → extended upward = not fist
  Ring tip [16]      → extended upward = not fist
  Pinky tip [20]     → extended upward = not fist

  All tips below knuckles → FIST (brake)
  All tips above knuckles → OPEN PALM (boost)
  Wrist X offset from center → steering angle
```

This is the same family of techniques used in sign language recognition, AR filters, and surgical robotics — just repurposed here for a fun bike game.

---

## 🎯 Game Features

- Endless procedurally generated perspective road with stars, horizon glow, and rumble strips
- 5 obstacle types: blue car, yellow car, white car, traffic cone, heavy truck
- Dynamic difficulty — speed and spawn rate increase as score climbs
- 3 lives with post-hit invincibility frames (bike blinks)
- Boost mode — blue flame exhaust trail, speed multiplier
- Exhaust particle system on the bike
- Score saved to localStorage — best score persists across sessions
- Full keyboard fallback — playable without a camera

---

## 🔧 Browser Requirements

- **Chrome 88+** or **Edge 88+** (recommended)
- Webcam / camera access
- Internet connection on first load (MediaPipe loads from CDN)
- Works on desktop and laptop — not optimised for mobile

---

## 👤 About the Creator

Built by an **M.Tech Bioinformatics** student who wanted to play a game without installing one — so built it instead, and made it hand-controlled just because it sounded cool.

This project sits at the intersection of **computer vision** and **interactive software** — two fields increasingly relevant in bioinformatics too (think: microscopy image analysis, structural protein visualization, medical imaging).

---

## 📄 License

This project is open source and free to use, modify, and share.

---

*Made with curiosity, a webcam, and zero game design experience.* 🤙
