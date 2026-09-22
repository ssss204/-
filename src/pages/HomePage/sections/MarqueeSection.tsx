import { useEffect, useRef } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import type { MotionValue } from 'framer-motion';
import { Image } from '@/components/ui/image';
import { asset } from '@/lib/asset';
import { MARQUEE_ROW_1, MARQUEE_ROW_2 } from '../portfolio-data';

const LOOP_TIMES = 3;

type MarqueeRowProps = {
  images: string[];
  x: MotionValue<number>;
};

function MarqueeRow({ images, x }: MarqueeRowProps) {
  const loopedImages = Array.from({ length: LOOP_TIMES }, () => images).flat();

  return (
    <div className="overflow-hidden">
      <motion.div
        style={{ x, willChange: 'transform' }}
        className="flex w-max gap-3"
      >
        {loopedImages.map((src, index) => (
          <div
            key={`${src}-${index}`}
            className="h-[270px] w-[420px] shrink-0 overflow-hidden rounded-2xl"
          >
            <Image
              src={asset(src)}
              alt=""
              loading="lazy"
              className="h-full w-full rounded-2xl object-cover"
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default function MarqueeSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const xRight = useMotionValue(0);
  const xLeft = useMotionValue(0);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const el = sectionRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const sectionTop = rect.top + window.scrollY;
      const offset =
        (window.scrollY - sectionTop + window.innerHeight) * 0.3;

      xRight.set(offset - 200);
      xLeft.set(-(offset - 200));
    };

    const requestUpdate = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate, { passive: true });

    return () => {
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [xRight, xLeft]);

  return (
    <section
      ref={sectionRef}
      className="overflow-hidden bg-[#0C0C0C] pb-10 pt-24 sm:pt-32 md:pt-40"
    >
      <div className="flex flex-col gap-3">
        <MarqueeRow images={MARQUEE_ROW_1} x={xRight} />
        <MarqueeRow images={MARQUEE_ROW_2} x={xLeft} />
      </div>
    </section>
  );
}
