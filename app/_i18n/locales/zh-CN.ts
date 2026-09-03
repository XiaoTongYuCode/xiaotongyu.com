import type { LocaleMessages } from "../types";

export const zhCN: LocaleMessages = {
  home: {
    localeName: "中文",
    htmlLang: "zh-CN",
    meta: {
      title: "肖彤宇（Xiaotong Yu）",
      description:
        "肖彤宇（Xiaotong Yu）的个人网站，记录产品工程、AI 应用、创意编程与网页实验。",
    },
    nav: {
      ariaMain: "主导航",
      ariaMobile: "移动端导航",
      work: "作品",
      game: "游戏",
      about: "关于",
      contact: "联系",
      openMenu: "打开菜单",
      closeMenu: "关闭菜单",
    },
    language: {
      aria: "切换语言",
      current: "中文",
    },
    contact: {
      email: "work@xiaotongyu.com",
      openEmail: "打开邮箱",
      copyEmail: "复制邮箱",
      copied: "已复制",
      emailCopied: "已复制邮箱：work@xiaotongyu.com",
      emailCopyFailed: "复制失败，请手动复制：work@xiaotongyu.com",
    },
    hero: {
      sectionLabel: "软件工程师 / 个人作品集",
      title: "构建有用的产品、AI 工具与网页体验",
      subtitle:
        "一名在北京工作的软件工程师，关注产品界面、AI 工作流，以及让技术更清晰、更好用的网页实验。",
      primaryCta: "联系我",
      secondaryCta: "查看作品",
    },
    content: {
      kicker:
        "好软件往往来自克制的选择、持续的迭代，以及对细节的尊重。",
      paragraphs: [
        "我是肖彤宇，英文名 Xiaotong Yu，常用网络名称 XiaoTongYu。xiaotongyu.com 是我在互联网上的一块个人空间，用来整理产品实践、AI 实验、工程作品，以及我对界面与交互的持续探索。",
        "我喜欢把早期想法变成真正能使用的产品：从信息结构、交互反馈到可维护实现，尽量让每一步都清楚、可靠，并服务于实际任务。",
        "最近的作品包括 Myrisle——隐私优先的本地 AI 日记，Petspace——围绕日常分享的宠物社区，以及 Pixel Roguelite——一款像素风浏览器战斗原型。",
        "在 AI 应用里，我更关心模型如何与检索、工具和人工复核连接起来，最终成为人们愿意反复使用的工作流，而不只是一次漂亮的演示。",
      ],
      closing: "新的作品、实验与工程笔记还会继续长出来。",
      join: "查看作品",
    },
    work: {
      heading: "精选作品",
      intro:
        "近期围绕本地 AI、社区产品与浏览器体验完成的几个项目与实验。",
      itemAria: "打开项目",
      items: [
        {
          title: "Myrisle",
          description:
            "一款私密、本地优先的 AI 日记，让每一次记录与反思都留在自己手中。",
          kind: "iOS · 本地 AI · 隐私优先",
          url: "https://apps.apple.com/us/app/%E7%A7%81%E5%B1%BF/id6759214981",
        },
        {
          title: "Petspace",
          description:
            "一个围绕宠物日常与细小快乐展开的友好网页社区。",
          kind: "网页产品 · 宠物社区 · 日常分享",
          url: "https://petspace.xiaotongyu.com/",
        },
        {
          title: "Pixel Roguelite",
          description:
            "一款以像素画面、短局节奏与战斗反馈为核心的浏览器原型。",
          kind: "浏览器游戏 · 像素艺术 · 战斗原型",
          url: "https://pixel-roguelite.vercel.app/",
        },
      ],
    },
    footer: {
      heading: [
        "把想法做成真正好用的产品",
        "让复杂变得清晰",
        "让每个细节经得起时间",
      ],
      links: "浏览",
      socials: "社交",
      email: "邮件",
    },
    scenes: {
      "analyst-copilot": "让 AI 接住重复，把判断与创造留给人。",
      "prototype-making":
        "当工具、系统与人的意图协同起来，产品才开始真正成形。",
      "knowledge-structure":
        "好软件是一层层搭起来的：结构、反馈与可维护性。",
      "industry-map":
        "一个个小实验连接起来，慢慢长成自己的数字空间。",
    },
  },
};
