import { useState, type FormEvent } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type ContactButtonProps = {
  email: string;
  className?: string;
};

export default function ContactButton({ email, className }: ContactButtonProps) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const buttonClassName = cn(
    'inline-flex items-center justify-center whitespace-nowrap rounded-full px-8 py-3 text-xs font-medium uppercase tracking-[0.2em] text-white transition-opacity duration-200 hover:opacity-90 sm:px-10 sm:py-3.5 sm:text-sm md:px-12 md:py-4 md:text-base',
    className,
  );
  const buttonStyle = {
    background:
      'linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)',
    boxShadow:
      '0px 4px 4px rgba(181, 1, 167, 0.25), inset 4px 4px 12px #7721B1',
    outline: '2px solid #FFFFFF',
    outlineOffset: '-3px',
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('submitting');

    try {
      const response = await fetch(
        `https://formsubmit.co/ajax/${encodeURIComponent(email)}`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            message: form.message,
            _subject: "来自 spongebobwang'blog 的联系消息",
            _template: 'table',
            _captcha: 'false',
          }),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to submit contact form');
      }

      setForm({ name: '', email: '', message: '' });
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) setStatus('idle');
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button type="button" className={buttonClassName} style={buttonStyle}>
          联系我
        </button>
      </DialogTrigger>
      <DialogContent className="border-white/10 bg-[#111116] text-[#D7E2EA] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-white">联系我</DialogTitle>
          <DialogDescription className="text-[#9AA5AD]">
            留下你的联系方式和留言，我会尽快回复。
          </DialogDescription>
        </DialogHeader>

        {status === 'success' ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <CheckCircle2 className="size-10 text-emerald-400" aria-hidden="true" />
            <div>
              <p className="font-medium text-white">发送成功</p>
              <p className="mt-1 text-sm text-[#9AA5AD]">我会尽快回复你。</p>
            </div>
            <Button type="button" onClick={() => setOpen(false)}>
              关闭
            </Button>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="contact-name" className="text-sm text-white">
                你的称呼
              </label>
              <Input
                id="contact-name"
                name="name"
                required
                autoComplete="name"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                className="border-white/15 bg-white/5 text-white placeholder:text-white/30"
                placeholder="怎么称呼你"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="contact-email" className="text-sm text-white">
                你的邮箱
              </label>
              <Input
                id="contact-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({ ...current, email: event.target.value }))
                }
                className="border-white/15 bg-white/5 text-white placeholder:text-white/30"
                placeholder="name@example.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="contact-message" className="text-sm text-white">
                留言
              </label>
              <Textarea
                id="contact-message"
                name="message"
                required
                value={form.message}
                onChange={(event) =>
                  setForm((current) => ({ ...current, message: event.target.value }))
                }
                className="min-h-32 resize-none border-white/15 bg-white/5 text-white placeholder:text-white/30"
                placeholder="想聊些什么？"
              />
            </div>

            {status === 'error' && (
              <div className="flex items-center gap-2 text-sm text-red-400">
                <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
                发送失败，请稍后再试。
              </div>
            )}

            <Button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full bg-[#B600A8] text-white hover:bg-[#A10095]"
            >
              {status === 'submitting' ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : (
                <Send aria-hidden="true" />
              )}
              {status === 'submitting' ? '发送中' : '发送留言'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
