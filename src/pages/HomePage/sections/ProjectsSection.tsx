import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import type { MotionValue } from 'framer-motion';
import type { CSSProperties } from 'react';
import FadeIn from '@/components/portfolio/FadeIn';
import LiveProjectButton from '@/components/portfolio/LiveProjectButton';
import { Image } from '@/components/ui/image';
import { asset } from '@/lib/asset';
import { PROJECTS, type IProject } from '../portfolio-data';

type ProjectCardProps = {
  project: IProject;
  index: number;
  total: number;
  progress: MotionValue<number>;
};

function ProjectCard({ project, index, total, progress }: ProjectCardProps) {
  const targetScale = 1 - (total - 1 - index) * 0.03;
  const scale = useTransform(progress, [index / total, 1], [1, targetScale]);

  const stickyStyle = {
    '--stack-offset': `${index * 28}px`,
  } as CSSProperties;

  return (
    <div
      style={stickyStyle}
      className="sticky top-[calc(6rem_+_var(--stack-offset))] h-[85vh] md:top-[calc(8rem_+_var(--stack-offset))]"
    >
      <motion.div
        style={{ scale }}
        className="flex h-full origin-top flex-col gap-4 rounded-[40px] border-2 border-[#D7E2EA] bg-[#0C0C0C] p-4 sm:gap-6 sm:rounded-[50px] sm:p-6 md:rounded-[60px] md:p-8"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-baseline gap-3 sm:gap-6">
            <span className="shrink-0 text-[clamp(2rem,6vw,4.5rem)] font-black leading-none text-[#D7E2EA]">
              {project.no}
            </span>
            <div className="flex min-w-0 flex-col">
              <span className="text-[0.65rem] uppercase tracking-[0.2em] text-[#D7E2EA]/60 sm:text-xs md:text-sm">
                {project.category}
              </span>
            </div>
          </div>
          <LiveProjectButton href={asset(project.images.large)} />
        </div>

        <div className="flex min-h-0 flex-1 gap-3 sm:gap-4 md:gap-6">
          <div className="flex w-[40%] flex-col gap-3 sm:gap-4 md:gap-6">
            <Image
              src={asset(project.images.top)}
              alt={`作品 ${project.no} 预览图 1`}
              loading="lazy"
              className="h-[clamp(130px,16vw,230px)] w-full shrink-0 rounded-[40px] object-cover sm:rounded-[50px] md:rounded-[60px]"
            />
            <Image
              src={asset(project.images.bottom)}
              alt={`作品 ${project.no} 预览图 2`}
              loading="lazy"
              className="h-[clamp(160px,22vw,340px)] w-full shrink-0 rounded-[40px] object-cover sm:rounded-[50px] md:rounded-[60px]"
            />
          </div>
          <div className="w-[60%] overflow-hidden rounded-[40px] sm:rounded-[50px] md:rounded-[60px]">
            <Image
              src={asset(project.images.large)}
              alt={`作品 ${project.no} 主视觉`}
              loading="lazy"
              className="h-full w-full rounded-[40px] object-cover sm:rounded-[50px] md:rounded-[60px]"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function ProjectsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  return (
    <section
      id="projects"
      className="relative z-10 -mt-10 scroll-mt-4 rounded-t-[40px] bg-[#0C0C0C] px-5 pb-24 pt-16 sm:-mt-12 sm:rounded-t-[50px] sm:px-8 sm:pt-20 md:-mt-14 md:rounded-t-[60px] md:px-10 md:pt-24"
    >
      <FadeIn
        as="h2"
        y={40}
        className="hero-heading mb-12 text-center text-[clamp(3rem,12vw,160px)] font-black uppercase leading-[0.9] tracking-tight sm:mb-16 md:mb-20"
      >
        项目
      </FadeIn>

      <div ref={containerRef}>
        {PROJECTS.map((project, index) => (
          <ProjectCard
            key={project.no}
            project={project}
            index={index}
            total={PROJECTS.length}
            progress={scrollYProgress}
          />
        ))}
      </div>
    </section>
  );
}
