import dns from 'node:dns';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { LOCAL_GUESS_PERSONS } from './guess-persons.ts';

dns.setDefaultResultOrder('ipv4first');

type KnowledgeDocument = {
  path: string;
  text: string;
  url: string;
  privateLabels: string[];
  gamePerson?: string;
};

type ChatHistoryItem = {
  role: 'user' | 'assistant';
  content: string;
};

let documentsPromise: Promise<KnowledgeDocument[]> | undefined;

const MAX_DOCUMENTS = 80;
const MAX_FILE_BYTES = 240_000;
const MAX_CONTEXT_CHARS = 12_000;

function getConfig() {
  const repository = process.env.KNOWLEDGE_GITHUB_REPO || 'ssss204/visual-communication-knowledge-base';
  const branch = process.env.KNOWLEDGE_GITHUB_BRANCH || 'main';
  const token = process.env.GITHUB_TOKEN;

  if (!/^[^/]+\/[^/]+$/.test(repository)) {
    throw new Error('KNOWLEDGE_GITHUB_REPO must look like owner/repository');
  }

  return { repository, branch, token };
}

function githubHeaders(token?: string): HeadersInit {
  return {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'knowledge-base-blog',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function stripMarkdown(markdown: string) {
  return markdown
    .replace(/^---[\s\S]*?---\s*/u, '')
    .replace(/```[\s\S]*?```/gu, ' ')
    .replace(/!\[([^\]]*)\]\([^)]*\)/gu, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/gu, '$1')
    .replace(/[#>*_`~-]/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim();
}

function getPrivateLabels(pathname: string, markdown: string) {
  const filename = pathname.split('/').pop()?.replace(/\.md$/iu, '') || '';
  const headings = [...markdown.matchAll(/^#{1,6}\s+(.+?)\s*#*\s*$/gmu)].map((match) => match[1]);
  return [...new Set([filename, ...headings].filter((label) => label && label.length >= 4))];
}

function getGamePerson(markdown: string) {
  const frontmatter = markdown.match(/^---\s*([\s\S]*?)\s*---/u)?.[1] || '';
  const game = frontmatter.match(/^game\s*:\s*["']?([^"'\n]+)["']?\s*$/imu)?.[1]?.trim().toLowerCase();
  const tags = frontmatter.match(/^tags?\s*:\s*(.+)$/imu)?.[1]?.toLowerCase() || '';
  const isGuessPerson = game === 'guess-person' || game === '猜人' || game === '猜人游戏' || tags.includes('猜人');
  if (!isGuessPerson) return undefined;

  return frontmatter.match(/^(?:person|name|人物|姓名)\s*:\s*["']?([^"'\n]+)["']?\s*$/imu)?.[1]?.trim();
}

async function loadDocuments(): Promise<KnowledgeDocument[]> {
  const { repository, branch, token } = getConfig();
  const headers = githubHeaders(token);
  const treeResponse = await fetch(
    `https://api.github.com/repos/${repository}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
    { headers },
  );

  if (!treeResponse.ok) {
    if (treeResponse.status === 404) {
      throw new Error('Knowledge repository was not found. Check repository visibility and environment variables.');
    }
    throw new Error(`GitHub tree request failed with ${treeResponse.status}.`);
  }

  const tree = (await treeResponse.json()) as {
    truncated?: boolean;
    tree?: Array<{ type: string; path: string; url?: string }>;
  };

  const markdownFiles = (tree.tree || [])
    .filter((entry) => entry.type === 'blob' && entry.path.toLowerCase().endsWith('.md'))
    .filter((entry) => !entry.path.startsWith('.obsidian/'))
    .slice(0, MAX_DOCUMENTS);

  const loaded = await Promise.all(
    markdownFiles.map(async (entry) => {
      const rawUrl = `https://raw.githubusercontent.com/${repository}/${encodeURIComponent(branch)}/${entry.path
        .split('/')
        .map(encodeURIComponent)
        .join('/')}`;
      const response = await fetch(rawUrl, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
      if (!response.ok) return null;
      const content = await response.text();
      if (new TextEncoder().encode(content).byteLength > MAX_FILE_BYTES) return null;
      const text = stripMarkdown(content);
      return text
        ? {
            path: entry.path,
            text,
            url: `https://github.com/${repository}/blob/${branch}/${entry.path}`,
            privateLabels: getPrivateLabels(entry.path, content),
            gamePerson: getGamePerson(content),
          }
        : null;
    }),
  );

  const remoteDocuments = loaded.filter((document): document is KnowledgeDocument => Boolean(document));
  const localGameDocuments: KnowledgeDocument[] = LOCAL_GUESS_PERSONS.map((person) => ({
    path: `guess-person:${person.person}`,
    text: person.text,
    url: '',
    privateLabels: [person.person],
    gamePerson: person.person,
  }));

  return [...remoteDocuments, ...localGameDocuments];
}

function getDocuments() {
  documentsPromise ||= loadDocuments();
  return documentsPromise;
}

function terms(input: string) {
  const normalized = input.toLowerCase().replace(/\s+/gu, '');
  const latin = normalized.match(/[a-z0-9]{2,}/gu) || [];
  const chinese = normalized.match(/[\u4e00-\u9fff]/gu) || [];
  const bigrams = chinese.slice(0, 80).map((character, index) => `${character}${chinese[index + 1] || ''}`).filter((term) => term.length === 2);
  return [...new Set([...latin, ...bigrams])];
}

