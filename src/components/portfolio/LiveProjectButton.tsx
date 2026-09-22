import { cn } from '@/lib/utils';

type LiveProjectButtonProps = {
  href: string;
  className?: string;
};

export default function LiveProjectButton({ href, className }: LiveProjectButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cn(
        'inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full border-2 border-[#D7E2EA] px-8 py-3 text-sm font-medium uppercase tracking-[0.2em] text-[#D7E2EA] transition-colors duration-200 hover:bg-[#D7E2EA]/10 sm:px-10 sm:py-3.5 sm:text-base',
        className,
      )}
    >
      查看图片
    </a>
  );
}
