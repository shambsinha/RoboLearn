import React, { useEffect, useRef, useCallback } from 'react';

/* ═══════════════════════════════════════════════════════════════════════
 *  PREMIUM AMBIENT BACKGROUND — with Dynamic Effects
 *
 *  Canvas layer:
 *  • Flowing aurora ribbons (smooth bezier gradient streams)
 *  • Pulsing dot grid with glowing intersections
 *  • Interactive mouse glow trail
 *
 *  CSS layer:
 *  • Animated gradient mesh blobs
 *  • Film grain texture
 *  • Vignette
 * ═══════════════════════════════════════════════════════════════════════ */

const rgba = (r, g, b, a) => `rgba(${r},${g},${b},${a})`;
const lerp = (a, b, t) => a + (b - a) * t;

// ── Aurora Ribbon Config ─────────────────────────────────────────────
const RIBBONS = [
  { y: 0.22, amp: 60,  speed: 0.15, width: 180, r: 99,  g: 102, b: 241, alpha: 0.07, phase: 0 },
  { y: 0.45, amp: 45,  speed: 0.12, width: 220, r: 6,   g: 182, b: 212, alpha: 0.05, phase: 2 },
  { y: 0.68, amp: 55,  speed: 0.18, width: 160, r: 139, g: 92,  b: 246, alpha: 0.06, phase: 4 },
  { y: 0.35, amp: 40,  speed: 0.10, width: 200, r: 6,   g: 182, b: 212, alpha: 0.04, phase: 1 },
  { y: 0.80, amp: 50,  speed: 0.14, width: 140, r: 99,  g: 102, b: 241, alpha: 0.05, phase: 3 },
];

// ── Grid Config ──────────────────────────────────────────────────────
const GRID = { spacing: 40, dotSize: 0.8, glowChance: 0.003, glowRadius: 20 };

