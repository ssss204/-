export type GuessPerson = {
  person: string;
  traits: string[];
};

export type GuessQuestion = {
  id: string;
  prompt: string;
  trait: string;
};

export const GUESS_PERSONS: GuessPerson[] = [
  {
    person: '王瑞轩',
    traits: ['开朗', '幽默', '打游戏', '玩瓦', '玩我的世界服务器', '玩AI', '不喜欢三角洲', '随和'],
  },
  {
    person: '锁旎',
    traits: ['活泼', '开朗', '热情', '打排球', '打游戏', '玩乐器', '刷抖音', '能吃辣', '熬夜', '不吃早餐'],
  },
  {
    person: '严雯娜',
    traits: ['活泼', '开朗', '善良', '随性', '画画', '听歌', '美食', '爱吃甜食', '低精力'],
  },
  {
    person: '刘博',
    traits: ['自信', '自律', '自强', '画画', '打篮球', '熬夜', '爱吃辣'],
  },
  {
    person: '林芷琳',
    traits: ['外人面前不爱讲话', '慢热', '性子急', '画产品', '旅游', '拍风景照', '不吃香菜', '不吃青瓜'],
  },
  {
    person: '刘泱莹',
    traits: ['随性', '开心', '懒', '好相处', '平静', '画画', '看视频', '文字游戏', '打扮自己', '出去玩', '爱吃辣', '睡懒觉'],
  },
  {
    person: '唐弘宇',
    traits: ['打篮球', '看小说', '爱吃甜食'],
  },
];

export const GUESS_QUESTIONS: GuessQuestion[] = [
  { id: 'ai', prompt: '这个人平时会主动研究或使用 AI 吗？', trait: '玩AI' },
  { id: 'valorant', prompt: '这个人喜欢玩《无畏契约》（瓦）吗？', trait: '玩瓦' },
  { id: 'volleyball', prompt: '这个人喜欢打排球吗？', trait: '打排球' },
  { id: 'basketball', prompt: '这个人喜欢打篮球吗？', trait: '打篮球' },
  { id: 'novels', prompt: '这个人喜欢看小说吗？', trait: '看小说' },
  { id: 'product-design', prompt: '这个人会画产品设计吗？', trait: '画产品' },
  { id: 'scenery', prompt: '这个人喜欢旅游并拍风景照吗？', trait: '拍风景照' },
  { id: 'instruments', prompt: '这个人会玩一些乐器吗？', trait: '玩乐器' },
  { id: 'minecraft', prompt: '这个人会玩《我的世界》服务器吗？', trait: '玩我的世界服务器' },
  { id: 'delta', prompt: '这个人不喜欢玩三角洲吗？', trait: '不喜欢三角洲' },
  { id: 'short-video', prompt: '这个人喜欢刷短视频吗？', trait: '刷抖音' },
  { id: 'watch-videos', prompt: '这个人喜欢看视频吗？', trait: '看视频' },
  { id: 'word-game', prompt: '这个人喜欢玩文字游戏吗？', trait: '文字游戏' },
  { id: 'makeup', prompt: '这个人喜欢打扮自己吗？', trait: '打扮自己' },
  { id: 'going-out', prompt: '这个人喜欢出去玩吗？', trait: '出去玩' },
  { id: 'travel', prompt: '这个人喜欢旅游吗？', trait: '旅游' },
  { id: 'foodie', prompt: '这个人平时很喜欢美食吗？', trait: '美食' },
  { id: 'sleep-in', prompt: '这个人喜欢睡懒觉吗？', trait: '睡懒觉' },
  { id: 'breakfast', prompt: '这个人通常不吃早餐吗？', trait: '不吃早餐' },
  { id: 'low-energy', prompt: '这个人平时精力偏低吗？', trait: '低精力' },
  { id: 'sweet', prompt: '这个人特别爱吃甜食吗？', trait: '爱吃甜食' },
  { id: 'spicy', prompt: '这个人很能吃辣或无辣不欢吗？', trait: '爱吃辣' },
  { id: 'cilantro', prompt: '这个人不吃香菜吗？', trait: '不吃香菜' },
  { id: 'cucumber', prompt: '这个人不吃青瓜吗？', trait: '不吃青瓜' },
  { id: 'warm', prompt: '这个人给人的感觉比较热情、外向吗？', trait: '热情' },
  { id: 'quiet-stranger', prompt: '这个人在不熟的人面前会比较安静、慢热吗？', trait: '慢热' },
  { id: 'humor', prompt: '这个人平时很幽默、爱开玩笑吗？', trait: '幽默' },
  { id: 'self-discipline', prompt: '这个人有很强的自律性吗？', trait: '自律' },
  { id: 'confident', prompt: '这个人平时显得很自信吗？', trait: '自信' },
  { id: 'kind', prompt: '这个人给人的感觉很善良吗？', trait: '善良' },
  { id: 'lazy', prompt: '这个人平时有点懒吗？', trait: '懒' },
  { id: 'calm', prompt: '这个人平时比较平静吗？', trait: '平静' },
  { id: 'impatient', prompt: '这个人的性子有点急吗？', trait: '性子急' },
  { id: 'easygoing', prompt: '这个人通常比较随性、好相处吗？', trait: '随性' },
  { id: 'art', prompt: '这个人喜欢画画吗？', trait: '画画' },
  { id: 'gaming', prompt: '这个人平时喜欢打游戏吗？', trait: '打游戏' },
];

export function chooseQuestion(candidates: GuessPerson[], askedIds: string[]) {
  const remaining = GUESS_QUESTIONS.filter((question) => !askedIds.includes(question.id));
  return remaining
    .map((question) => {
      const yesCount = candidates.filter((person) => person.traits.includes(question.trait)).length;
      const noCount = candidates.length - yesCount;
      return { question, yesCount, score: Math.min(yesCount, noCount) };
    })
    .filter(({ yesCount, score }) => yesCount > 0 && yesCount < candidates.length && score > 0)
    .sort((a, b) => b.score - a.score)[0]?.question;
}
