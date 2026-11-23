"use client";

import { useEffect, useRef } from "react";

type Arrow = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  spin: number;
  size: number;
  phase: number;
  color: string;
  trail: Array<{ x: number; y: number }>;
};

type RectShape = {
  x: number;
  y: number;
  w: number;
  h: number;
  phase: number;
  speed: number;
  color: string;
};

const ARROW_PHASE_SECONDS = 2.6;
const ARROW_FADE_SECONDS = 0.4;

export default function AnimationBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      canvas.style.display = "none";
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    let frame = 0;
    let startTime = 0;
    let raf = 0;
    let introFinished = false;
    let introFallbackTimer = 0;

    const finishArrowIntro = () => {
      if (introFinished) return;
      introFinished = true;
      window.clearTimeout(introFallbackTimer);
      document.documentElement.classList.remove("intro-arrows");
      document.dispatchEvent(new Event("portfolio-intro:ready"));
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });

    const compact = width < 700;
    const arrowCount = compact ? 10 : 22;
    const arrows: Arrow[] = Array.from({ length: arrowCount }, (_, index) => {
      const speed = 18 + Math.random() * 34;
      const angle = Math.random() * Math.PI * 2;
      return {
        x: width * (0.12 + Math.random() * 0.76),
        y: height * (0.12 + Math.random() * 0.76),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        angle: angle + Math.PI / 2,
        spin: (Math.random() - 0.5) * 1.8,
        size: 4 + Math.random() * (compact ? 5 : 8),
        phase: Math.random() * Math.PI * 2,
        color: index % 7 === 0 ? "#ff5267" : index % 3 === 0 ? "#f7fbff" : "#69d8e7",
        trail: [],
      };
    });

    const rectCount = compact ? 4 : 8;
    const shapes: RectShape[] = Array.from({ length: rectCount }, (_, index) => ({
      x: (0.08 + Math.random() * 0.55) * width,
      y: (0.12 + Math.random() * 0.7) * height,
      w: (compact ? 70 : 110) + Math.random() * (compact ? 150 : 230),
      h: (compact ? 45 : 70) + Math.random() * (compact ? 100 : 150),
      phase: index * 0.65 + Math.random() * 2,
      speed: 0.48 + Math.random() * 0.32,
      color: index % 6 === 0 ? "#ff5267" : index % 3 === 0 ? "#f7fbff" : "#69d8e7",
    }));

    const drawArrow = (arrow: Arrow, opacity: number) => {
      context.save();
      context.translate(arrow.x, arrow.y);
      context.rotate(arrow.angle);
      context.shadowColor = arrow.color;
      context.shadowBlur = 7;
      context.fillStyle = arrow.color;
      context.globalAlpha = 0.82 * opacity;
      context.beginPath();
      context.moveTo(arrow.size, 0);
      context.lineTo(-arrow.size * 0.78, -arrow.size * 0.62);
      context.lineTo(-arrow.size * 0.48, -arrow.size * 0.08);
      context.lineTo(-arrow.size * 0.78, arrow.size * 0.62);
      context.closePath();
      context.fill();
      context.globalAlpha = 0.95 * opacity;
      context.strokeStyle = arrow.color;
      context.lineWidth = 0.8;
      context.beginPath();
      context.moveTo(arrow.size, 0);
      context.lineTo(-arrow.size * 0.78, -arrow.size * 0.62);
      context.lineTo(-arrow.size * 0.48, -arrow.size * 0.08);
      context.lineTo(-arrow.size * 0.78, arrow.size * 0.62);
      context.closePath();
      context.stroke();
      context.restore();

      if (arrow.trail.length > 1) {
        context.save();
        context.lineWidth = 0.7;
        context.strokeStyle = arrow.color;
        context.globalAlpha = 0.2 * opacity;
        context.beginPath();
        arrow.trail.forEach((point, index) => {
          if (index === 0) context.moveTo(point.x, point.y);
          else context.lineTo(point.x, point.y);
        });
        context.stroke();
        context.restore();
      }
    };

    const pointOnRect = (
      shape: RectShape,
      progress: number
    ): { x: number; y: number } => {
      const perimeter = 2 * (shape.w + shape.h);
      let distance = ((progress % 1) * perimeter + perimeter) % perimeter;
      if (distance <= shape.w) return { x: shape.x + distance, y: shape.y };
      distance -= shape.w;
      if (distance <= shape.h) return { x: shape.x + shape.w, y: shape.y + distance };
      distance -= shape.h;
      if (distance <= shape.w) return { x: shape.x + shape.w - distance, y: shape.y + shape.h };
      distance -= shape.w;
      return { x: shape.x, y: shape.y + shape.h - distance };
    };

    const drawShape = (shape: RectShape, elapsed: number) => {
      const cycle = (elapsed * shape.speed + shape.phase) % 9;
      const visible = cycle < 6.2;
      if (!visible) return;

      const drawProgress = Math.min(1, cycle / 2.8);
      const fadeIn = Math.min(1, cycle * 1.8);
      const fadeOut = 1 - Math.max(0, (cycle - 5.2) / 1);
      const alpha = Math.max(0, Math.min(fadeIn, fadeOut) * 0.48);
      if (alpha <= 0) return;

      const perimeter = 2 * (shape.w + shape.h);
      const total = perimeter * drawProgress;
      context.save();
      context.strokeStyle = shape.color;
      context.lineWidth = 1;
      context.shadowColor = shape.color;
      context.shadowBlur = 7;
      context.globalAlpha = alpha;
      context.beginPath();

      let remaining = total;
      const edges = [
        { a: { x: shape.x, y: shape.y }, b: { x: shape.x + shape.w, y: shape.y } },
        { a: { x: shape.x + shape.w, y: shape.y }, b: { x: shape.x + shape.w, y: shape.y + shape.h } },
        { a: { x: shape.x + shape.w, y: shape.y + shape.h }, b: { x: shape.x, y: shape.y + shape.h } },
        { a: { x: shape.x, y: shape.y + shape.h }, b: { x: shape.x, y: shape.y } },
      ];

      context.moveTo(edges[0].a.x, edges[0].a.y);
      edges.forEach((edge) => {
        if (remaining <= 0) return;
        const edgeLength = Math.hypot(edge.b.x - edge.a.x, edge.b.y - edge.a.y);
        const partial = Math.min(remaining, edgeLength);
        const t = partial / edgeLength;
        context.lineTo(
          edge.a.x + (edge.b.x - edge.a.x) * t,
          edge.a.y + (edge.b.y - edge.a.y) * t
        );
        remaining -= edgeLength;
      });
      context.stroke();

      if (drawProgress > 0.1) {
        const traveler = pointOnRect(shape, (elapsed * 0.11 + shape.phase) % 1);
        context.globalAlpha = alpha * 1.8;
        context.fillStyle = shape.color;
        context.beginPath();
        context.arc(traveler.x, traveler.y, 1.8, 0, Math.PI * 2);
        context.fill();
      }
      context.restore();
    };

    const draw = (timestamp: number) => {
      raf = requestAnimationFrame(draw);
      if (!startTime) startTime = timestamp;
      const elapsed = (timestamp - startTime) / 1000;
      const dt = Math.min(0.033, (timestamp - frame) / 1000 || 0.016);
      frame = timestamp;

      context.clearRect(0, 0, width, height);

      if (elapsed < ARROW_PHASE_SECONDS) {
        const opacity = Math.min(
          1,
          (ARROW_PHASE_SECONDS - elapsed) / ARROW_FADE_SECONDS
        );
        arrows.forEach((arrow) => {
          arrow.x += arrow.vx * dt * 0.7;
          arrow.y += arrow.vy * dt * 0.7;
          arrow.angle += arrow.spin * dt * 1.3;

          const turn = 0.025 * Math.sin(elapsed * 0.9 + arrow.phase);
          const cos = Math.cos(turn);
          const sin = Math.sin(turn);
          const vx = arrow.vx * cos - arrow.vy * sin;
          arrow.vy = arrow.vx * sin + arrow.vy * cos;
          arrow.vx = vx;

          if (arrow.x < -30) arrow.x = width + 30;
          if (arrow.x > width + 30) arrow.x = -30;
          if (arrow.y < -30) arrow.y = height + 30;
          if (arrow.y > height + 30) arrow.y = -30;

          arrow.trail.push({ x: arrow.x, y: arrow.y });
          if (arrow.trail.length > 13) arrow.trail.shift();
          drawArrow(arrow, opacity);
        });
      } else {
        finishArrowIntro();

        const orbTime = elapsed * 0.0001;
        const orbs = [
          { x: 0.35 + Math.sin(orbTime) * 0.04, y: 0.4, r: 0.5, color: "239,68,68" },
          { x: 0.7 + Math.cos(orbTime * 0.7) * 0.03, y: 0.45, r: 0.42, color: "185,28,28" },
          { x: 0.5, y: 0.8, r: 0.48, color: "255,255,255" },
        ];
        orbs.forEach((orb) => {
          const radius = orb.r * Math.min(width, height);
          const gradient = context.createRadialGradient(
            orb.x * width,
            orb.y * height,
            0,
            orb.x * width,
            orb.y * height,
            radius
          );
          gradient.addColorStop(0, `rgba(${orb.color},${orb.color.startsWith("255") ? 0.025 : 0.11})`);
          gradient.addColorStop(1, "rgba(0,0,0,0)");
          context.fillStyle = gradient;
          context.beginPath();
          context.arc(orb.x * width, orb.y * height, radius, 0, Math.PI * 2);
          context.fill();
        });

        context.save();
        context.strokeStyle = "rgba(255,255,255,.025)";
        context.lineWidth = 1;
        const ringBase = (elapsed * 12) % 120;
        for (let i = 0; i < 4; i += 1) {
          context.beginPath();
          context.arc(width * 0.5, height * 0.45, ringBase + i * 140, 0, Math.PI * 2);
          context.stroke();
        }
        context.restore();

        shapes.forEach((shape) =>
          drawShape(shape, elapsed - ARROW_PHASE_SECONDS)
        );
      }
    };

    introFallbackTimer = window.setTimeout(
      finishArrowIntro,
      (ARROW_PHASE_SECONDS + 1.5) * 1000
    );
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(introFallbackTimer);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="animation-background" aria-hidden="true" />
  );
}
