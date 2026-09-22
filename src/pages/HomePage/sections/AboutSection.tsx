import FadeIn from '@/components/portfolio/FadeIn';
import ContactButton from '@/components/portfolio/ContactButton';
import AnimatedText from '@/components/portfolio/AnimatedText';
import { Image } from '@/components/ui/image';
import { asset } from '@/lib/asset';
import { ABOUT_TEXT, CONTACT_EMAIL, DECOR_IMAGES } from '../portfolio-data';

export default function AboutSection() {
  return (
    <section
      id="about"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 py-20 sm:px-8 md:px-10"
    >
      <FadeIn
        x={-80}
        y={0}
        delay={0.1}
        duration={0.9}
        className="pointer-events-none absolute left-[1%] top-[4%] w-[120px] sm:left-[2%] sm:w-[160px] md:left-[4%] md:w-[210px]"
      >
        <Image src={asset(DECOR_IMAGES.moon)} alt="" style={{ backgroundImage: 'none' }} className="w-full" />
      </FadeIn>

      <FadeIn
        x={-80}
        y={0}
        delay={0.25}
        duration={0.9}
        className="pointer-events-none absolute bottom-[8%] left-[3%] w-[100px] sm:left-[6%] sm:w-[140px] md:left-[10%] md:w-[180px]"
      >
        <Image src={asset(DECOR_IMAGES.object)} alt="" style={{ backgroundImage: 'none' }} className="w-full" />
      </FadeIn>

      <FadeIn
        x={80}
        y={0}
        delay={0.15}
        duration={0.9}
        className="pointer-events-none absolute right-[1%] top-[4%] w-[120px] sm:right-[2%] sm:w-[160px] md:right-[4%] md:w-[210px]"
      >
        <Image src={asset(DECOR_IMAGES.lego)} alt="" style={{ backgroundImage: 'none' }} className="w-full" />
      </FadeIn>

      <FadeIn
        x={80}
        y={0}
        delay={0.3}
        duration={0.9}
        className="pointer-events-none absolute bottom-[8%] right-[3%] w-[130px] sm:right-[6%] sm:w-[170px] md:right-[10%] md:w-[220px]"
      >
        <Image src={asset(DECOR_IMAGES.group)} alt="" style={{ backgroundImage: 'none' }} className="w-full" />
      </FadeIn>

      <div className="relative z-10 flex flex-col items-center gap-10 sm:gap-14 md:gap-16">
        <FadeIn
          as="h2"
          y={40}
          delay={0}
          className="hero-heading text-center text-[clamp(3rem,12vw,160px)] font-black uppercase leading-[0.9] tracking-tight"
        >
          关于我
        </FadeIn>

        <div className="flex flex-col items-center gap-16 sm:gap-20 md:gap-24">
          <AnimatedText
            text={ABOUT_TEXT}
            className="max-w-[560px] text-center text-[clamp(1rem,2vw,1.35rem)] font-medium leading-[1.8] tracking-wide text-[#D7E2EA]"
          />
          <div id="contact" className="scroll-mt-24">
            <ContactButton email={CONTACT_EMAIL} />
          </div>
        </div>
      </div>
    </section>
  );
}
