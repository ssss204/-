import { motion } from 'framer-motion';
import type { CSSProperties, ReactNode } from 'react';

// Pre-create motion elements at module scope (render purity requirement).
const motionTags = {
  div: motion.create('div'),
  section: motion.create('section'),
  nav: motion.create('nav'),
  h1: motion.create('h1'),
  h2: motion.create('h2'),
  h3: motion.create('h3'),
  p: motion.create('p'),
  span: motion.create('span'),
  li: motion.create('li'),
  button: motion.create('button'),
  a: motion.create('a'),
} as const;

type FadeInTag = keyof typeof motionTags;

type FadeInProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  delay?: number;
  duration?: number;
  x?: number;
  y?: number;
  as?: FadeInTag;
};

const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

export default function FadeIn({
  children,
  className,
  style,
  delay = 0,
  duration = 0.7,
  x = 0,
  y = 30,
  as = 'div',
}: FadeInProps) {
  const MotionTag = motionTags[as] as typeof motionTags.div;

  return (
    <MotionTag
      className={className}
      style={style}
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '50px', amount: 0 }}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </MotionTag>
  );
}
