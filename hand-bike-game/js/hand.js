/**
 * hand.js — MediaPipe Hands wrapper
 * Detects gestures and calls onGesture(steer, isFist, isBoost)
 */

export class HandTracker {
  constructor({ videoEl, overlayCanvas, onGesture, onStatus }) {
    this.video      = videoEl;
    this.overlay    = overlayCanvas;
    this.ctx        = overlayCanvas.getContext('2d');
    this.onGesture  = onGesture;
    this.onStatus   = onStatus;
    this.active     = false;
  }

  async start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: 'user' }
      });
      this.video.srcObject = stream;
      this.onStatus('Loading hand model…');

      const hands = new Hands({
        locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 0,
        minDetectionConfidence: 0.65,
        minTrackingConfidence: 0.55
      });

      hands.onResults(res => this._onResults(res));

      const camera = new Camera(this.video, {
        onFrame: async () => { await hands.send({ image: this.video }); },
        width: 320, height: 240
      });

      await camera.start();
      this.active = true;
      this.onStatus('Show your hand to start!');
    } catch (e) {
      this.onStatus('Camera error — allow access and refresh.');
      console.error(e);
    }
  }

  _onResults(res) {
    this.ctx.clearRect(0, 0, this.overlay.width, this.overlay.height);

    if (!res.multiHandLandmarks || res.multiHandLandmarks.length === 0) {
      this.onGesture(null);
      return;
    }

    const lm = res.multiHandLandmarks[0];
    this._drawSkeleton(lm);

    // ── Gesture logic ──
    const wrist    = lm[0];
    const indexTip = lm[8],  middleTip = lm[12];
    const ringTip  = lm[16], pinkyTip  = lm[20];
    const indexMCP = lm[5],  middleMCP = lm[9];
    const ringMCP  = lm[13], pinkyMCP  = lm[17];

    // Steer = horizontal wrist position (mirrored)
    const steer = Math.max(-1, Math.min(1, (wrist.x - 0.5) * 3));

    // Count extended fingers
    const tips = [indexTip, middleTip, ringTip, pinkyTip];
    const mcps = [indexMCP, middleMCP, ringMCP, pinkyMCP];
    const extended = tips.filter((t, i) => t.y < mcps[i].y - 0.05).length;

    const isFist  = extended === 0;
    const isBoost = extended >= 4;

    this.onGesture({ steer: isFist ? 0 : steer, isFist, isBoost });
  }

  _drawSkeleton(lm) {
    const W = this.overlay.width, H = this.overlay.height;
    const cx = this.ctx;
    const px = (pt) => [(1 - pt.x) * W, pt.y * H];

    const CONNECTIONS = [
      [0,1],[1,2],[2,3],[3,4],
      [0,5],[5,6],[6,7],[7,8],
      [0,9],[9,10],[10,11],[11,12],
      [0,13],[13,14],[14,15],[15,16],
      [0,17],[17,18],[18,19],[19,20],
      [5,9],[9,13],[13,17]
    ];

    cx.strokeStyle = 'rgba(0,255,136,0.65)';
    cx.lineWidth   = 1.5;
    for (const [a, b] of CONNECTIONS) {
      cx.beginPath();
      cx.moveTo(...px(lm[a]));
      cx.lineTo(...px(lm[b]));
      cx.stroke();
    }

    for (const pt of lm) {
      const [x, y] = px(pt);
      cx.fillStyle = '#00ff88';
      cx.beginPath(); cx.arc(x, y, 3, 0, Math.PI * 2); cx.fill();
    }
  }
}
