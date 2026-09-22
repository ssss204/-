import { useEffect, useState } from 'react';
import type { MouseEvent, ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type AnchorLinkProps = {
  id: string;
  children: ReactNode;
  className?: string;
};

export default function AnchorLink({ id, children, className }: AnchorLinkProps) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = document.getElementById(id);
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [id]);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.history.replaceState(null, '', `#${id}`);
  };

  return (
    <a
      href={`#${id}`}
      onClick={handleClick}
      aria-current={active ? 'location' : undefined}
      className={cn('galaxy-btn', className)}
    >
      <span className="galaxy-btn__content">
        <span className="galaxy-btn__text">{children}</span>
        <ArrowRight className="galaxy-btn__icon" aria-hidden="true" />
      </span>
      <span className="galaxy-btn__glow" aria-hidden="true" />
      <span className="galaxy-btn__stars" aria-hidden="true" />
    </a>
  );
}
