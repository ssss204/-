import { useState } from 'react';
import HeroSection from './sections/HeroSection';
import MarqueeSection from './sections/MarqueeSection';
import AboutSection from './sections/AboutSection';
import ServicesSection from './sections/ServicesSection';
import ProjectsSection from './sections/ProjectsSection';
import KnowledgeChat from '@/components/KnowledgeChat';

export default function HomePage() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <main
      className="w-full bg-[#0C0C0C] font-sans text-[#D7E2EA]"
      style={{ overflowX: 'clip' }}
    >
      <HeroSection onOpenChat={() => setChatOpen(true)} />
      <MarqueeSection />
      <AboutSection />
      <ServicesSection />
      <ProjectsSection />
      <KnowledgeChat open={chatOpen} onOpenChange={setChatOpen} />
    </main>
  );
}