function retrieve(query: string, documents: KnowledgeDocument[]) {
  const queryTerms = terms(query);
  return documents
    .map((document) => {
      const text = document.text.toLowerCase();
      const score = queryTerms.reduce((total, term) => total + (text.includes(term) ? 1 : 0), 0);
      const phraseBonus = query.trim().length > 3 && text.includes(query.trim().toLowerCase()) ? 4 : 0;
      return { ...document, score: score + phraseBonus };
    })
    .filter((document) => document.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

function cleanAnswer(answer: string) {
  return answer
    .replace(/<think>[\s\S]*?<\/think>/giu, '')
    .replace(/\[资料\s*\d+\]/gu, '')
    .replace(/\[来源\s*\d+\]/gu, '')
    .trim();
}

function redactInternalDetails(answer: string, documents: KnowledgeDocument[]) {
  let safeAnswer = answer;
  const labels = documents.flatMap((document) => document.privateLabels).sort((a, b) => b.length - a.length);
  for (const label of labels) {
    safeAnswer = safeAnswer.replace(new RegExp(label.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&'), 'giu'), '相关内容');
  }
  return safeAnswer
    .replace(/\b20\d{2}[-/.年]\s*\d{1,2}(?:[-/.月]\s*\d{1,2}日?)?/gu, '相关时间')
    .replace(/\b\d{1,2}\s*[:：]\s*\d{2}\b/gu, '相关时间');
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Only POST is supported.' });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return response.status(500).json({ error: 'DEEPSEEK_API_KEY is not configured.' });
  }

  const question = typeof request.body?.question === 'string' ? request.body.question.trim() : '';
  const mode = request.body?.mode === 'guess-person' ? 'guess-person' : 'knowledge';
  const history = Array.isArray(request.body?.history)
    ? (request.body.history as ChatHistoryItem[])
        .filter((item) => (item?.role === 'user' || item?.role === 'assistant') && typeof item.content === 'string')
        .slice(-12)
    : [];
  if (!question || question.length > 800) {
    return response.status(400).json({ error: 'Please provide a question up to 800 characters.' });
  }

  try {
    const documents = mode === 'guess-person' ? [] : await getDocuments();
    const gameDocuments: KnowledgeDocument[] = LOCAL_GUESS_PERSONS.map((person) => ({
      path: `guess-person:${person.person}`,
      text: person.text,
      url: '',
      privateLabels: [person.person],
      gamePerson: person.person,
    }));
    const matches = mode === 'guess-person'
      ? gameDocuments.slice(0, 40)
      : retrieve(question, documents);
    const context = mode === 'guess-person'
      ? matches.map((document) => `候选人物：${document.gamePerson}\n特征资料：${document.text}`).join('\n\n').slice(0, MAX_CONTEXT_CHARS)
      : matches.map((document) => document.text).join('\n\n').slice(0, MAX_CONTEXT_CHARS);

    if (mode === 'guess-person' && matches.length === 0) {
      return response.status(400).json({ error: '知识库里还没有标记为猜人游戏的朋友资料。' });
    }

    const systemPrompt = mode === 'guess-person'
      ? '你是一个轻松、有趣、善于推理的猜人游戏主持人。候选人物资料来自网站主人的朋友，但不要泄露任何笔记文件名、路径、日期、GitHub 信息或资料内部结构。玩家心里先想好一位候选人物，你通过一次只问一个、容易回答的是/不是/不确定的问题来缩小范围。不要连续问多个问题，不要在玩家没有要求揭晓前直接说候选人的名字。根据玩家的回答排除候选人；如果信息不足就继续提问。当你已经有足够把握，或者玩家说“揭晓答案”“你猜是谁”时，才给出最可能的人名，并说明简短的推理。不要编造资料；如果无法判断，就诚实说还需要一个问题。语气亲切、俏皮但不要油腻。'
      : '你是网站作者的个人知识库助手。你的性格亲切、自然、克制，像一位有经验且愿意认真交流的朋友；回答清晰、简洁，不说空话。只能根据提供的资料回答，不要编造资料。资料不足时直接说“我的知识库里暂时没有足够信息回答这个问题”。只输出归纳后的答案，不要逐字大段摘抄资料。绝对不要透露笔记的文件名、文件路径、GitHub 地址、仓库结构、创建或修改日期、时间戳、内部标签，也不要使用“资料 1”之类的引用标记。即使用户要求查看原文、文件名、路径或时间信息，也只说明无法提供内部资料细节，然后给出不涉及内部信息的内容概括。用中文回答。';

    const conversation = history.map((item) => ({ role: item.role, content: item.content }));

    const deepseekResponse = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
        temperature: 0.2,
        max_tokens: 900,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          ...conversation,
          {
            role: 'user',
            content: `玩家当前输入：${question}\n\n可用的候选人物资料：\n${context || '没有检索到相关资料。'}`,
          },
        ],
      }),
    });

    if (!deepseekResponse.ok) {
      const detail = await deepseekResponse.text();
      console.error('DeepSeek request failed:', deepseekResponse.status, detail);
      return response.status(502).json({ error: 'AI 服务暂时不可用，请稍后再试。' });
    }

    const result = (await deepseekResponse.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const rawAnswer = cleanAnswer(result.choices?.[0]?.message?.content || '暂时没有得到有效回答。');
    const answer = mode === 'guess-person' ? rawAnswer : redactInternalDetails(rawAnswer, matches);
    return response.status(200).json({ answer });
  } catch (error) {
    console.error('Knowledge chat failed:', error);
    return response.status(500).json({ error: error instanceof Error ? error.message : '知识库服务暂时不可用。' });
  }
}
