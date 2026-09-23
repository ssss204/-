import { FormEvent, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BookOpen, Gamepad2, Loader2, MessageCircle, RotateCcw, Send, X } from 'lucide-react';

type Message = { role: 'user' | 'assistant'; content: string };
type ChatMode = 'knowledge' | 'guess-person';
type KnowledgeChatProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const initialMessage: Message = {
  role: 'assistant',
  content: '你好，我可以根据知识库里的内容回答问题。',
};

const gameIntro: Message = {
  role: 'assistant',
  content: '想好一位朋友，但先不要告诉我是谁。你只需要回答“是”“不是”或“不确定”，我会通过几个问题来猜。',
};

export default function KnowledgeChat({ open, onOpenChange }: KnowledgeChatProps) {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [mode, setMode] = useState<ChatMode>('knowledge');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const ask = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextQuestion = question.trim();
    if (!nextQuestion || loading) return;

    setQuestion('');
    setError('');
    setMessages((current) => [...current, { role: 'user', content: nextQuestion }]);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: nextQuestion,
          mode,
          history: messages,
        }),
      });
      const result = (await response.json()) as { answer?: string; error?: string };
      if (!response.ok) throw new Error(result.error || '请求失败');
      setMessages((current) => [...current, { role: 'assistant', content: result.answer || '暂时没有得到有效回答。' }]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : '服务暂时不可用');
    } finally {
      setLoading(false);
    }
  };

  const changeMode = (nextMode: ChatMode) => {
    setMode(nextMode);
    setQuestion('');
    setError('');
    setMessages([nextMode === 'guess-person' ? gameIntro : initialMessage]);
  };

  const resetGame = () => {
    setQuestion('');
    setError('');
    setMessages([gameIntro]);
  };

  return (
    <>
      {open && (
        <section className="fixed bottom-24 right-4 z-50 flex h-[min(660px,calc(100vh-7rem))] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#111116]/95 text-[#D7E2EA] shadow-2xl shadow-black/50 backdrop-blur-xl sm:right-6" aria-label="知识库问答">
          <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-full bg-[#D7E2EA] text-[#0C0C0C]"><BookOpen className="size-4" aria-hidden="true" /></span>
              <div><h2 className="text-sm font-semibold text-white">{mode === 'guess-person' ? '猜猜他是谁' : '我的知识库'}</h2><p className="text-xs text-white/50">{mode === 'guess-person' ? '根据朋友特征来推理' : '基于笔记内容回答'}</p></div>
            </div>
            <div className="flex items-center gap-1">
              {mode === 'guess-person' && <button type="button" onClick={resetGame} className="grid size-9 place-items-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white" aria-label="重新开始游戏" title="重新开始"><RotateCcw className="size-4" /></button>}
              <button type="button" onClick={() => onOpenChange(false)} className="grid size-9 place-items-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white" aria-label="关闭问答窗口"><X className="size-5" /></button>
            </div>
          </header>

          <div className="flex gap-1 border-b border-white/10 px-4 py-2">
            <button type="button" onClick={() => changeMode('knowledge')} className={`flex-1 rounded-lg px-3 py-2 text-xs transition ${mode === 'knowledge' ? 'bg-white/12 text-white' : 'text-white/45 hover:bg-white/6 hover:text-white/80'}`}><BookOpen className="mr-1.5 inline-block size-3.5" />知识问答</button>
            <button type="button" onClick={() => changeMode('guess-person')} className={`flex-1 rounded-lg px-3 py-2 text-xs transition ${mode === 'guess-person' ? 'bg-white/12 text-white' : 'text-white/45 hover:bg-white/6 hover:text-white/80'}`}><Gamepad2 className="mr-1.5 inline-block size-3.5" />猜人游戏</button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={message.role === 'user' ? 'ml-8' : 'mr-5'}>
                <div className={message.role === 'user' ? 'rounded-2xl rounded-br-sm bg-[#D7E2EA] px-4 py-3 text-sm leading-relaxed text-[#0C0C0C]' : 'rounded-2xl rounded-bl-sm bg-white/8 px-4 py-3 text-sm leading-relaxed text-white/85'}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                </div>
              </div>
            ))}
            {loading && <div className="mr-5 flex items-center gap-2 rounded-2xl rounded-bl-sm bg-white/8 px-4 py-3 text-sm text-white/50"><Loader2 className="size-4 animate-spin" />正在检索知识库</div>}
            <div ref={endRef} />
          </div>

          {error && <p className="px-4 pb-2 text-xs text-red-300">{error}</p>}
          <form onSubmit={ask} className="border-t border-white/10 p-3">
            <div className="flex items-end gap-2 rounded-xl border border-white/15 bg-white/5 p-2 focus-within:border-white/35">
              <textarea value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} placeholder={mode === 'guess-person' ? '回答上一个问题...' : '问问我的知识库...'} rows={1} className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-white/35" aria-label="输入内容" />
              <button type="submit" disabled={loading || !question.trim()} className="grid size-10 shrink-0 place-items-center rounded-lg bg-[#D7E2EA] text-[#0C0C0C] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-30" aria-label="发送问题"><Send className="size-4" /></button>
            </div>
          </form>
        </section>
      )}
      <button type="button" onClick={() => onOpenChange(!open)} className="fixed bottom-6 right-4 z-50 flex items-center gap-2 rounded-full border border-white/20 bg-[#D7E2EA] px-4 py-3 text-sm font-medium text-[#0C0C0C] shadow-xl shadow-black/30 transition hover:-translate-y-0.5 hover:bg-white sm:right-6" aria-label={open ? '关闭知识库问答' : '打开知识库问答'}>
        {open ? <X className="size-4" /> : <MessageCircle className="size-4" />}
        <span>{open ? '关闭' : '问问我'}</span>
      </button>
    </>
  );
}
