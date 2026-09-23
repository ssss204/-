import { FormEvent, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BookOpen, Check, CircleX, Gamepad2, Loader2, MessageCircle, RotateCcw, Send, X } from 'lucide-react';
import { chooseQuestion, GUESS_PERSONS, type GuessPerson, type GuessQuestion } from '@/lib/guess-person-game';

type Message = { role: 'user' | 'assistant'; content: string };
type GameAnswer = { trait: string; answer: 'yes' | 'no' };
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
  content: '想好一位朋友，先别告诉我是谁。点选“是 / 不是 / 不确定”，我会一步步缩小范围。',
};

export default function KnowledgeChat({ open, onOpenChange }: KnowledgeChatProps) {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [mode, setMode] = useState<ChatMode>('knowledge');
  const [candidates, setCandidates] = useState<GuessPerson[]>([]);
  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);
  const [gameAnswers, setGameAnswers] = useState<GameAnswer[]>([]);
  const [rejectedGuesses, setRejectedGuesses] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<GuessQuestion | null>(null);
  const [guessPending, setGuessPending] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
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
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('当前网站还没有部署聊天服务。AI 聊天需要后端 API，GitHub Pages 只能托管静态网页。');
      }
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
    setCandidates([]);
    setAskedQuestions([]);
    setGameAnswers([]);
    setRejectedGuesses([]);
    setCurrentQuestion(null);
    setGuessPending(false);
    setGameFinished(false);
    setMessages([nextMode === 'guess-person' ? gameIntro : initialMessage]);
    if (nextMode === 'guess-person') startGame();
  };

  const resetGame = () => {
    setQuestion('');
    setError('');
    setAskedQuestions([]);
    setGameAnswers([]);
    setRejectedGuesses([]);
    setGuessPending(false);
    setGameFinished(false);
    startGame();
  };

  const startGame = () => {
    const firstQuestion = chooseQuestion(GUESS_PERSONS, []);
    setCandidates(GUESS_PERSONS);
    setGameAnswers([]);
    setRejectedGuesses([]);
    setAskedQuestions(firstQuestion ? [firstQuestion.id] : []);
    setCurrentQuestion(firstQuestion || null);
    setMessages([
      gameIntro,
      { role: 'assistant', content: firstQuestion?.prompt || '目前线索不足，我们可以再添加一些人物特征。' },
    ]);
  };

  const appendGameMessage = (answer: string) => {
    setMessages((current) => [...current, { role: 'assistant', content: answer }]);
  };

  const continueGame = (nextCandidates: GuessPerson[], nextAsked: string[]) => {
    setCandidates(nextCandidates);
    setAskedQuestions(nextAsked);
    setGuessPending(false);

    if (nextCandidates.length === 1) {
      setGuessPending(true);
      setCurrentQuestion(null);
      appendGameMessage(`我来猜一下：你想的是 ${nextCandidates[0].person}，对吗？`);
      return;
    }

    const nextQuestion = chooseQuestion(nextCandidates, nextAsked);
    if (!nextQuestion) {
      setGameFinished(true);
      setCurrentQuestion(null);
      appendGameMessage('这些线索还不能唯一确定一个人。可以重新开始，换一组回答试试。');
      return;
    }

    setAskedQuestions([...nextAsked, nextQuestion.id]);
    setCurrentQuestion(nextQuestion);
    appendGameMessage(nextQuestion.prompt);
  };

  const answerGame = (answer: 'yes' | 'no' | 'unknown') => {
    if (gameFinished || (!currentQuestion && !guessPending)) return;
    const answerLabel = answer === 'yes' ? '是' : answer === 'no' ? '不是' : '不确定';
    setMessages((current) => [...current, { role: 'user', content: answerLabel }]);

    if (guessPending) {
      if (answer === 'yes') {
        setGameFinished(true);
        setGuessPending(false);
        appendGameMessage('猜中了！要不要再玩一轮？');
        return;
      }
      if (answer === 'unknown') {
        const possible = GUESS_PERSONS.filter((person) =>
          !rejectedGuesses.includes(person.person)
          && gameAnswers.every((item) => person.traits.includes(item.trait) === (item.answer === 'yes')),
        );
        const nextQuestion = chooseQuestion(possible, askedQuestions);
        if (!nextQuestion) {
          setGameFinished(true);
          setGuessPending(false);
          appendGameMessage('没关系。目前线索还不够，我先不乱猜了。重新开始后可以换一组问题。');
          return;
        }
        setCandidates(possible);
        setAskedQuestions([...askedQuestions, nextQuestion.id]);
        setCurrentQuestion(nextQuestion);
        setGuessPending(false);
        appendGameMessage(`好，我先不锁定这个猜测。再确认一个细节：\n\n${nextQuestion.prompt}`);
        return;
      }

      const rejectedPerson = candidates[0]?.person;
      const nextRejected = [...rejectedGuesses, rejectedPerson].filter(Boolean) as string[];
      setRejectedGuesses(nextRejected);
      const alternatives = GUESS_PERSONS.filter((person) => !nextRejected.includes(person.person));
      const matchScore = (person: GuessPerson) => gameAnswers.reduce((score, item) => {
        const matches = person.traits.includes(item.trait) === (item.answer === 'yes');
        return score + (matches ? 1 : -1);
      }, 0);
      const highestScore = Math.max(...alternatives.map(matchScore));
      const remaining = alternatives.filter((person) => matchScore(person) === highestScore);
      if (remaining.length === 0) {
        setGameFinished(true);
        setGuessPending(false);
        appendGameMessage('看来我猜错了。可能有些特征和我理解的不一样，重新开始再玩一轮吧。');
        return;
      }
      if (remaining.length === 1) {
        setCandidates(remaining);
        setGuessPending(true);
        setCurrentQuestion(null);
        setAskedQuestions([]);
        appendGameMessage(`那我再猜一次：是 ${remaining[0].person} 吗？`);
        return;
      }
      const nextQuestion = chooseQuestion(remaining, askedQuestions);
      if (!nextQuestion) {
        setGameFinished(true);
        setGuessPending(false);
        setCandidates(remaining);
        appendGameMessage(`我排除了刚才的猜测。按目前线索，最像的是：${remaining.map((person) => person.person).join('、')}。还需要补充更具体的特征才能继续区分。`);
        return;
      }
      setCandidates(remaining);
      setAskedQuestions([...askedQuestions, nextQuestion.id]);
      setCurrentQuestion(nextQuestion);
      setGuessPending(false);
      appendGameMessage(nextQuestion.prompt);
      return;
    }

    const questionId = askedQuestions[askedQuestions.length - 1];
    const askedQuestion = currentQuestion;
    if (!askedQuestion || askedQuestion.id !== questionId) return;
    if (answer !== 'unknown') {
      setGameAnswers((current) => [...current, { trait: askedQuestion.trait, answer }]);
    }
    const kept = answer === 'unknown'
      ? candidates
      : candidates.filter((person) => person.traits.includes(askedQuestion.trait) === (answer === 'yes'));
    if (kept.length === 0) {
      appendGameMessage('这组回答和现有线索有点对不上。我们跳过这题，换个角度再问。');
      const nextQuestion = chooseQuestion(candidates, askedQuestions);
      if (nextQuestion) {
        setAskedQuestions([...askedQuestions, nextQuestion.id]);
        setCurrentQuestion(nextQuestion);
        appendGameMessage(nextQuestion.prompt);
      } else {
        setGameFinished(true);
      }
      return;
    }
    continueGame(kept, askedQuestions);
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
          {mode === 'guess-person' ? (
            <div className="border-t border-white/10 p-3">
              {gameFinished ? (
                <button type="button" onClick={resetGame} className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#D7E2EA] text-sm font-medium text-[#0C0C0C] transition hover:bg-white"><RotateCcw className="size-4" />再玩一轮</button>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => answerGame('yes')} className="flex h-11 items-center justify-center gap-1.5 rounded-lg bg-[#D7E2EA] text-sm font-medium text-[#0C0C0C] transition hover:bg-white"><Check className="size-4" />是</button>
                  <button type="button" onClick={() => answerGame('no')} className="flex h-11 items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-white/5 text-sm text-white transition hover:bg-white/10"><CircleX className="size-4" />不是</button>
                  <button type="button" onClick={() => answerGame('unknown')} className="h-11 rounded-lg border border-white/15 bg-white/5 text-sm text-white/75 transition hover:bg-white/10">不确定</button>
                </div>
              )}
            </div>
          ) : (
          <form onSubmit={ask} className="border-t border-white/10 p-3">
            <div className="flex items-end gap-2 rounded-xl border border-white/15 bg-white/5 p-2 focus-within:border-white/35">
              <textarea value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} placeholder="问问我的知识库..." rows={1} className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-white/35" aria-label="输入内容" />
              <button type="submit" disabled={loading || !question.trim()} className="grid size-10 shrink-0 place-items-center rounded-lg bg-[#D7E2EA] text-[#0C0C0C] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-30" aria-label="发送问题"><Send className="size-4" /></button>
            </div>
          </form>
          )}
        </section>
      )}
      <button type="button" onClick={() => onOpenChange(!open)} className="fixed bottom-6 right-4 z-50 flex items-center gap-2 rounded-full border border-white/20 bg-[#D7E2EA] px-4 py-3 text-sm font-medium text-[#0C0C0C] shadow-xl shadow-black/30 transition hover:-translate-y-0.5 hover:bg-white sm:right-6" aria-label={open ? '关闭知识库问答' : '打开知识库问答'}>
        {open ? <X className="size-4" /> : <MessageCircle className="size-4" />}
        <span>{open ? '关闭' : '问问我'}</span>
      </button>
    </>
  );
}
