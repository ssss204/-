import FadeIn from '@/components/portfolio/FadeIn';
import AnchorLink from '@/components/portfolio/AnchorLink';
import InteractiveStarfield from '@/components/portfolio/InteractiveStarfield';
import MusicControl from '@/components/portfolio/MusicControl';
import { ChevronDown, MessageCircle } from 'lucide-react';

const NAV_LINKS = [
  { id: 'about', label: '关于' },
  { id: 'services', label: '技能' },
  { id: 'projects', label: '作品' },
  { id: 'contact', label: '联系我' },
];

type HeroSectionProps = {
  onOpenChat: () => void;
};

export default function HeroSection({ onOpenChat }: HeroSectionProps) {
  return (
    <section className="relative flex min-h-[100svh] flex-col overflow-hidden bg-[#01040d]">
      <InteractiveStarfield />
      <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(1,4,13,0.34)_0%,transparent_22%,transparent_76%,rgba(1,4,13,0.46)_100%)]" />

      <FadeIn
        as="nav"
        y={-20}
        delay={0}
        className="relative z-30 flex w-full items-center justify-between gap-2 px-3 pt-4 sm:px-6 sm:pt-6 md:px-10 md:pt-8"
      >
        {NAV_LINKS.map((item) => (
          <AnchorLink
            key={item.id}
            id={item.id}
          >
            {item.label}
          </AnchorLink>
        ))}
        <button
          type="button"
          onClick={onOpenChat}
          className="galaxy-btn"
          aria-label="打开知识库聊天"
        >
          <span className="galaxy-btn__content">
            <span className="galaxy-btn__text">聊天</span>
            <MessageCircle className="galaxy-btn__icon" aria-hidden="true" />
          </span>
          <span className="galaxy-btn__glow" aria-hidden="true" />
          <span className="galaxy-btn__stars" aria-hidden="true" />
        </button>
        <MusicControl />
      </FadeIn>

      <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-5 text-center">
        <div className="w-full max-w-6xl">
          <FadeIn
            as="p"
            delay={0.08}
            y={18}
            duration={1.15}
            className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-[#B8CFF1] sm:text-sm"
          >
            Welcome to my universe
          </FadeIn>
        <FadeIn
          as="h1"
          delay={0.15}
            y={46}
            duration={1.65}
            className="starfield-title w-full text-center text-[1.65rem] font-black leading-[0.92] min-[420px]:text-[1.9rem] sm:text-5xl md:text-[3.8rem] lg:text-[clamp(4.75rem,8.5vw,8rem)]"
        >
          spongebobwang'blog
        </FadeIn>
        <FadeIn
          as="p"
            delay={0.45}
          y={20}
            duration={1.2}
            className="mx-auto mt-6 max-w-xl text-sm font-light leading-7 text-[#D7E2EA]/80 sm:text-base md:text-lg"
        >
            在代码与灵感之间，记录每一次探索。
        </FadeIn>
        </div>
      </div>

      <div className="pointer-events-none relative z-20 mt-auto flex justify-center pb-7 sm:pb-9">
        <ChevronDown className="starfield-scroll h-6 w-6 text-white/55" aria-hidden="true" />
      </div>
    </section>
  );
}
