import { useEffect, useRef, useState } from 'react';
import { asset } from '@/lib/asset';
import {
  EYEBALL_BASE_SRC,
  GLASSES_TOP_SRC,
  IRIS_LEFT_SRC,
  IRIS_RIGHT_SRC,
  PORTRAIT_SRC,
} from '../../pages/HomePage/portfolio-data';

/**
 * AvatarEyes
 * 在静态头像上实现「眼球跟随鼠标」。
 * 三层静态素材合成（均为底图自然像素坐标，内部分辨率 1279 x 1706）：
 *   1. eyeball-base  —— 离线修复（调和扩散 inpaint）后的无虹膜眼底图
 *   2. iris 精灵     —— 真实虹膜像素，在眼裂椭圆内随鼠标平移
 *   3. glasses-top   —— 眼镜框、眼皮、镜片星光等顶层，始终盖在眼球图层之上
 * 这样虹膜永远被裁剪在眼眶内，且不可能压过镜框或露出旧虹膜残影。
 */

const NATURAL_W = 1279;
const NATURAL_H = 1706;
const IRIS_R = 58;
const SPRITE_SIZE = IRIS_R * 2 + 8; // 124，四周 4px 透明边距
const SPRITE_HALF = SPRITE_SIZE / 2;
const MAX_X = 16;
const MAX_Y = 7;
const LERP = 0.18;
const SETTLE = 0.03;

interface EyeConfig {
  iris: { x: number; y: number };
  /** 眼裂裁剪椭圆：虹膜精灵只能在该区域内可见 */
  slit: { cx: number; cy: number; rx: number; ry: number };
  spriteSrc: string;
}

const EYES: EyeConfig[] = [
  // 人物右眼（画面左侧）
  {
    iris: { x: 466, y: 777 },
    slit: { cx: 425, cy: 794, rx: 100, ry: 32 },
    spriteSrc: IRIS_RIGHT_SRC,
  },
  // 人物左眼（画面右侧）
  {
    iris: { x: 801, y: 773 },
    slit: { cx: 800, cy: 792, rx: 100, ry: 32 },
    spriteSrc: IRIS_LEFT_SRC,
  },
];

function loadImage(src: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.decoding = 'async';
  img.src = src;
  return img.decode().then(() => img);
}

export default function AvatarEyes() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCanvasReady, setIsCanvasReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    let cancelled = false;
    let rafId = 0;

    const targets = EYES.map(() => ({ x: 0, y: 0 }));
    const currents = EYES.map(() => ({ x: 0, y: 0 }));
    const cleanupFns: Array<() => void> = [];

    const drawFrame = (
      base: CanvasImageSource,
      sprites: CanvasImageSource[],
      top: CanvasImageSource,
    ) => {
      ctx.clearRect(0, 0, NATURAL_W, NATURAL_H);
      // 第一层：无虹膜眼底图
      ctx.drawImage(base, 0, 0);
      // 第二层：裁剪在眼裂内、随鼠标平移的虹膜
      EYES.forEach((eye, i) => {
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(
          eye.slit.cx,
          eye.slit.cy,
          eye.slit.rx,
          eye.slit.ry,
          0,
          0,
          Math.PI * 2,
        );
        ctx.clip();
        ctx.drawImage(
          sprites[i],
          eye.iris.x + currents[i].x - SPRITE_HALF,
          eye.iris.y + currents[i].y - SPRITE_HALF,
        );
        ctx.restore();
      });
      // 第三层：眼镜框 / 眼皮 / 镜片星光盖顶
      ctx.drawImage(top, 0, 0);
    };

    Promise.all([
      loadImage(asset(EYEBALL_BASE_SRC)),
      Promise.all(EYES.map((eye) => loadImage(asset(eye.spriteSrc)))),
      loadImage(asset(GLASSES_TOP_SRC)),
    ])
      .then(([base, sprites, top]) => {
        if (cancelled) return;

        const render = () => drawFrame(base, sprites, top);
        render();
        setIsCanvasReady(true);

        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
          return;
        }

        const animate = () => {
          let settled = true;
          currents.forEach((cur, i) => {
            const target = targets[i];
            cur.x += (target.x - cur.x) * LERP;
            cur.y += (target.y - cur.y) * LERP;
            if (
              Math.abs(target.x - cur.x) > SETTLE ||
              Math.abs(target.y - cur.y) > SETTLE
            ) {
              settled = false;
            } else {
              cur.x = target.x;
              cur.y = target.y;
            }
          });
          render();
          if (!settled) {
            rafId = requestAnimationFrame(animate);
          } else {
            rafId = 0;
          }
        };

        const kick = () => {
          if (!rafId) rafId = requestAnimationFrame(animate);
        };

        const onPointerMove = (event: PointerEvent) => {
          const rect = canvas.getBoundingClientRect();
          if (rect.width === 0) return;
          const scaleX = NATURAL_W / rect.width;
          const scaleY = NATURAL_H / rect.height;
          const mx = (event.clientX - rect.left) * scaleX;
          const my = (event.clientY - rect.top) * scaleY;
          EYES.forEach((eye, i) => {
            const dx = mx - eye.iris.x;
            const dy = my - eye.iris.y;
            targets[i].x = Math.max(-MAX_X, Math.min(MAX_X, dx * 0.08));
            targets[i].y = Math.max(-MAX_Y, Math.min(MAX_Y, dy * 0.06));
          });
          kick();
        };

        const onPointerLeave = (event: PointerEvent) => {
          if (event.relatedTarget === null) {
            targets.forEach((t) => {
              t.x = 0;
              t.y = 0;
            });
            kick();
          }
        };

        window.addEventListener('pointermove', onPointerMove, { passive: true });
        document.documentElement.addEventListener('pointerleave', onPointerLeave);

        cleanupFns.push(() => {
          window.removeEventListener('pointermove', onPointerMove);
          document.documentElement.removeEventListener('pointerleave', onPointerLeave);
        });
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      cleanupFns.forEach((fn) => fn());
    };
  }, []);

  return (
    <div className="relative w-full">
      <img
        src={asset(PORTRAIT_SRC)}
        alt=""
        aria-hidden="true"
        draggable={false}
        fetchPriority="high"
        className="block h-auto w-full select-none"
      />
      <canvas
        ref={canvasRef}
        width={NATURAL_W}
        height={NATURAL_H}
        role="img"
        aria-label="Jack 的 3D 虚拟形象，眼睛会跟随鼠标"
        draggable={false}
        className={`absolute inset-0 block h-full w-full select-none transition-opacity duration-300 ${
          isCanvasReady ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ backgroundImage: 'none' }}
      />
    </div>
  );
}
