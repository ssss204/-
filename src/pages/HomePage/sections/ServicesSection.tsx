import FadeIn from '@/components/portfolio/FadeIn';
import { Image } from '@/components/ui/image';
import { asset } from '@/lib/asset';
import { SERVICES, SKILL_STICKERS } from '../portfolio-data';

export default function ServicesSection() {
  return (
    <section
      id="services"
      className="skills-section relative isolate scroll-mt-4 overflow-hidden rounded-t-[40px] bg-white px-5 py-20 sm:rounded-t-[50px] sm:px-8 sm:py-24 md:rounded-t-[60px] md:px-10 md:py-32"
    >
      <div className="skills-stickers" aria-hidden="true">
        <div className="skills-sticker skills-sticker--one">
          <Image src={asset(SKILL_STICKERS[0])} alt="" className="skills-sticker__image" loading="eager" />
        </div>
        <div className="skills-sticker skills-sticker--two">
          <Image src={asset(SKILL_STICKERS[1])} alt="" className="skills-sticker__image" loading="eager" />
        </div>
        <div className="skills-sticker skills-sticker--three">
          <Image src={asset(SKILL_STICKERS[2])} alt="" className="skills-sticker__image" loading="eager" />
        </div>
      </div>

      <FadeIn
        as="h2"
        y={40}
        className="relative z-10 mb-16 text-center text-[clamp(3rem,12vw,160px)] font-black uppercase leading-none tracking-tight text-[#0C0C0C] sm:mb-20 md:mb-28"
      >
        技能
      </FadeIn>

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col">
        {SERVICES.map((service, index) => (
          <FadeIn
            key={service.no}
            delay={index * 0.1}
            className={
              index === 0
                ? 'flex flex-col gap-3 py-8 sm:flex-row sm:gap-10 sm:py-10 md:py-12'
                : 'flex flex-col gap-3 border-t border-[rgba(12,12,12,0.15)] py-8 sm:flex-row sm:gap-10 sm:py-10 md:py-12'
            }
          >
            <div className="shrink-0 text-[clamp(3rem,10vw,140px)] font-black leading-none text-[#0C0C0C]">
              {service.no}
            </div>
            <div className="flex flex-col gap-2 sm:pt-2">
              <h3 className="text-[clamp(1rem,2.2vw,2.1rem)] font-medium uppercase tracking-wide text-[#0C0C0C]">
                {service.title}
              </h3>
              <p className="max-w-2xl text-[clamp(0.85rem,1.6vw,1.25rem)] font-light leading-relaxed text-[#0C0C0C]/60">
                {service.desc}
              </p>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