export default function NeuralBackground() {
  const canvasRef = useRef(null);
  const spotlightRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000, tx: -1000, ty: -1000 });
  const glowNodes = useRef([]);

  const animate = useCallback(() => {/* handled inside useEffect */}, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w, h, raf;

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    // ── Draw aurora ribbon ───────────────────────────────────────────
    function drawRibbon(ribbon, t) {
      const segments = 8;
      const points = [];
      for (let i = 0; i <= segments; i++) {
        const frac = i / segments;
        const x = frac * (w + 200) - 100;
        const baseY = ribbon.y * h;
        const wave1 = Math.sin(frac * Math.PI * 2 + t * ribbon.speed + ribbon.phase) * ribbon.amp;
        const wave2 = Math.sin(frac * Math.PI * 3.7 + t * ribbon.speed * 0.7 + ribbon.phase * 1.3) * ribbon.amp * 0.4;
        const wave3 = Math.cos(frac * Math.PI * 1.3 + t * ribbon.speed * 1.2) * ribbon.amp * 0.2;
        points.push({ x, y: baseY + wave1 + wave2 + wave3 });
      }

      // Draw the ribbon as a thick gradient path
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      // Multiple passes for glow depth
      const passes = [
        { width: ribbon.width * 1.8, alpha: ribbon.alpha * 0.2 },
        { width: ribbon.width * 1.2, alpha: ribbon.alpha * 0.5 },
        { width: ribbon.width * 0.6, alpha: ribbon.alpha * 1.0 },
      ];

      for (const pass of passes) {
        ctx.lineWidth = pass.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Create gradient along the ribbon
        const grad = ctx.createLinearGradient(0, 0, w, 0);
        grad.addColorStop(0, rgba(ribbon.r, ribbon.g, ribbon.b, 0));
        grad.addColorStop(0.2, rgba(ribbon.r, ribbon.g, ribbon.b, pass.alpha));
        grad.addColorStop(0.5, rgba(ribbon.r, ribbon.g, ribbon.b, pass.alpha * 1.3));
        grad.addColorStop(0.8, rgba(ribbon.r, ribbon.g, ribbon.b, pass.alpha));
        grad.addColorStop(1, rgba(ribbon.r, ribbon.g, ribbon.b, 0));
        ctx.strokeStyle = grad;

        // Draw smooth curve through points
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length - 1; i++) {
          const cpx = (points[i].x + points[i + 1].x) / 2;
          const cpy = (points[i].y + points[i + 1].y) / 2;
          ctx.quadraticCurveTo(points[i].x, points[i].y, cpx, cpy);
        }
        const last = points[points.length - 1];
        ctx.lineTo(last.x, last.y);
        ctx.stroke();
      }

      ctx.restore();
    }

    // ── Draw pulsing grid ────────────────────────────────────────────
    function drawGrid(t) {
      const sp = GRID.spacing;
      const cols = Math.ceil(w / sp) + 1;
      const rows = Math.ceil(h / sp) + 1;

      // Base dots
      ctx.fillStyle = rgba(255, 255, 255, 0.025);
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const x = c * sp, y = r * sp;
          // Fade at edges
          const ex = Math.min(x, w - x) / 200;
          const ey = Math.min(y, h - y) / 200;
          const edgeFade = Math.min(1, Math.min(ex, ey));
          if (edgeFade < 0.05) continue;

          ctx.globalAlpha = edgeFade;
          ctx.beginPath();
          ctx.arc(x, y, GRID.dotSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      // Spawn random glow nodes
      if (Math.random() < GRID.glowChance * (cols * rows) * 0.01) {
        const gc = Math.floor(Math.random() * cols);
        const gr = Math.floor(Math.random() * rows);
        glowNodes.current.push({
          x: gc * sp, y: gr * sp,
          birth: t, life: 2 + Math.random() * 2,
          color: Math.random() > 0.5 ? [99, 102, 241] : [6, 182, 212],
        });
      }

      // Render glow nodes
      ctx.globalCompositeOperation = 'lighter';
      glowNodes.current = glowNodes.current.filter(n => {
        const age = t - n.birth;
        if (age > n.life) return false;
        const progress = age / n.life;
        const intensity = progress < 0.3
          ? progress / 0.3
          : 1 - (progress - 0.3) / 0.7;

        const gr = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, GRID.glowRadius);
        gr.addColorStop(0, rgba(n.color[0], n.color[1], n.color[2], intensity * 0.25));
        gr.addColorStop(0.5, rgba(n.color[0], n.color[1], n.color[2], intensity * 0.08));
        gr.addColorStop(1, 'transparent');
        ctx.fillStyle = gr;
        ctx.fillRect(n.x - GRID.glowRadius, n.y - GRID.glowRadius, GRID.glowRadius * 2, GRID.glowRadius * 2);

        // Bright center dot
        ctx.fillStyle = rgba(n.color[0], n.color[1], n.color[2], intensity * 0.6);
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.5, 0, Math.PI * 2);
        ctx.fill();

        return true;
      });
      ctx.globalCompositeOperation = 'source-over';
    }

    // ── Draw mouse glow ──────────────────────────────────────────────
    function drawMouseGlow() {
      const m = mouseRef.current;
      m.x = lerp(m.x, m.tx, 0.08);
      m.y = lerp(m.y, m.ty, 0.08);

      if (m.tx < -500) return;

      ctx.globalCompositeOperation = 'lighter';
      const gr = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 350);
      gr.addColorStop(0, rgba(99, 102, 241, 0.08));
      gr.addColorStop(0.3, rgba(6, 182, 212, 0.03));
      gr.addColorStop(1, 'transparent');
      ctx.fillStyle = gr;
      ctx.fillRect(m.x - 350, m.y - 350, 700, 700);
      ctx.globalCompositeOperation = 'source-over';
    }

    // ── Animation loop ───────────────────────────────────────────────
    function frame(timestamp) {
      const t = timestamp * 0.001;
      ctx.clearRect(0, 0, w, h);

      // Grid (deep layer)
      drawGrid(t);

      // Aurora ribbons
      for (const ribbon of RIBBONS) {
        drawRibbon(ribbon, t);
      }

      // Mouse glow
      drawMouseGlow();

      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    // ── Events ───────────────────────────────────────────────────────
    const onMouse = (e) => {
      mouseRef.current.tx = e.clientX;
      mouseRef.current.ty = e.clientY;
    };
    const onResize = () => resize();

    window.addEventListener('mousemove', onMouse, { passive: true });
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 overflow-hidden"
      style={{ pointerEvents: 'none' }}
    >
      {/* L0 — Deep base gradient */}
      <div className="ambient-base" />

      {/* L1 — Animated gradient mesh blobs */}
      <div className="ambient-blob ambient-blob-1" />
      <div className="ambient-blob ambient-blob-2" />
      <div className="ambient-blob ambient-blob-3" />
      <div className="ambient-blob ambient-blob-4" />

      {/* L2 — Canvas effects (aurora + grid + mouse glow) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ pointerEvents: 'none' }}
      />

      {/* L3 — Film grain */}
      <div className="ambient-grain" />

      {/* L4 — Vignette */}
      <div className="ambient-vignette" />
    </div>
  );
}
