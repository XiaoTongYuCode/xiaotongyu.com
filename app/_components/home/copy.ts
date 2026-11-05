import type { Locale } from "../../_i18n";
import { DISPLAY_NAME } from "../site/identity";

type HomePageCopy = {
  meta: { title: string; description: string };
  hero: { title: [string, string]; intro: string; work: string; contact: string };
  about: { title: string; paragraphs: [string, string] };
  projects: Record<string, { description: string; caption: string }>;
  personalCaption: string;
};

/** Version B: the personal workbench. Shared navigation and contact copy stay in site i18n. */
export const HOME_COPY: Record<Locale, HomePageCopy> = {
  "zh-CN": {
    meta: {
      title: `${DISPLAY_NAME} — 产品与代码`,
      description: "这里是肖彤宇（TongYu Xiao）的个人工作台。写代码，做产品，记录关于 AI、人与日常生活的尝试。",
    },
    hero: {
      title: ["有些想法，", "值得动手做出来。"],
      intro: "我是肖彤宇，一个在北京写代码、做产品的人。这里放着我的作品，也留着一些好奇心：AI、人与人的连接，还有日常里的小事。",
      work: "看看我在做什么",
      contact: "打个招呼",
    },
    about: {
      title: "这是我的一张工作台。",
      paragraphs: [
        "上面放着几种不同的尝试：会和你聊天的 AI 伙伴，帮忙搜索和调用工具的智能体，留给自己的日记，以及分享宠物日常的社区。它们让我有机会把对技术和生活的好奇，变成可以打开、可以使用的东西。",
        "我喜欢边做边调整。一个功能用起来顺不顺，一段文字是不是多余，一个动作会不会太刻意，都值得再看一遍。写代码、自己使用、再改一点，是我习惯的节奏。",
      ],
    },
    projects: {
      Mewa: { description: "今天的小事，和朋友、AI 一起聊", caption: "对话 · 今天聊点什么" },
      CornAgent: { description: "一起找资料，接着把事情做下去", caption: "工具 · 一起找答案" },
      Myrisle: { description: "给自己的记录，给自己的空间", caption: "日记 · 写给自己" },
      Petspace: { description: "和宠物一起过的普通一天", caption: "生活 · 和宠物一起" },
    },
    personalCaption: "创作 · 还在继续",
  },
  "en-US": {
    meta: {
      title: `${DISPLAY_NAME} — Products & code`,
      description: "TongYu Xiao's personal workbench: code, products, and experiments around AI, human connection, and everyday life.",
    },
    hero: {
      title: ["Some ideas are worth", "seeing through."],
      intro: "I'm TongYu Xiao. I write code and make things in Beijing. This is a home for my work and a few ongoing interests: AI, human connection, and the small things in everyday life.",
      work: "See what I'm making",
      contact: "Say hello",
    },
    about: {
      title: "A small corner of the web where I make things.",
      paragraphs: [
        "On the workbench: an AI companion, an agent for search and tools, a private diary, and a community for life with pets. Each gives me a way to turn something I'm curious about into something you can open and use.",
        "I tend to work by making, trying, and adjusting. How a feature feels, whether a sentence earns its place, whether a movement looks natural. Those small decisions are part of the work I enjoy.",
      ],
    },
    projects: {
      Mewa: { description: "Everyday conversations with friends and AI", caption: "Conversation · What's on your mind?" },
      CornAgent: { description: "Find something out. Take the next step.", caption: "Tools · Finding things out" },
      Myrisle: { description: "Your thoughts, in a space of your own", caption: "Journal · Just for you" },
      Petspace: { description: "An ordinary day, made better by pets", caption: "Everyday life · With pets" },
    },
    personalCaption: "Making · Still in progress",
  },
};
