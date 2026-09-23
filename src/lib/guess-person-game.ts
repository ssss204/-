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
  {
    person: '谢坤毓',
    traits: ['美丽', '明艳', '动人', '健身', '睡觉', '画画', '熬夜', '爱吃辣', '不喜欢健身房外运动'],
  },
  {
    person: '洪钰婷',
    traits: ['慢热', '内敛', '共情力强', '做事认真', '视觉美学', '喜欢小动物', '早睡', '口味清淡', '注重卫生'],
  },
  {
    person: '沈希文',
    traits: ['暴躁', '易怒', '爱生气', '追剧', '爱吃辣'],
  },
  {
    person: '谢佳怡',
    traits: ['随和', '热情', '牛逼', '吃', '喝', '玩手机', '打羽毛球', '爱吃辣', '耳机依赖', '爱喝冰的'],
  },
];

export const GUESS_QUESTIONS: GuessQuestion[] = [
  { id: 'ai', prompt: '这个人会主动折腾或使用 AI 工具吗？', trait: '玩AI' },
  { id: 'valorant', prompt: '这个人会玩《无畏契约》（也叫“瓦”）吗？', trait: '玩瓦' },
  { id: 'volleyball', prompt: '这个人平时会打排球吗？', trait: '打排球' },
  { id: 'basketball', prompt: '这个人喜欢打篮球吗？注意不是只看篮球比赛。', trait: '打篮球' },
  { id: 'novels', prompt: '这个人平时有看小说的习惯吗？', trait: '看小说' },
  { id: 'product-design', prompt: '这个人画的是产品外观或产品设计，而不只是普通绘画吗？', trait: '画产品' },
  { id: 'scenery', prompt: '这个人旅行时喜欢拍自然风景照片吗？', trait: '拍风景照' },
  { id: 'instruments', prompt: '这个人除了听音乐，也会自己演奏乐器吗？', trait: '玩乐器' },
  { id: 'minecraft', prompt: '这个人会玩《我的世界》的多人服务器吗？', trait: '玩我的世界服务器' },
  { id: 'delta', prompt: '这个人明确不喜欢玩《三角洲行动》吗？', trait: '不喜欢三角洲' },
  { id: 'short-video', prompt: '这个人会经常刷抖音一类的短视频吗？', trait: '刷抖音' },
  { id: 'watch-videos', prompt: '这个人喜欢看视频内容吗？这里指看视频，不特指刷短视频。', trait: '看视频' },
  { id: 'word-game', prompt: '这个人喜欢玩文字类游戏吗？', trait: '文字游戏' },
  { id: 'makeup', prompt: '这个人喜欢花时间打扮、整理自己的造型吗？', trait: '打扮自己' },
  { id: 'going-out', prompt: '这个人喜欢约人出门玩或逛逛吗？', trait: '出去玩' },
  { id: 'travel', prompt: '这个人喜欢专门安排旅行吗？', trait: '旅游' },
  { id: 'foodie', prompt: '这个人平时会主动关注、享受美食吗？', trait: '美食' },
  { id: 'sleep-in', prompt: '休息日时，这个人通常喜欢睡到比较晚吗？', trait: '睡懒觉' },
  { id: 'breakfast', prompt: '这个人平时有不吃早餐的习惯吗？', trait: '不吃早餐' },
  { id: 'low-energy', prompt: '这个人经常显得精力不太足吗？', trait: '低精力' },
  { id: 'sweet', prompt: '比起咸口，这个人明显更爱吃甜食吗？', trait: '爱吃甜食' },
  { id: 'spicy', prompt: '这个人吃东西时是否特别能吃辣，甚至无辣不欢？', trait: '爱吃辣' },
  { id: 'cilantro', prompt: '这个人会主动避开香菜吗？', trait: '不吃香菜' },
  { id: 'cucumber', prompt: '这个人会主动避开青瓜吗？', trait: '不吃青瓜' },
  { id: 'warm', prompt: '这个人对熟人通常表现得热情、外向吗？', trait: '热情' },
  { id: 'quiet-stranger', prompt: '面对不熟的人时，这个人会比较安静，需要熟悉后才放开吗？', trait: '慢热' },
  { id: 'humor', prompt: '这个人平时会主动开玩笑、逗大家笑吗？', trait: '幽默' },
  { id: 'self-discipline', prompt: '这个人能长期按计划做事，表现出明显的自律吗？', trait: '自律' },
  { id: 'confident', prompt: '这个人表达想法或展示自己时通常比较有自信吗？', trait: '自信' },
  { id: 'kind', prompt: '这个人平时会主动照顾别人的感受、显得善良吗？', trait: '善良' },
  { id: 'lazy', prompt: '这个人自己会承认或表现得有点懒吗？', trait: '懒' },
  { id: 'calm', prompt: '遇到日常事情时，这个人大多显得平静、不太急躁吗？', trait: '平静' },
  { id: 'impatient', prompt: '这个人遇到事情时会比较急、希望马上处理好吗？', trait: '性子急' },
  { id: 'easygoing', prompt: '约活动或做选择时，这个人常说“都行”，比较随和吗？', trait: '随性' },
  { id: 'art', prompt: '这个人喜欢画画或创作绘画作品吗？这里不包括专门画产品设计。', trait: '画画' },
  { id: 'gaming', prompt: '这个人平时会主动玩电子游戏吗？', trait: '打游戏' },
  { id: 'beauty', prompt: '这个人常给人美丽、明艳动人的印象吗？', trait: '美丽' },
  { id: 'fitness', prompt: '这个人有去健身房健身的习惯吗？', trait: '健身' },
  { id: 'sleep', prompt: '这个人平时很喜欢睡觉或补觉吗？', trait: '睡觉' },
  { id: 'avoids-non-gym-sports', prompt: '除了去健身房，这个人基本不喜欢其他运动吗？', trait: '不喜欢健身房外运动' },
  { id: 'empathy', prompt: '这个人共情力比较强，容易理解别人的感受吗？', trait: '共情力强' },
  { id: 'serious', prompt: '这个人做事情通常认真、仔细吗？', trait: '做事认真' },
  { id: 'visual-aesthetics', prompt: '这个人对视觉美感、配色或画面效果特别感兴趣吗？', trait: '视觉美学' },
  { id: 'animals', prompt: '这个人喜欢小动物吗？', trait: '喜欢小动物' },
  { id: 'early-sleep', prompt: '这个人通常习惯早睡吗？', trait: '早睡' },
  { id: 'light-flavors', prompt: '这个人口味偏清淡、不太喜欢重口味吗？', trait: '口味清淡' },
  { id: 'hygiene', prompt: '这个人平时很注重卫生和整洁吗？', trait: '注重卫生' },
  { id: 'irritable', prompt: '这个人容易暴躁、发脾气吗？', trait: '暴躁' },
  { id: 'anger', prompt: '这个人遇到不顺心的事时容易生气吗？', trait: '易怒' },
  { id: 'drama', prompt: '这个人喜欢追电视剧或连续剧吗？', trait: '追剧' },
  { id: 'badminton', prompt: '这个人平时喜欢打羽毛球吗？', trait: '打羽毛球' },
  { id: 'phone', prompt: '这个人平时经常玩手机吗？', trait: '玩手机' },
  { id: 'headphones', prompt: '这个人平时很依赖耳机，经常戴着耳机吗？', trait: '耳机依赖' },
  { id: 'cold-drinks', prompt: '这个人喜欢喝冰饮或冰水吗？', trait: '爱喝冰的' },
  { id: 'good-at-things', prompt: '朋友会用“牛逼”来形容这个人很厉害吗？', trait: '牛逼' },
  { id: 'enjoys-food-drink', prompt: '这个人平时很享受吃东西、喝饮料吗？', trait: '吃' },
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
