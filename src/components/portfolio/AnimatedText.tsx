import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import type { MotionValue } from 'framer-motion';

type AnimatedCharProps = {
  char: string;
  progress: MotionValue<number>;
  index: number;
  total: number;
};

function AnimatedChar({ char, progress, index, total }: AnimatedCharProps) {
  const start = index / total;
  const end = Math.min(1, start + 2 / total);
  const opacity = useTransform(progress, [start, end], [0.2, 1]);
  const display = char === ' ' ? '\u00A0' : char;

  return (
    <span className="relative inline-block">
      <span className="opacity-0">{display}</span>
      <motion.span style={{ opacity }} className="absolute inset-0">
        {display}
      </motion.span>
    </span>
  );
}

type AnimatedTextProps = {
  text: string;
  className?: string;
};

export default function AnimatedText({ text, className }: AnimatedTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.8', 'end 0.2'],
  });
  const chars = Array.from(text);

  return (
    <p ref={ref} className={className}>
      {chars.map((char, index) => (
        <AnimatedChar
          key={`${char}-${index}`}
          char={char}
          progress={scrollYProgress}
          index={index}
          total={chars.length}
        />
      ))}
    </p>
  );
}
