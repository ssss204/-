import { useEffect, useRef } from 'react';

type Star = {
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
  velocityX: number;
  velocityY: number;
  radius: number;
  alpha: number;
  phase: number;
  speed: number;
  color: string;
};

type PointerState = {
  x: number;
  y: number;
  previousX: number;
  previousY: number;
  velocityX: number;
  velocityY: number;
  active: boolean;
};

const STAR_COLORS = ['255 255 255', '183 218 255', '132 196 255', '203 183 255', '255 201 235'];

function createRandom(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function normalRandom(random: () => number) {
  return (random() + random() + random() + random() - 2) / 2;
}

function buildStars(width: number, height: number, reducedMotion: boolean) {
  const area = width * height;
  const count = Math.min(reducedMotion ? 520 : width < 640 ? 900 : 1850, Math.max(420, Math.round(area / 900)));
  const random = createRandom(Math.round(width * 13 + height * 7));

  return Array.from({ length: count }, (_, index): Star => {
    const inGalaxy = random() < 0.48;
    const x = random() * width;
    const progress = x / width;
    const galaxyY = height * (0.3 + progress * 0.22 + Math.sin(progress * Math.PI) * 0.08);
    const y = inGalaxy
      ? galaxyY + normalRandom(random) * height * 0.2
      : random() * height;
    const bright = index % 31 === 0;

    return {
      x,
      y: Math.max(0, Math.min(height, y)),
      offsetX: 0,
      offsetY: 0,
      velocityX: 0,
      velocityY: 0,
      radius: bright ? 1.55 + random() * 1.4 : 0.3 + random() * 1.05,
      alpha: bright ? 0.76 + random() * 0.22 : 0.28 + random() * 0.62,
      phase: random() * Math.PI * 2,
      speed: 0.00035 + random() * 0.0007,
      color: STAR_COLORS[Math.floor(random() * STAR_COLORS.length)],
    };
  });
}

function buildSky(width: number, height: number, dpr: number) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  const context = canvas.getContext('2d');
  if (!context) return canvas;

  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.fillStyle = '#01040d';
  context.fillRect(0, 0, width, height);

  const atmosphere = context.createLinearGradient(0, 0, width, height);
  atmosphere.addColorStop(0, '#020617');
  atmosphere.addColorStop(0.42, '#07132e');
  atmosphere.addColorStop(0.72, '#110c2b');
  atmosphere.addColorStop(1, '#03040c');
  context.globalAlpha = 0.9;
  context.fillStyle = atmosphere;
  context.fillRect(0, 0, width, height);

  const random = createRandom(Math.round(width * 17 + height * 11));
  const clouds = [
    { x: 0.08, y: 0.22, radius: 0.34, color: '39 150 255', alpha: 0.13 },
    { x: 0.26, y: 0.35, radius: 0.3, color: '21 208 255', alpha: 0.15 },
    { x: 0.46, y: 0.45, radius: 0.38, color: '104 81 255', alpha: 0.15 },
    { x: 0.63, y: 0.52, radius: 0.32, color: '44 189 255', alpha: 0.13 },
    { x: 0.82, y: 0.6, radius: 0.33, color: '255 69 190', alpha: 0.1 },
    { x: 0.96, y: 0.72, radius: 0.28, color: '99 115 255', alpha: 0.12 },
  ];

  clouds.forEach((cloud) => {
    const radius = width * cloud.radius;
    const gradient = context.createRadialGradient(
      width * cloud.x,
      height * cloud.y,
      0,
      width * cloud.x,
      height * cloud.y,
      radius,
    );
    gradient.addColorStop(0, `rgb(${cloud.color} / ${cloud.alpha})`);
    gradient.addColorStop(0.45, `rgb(${cloud.color} / ${cloud.alpha * 0.55})`);
    gradient.addColorStop(1, `rgb(${cloud.color} / 0)`);
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
  });

  const galaxyY = (progress: number) => height * (0.28 + progress * 0.28 + Math.sin(progress * Math.PI) * 0.06);

  // Build a soft, irregular Milky Way ribbon from overlapping blurred strokes.
  context.save();
  context.globalCompositeOperation = 'screen';
  context.lineCap = 'round';
  context.filter = 'blur(28px)';
  const nebulaStrokes = [
    { color: '28 174 255', width: 0.2, alpha: 0.18, shift: -0.015 },
    { color: '82 104 255', width: 0.15, alpha: 0.2, shift: 0.02 },
    { color: '206 86 255', width: 0.11, alpha: 0.13, shift: 0.06 },
    { color: '255 86 194', width: 0.06, alpha: 0.1, shift: 0.1 },
  ];

  nebulaStrokes.forEach((stroke) => {
    context.beginPath();
    for (let step = 0; step <= 40; step += 1) {
      const progress = step / 40;
      const x = progress * width;
      const y = galaxyY(progress) + height * stroke.shift + Math.sin(progress * 16) * height * 0.012;
      if (step === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.strokeStyle = `rgb(${stroke.color} / ${stroke.alpha})`;
    context.lineWidth = height * stroke.width;
    context.stroke();
  });
  context.restore();

  // Add small gas knots and glowing pockets so the band feels granular rather than flat.
  context.save();
  context.globalCompositeOperation = 'screen';
  for (let index = 0; index < 115; index += 1) {
    const progress = random();
    const x = progress * width;
    const y = galaxyY(progress) + normalRandom(random) * height * 0.16;
    const radius = width * (0.008 + random() * 0.035);
    const colors = ['35 196 255', '77 126 255', '170 91 255', '255 86 190'];
    const color = colors[index % colors.length];
    const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `rgb(${color} / ${0.12 + random() * 0.16})`);
    gradient.addColorStop(0.35, `rgb(${color} / ${0.05 + random() * 0.08})`);
    gradient.addColorStop(1, `rgb(${color} / 0)`);
    context.fillStyle = gradient;
    context.beginPath();
    context.ellipse(x, y, radius, radius * (0.3 + random() * 0.5), random() * Math.PI, 0, Math.PI * 2);
    context.fill();
  }
  context.restore();

  // Narrow dark lanes create the smoky depth visible between bright nebula clouds.
  context.save();
  context.globalCompositeOperation = 'destination-out';
  context.globalAlpha = 0.18;
  context.filter = 'blur(11px)';
  [-0.045, 0.025, 0.095].forEach((shift, index) => {
    context.beginPath();
    for (let step = 0; step <= 32; step += 1) {
      const progress = step / 32;
      const x = progress * width;
      const y = galaxyY(progress) + height * shift + Math.sin(progress * (12 + index * 2)) * height * 0.014;
      if (step === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.strokeStyle = '#000';
    context.lineWidth = height * (0.014 + index * 0.004);
    context.stroke();
  });
  context.restore();

  context.globalCompositeOperation = 'screen';
  for (let index = 0; index < Math.min(3600, Math.round((width * height) / 420)); index += 1) {
    const progress = random();
    const x = progress * width;
    const y = galaxyY(progress) + normalRandom(random) * height * 0.2;
    const radius = 0.18 + random() * 0.58;
    context.beginPath();
    const colors = ['180 230 255', '99 185 255', '210 190 255', '255 185 240'];
    context.fillStyle = `rgb(${colors[index % colors.length]} / ${0.04 + random() * 0.2})`;
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
  }
  context.globalCompositeOperation = 'source-over';
  context.globalAlpha = 1;

  return canvas;
}

export default function InteractiveStarfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const context = canvas.getContext('2d');
    if (!context) return undefined;

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reducedMotion = reducedMotionQuery.matches;
    let stars: Star[] = [];
    let sky = document.createElement('canvas');
    let width = 0;
    let height = 0;
    let animationFrame = 0;
    const pointer: PointerState = {
      x: 0,
      y: 0,
      previousX: 0,
      previousY: 0,
      velocityX: 0,
      velocityY: 0,
      active: false,
    };

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = buildStars(width, height, reducedMotion);
      sky = buildSky(width, height, dpr);
    };

    const updatePointer = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      pointer.velocityX = Math.max(-18, Math.min(18, x - pointer.previousX));
      pointer.velocityY = Math.max(-18, Math.min(18, y - pointer.previousY));
      pointer.previousX = x;
      pointer.previousY = y;
      pointer.x = x;
      pointer.y = y;
      pointer.active = true;
    };

    const deactivatePointer = () => {
      pointer.active = false;
      pointer.velocityX = 0;
      pointer.velocityY = 0;
    };

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);
      context.drawImage(sky, 0, 0, sky.width, sky.height, 0, 0, width, height);
      context.globalCompositeOperation = 'screen';

      stars.forEach((star) => {
        if (!reducedMotion && pointer.active) {
          const currentX = star.x + star.offsetX;
          const currentY = star.y + star.offsetY;
          const deltaX = currentX - pointer.x;
          const deltaY = currentY - pointer.y;
          const distanceSquared = deltaX * deltaX + deltaY * deltaY;
          const radius = width < 640 ? 88 : 125;

          if (distanceSquared > 0 && distanceSquared < radius * radius) {
            const distance = Math.sqrt(distanceSquared);
            const influence = (1 - distance / radius) ** 2;
            star.velocityX += (deltaX / distance) * influence * 0.52 + pointer.velocityX * influence * 0.014;
            star.velocityY += (deltaY / distance) * influence * 0.52 + pointer.velocityY * influence * 0.014;
          }
        }

        star.velocityX += -star.offsetX * 0.018;
        star.velocityY += -star.offsetY * 0.018;
        star.velocityX *= 0.91;
        star.velocityY *= 0.91;
        star.offsetX += star.velocityX;
        star.offsetY += star.velocityY;

        const twinkle = reducedMotion ? 1 : 0.86 + Math.sin(time * star.speed + star.phase) * 0.14;
        const alpha = star.alpha * twinkle;
        const x = star.x + star.offsetX;
        const y = star.y + star.offsetY;

        if (star.radius > 1.7) {
          const glow = context.createRadialGradient(x, y, 0, x, y, star.radius * 5);
          glow.addColorStop(0, `rgb(${star.color} / ${alpha * 0.55})`);
          glow.addColorStop(1, `rgb(${star.color} / 0)`);
          context.fillStyle = glow;
          context.beginPath();
          context.arc(x, y, star.radius * 5, 0, Math.PI * 2);
          context.fill();
        }

        if (star.radius > 2.35) {
          const flareLength = star.radius * 6.5;
          const flare = context.createLinearGradient(x - flareLength, y, x + flareLength, y);
          flare.addColorStop(0, `rgb(${star.color} / 0)`);
          flare.addColorStop(0.5, `rgb(${star.color} / ${alpha * 0.42})`);
          flare.addColorStop(1, `rgb(${star.color} / 0)`);
          context.strokeStyle = flare;
          context.lineWidth = 0.7;
          context.beginPath();
          context.moveTo(x - flareLength, y);
          context.lineTo(x + flareLength, y);
          context.stroke();
          context.beginPath();
          context.moveTo(x, y - flareLength * 0.72);
          context.lineTo(x, y + flareLength * 0.72);
          context.stroke();
        }

        context.fillStyle = `rgb(${star.color} / ${alpha})`;
        context.beginPath();
        context.arc(x, y, star.radius, 0, Math.PI * 2);
        context.fill();
      });

      context.globalCompositeOperation = 'source-over';
      animationFrame = window.requestAnimationFrame(draw);
    };

    const handleMotionChange = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches;
      resize();
    };

    resize();
    animationFrame = window.requestAnimationFrame(draw);
    window.addEventListener('resize', resize);
    canvas.addEventListener('pointerdown', updatePointer, { passive: true });
    canvas.addEventListener('pointermove', updatePointer, { passive: true });
    canvas.addEventListener('pointerleave', deactivatePointer);
    canvas.addEventListener('pointercancel', deactivatePointer);
    reducedMotionQuery.addEventListener('change', handleMotionChange);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointerdown', updatePointer);
      canvas.removeEventListener('pointermove', updatePointer);
      canvas.removeEventListener('pointerleave', deactivatePointer);
      canvas.removeEventListener('pointercancel', deactivatePointer);
      reducedMotionQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full touch-pan-y"
      aria-hidden="true"
    />
  );
}
