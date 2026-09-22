import FadeIn from '@/components/portfolio/FadeIn';
import Magnet from '@/components/portfolio/Magnet';
import ContactButton from '@/components/portfolio/ContactButton';
import AnchorLink from '@/components/portfolio/AnchorLink';
import AvatarEyes from '@/components/portfolio/AvatarEyes';
import MusicControl from '@/components/portfolio/MusicControl';
import { CONTACT_EMAIL } from '../portfolio-data';

const NAV_LINKS = [
  { id: 'about', label: '关于' },
  { id: 'services', label: '技能' },
  { id: 'projects', label: '作品' },
  { id: 'contact', label: '联系我' },
];

export default function HeroSection() {
  return (
    <section className="relative flex h-screen flex-col overflow-x-clip">
      <FadeIn
        as="nav"
        y={-20}
        delay={0}
        className="flex w-full items-center justify-between gap-2 px-3 pt-4 sm:px-6 sm:pt-6 md:px-10 md:pt-8"
      >
        {NAV_LINKS.map((item) => (
          <AnchorLink
            key={item.id}
            id={item.id}
          >
            {item.label}
          </AnchorLink>
        ))}
        <MusicControl />
      </FadeIn>

      <div className="w-full overflow-hidden">
        <FadeIn
          as="h1"
          delay={0.15}
          y={40}
          className="hero-heading mt-16 w-full whitespace-nowrap text-center text-[clamp(1.8rem,9vw,8rem)] font-black leading-none tracking-tight sm:mt-20 md:mt-10"
        >
          spongebobwang'blog
        </FadeIn>
      </div>

      <Magnet className="absolute left-1/2 top-1/2 z-10 w-[280px] -translate-x-1/2 -translate-y-1/2 sm:top-auto sm:bottom-0 sm:w-[360px] sm:translate-y-0 md:w-[440px] lg:w-[520px]">
        <AvatarEyes />
      </Magnet>

      <div className="relative z-20 mt-auto flex items-end justify-between px-6 pb-7 sm:pb-8 md:px-10 md:pb-10">
        <FadeIn
          as="p"
          delay={0.35}
          y={20}
          className="max-w-[160px] text-[clamp(0.75rem,1.4vw,1.5rem)] font-light uppercase leading-[1.15] tracking-[0.12em] text-[#D7E2EA] sm:max-w-[220px] md:max-w-[260px]"
        >
          一名喜欢创新的小伙 往下翻深入了解
        </FadeIn>
        <FadeIn delay={0.5} y={20}>
          <ContactButton email={CONTACT_EMAIL} />
        </FadeIn>
      </div>
    </section>
  );
}
