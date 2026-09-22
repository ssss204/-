// EXPORTS: CONTACT_EMAIL, PORTRAIT_SRC, MARQUEE_ROW_1, MARQUEE_ROW_2, DECOR_IMAGES,
// ABOUT_TEXT, SERVICES, IService, PROJECTS, IProject

export const CONTACT_EMAIL = '2875539620@qq.com';

export const PORTRAIT_SRC = '/images/portrait/portrait.webp';
export const EYEBALL_BASE_SRC = '/images/portrait/eyeball-base.webp';
export const IRIS_RIGHT_SRC = '/images/portrait/iris-right.png';
export const IRIS_LEFT_SRC = '/images/portrait/iris-left.png';
export const GLASSES_TOP_SRC = '/images/portrait/glasses-top.webp';

export const MARQUEE_ROW_1: string[] = [
  '/images/marquee/m01.gif',
  '/images/marquee/m02.gif',
  '/images/marquee/m03.gif',
  '/images/marquee/m04.gif',
  '/images/marquee/m05.gif',
  '/images/marquee/m06.gif',
  '/images/marquee/m07.gif',
  '/images/marquee/m08.gif',
  '/images/marquee/m09.gif',
  '/images/marquee/m10.gif',
  '/images/marquee/m11.gif',
];

export const MARQUEE_ROW_2: string[] = [
  '/images/marquee/m12.gif',
  '/images/marquee/m13.gif',
  '/images/marquee/m14.gif',
  '/images/marquee/m15.gif',
  '/images/marquee/m16.gif',
  '/images/marquee/m17.gif',
  '/images/marquee/m18.gif',
  '/images/marquee/m19.gif',
  '/images/marquee/m20.gif',
  '/images/marquee/m21.gif',
];

export const DECOR_IMAGES = {
  moon: '/images/decor/moon.png',
  object: '/images/decor/object.png',
  lego: '/images/decor/lego.png',
  group: '/images/decor/group.png',
} as const;

export const SKILL_STICKERS = [
  '/images/skills-sticker-1.png',
  '/images/skills-sticker-2.png',
  '/images/skills-sticker-3.png',
] as const;

export const ABOUT_TEXT =
  '目前就读于广东第二师范学院视觉传达设计 目前在不断积累审美创作作品集 对AI有浓厚兴趣';

export interface IService {
  no: string;
  title: string;
  desc: string;
}

export const SERVICES: IService[] = [
  {
    no: '01',
    title: '我的世界服务器搭建',
    desc: '我的世界下载与服务器搭建',
  },
  {
    no: '02',
    title: '艺术设计与排版',
    desc: '高品质写实渲染，通过自定义光照、纹理与材质展示设计，将概念落地。',
  },
  {
    no: '03',
    title: '动态设计',
    desc: '动态动画与动效图形，为品牌、产品和数字体验增添活力与叙事感。',
  },
  {
    no: '04',
    title: '摄影',
    desc: '没素材好吧',
  },
  {
    no: '05',
    title: '网页设计',
    desc: '设计简洁现代、侧重转化的网站，注重布局、排版与用户体验。',
  },
];

export interface IProject {
  no: string;
  category: string;
  images: {
    top: string;
    bottom: string;
    large: string;
  };
}

export const PROJECTS: IProject[] = [
  {
    no: '01',
    category: '作品',
    images: {
      top: '/images/projects/p1-1.webp',
      bottom: '/images/projects/p1-2.webp',
      large: '/images/projects/p1-3.webp',
    },
  },
  {
    no: '02',
    category: '作品',
    images: {
      top: '/images/projects/p2-1.webp',
      bottom: '/images/projects/p2-2.webp',
      large: '/images/projects/p2-3.webp',
    },
  },
  {
    no: '03',
    category: '作品',
    images: {
      top: '/images/projects/p3-1.webp',
      bottom: '/images/projects/p3-2.webp',
      large: '/images/projects/p3-3.webp',
    },
  },
];
